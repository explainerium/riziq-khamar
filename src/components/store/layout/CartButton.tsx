"use client";

import { ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useIsClient } from "@/hooks/useIsClient";
import { Link } from "@/i18n/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectCartCount } from "@/redux/slices/cartSlice";
import { formatNumber } from "@/utils/format";

export function CartButton() {
  const t = useTranslations("layout");
  const locale = useLocale();
  const saved = useAppSelector(selectCartCount);
  // The server cannot know the saved cart, so hydration must start from zero like its HTML did.
  const count = useIsClient() ? saved : 0;

  return (
    <Link
      href="/checkout"
      // In the header of every page: prefetching would send the checkout form's code to everyone who only browses.
      prefetch={false}
      aria-label={t("cartWithCount", { count })}
      className="relative grid size-11 place-items-center rounded-full text-palm transition-colors hover:bg-secondary"
    >
      <ShoppingCart className="size-5.5" aria-hidden />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-honey px-1 text-xs font-bold text-soil">
          {formatNumber(count, locale)}
        </span>
      )}
    </Link>
  );
}
