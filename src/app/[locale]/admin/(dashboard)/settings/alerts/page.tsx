import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { AlertSettingsView } from "@/components/dashboard/settings/SettingsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.settings");
  return { title: t("alerts") };
}

export default function AlertSettingsPage() {
  return (
    <AdminGate>
      <AlertSettingsView />
    </AdminGate>
  );
}
