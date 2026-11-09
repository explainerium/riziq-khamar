import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "sonner";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { MEDIA } from "@/constants/media";
import { SITE_URL } from "@/constants/site";
import { routing } from "@/i18n/routing";
import { pickMessages, STORE_CLIENT_MESSAGES } from "@/i18n/clientMessages";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

// Required by Cache Components: every root param needs at least one static value.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s | ${t("siteName")}` },
    description: t("description"),
    icons: { icon: MEDIA.icon, apple: MEDIA.appleIcon },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      images: [{ url: MEDIA.og, width: 1200, height: 630 }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#14432e",
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <html lang={locale} className={`${fontVariables} h-full antialiased`}>
      {/* Browser extensions add attributes to <body> before hydration. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <NextIntlClientProvider messages={pickMessages(messages, STORE_CLIENT_MESSAGES)}>
          <StoreProvider>{children}</StoreProvider>
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
