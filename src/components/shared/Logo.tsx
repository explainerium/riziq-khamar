import { useTranslations } from "next-intl";
import { CloudImage } from "@/components/shared/CloudImage";
import { MEDIA } from "@/constants/media";
import { cn } from "@/lib/utils";

/** The mark from the logo with the name as live text, so it stays readable at header size. */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const t = useTranslations("common");

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <CloudImage
        url={MEDIA.mark}
        alt=""
        sizes="47px"
        widths={[48, 96, 144]}
        width={47}
        height={36}
        className={cn("h-9 w-auto object-contain", tone === "light" && "rounded-lg bg-white p-0.5")}
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
