import "server-only";
import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { OrderListQuery, OrderUpdateInput, PlaceOrderInput, QuoteInput } from "@/schemas/order.schema";
import type { OrderCounts, OrderRow, Quote, QuoteLine } from "@/types/order";
import { toAsciiDigits } from "@/utils/phone";
import { prisma } from "../../db/prisma";
import { isOrderable, orderTotals } from "../../domain/orderTotals";
import { ApiError } from "../../http/ApiError";
import { toMeta, toSkipTake } from "../../http/pagination";
import { enforceRateLimit } from "../../http/rateLimit";
import { readSettings } from "../setting/setting.service";

const MINUTE = 60_000;

/** The same product twice in a cart counts as one line. */
function mergeLines(items: QuoteInput["items"]) {
  const quantities = new Map<string, number>();
  for (const { productId, quantity } of items) {
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }
  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

/** Prices and availability straight from the database: the browser's numbers are never used. */
async function priceLines(items: QuoteInput["items"]): Promise<{ lines: QuoteLine[]; missing: string[] }> {
  const merged = mergeLines(items);
  const products = await prisma.product.findMany({
    where: { id: { in: merged.map((item) => item.productId) }, isPublished: true },
    select: {
      id: true,
      slug: true,
      name: true,
      nameEn: true,
      packSize: true,
      packUnit: true,
      price: true,
      availability: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
  });
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines: QuoteLine[] = [];
  const missing: string[] = [];
  for (const { productId, quantity } of merged) {
    const product = byId.get(productId);
    if (!product) {
      missing.push(productId);
      continue;
    }
    const { id: _id, images, ...fields } = product;
    lines.push({
      ...fields,
      productId,
      quantity,
      lineTotal: product.price * quantity,
      imageUrl: images[0]?.url ?? null,
      orderable: isOrderable(product.availability),
    });
  }
  return { lines, missing };
}

export async function quoteOrder({ items, deliveryOptionId }: QuoteInput): Promise<Quote> {
  const [{ lines, missing }, settings] = await Promise.all([priceLines(items), readSettings()]);
  const selected = settings.deliveryOptions.find((option) => option.id === deliveryOptionId) ?? null;
  const totals = orderTotals(lines.filter((line) => line.orderable), selected?.charge ?? 0);

  return {
    lines,
    missing,
    deliveryOptions: settings.deliveryOptions,
    selectedDeliveryId: selected?.id ?? null,
    ...totals,
    prebookNote: settings.prebookNote,
    prebookNoteEn: settings.prebookNoteEn,
  };
}

const placedSelect = { id: true, orderNo: true, publicToken: true } satisfies Prisma.OrderSelect;

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export async function placeOrder(input: PlaceOrderInput, ip: string) {
  if (input.website) throw new ApiError(400, "orderRejected");

  // A retry of an order that already went through returns that order.
  const existing = await prisma.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    select: placedSelect,
  });
  if (existing) return { order: existing, created: false };

  // The address limit is loose: on mobile networks many customers share one IP.
  await enforceRateLimit(`order:phone:${input.customerPhone}`, 5, 30 * MINUTE, "tooManyOrders");
  await enforceRateLimit(`order:ip:${ip}`, 30, 15 * MINUTE, "tooManyOrders");

  const [{ lines, missing }, settings] = await Promise.all([priceLines(input.items), readSettings()]);
  if (missing.length > 0 || lines.some((line) => !line.orderable)) throw new ApiError(409, "itemsChanged");

  const delivery = settings.deliveryOptions.find((option) => option.id === input.deliveryOptionId);
  if (!delivery) throw new ApiError(400, "deliveryInvalid");

  const totals = orderTotals(lines, delivery.charge);

  try {
    const order = await prisma.order.create({
      data: {
        publicToken: randomBytes(24).toString("base64url"),
        idempotencyKey: input.idempotencyKey,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        address: input.address,
        customerNote: input.customerNote,
        locale: input.locale,
        deliveryLabel: delivery.label,
        deliveryLabelEn: delivery.labelEn,
        deliveryCharge: totals.deliveryCharge,
        subtotal: totals.subtotal,
        total: totals.total,
        ip,
        items: {
          create: lines.map((line) => ({
            productId: line.productId,
            productName: line.name,
            productNameEn: line.nameEn,
            packSize: line.packSize,
            packUnit: line.packUnit,
            unitPrice: line.price,
            quantity: line.quantity,
            lineTotal: line.lineTotal,
            imageUrl: line.imageUrl,
            wasPrebook: line.availability === "PREBOOK",
          })),
        },
      },
      select: placedSelect,
    });
    return { order, created: true };
  } catch (error) {
    // Two identical requests raced each other: the other one won.
    if (isUniqueViolation(error)) {
      const winner = await prisma.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        select: placedSelect,
      });
      if (winner) return { order: winner, created: false };
    }
    throw error;
  }
}

