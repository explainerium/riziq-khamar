"use client";

import { Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { MAX_LINE_QUANTITY } from "@/constants/catalog";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/format";

const buttonClass =
  "grid size-11 place-items-center text-palm transition-colors hover:bg-secondary disabled:opacity-30";

export function QuantityStepper({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  const t = useTranslations("product");
  const locale = useLocale();

  return (
    <div className={cn("inline-flex items-center overflow-hidden rounded-lg border border-input bg-card", className)}>
      <button
        type="button"
        className={buttonClass}
        aria-label={t("decrease")}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="min-w-8 text-center font-semibold tabular-nums" aria-live="polite">
        {formatNumber(value, locale)}
      </span>
      <button
        type="button"
        className={buttonClass}
        aria-label={t("increase")}
        disabled={value >= MAX_LINE_QUANTITY}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
