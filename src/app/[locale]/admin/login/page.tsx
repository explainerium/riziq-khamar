import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/dashboard/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.metadata");
  return { title: t("login") };
}

export default function LoginPage() {
  return <LoginForm />;
}
