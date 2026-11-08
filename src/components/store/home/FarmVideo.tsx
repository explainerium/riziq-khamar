import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "./VideoPlayer";

export function FarmVideo({ className }: { className?: string }) {
  const t = useTranslations("home.farm");

  return (
    <figure className={cn("mx-auto w-full max-w-[19rem]", className)}>
      <VideoPlayer playLabel={t("videoPlay")} />
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">{t("videoCaption")}</figcaption>
    </figure>
  );
}
