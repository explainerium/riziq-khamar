import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { NewProductView } from "@/components/dashboard/products/ProductForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.metadata");
  return { title: t("newProduct") };
}

export default function NewProductPage() {
  return (
    <AdminGate>
      <NewProductView />
    </AdminGate>
  );
}
