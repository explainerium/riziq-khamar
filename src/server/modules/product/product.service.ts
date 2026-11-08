import "server-only";
import type { Prisma } from "@prisma/client";
import type { ProductInput, ProductPatch } from "@/schemas/product.schema";
import type { PublicProduct } from "@/types/catalog";
import { prisma } from "../../db/prisma";
import { uniqueSlug } from "../../domain/slug";
import { ApiError } from "../../http/ApiError";

const publicSelect = {
  id: true,
  slug: true,
  name: true,
  nameEn: true,
  category: true,
  packSize: true,
  packUnit: true,
  price: true,
  comparePrice: true,
  description: true,
  descriptionEn: true,
  availability: true,
  isFeatured: true,
  images: { orderBy: { position: "asc" }, select: { url: true, width: true, height: true } },
} satisfies Prisma.ProductSelect;

const adminSelect = {
  ...publicSelect,
  isPublished: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  images: {
    orderBy: { position: "asc" },
    select: { url: true, publicId: true, width: true, height: true },
  },
} satisfies Prisma.ProductSelect;

const displayOrder = [
  { sortOrder: "asc" },
  { createdAt: "desc" },
] satisfies Prisma.ProductOrderByWithRelationInput[];

export const listPublicProducts = (): Promise<PublicProduct[]> =>
  prisma.product.findMany({ where: { isPublished: true }, orderBy: displayOrder, select: publicSelect });

export const findPublicProduct = (slug: string): Promise<PublicProduct | null> =>
  prisma.product.findFirst({ where: { slug, isPublished: true }, select: publicSelect });

export const listAdminProducts = () => prisma.product.findMany({ orderBy: displayOrder, take: 200, select: adminSelect });

export async function getAdminProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, select: adminSelect });
  if (!product) throw new ApiError(404, "notFound");
  return product;
}

const slugTaken = (exceptId?: string) => async (slug: string) =>
  (await prisma.product.count({ where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) } })) > 0;

const imageRows = (images: ProductInput["images"]) => images.map((image, position) => ({ ...image, position }));

export async function createProduct(input: ProductInput) {
  const { images, slug, ...fields } = input;
  return prisma.product.create({
    data: {
      ...fields,
      slug: await uniqueSlug(slug ?? fields.nameEn ?? fields.name, slugTaken()),
      images: { create: imageRows(images) },
    },
    select: adminSelect,
  });
}

/** Returns the product and the Cloudinary ids no longer used by it. */
export async function updateProduct(id: string, patch: ProductPatch) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { slug: true, images: { select: { publicId: true } } },
  });
  if (!existing) throw new ApiError(404, "notFound");

  const { images, slug, ...fields } = patch;
  const newSlug = slug && slug !== existing.slug ? await uniqueSlug(slug, slugTaken(id)) : undefined;
  const removedImages = images
    ? existing.images.map((image) => image.publicId).filter((publicId) => !images.some((i) => i.publicId === publicId))
    : [];

  const product = await prisma.$transaction(async (tx) => {
    if (images) await tx.productImage.deleteMany({ where: { productId: id } });
    return tx.product.update({
      where: { id },
      data: {
        ...fields,
        ...(newSlug ? { slug: newSlug } : {}),
        ...(images ? { images: { create: imageRows(images) } } : {}),
      },
      select: adminSelect,
    });
  });

  return { product, previousSlug: existing.slug, removedImages };
}

/** Old orders keep their snapshot; the product link on them becomes null. */
export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true, images: { select: { publicId: true } } },
  });
  if (!product) throw new ApiError(404, "notFound");

  await prisma.product.delete({ where: { id } });
  return { slug: product.slug, removedImages: product.images.map((image) => image.publicId) };
}
