import { z } from "zod";
import { MAX_LINE_QUANTITY, ORDER_STATUSES } from "@/constants/catalog";
import { normalizeBdPhone } from "@/utils/phone";
import { optionalText } from "./shared";

const cartLine = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
});

const cartLines = z.array(cartLine).min(1).max(30);

export const quoteSchema = z.object({
  items: cartLines,
  deliveryOptionId: z.string().nullish(),
});

export const phoneField = z
  .string()
  .trim()
  .transform((value, context) => {
    const phone = normalizeBdPhone(value);
    if (!phone) {
      context.addIssue({ code: "custom", message: "phoneInvalid" });
      return z.NEVER;
    }
    return phone;
  });

export const checkoutFormSchema = z.object({
  customerName: z.string().trim().min(2, "nameRequired").max(80, "tooLong"),
  customerPhone: phoneField,
  address: z.string().trim().min(8, "addressRequired").max(500, "tooLong"),
  deliveryOptionId: z.string().min(1, "deliveryRequired"),
  customerNote: optionalText(500),
  /** Honeypot: hidden from people, filled in by bots. */
  website: z.string().optional(),
});

export type CheckoutFormValues = z.input<typeof checkoutFormSchema>;

export const placeOrderSchema = checkoutFormSchema.extend({
  idempotencyKey: z.string().min(16).max(64),
  locale: z.enum(["bn", "en"]),
  items: cartLines,
});

export type PlaceOrderInput = z.output<typeof placeOrderSchema>;
export type QuoteInput = z.output<typeof quoteSchema>;

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(ORDER_STATUSES).optional(),
  search: z.string().trim().max(80).optional(),
});

export type OrderListQuery = z.output<typeof orderListQuerySchema>;

export const orderUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  adminNote: optionalText(1000).optional(),
});

export type OrderUpdateInput = z.output<typeof orderUpdateSchema>;
