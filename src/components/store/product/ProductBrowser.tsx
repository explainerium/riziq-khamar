"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/utils/format";

/**
 * Category chips over an already rendered grid. The cards stay Server
 * Components; this only decides which ones are visible. With fewer than two
 * categories there is nothing to choose, so no chips.
 */
export function ProductBrowser({ items }: { items: { category: string; card: ReactNode; id: string }[] }) {
  const t = useTranslations("products");
  const locale = useLocale();
  const [selected, setSelected] = useState<string | null>(null);

  const categories = [...new Set(items.map((item) => item.category))];
  const visible = selected ? items.filter((item) => item.category === selected) : items;

  const chip = (label: string, value: string | null) => (
    <button
      key={label}
      type="button"
      aria-pressed={selected === value}
      onClick={() => setSelected(value)}
      className={cn(
        "h-10 shrink-0 rounded-full px-4 font-medium transition-colors",
        selected === value ? "bg-palm text-white" : "bg-secondary text-palm hover:bg-accent",
      )}
    >
      {label}
    </button>
  );

  return (
    <>
      {categories.length > 1 && (
        <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {chip(t("all"), null)}
          {categories.map((category) => chip(categoryLabel(category, locale), category))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
        {visible.map((item) => (
          <div key={item.id} className="min-w-0">
            {item.card}
          </div>
        ))}
      </div>
    </>
  );
}
