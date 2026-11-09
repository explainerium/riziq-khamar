import { useLocale, useTranslations } from "next-intl";
import { ProductImage } from "@/components/shared/ProductImage";
import { Link } from "@/i18n/navigation";
import type { PublicProduct } from "@/types/catalog";
import { formatPack, localized } from "@/utils/format";
import { AvailabilityPill } from "./AvailabilityPill";
import { Price } from "./Price";
import { QuickAdd } from "./QuickAdd";

export const toCartLine = (product: PublicProduct) => ({
  productId: product.id,
  slug: product.slug,
  name: product.name,
  nameEn: product.nameEn,
  packSize: product.packSize,
  packUnit: product.packUnit,
  price: product.price,
  availability: product.availability,
  imageUrl: product.images[0]?.url ?? null,
});

export function ProductCard({ product, priority = false }: { product: PublicProduct; priority?: boolean }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const name = localized(product.name, product.nameEn, locale);

  return (
    <article className="flex min-w-0 flex-col">
      <Link href={`/products/${product.slug}`} className="group relative block">
        <ProductImage
          url={product.images[0]?.url}
          alt={name}
          sizes="(min-width: 1152px) 261px, (min-width: 768px) 25vw, calc(50vw - 22px)"
          priority={priority}
          thrifty
          className="leaf aspect-square w-full"
        />
        <AvailabilityPill availability={product.availability} className="absolute top-2.5 left-2.5" />
      </Link>

      <div className="mt-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[1.05rem] font-semibold">
            <Link href={`/products/${product.slug}`} className="hover:text-frond">
              {name}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">{formatPack(product.packSize, product.packUnit, locale)}</p>
          <Price price={product.price} comparePrice={product.comparePrice} className="mt-0.5 text-[1.05rem]" />
        </div>
        {product.availability !== "OUT_OF_STOCK" && (
          <QuickAdd line={toCartLine(product)} label={t("addNamed", { name })} />
        )}
      </div>
    </article>
  );
}
