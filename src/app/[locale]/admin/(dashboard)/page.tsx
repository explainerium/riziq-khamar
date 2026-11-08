import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { OverviewView } from "@/components/dashboard/overview/OverviewView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.metadata");
  return { title: t("overview") };
}

export default function AdminOverviewPage() {
  return (
    <AdminGate>
      <OverviewView />
    </AdminGate>
  );
}
