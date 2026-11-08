import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/shared/Container";

const SECTIONS = ["delivery", "payment", "returns", "privacy"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("policy");
  return { title: t("title") };
}

export default async function PolicyPage() {
  const t = await getTranslations("policy");

  return (
    <main>
      <Container className="max-w-2xl py-10 md:py-16">
        <h1 className="text-4xl font-bold text-palm">{t("title")}</h1>
        {SECTIONS.map((section) => (
          <section key={section} className="mt-8">
            <h2 className="text-xl font-semibold text-palm">{t(`${section}.title`)}</h2>
            <p className="mt-1.5">{t(`${section}.body`)}</p>
          </section>
        ))}
      </Container>
    </main>
  );
}
