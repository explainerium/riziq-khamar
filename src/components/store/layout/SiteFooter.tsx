import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { STORE_NAV } from "@/constants/navigation";
import { Link } from "@/i18n/navigation";
import { getCurrentYear, getPublicSettings } from "@/lib/catalog";
import { telLink, whatsappLink } from "@/utils/contact";
import { formatNumber, localized } from "@/utils/format";

export async function SiteFooter() {
  const [t, common, settings, locale, year] = await Promise.all([
    getTranslations("layout"),
    getTranslations("common"),
    getPublicSettings(),
    getLocale(),
    getCurrentYear(),
  ]);

  return (
    <footer className="bg-soil text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,4fr)]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-white/75">{common("tagline")}</p>
        </div>

        <nav aria-label={t("footer.links")} className="flex flex-col items-start gap-2">
          {STORE_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="py-0.5 text-white/85 hover:text-paddy">
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-start gap-2 text-white/85">
          <p>{localized(settings.address, settings.addressEn, locale)}</p>
          <a href={telLink(settings.phone)} className="py-0.5 hover:text-paddy">
            {formatPhone(settings.phone, locale)}
          </a>
          <a href={whatsappLink(settings.whatsapp)} className="py-0.5 hover:text-paddy" target="_blank" rel="noreferrer">
            {common("whatsapp")}
          </a>
          <a href={settings.facebookUrl} className="py-0.5 hover:text-paddy" target="_blank" rel="noreferrer">
            {common("facebook")}
          </a>
        </div>
      </Container>

      <p className="border-t border-white/10 py-4 text-center text-sm text-white/60">
        {t("footer.rights", { year: formatNumber(year, locale).replace(/[,،]/g, "") })}
      </p>
    </footer>
  );
}

function formatPhone(phone: string, locale: string): string {
  return locale === "bn" ? phone.replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]) : phone;
}
