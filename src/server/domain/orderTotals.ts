import type { Availability } from "@/constants/catalog";

export const isOrderable = (availability: Availability): boolean => availability !== "OUT_OF_STOCK";

export function orderTotals(lines: { price: number; quantity: number }[], deliveryCharge: number) {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  return { subtotal, deliveryCharge, total: subtotal + deliveryCharge };
}
