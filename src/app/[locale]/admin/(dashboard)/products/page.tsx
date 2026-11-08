import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { ProductsView } from "@/components/dashboard/products/ProductsView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.metadata");
  return { title: t("products") };
}

export default function AdminProductsPage() {
  return (
    <AdminGate>
      <ProductsView />
    </AdminGate>
  );
}
