import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { OrdersView } from "@/components/dashboard/orders/OrdersView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.metadata");
  return { title: t("orders") };
}

export default function AdminOrdersPage() {
  return (
    <AdminGate>
      <OrdersView />
    </AdminGate>
  );
}
