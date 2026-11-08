import { getTranslations } from "next-intl/server";
import { Container } from "@/components/shared/Container";
import { NoProducts } from "@/components/store/product/NoProducts";
import { ProductCard } from "@/components/store/product/ProductCard";
import { Link } from "@/i18n/navigation";
import { getProducts } from "@/lib/catalog";

const HOME_LIMIT = 8;

/** The field below the sky: it overlaps the photo with one leaf-shaped corner. */
export async function ProductsSection() {
  const [products, t] = await Promise.all([getProducts(), getTranslations("home.products")]);
  const featuredFirst = [...products].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));

  return (
    <section className="relative z-10 -mt-10 rounded-tl-[3.5rem] bg-mist pt-12 pb-16 md:-mt-20 md:rounded-tl-[7rem] md:pt-16 md:pb-20">
      <Container>
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold text-palm md:text-4xl">{t("title")}</h2>
          {products.length > HOME_LIMIT && (
            <Link href="/products" className="shrink-0 font-medium text-frond underline underline-offset-4">
              {t("viewAll")}
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <NoProducts />
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
            {featuredFirst.slice(0, HOME_LIMIT).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
