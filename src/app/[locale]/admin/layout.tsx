import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ADMIN_CLIENT_MESSAGES, pickMessages } from "@/i18n/clientMessages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.metadata");
  return {
    title: { default: t("title"), template: `%s | ${t("title")}` },
    robots: { index: false, follow: false },
    // "Add to Home Screen" from the dashboard opens the dashboard.
    manifest: "/admin.webmanifest",
  };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={pickMessages(messages, ADMIN_CLIENT_MESSAGES)}>{children}</NextIntlClientProvider>
  );
}
