"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

function Switcher({ href, className }: { href: string; className?: string }) {
  const t = useTranslations("layout.language");
  const current = useLocale();

  return (
    <nav aria-label={t("label")} className={cn("flex items-center rounded-full bg-secondary p-0.5", className)}>
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={href}
          locale={locale}
          hrefLang={locale}
          aria-current={locale === current ? "true" : undefined}
          className={cn(
            "flex h-8 min-w-9 items-center justify-center rounded-full px-2 text-[0.8rem] font-semibold transition-colors",
            locale === current ? "bg-palm text-white" : "text-palm",
          )}
        >
          {t(`short.${locale}`)}
        </Link>
      ))}
    </nav>
  );
}

/** Keeps the current page. Reads the URL: render inside <Suspense fallback={<LanguageSwitchFallback />}>. */
export function LanguageSwitch({ className }: { className?: string }) {
  const pathname = usePathname();
  return <Switcher href={pathname} className={className} />;
}

/** The prerendered stand-in: each language's home page. */
export function LanguageSwitchFallback({ className }: { className?: string }) {
  return <Switcher href="/" className={className} />;
}
