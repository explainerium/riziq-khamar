import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminGate } from "@/components/dashboard/AdminGate";
import { EditProductView } from "@/components/dashboard/products/ProductForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.metadata");
  return { title: t("editProduct") };
}

export default function EditProductPage() {
  return (
    <AdminGate>
      <EditProductView />
    </AdminGate>
  );
}
