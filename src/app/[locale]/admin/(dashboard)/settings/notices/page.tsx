import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { NoticeSettingsView } from "@/components/dashboard/settings/SettingsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.settings");
  return { title: t("notices") };
}

export default function NoticeSettingsPage() {
  return (
    <AdminGate>
      <NoticeSettingsView />
    </AdminGate>
  );
}
