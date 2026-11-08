import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { formatTaka } from "@/utils/format";

export function Price({
  price,
  comparePrice,
  className,
}: {
  price: number;
  comparePrice?: number | null;
  className?: string;
}) {
  const locale = useLocale();

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className="font-bold text-palm">{formatTaka(price, locale)}</span>
      {comparePrice && comparePrice > price ? (
        <s className="text-[0.85em] text-muted-foreground">{formatTaka(comparePrice, locale)}</s>
      ) : null}
    </p>
  );
}
