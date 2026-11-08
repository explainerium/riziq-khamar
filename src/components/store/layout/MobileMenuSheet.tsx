"use client";

import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { STORE_NAV } from "@/constants/navigation";
import { Link } from "@/i18n/navigation";

export default function MobileMenuSheet({
  open,
  onOpenChange,
  returnFocusTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}) {
  const t = useTranslations("layout");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[78vw] max-w-xs bg-mist"
        onCloseAutoFocus={() => returnFocusTo.current?.focus()}
      >
        <SheetHeader>
          <SheetTitle className="text-lg text-palm">{t("menuTitle")}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-4">
          {STORE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className="border-b border-border py-3.5 text-lg font-medium text-palm last:border-0"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
