import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/shared/Container";
import { NoProducts } from "@/components/store/product/NoProducts";
import { ProductBrowser } from "@/components/store/product/ProductBrowser";
import { ProductCard } from "@/components/store/product/ProductCard";
import { getProducts } from "@/lib/catalog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");
  return { title: t("title"), description: t("description") };
}

export default async function ProductsPage() {
  const [products, t] = await Promise.all([getProducts(), getTranslations("products")]);

  return (
    <main>
      <Container className="py-8 md:py-12">
        <h1 className="mb-6 text-4xl font-bold text-palm">{t("title")}</h1>
        {products.length === 0 ? (
          <NoProducts />
        ) : (
          <ProductBrowser
            items={products.map((product, index) => ({
              id: product.id,
              category: product.category,
              card: <ProductCard product={product} priority={index < 2} />,
            }))}
          />
        )}
      </Container>
    </main>
  );
}
