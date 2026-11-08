import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * The patil mark from the current logo, with the name as live text. When the
 * final logo arrives, this is the only place that changes.
 */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const t = useTranslations("common");

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/brand/mark.png"
        alt=""
        width={47}
        height={36}
        className={cn("h-9 w-auto", tone === "light" && "rounded-lg bg-white p-0.5")}
      />
      <span className="flex flex-col leading-tight whitespace-nowrap">
        <span className={cn("text-[1.05rem] font-bold", tone === "dark" ? "text-palm" : "text-white")}>
          {t("brand")}
        </span>
        <span className={cn("text-xs", tone === "dark" ? "text-muted-foreground" : "text-white/70")}>
          {t("brandAlt")}
        </span>
      </span>
    </span>
  );
}
