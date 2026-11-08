/**
 * Fixed lists with their labels in both languages. To add a category, add one
 * line to CATEGORIES: the dashboard dropdown and the shop chips follow.
 */
export const CATEGORIES = {
  GUR: { bn: "গুড়", en: "Gur" },
  HONEY: { bn: "মধু", en: "Honey" },
  OIL: { bn: "তেল", en: "Oil" },
  OTHER: { bn: "অন্যান্য", en: "Other" },
} as const;

export type CategoryCode = keyof typeof CATEGORIES;
export const CATEGORY_CODES = Object.keys(CATEGORIES) as [CategoryCode, ...CategoryCode[]];

export const PACK_UNITS = {
  g: { bn: "গ্রাম", en: "g" },
  kg: { bn: "কেজি", en: "kg" },
  ml: { bn: "মিলি", en: "ml" },
  l: { bn: "লিটার", en: "L" },
  piece: { bn: "পিস", en: "pc" },
} as const;

export type PackUnit = keyof typeof PACK_UNITS;
export const PACK_UNIT_CODES = Object.keys(PACK_UNITS) as [PackUnit, ...PackUnit[]];

/** One tap choices in the product form. */
export const QUICK_PACKS: { size: number; unit: PackUnit }[] = [
  { size: 500, unit: "g" },
  { size: 1, unit: "kg" },
  { size: 2, unit: "kg" },
  { size: 1, unit: "l" },
  { size: 5, unit: "l" },
];

export const AVAILABILITIES = ["IN_STOCK", "PREBOOK", "OUT_OF_STOCK"] as const;
export type Availability = (typeof AVAILABILITIES)[number];

export const ORDER_STATUSES = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const MAX_PRODUCT_IMAGES = 5;
export const MAX_LINE_QUANTITY = 50;
