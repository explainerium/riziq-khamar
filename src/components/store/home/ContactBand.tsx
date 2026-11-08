import { Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { WhatsAppIcon } from "@/components/shared/BrandIcons";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { getPublicSettings } from "@/lib/catalog";
import { telLink, whatsappLink } from "@/utils/contact";

export async function ContactBand() {
  const [t, common, settings] = await Promise.all([
    getTranslations("home.contact"),
    getTranslations("common"),
    getPublicSettings(),
  ]);

  return (
    <section className="bg-paddy py-12">
      <Container className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-palm md:text-3xl">{t("title")}</h2>
          <p className="mt-1 text-lg text-palm">{t("body")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg">
            <a href={telLink(settings.phone)}>
              <Phone aria-hidden /> {common("call")}
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-palm/40 bg-transparent text-palm hover:bg-white/40">
            <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer">
              <WhatsAppIcon className="size-5" /> {common("whatsapp")}
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}
