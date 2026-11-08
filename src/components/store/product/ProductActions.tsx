"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { addToCart, type CartLine } from "@/redux/slices/cartSlice";
import { QuantityStepper } from "./QuantityStepper";

/**
 * Quantity and the two buttons. On phones they sit in a bar fixed to the
 * bottom of the screen, so ordering is never a scroll away.
 */
export function ProductActions({ line }: { line: Omit<CartLine, "quantity"> }) {
  const t = useTranslations("product");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);

  if (line.availability === "OUT_OF_STOCK") {
    return (
      <p className="leaf-sm bg-secondary px-4 py-3 font-medium text-palm" role="status">
        {t("outOfStock")}
      </p>
    );
  }

  const add = () => dispatch(addToCart({ ...line, quantity }));

  return (
    <div
      data-sticky-cta
      className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-border bg-white/95 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md md:static md:flex-wrap md:gap-3 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
    >
      <QuantityStepper value={quantity} onChange={setQuantity} className="shrink-0" />
      <Button
        size="lg"
        variant="secondary"
        className="hidden md:inline-flex"
        onClick={() => {
          add();
          toast.success(t("added"));
        }}
      >
        {t("addToCart")}
      </Button>
      <Button
        size="lg"
        className="min-w-0 flex-1 md:flex-none"
        onClick={() => {
          add();
          router.push("/checkout");
        }}
      >
        {line.availability === "PREBOOK" ? t("prebookNow") : t("orderNow")}
      </Button>
    </div>
  );
}
