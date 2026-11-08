import { useTranslations } from "next-intl";
import type { Availability } from "@/constants/catalog";
import { cn } from "@/lib/utils";

/** Nothing for a normal in-stock item: only the exceptions need a label. */
export function AvailabilityPill({
  availability,
  showInStock = false,
  className,
}: {
  availability: Availability;
  showInStock?: boolean;
  className?: string;
}) {
  const t = useTranslations("availability");
  if (availability === "IN_STOCK" && !showInStock) return null;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[0.8rem] font-semibold",
        availability === "PREBOOK" && "bg-honey text-soil",
        availability === "OUT_OF_STOCK" && "bg-soil text-white",
        availability === "IN_STOCK" && "bg-secondary text-palm",
        className,
      )}
    >
      {t(availability)}
    </span>
  );
}
