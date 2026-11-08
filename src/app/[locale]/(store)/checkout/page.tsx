import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutView } from "@/components/store/checkout/CheckoutView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default function CheckoutPage() {
  return (
    <main>
      <CheckoutView />
    </main>
  );
}
