import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { getPublicSettings } from "@/lib/catalog";
import { telLink, whatsappLink } from "@/utils/contact";

/** Before the first product is uploaded: the visitor can still reach the farm. */
export async function NoProducts() {
  const [t, common, settings] = await Promise.all([
    getTranslations("products"),
    getTranslations("common"),
    getPublicSettings(),
  ]);

  return (
    <div className="leaf bg-white px-6 py-10 text-center">
      <h3 className="text-xl font-semibold text-palm">{t("emptyTitle")}</h3>
      <p className="mx-auto mt-1 max-w-sm text-muted-foreground">{t("emptyBody")}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <a href={telLink(settings.phone)}>{common("call")}</a>
        </Button>
        <Button asChild variant="secondary">
          <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer">
            {common("whatsapp")}
          </a>
        </Button>
      </div>
    </div>
  );
}
