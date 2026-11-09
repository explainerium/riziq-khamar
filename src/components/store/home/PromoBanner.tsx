import { getTranslations } from "next-intl/server";
import { CloudImage } from "@/components/shared/CloudImage";
import { Container } from "@/components/shared/Container";
import { MEDIA } from "@/constants/media";
import { Link } from "@/i18n/navigation";

/** The farm's own gur banner. Its words are part of the picture, so the alt text repeats them. */
export async function PromoBanner() {
  const t = await getTranslations("home.promo");

  return (
    // Off the first screen, so the browser leaves it alone until someone scrolls near.
    <section className="bg-mist pb-16 [contain-intrinsic-block-size:auto_16rem] [content-visibility:auto] md:pb-20 md:[contain-intrinsic-block-size:auto_32rem]">
      <Container>
        <Link href="/products" className="block">
          <CloudImage
            url={MEDIA.promoBanner}
            alt={t("alt")}
            sizes="(min-width: 1152px) 1104px, calc(100vw - 32px)"
            className="leaf aspect-[1376/768] w-full bg-secondary"
          />
        </Link>
      </Container>
    </section>
  );
}
