import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CloudImage } from "@/components/shared/CloudImage";
import { Container } from "@/components/shared/Container";
import { FarmVideo } from "@/components/store/home/FarmVideo";
import { MEDIA } from "@/constants/media";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("title"), description: t("lead") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <main>
      <div className="relative">
        <CloudImage
          url={MEDIA.farmBanner}
          alt={t("bannerAlt")}
          sizes="100vw"
          className="h-56 w-full bg-secondary sm:h-80 md:h-[26rem]"
        />
      </div>

      <Container className="py-10 md:py-16">
        <h1 className="text-4xl font-bold text-palm md:text-5xl">{t("title")}</h1>
        <p className="mt-3 max-w-[32em] text-xl text-palm">{t("lead")}</p>

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
          <CloudImage
            url={MEDIA.storyClimb}
            alt={t("climbAlt")}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="leaf aspect-[16/10] w-full bg-secondary"
          />
          <div>
            <h2 className="text-2xl font-bold text-palm">{t("gachiTitle")}</h2>
            <p className="mt-2 max-w-[34em] text-lg">{t("gachiBody")}</p>
          </div>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:items-center md:gap-14">
          <FarmVideo className="md:order-1" />
          <div className="md:order-2">
            <h2 className="text-2xl font-bold text-palm">{t("openTitle")}</h2>
            <p className="mt-2 max-w-[34em] text-lg">{t("openBody")}</p>
            <CloudImage
              url={MEDIA.aboutGrove}
              alt={t("groveAlt")}
              sizes="(min-width: 768px) 55vw, 100vw"
              className="leaf mt-6 aspect-[16/10] w-full bg-secondary"
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
