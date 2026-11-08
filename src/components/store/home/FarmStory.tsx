import Image from "next/image";
import { getTranslations } from "next-intl/server";
import storyGachi from "@/assets/images/story-gachi.jpg";
import { Container } from "@/components/shared/Container";
import { Link } from "@/i18n/navigation";
import { FarmVideo } from "./FarmVideo";

export async function FarmStory() {
  const t = await getTranslations("home.farm");

  return (
    <section className="below-fold py-16 md:py-24">
      <Container className="grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] md:items-start md:gap-14">
        <div className="min-w-0">
          <Image
            src={storyGachi}
            alt={t("imageAlt")}
            sizes="(min-width: 768px) 60vw, 100vw"
            placeholder="blur"
            className="leaf aspect-[16/10] w-full object-cover"
          />
          <h2 className="mt-6 text-3xl font-bold text-palm md:text-4xl">{t("title")}</h2>
          <p className="mt-2 max-w-[34em] text-lg text-muted-foreground">{t("body")}</p>
          <Link href="/about" className="mt-3 inline-block font-medium text-frond underline underline-offset-4">
            {t("more")}
          </Link>
        </div>
        <FarmVideo />
      </Container>
    </section>
  );
}
