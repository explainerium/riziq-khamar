import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { StoreSettingsView } from "@/components/dashboard/settings/SettingsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.settings");
  return { title: t("store") };
}

export default function StoreSettingsPage() {
  return (
    <AdminGate>
      <StoreSettingsView />
    </AdminGate>
  );
}
