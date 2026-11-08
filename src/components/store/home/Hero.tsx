import Image from "next/image";
import { getTranslations } from "next-intl/server";
import heroPalms from "@/assets/images/hero-palms.jpg";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * The farm's own sky. On phones the headline sits in a sky-coloured block and
 * the palms rise out of it; on wide screens the photo fills the section and
 * the headline takes the empty sky on its left.
 */
export async function Hero() {
  const t = await getTranslations("home.hero");

  return (
    <section className="relative isolate overflow-hidden bg-linear-to-b from-sky-deep to-sky">
      <div className="absolute inset-x-0 bottom-0 -z-10 h-[62%] mask-[linear-gradient(to_bottom,transparent,black_32%)] md:inset-y-0 md:right-0 md:left-[36%] md:h-full md:mask-[linear-gradient(to_right,transparent,black_30%)]">
        <Image
          src={heroPalms}
          alt={t("imageAlt")}
          fill
          preload
          fetchPriority="high"
          sizes="(min-width: 768px) 64vw, 100vw"
          className="object-cover object-[64%_100%] md:object-center"
        />
      </div>

      <Container className="pt-10 pb-[86vw] sm:pb-[60vw] md:pt-24 md:pb-44 lg:pb-56">
        <h1 className="max-w-[13em] text-[2.5rem] leading-[1.2] font-bold text-palm sm:text-5xl md:max-w-[9.5em] md:text-[3.25rem] lg:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-[30em] text-lg text-palm md:max-w-[24em]">{t("body")}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/products">{t("cta")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-palm/30 bg-white/75 text-palm hover:bg-white">
            <Link href="/about">{t("story")}</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