const itemSelect = {
  id: true,
  productName: true,
  productNameEn: true,
  packSize: true,
  packUnit: true,
  unitPrice: true,
  quantity: true,
  lineTotal: true,
  imageUrl: true,
  wasPrebook: true,
} satisfies Prisma.OrderItemSelect;

/** For the success page: no phone or address, even for someone holding the link. */
export const findOrderByToken = (publicToken: string) =>
  prisma.order.findUnique({
    where: { publicToken },
    select: {
      orderNo: true,
      subtotal: true,
      deliveryCharge: true,
      total: true,
      deliveryLabel: true,
      deliveryLabelEn: true,
      items: { select: itemSelect },
    },
  });

const rowSelect = {
  id: true,
  orderNo: true,
  customerName: true,
  customerPhone: true,
  total: true,
  status: true,
  createdAt: true,
  items: { select: { productName: true, wasPrebook: true } },
} satisfies Prisma.OrderSelect;

type RowResult = Prisma.OrderGetPayload<{ select: typeof rowSelect }>;

export const toOrderRow = ({ items, createdAt, ...order }: RowResult): OrderRow => ({
  ...order,
  createdAt: createdAt.toISOString(),
  itemCount: items.length,
  firstItem: items[0]?.productName ?? null,
  hasPrebook: items.some((item) => item.wasPrebook),
});

export const orderRowSelect = rowSelect;

function searchFilter(search: string | undefined): Prisma.OrderWhereInput {
  if (!search) return {};
  const value = toAsciiDigits(search).replace(/^rk-?/i, "").trim();
  if (/^\d+$/.test(value)) {
    const number = Number(value);
    return {
      OR: [
        { customerPhone: { contains: value } },
        ...(number <= 2_147_483_647 ? [{ orderNo: number }] : []),
      ],
    };
  }
  return { customerName: { contains: search, mode: "insensitive" } };
}

export async function listOrders(query: OrderListQuery) {
  const where: Prisma.OrderWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...searchFilter(query.search),
  };
  const [rows, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, ...toSkipTake(query), select: rowSelect }),
    prisma.order.count({ where }),
  ]);
  return { rows: rows.map(toOrderRow), meta: toMeta(query, total) };
}

export async function orderCounts(): Promise<OrderCounts> {
  const groups = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
  const counts: OrderCounts = { ALL: 0, NEW: 0, CONFIRMED: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
  for (const group of groups) {
    counts[group.status] = group._count._all;
    counts.ALL += group._count._all;
  }
  return counts;
}

const detailSelect = {
  id: true,
  orderNo: true,
  customerName: true,
  customerPhone: true,
  address: true,
  customerNote: true,
  locale: true,
  deliveryLabel: true,
  deliveryLabelEn: true,
  deliveryCharge: true,
  subtotal: true,
  total: true,
  paymentMethod: true,
  status: true,
  adminNote: true,
  createdAt: true,
  updatedAt: true,
  items: { select: itemSelect },
} satisfies Prisma.OrderSelect;

export async function getOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id }, select: detailSelect });
  if (!order) throw new ApiError(404, "notFound");
  return order;
}

export const updateOrder = (id: string, input: OrderUpdateInput) =>
  prisma.order.update({ where: { id }, data: input, select: detailSelect });
