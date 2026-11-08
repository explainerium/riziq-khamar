import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { OrderDetailView } from "@/components/dashboard/orders/OrderDetailView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.metadata");
  return { title: t("orders") };
}

export default function AdminOrderPage() {
  return (
    <AdminGate>
      <OrderDetailView />
    </AdminGate>
  );
}
