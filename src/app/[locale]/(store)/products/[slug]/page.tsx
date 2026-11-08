import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/shared/Container";
import { AvailabilityPill } from "@/components/store/product/AvailabilityPill";
import { Price } from "@/components/store/product/Price";
import { ProductActions } from "@/components/store/product/ProductActions";
import { ProductCard, toCartLine } from "@/components/store/product/ProductCard";
import { ProductGallery } from "@/components/store/product/ProductGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { getProduct, getProducts, getPublicSettings } from "@/lib/catalog";
import type { PublicProduct } from "@/types/catalog";
import { cloudinaryWidth } from "@/utils/cloudinary";
import { formatPack, localized } from "@/utils/format";

type Props = PageProps<"/[locale]/products/[slug]">;

/** Cache Components needs at least one value, and the shop may have no products yet. */
const NO_PRODUCTS_YET = "no-products-yet";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.length > 0 ? products.map((product) => ({ slug: product.slug })) : [{ slug: NO_PRODUCTS_YET }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [product, locale] = await Promise.all([getProduct((await params).slug), getLocale()]);
  if (!product) return {};

  const description = localized(product.description, product.descriptionEn, locale);
  const image = product.images[0];
  return {
    title: localized(product.name, product.nameEn, locale),
    description: description ? description.slice(0, 160) : undefined,
    // Only with a photo: `openGraph` here replaces the site-wide tags, and `undefined` would remove them all.
    ...(image ? { openGraph: { images: [{ url: cloudinaryWidth(image.url, 1200) }] } } : {}),
  };
}

/** schema.org Product, so search engines can show price and availability. */
function productJsonLd(product: PublicProduct, locale: string) {
  const availability = {
    IN_STOCK: "https://schema.org/InStock",
    PREBOOK: "https://schema.org/PreOrder",
    OUT_OF_STOCK: "https://schema.org/OutOfStock",
  }[product.availability];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localized(product.name, product.nameEn, locale),
    description: localized(product.description, product.descriptionEn, locale) || undefined,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: "Riziq Khamar" },
    offers: { "@type": "Offer", priceCurrency: "BDT", price: product.price, availability },
  };
}

async function ProductContent({ params }: { params: Props["params"] }) {
  const { slug } = await params;
  const [product, products, settings, locale, t] = await Promise.all([
    getProduct(slug),
    getProducts(),
    getPublicSettings(),
    getLocale(),
    getTranslations("product"),
  ]);
  if (!product) notFound();

  const name = localized(product.name, product.nameEn, locale);
  const description = localized(product.description, product.descriptionEn, locale);
  const others = products.filter((entry) => entry.id !== product.id).slice(0, 4);
  const prebookNote = settings.prebookNote ? localized(settings.prebookNote, settings.prebookNoteEn, locale) : null;

  return (
    <Container className="pt-4 pb-28 md:pt-10 md:pb-20">
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped cannot close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, locale)).replace(/</g, "\\u003c") }}
      />

      <div className="grid gap-6 md:grid-cols-2 md:gap-12">
        <ProductGallery images={product.images} alt={name} />

        <div className="min-w-0">
          <AvailabilityPill availability={product.availability} showInStock />
          <h1 className="mt-2 text-3xl font-bold text-palm md:text-4xl">{name}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{formatPack(product.packSize, product.packUnit, locale)}</p>
          <Price price={product.price} comparePrice={product.comparePrice} className="mt-3 text-3xl" />

          {product.availability === "PREBOOK" && prebookNote && (
            <p className="mt-4 rounded-lg bg-honey/25 px-3.5 py-2.5">{prebookNote}</p>
          )}

          <div className="mt-6">
            <ProductActions line={toCartLine(product)} />
          </div>

          {description && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-palm">{t("description")}</h2>
              <p className="mt-2 max-w-[36em] whitespace-pre-line">{description}</p>
            </div>
          )}
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="mb-6 text-2xl font-bold text-palm">{t("others")}</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
            {others.map((entry) => (
              <ProductCard key={entry.id} product={entry} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}

function ProductSkeleton() {
  return (
    <Container aria-hidden className="grid gap-6 py-6 md:grid-cols-2 md:gap-12 md:py-10">
      <Skeleton className="leaf aspect-[4/5] w-full" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-12 w-full" />
      </div>
    </Container>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <main>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </main>
  );
}
