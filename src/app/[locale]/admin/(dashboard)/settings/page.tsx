import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { SettingsHub } from "@/components/dashboard/settings/SettingsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.metadata");
  return { title: t("settings") };
}

export default function AdminSettingsPage() {
  return (
    <AdminGate>
      <SettingsHub />
    </AdminGate>
  );
}
