import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/shared/Container";
import { formatNumber } from "@/utils/format";

const STEPS = ["choose", "details", "receive"] as const;

export async function HowToOrder() {
  const [t, locale] = await Promise.all([getTranslations("home.how"), getLocale()]);

  return (
    <section className="border-t border-border py-14 md:py-20">
      <Container>
        <h2 className="text-3xl font-bold text-palm md:text-4xl">{t("title")}</h2>
        <ol className="mt-8 grid gap-7 md:grid-cols-3 md:gap-10">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-4 md:block">
              <span className="text-4xl leading-none font-bold text-frond md:text-5xl">
                {formatNumber(index + 1, locale)}
              </span>
              <p className="min-w-0 text-lg md:mt-3">{t(`steps.${step}`)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
