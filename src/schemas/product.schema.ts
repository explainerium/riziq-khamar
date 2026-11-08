import { z } from "zod";
import {
  AVAILABILITIES,
  CATEGORY_CODES,
  MAX_PRODUCT_IMAGES,
  PACK_UNIT_CODES,
} from "@/constants/catalog";
import { toAsciiDigits } from "@/utils/phone";
import { optionalText, wholeNumber } from "./shared";

const imageSchema = z.object({
  url: z.url().refine((url) => url.startsWith("https://res.cloudinary.com/"), "imageInvalid"),
  publicId: z.string().min(1).max(300),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/** Empty means "work it out from the name". */
const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slugInvalid")
  .max(80, "tooLong")
  .optional()
  .transform((value) => value || undefined);

const packSizeField = z.preprocess(
  (value) => (typeof value === "string" ? Number(toAsciiDigits(value.trim()) || Number.NaN) : value),
  z.number({ error: "packSizeRequired" }).positive("packSizeRequired").max(100000, "tooLarge"),
);

const comparePriceField = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.union([z.null(), wholeNumber("wholeNumber", 1, 10_000_000)]),
);

const descriptionField = z.string().trim().max(4000, "tooLong");

export const productSchema = z.object({
  name: z.string().trim().min(2, "nameRequired").max(120, "tooLong"),
  nameEn: optionalText(120),
  slug: slugField,
  category: z.enum(CATEGORY_CODES),
  packSize: packSizeField,
  packUnit: z.enum(PACK_UNIT_CODES),
  price: wholeNumber("priceRequired", 1, 10_000_000),
  comparePrice: comparePriceField,
  description: descriptionField.default(""),
  descriptionEn: optionalText(4000),
  availability: z.enum(AVAILABILITIES),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: wholeNumber("wholeNumber", 0, 9999),
  images: z.array(imageSchema).max(MAX_PRODUCT_IMAGES, "tooManyImages"),
});

/**
 * Only what was sent changes. Zod applies a default even inside `.partial()`,
 * so without this override every partial save would blank the description.
 */
export const productPatchSchema = productSchema.extend({ description: descriptionField }).partial();

export type ProductFormValues = z.input<typeof productSchema>;
export type ProductInput = z.output<typeof productSchema>;
export type ProductPatch = z.output<typeof productPatchSchema>;
