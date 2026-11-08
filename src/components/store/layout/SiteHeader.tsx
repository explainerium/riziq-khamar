import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { STORE_NAV } from "@/constants/navigation";
import { Link } from "@/i18n/navigation";
import { CartButton } from "./CartButton";
import { LanguageSwitch, LanguageSwitchFallback } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";

export async function SiteHeader() {
  const [t, common] = await Promise.all([getTranslations("layout"), getTranslations("common")]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-2">
        <Link href="/" aria-label={common("brand")} className="min-w-0 shrink">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {STORE_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="font-medium text-palm hover:text-frond">
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5">
          <Suspense fallback={<LanguageSwitchFallback className="mr-1" />}>
            <LanguageSwitch className="mr-1" />
          </Suspense>
          <CartButton />
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
