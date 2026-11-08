"use client";

import { Package, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ProductImage } from "@/components/shared/ProductImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AVAILABILITIES, type Availability } from "@/constants/catalog";
import { ADMIN_LINKS } from "@/constants/site";
import { useApiErrorText } from "@/hooks/useApiErrorText";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAdminProductsQuery, useUpdateProductMutation } from "@/redux/api/productApi";
import type { AdminProduct } from "@/types/catalog";
import { formatPack, formatTaka } from "@/utils/format";
import { EmptyState, ListSkeleton, PageHeader, QueryError } from "../common";

const AVAILABILITY_DOT: Record<Availability, string> = {
  IN_STOCK: "bg-frond",
  PREBOOK: "bg-honey",
  OUT_OF_STOCK: "bg-muted-foreground/50",
};

function ProductRow({ product }: { product: AdminProduct }) {
  const t = useTranslations("admin.products");
  const availability = useTranslations("availability");
  const locale = useLocale();
  const errorText = useApiErrorText();
  const [update] = useUpdateProductMutation();

  const change = async (next: Availability) => {
    try {
      await update({ id: product.id, body: { availability: next } }).unwrap();
      toast.success(t("availabilitySaved"));
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  return (
    <li>
      <Card size="sm" className="h-full flex-row gap-3 px-3">
        <Link href={`${ADMIN_LINKS.products}/${product.id}`} className="shrink-0">
          <ProductImage url={product.images[0]?.url} alt="" sizes="96px" className="leaf-sm size-20 sm:size-24" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={`${ADMIN_LINKS.products}/${product.id}`} className="block">
            <p className="truncate text-[1.05rem] font-semibold">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-palm">{formatTaka(product.price, locale)}</span>
              <span className="ml-2">{formatPack(product.packSize, product.packUnit, locale)}</span>
            </p>
          </Link>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Select value={product.availability} onValueChange={(value) => change(value as Availability)}>
              <SelectTrigger
                size="sm"
                aria-label={t("availabilityLabel", { name: product.name })}
                className="w-full sm:w-48"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    <span className={cn("size-2 shrink-0 rounded-full", AVAILABILITY_DOT[value])} aria-hidden />
                    {availability(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!product.isPublished && (
              <Badge variant="secondary" className="h-auto bg-muted px-2.5 py-0.5 text-[0.8rem] text-muted-foreground">
                {t("hidden")}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}

export function ProductsView() {
  const t = useTranslations("admin.products");
  const { data, isLoading, isError, refetch } = useAdminProductsQuery();

  const addButton = (
    <Button asChild>
      <Link href={ADMIN_LINKS.newProduct}>
        <Plus aria-hidden />
        {t("add")}
      </Link>
    </Button>
  );

  return (
    <>
      <PageHeader title={t("title")} actions={addButton} />
      {isError ? (
        <QueryError onRetry={refetch} />
      ) : isLoading || !data ? (
        <ListSkeleton />
      ) : data.length === 0 ? (
        <EmptyState icon={Package} title={t("emptyTitle")} body={t("emptyBody")} action={addButton} />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {data.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </ul>
      )}
    </>
  );
}
