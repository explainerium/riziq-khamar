"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAppDispatch } from "@/redux/hooks";
import { addToCart, type CartLine } from "@/redux/slices/cartSlice";

/** The small add-to-cart button on a product card. */
export function QuickAdd({ line, label }: { line: Omit<CartLine, "quantity">; label: string }) {
  const t = useTranslations("product");
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        dispatch(addToCart({ ...line, quantity: 1 }));
        toast.success(t("added"));
      }}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-palm text-white transition-colors hover:bg-frond"
    >
      <ShoppingCart className="size-5" aria-hidden />
    </button>
  );
}
