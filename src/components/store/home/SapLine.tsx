import { getLocale, getTranslations } from "next-intl/server";
import { PotIcon } from "@/components/shared/BrandIcons";
import { Container } from "@/components/shared/Container";
import { formatNumber } from "@/utils/format";

const STEPS = ["cut", "collect", "boil", "make"] as const;

/** How gur is made, as a trunk the sap runs down: a real sequence, so the numbers mean something. */
export async function SapLine() {
  const [t, locale] = await Promise.all([getTranslations("home.sap"), getLocale()]);

  return (
    <section className="bg-palm py-16 text-white md:py-24">
      <Container className="md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
        <div className="md:sticky md:top-28 md:self-start">
          <h2 className="text-4xl font-bold md:text-5xl">{t("title")}</h2>
          <p className="mt-3 max-w-[32em] text-lg text-white/80">{t("intro")}</p>
        </div>

        <ol className="relative mt-10 md:mt-0">
          <div aria-hidden className="sap-line" />
          {STEPS.map((step, index) => (
            <li key={step} className="relative flex gap-5 pb-9">
              <span className="z-10 grid size-10 shrink-0 place-items-center rounded-full bg-paddy font-bold text-palm">
                {formatNumber(index + 1, locale)}
              </span>
              <div className="min-w-0 pt-1">
                <h3 className="text-xl font-semibold">{t(`steps.${step}.title`)}</h3>
                <p className="mt-1 max-w-[30em] text-white/80">{t(`steps.${step}.body`)}</p>
              </div>
            </li>
          ))}
          <li className="relative flex items-center gap-5">
            <span className="z-10 grid size-10 shrink-0 place-items-center text-honey">
              <PotIcon className="size-10" />
            </span>
            <p className="text-lg font-semibold text-honey">{t("end")}</p>
          </li>
        </ol>
      </Container>
    </section>
  );
}
