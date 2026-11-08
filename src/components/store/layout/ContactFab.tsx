import { getTranslations } from "next-intl/server";
import { WhatsAppIcon } from "@/components/shared/BrandIcons";
import { getPublicSettings } from "@/lib/catalog";
import { whatsappLink } from "@/utils/contact";

export async function ContactFab() {
  const [t, settings] = await Promise.all([getTranslations("layout"), getPublicSettings()]);

  return (
    <a
      href={whatsappLink(settings.whatsapp)}
      target="_blank"
      rel="noreferrer"
      aria-label={t("whatsappFab")}
      className="contact-fab fixed right-4 bottom-5 z-30 grid size-13 place-items-center rounded-full bg-[#1f9d55] text-white shadow-lg shadow-palm/25 transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
