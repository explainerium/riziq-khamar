"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSelect } from "@/components/form/ProSelect";
import { ProSubmit } from "@/components/form/ProSubmit";
import { ProSwitch } from "@/components/form/ProSwitch";
import { ProTextarea } from "@/components/form/ProTextarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AVAILABILITIES,
  CATEGORIES,
  CATEGORY_CODES,
  PACK_UNIT_CODES,
  PACK_UNITS,
  QUICK_PACKS,
} from "@/constants/catalog";
import { ADMIN_LINKS } from "@/constants/site";
import { useApiErrorText } from "@/hooks/useApiErrorText";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  useAdminProductQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "@/redux/api/productApi";
import { productSchema, type ProductFormValues } from "@/schemas/product.schema";
import type { AdminProduct } from "@/types/catalog";
import { apiFieldErrors } from "@/utils/apiError";
import { formatPack } from "@/utils/format";
import { CHOICE_ITEM, ListSkeleton, PageHeader, Panel, QueryError } from "../common";
import { ImageUploader } from "./ImageUploader";

const BLANK: ProductFormValues = {
  name: "",
  nameEn: "",
  slug: "",
  category: "GUR",
  packSize: "1",
  packUnit: "kg",
  price: "",
  comparePrice: "",
  description: "",
  descriptionEn: "",
  availability: "IN_STOCK",
  isPublished: true,
  isFeatured: false,
  sortOrder: "0",
  images: [],
};

const toFormValues = (product: AdminProduct): ProductFormValues => ({
  name: product.name,
  nameEn: product.nameEn ?? "",
  slug: product.slug,
  category: product.category as ProductFormValues["category"],
  packSize: String(product.packSize),
  packUnit: product.packUnit as ProductFormValues["packUnit"],
  price: String(product.price),
  comparePrice: product.comparePrice == null ? "" : String(product.comparePrice),
  description: product.description,
  descriptionEn: product.descriptionEn ?? "",
  availability: product.availability,
  isPublished: product.isPublished,
  isFeatured: product.isFeatured,
  sortOrder: String(product.sortOrder),
  images: product.images,
});

const packKey = (size: unknown, unit: unknown) => `${String(size)}-${String(unit)}`;

function QuickPacks({ className }: { className?: string }) {
  const t = useTranslations("admin.products");
  const locale = useLocale();
  const { setValue, control } = useFormContext<ProductFormValues>();
  const [size, unit] = useWatch({ control, name: ["packSize", "packUnit"] });

  return (
    <ToggleGroup
      type="single"
      aria-label={t("packSize")}
      value={packKey(size, unit)}
      onValueChange={(value) => {
        const pack = QUICK_PACKS.find((entry) => packKey(entry.size, entry.unit) === value);
        if (!pack) return;
        setValue("packSize", String(pack.size), { shouldDirty: true, shouldValidate: true });
        setValue("packUnit", pack.unit, { shouldDirty: true });
      }}
      className={cn("scrollbar-none w-full justify-start overflow-x-auto p-0.5", className)}
    >
      {QUICK_PACKS.map((pack) => (
        <ToggleGroupItem
          key={packKey(pack.size, pack.unit)}
          value={packKey(pack.size, pack.unit)}
          className={cn(CHOICE_ITEM, "h-9 rounded-full bg-secondary px-3")}
        >
          {formatPack(pack.size, pack.unit, locale)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

const OPTIONAL_SECTION_FIELDS = {
  english: ["nameEn", "descriptionEn"],
  more: ["comparePrice", "slug", "sortOrder"],
} as const;

const SECTION_TRIGGER = "min-h-13 items-center rounded-none px-4 text-[0.95rem] text-palm hover:no-underline focus-visible:ring-inset";
const SECTION_CONTENT = "flex h-auto flex-col gap-4 px-4 pt-1 pb-4 [&_p:not(:last-child)]:mb-0";

/** English and the rarely used options. A section holding an error stays open, so the message is never hidden. */
function OptionalSections() {
  const t = useTranslations("admin.products");
  const { control } = useFormContext<ProductFormValues>();
  const { errors } = useFormState({ control });
  const [opened, setOpened] = useState<string[]>([]);

  const failing = Object.entries(OPTIONAL_SECTION_FIELDS)
    .filter(([, fields]) => fields.some((field) => errors[field]))
    .map(([section]) => section);

  return (
    <Card className="py-0">
      <Accordion type="multiple" value={[...new Set([...opened, ...failing])]} onValueChange={setOpened}>
        <AccordionItem value="english">
          <AccordionTrigger className={SECTION_TRIGGER}>{t("english")}</AccordionTrigger>
          <AccordionContent className={SECTION_CONTENT}>
            <p className="text-sm text-muted-foreground">{t("englishHint")}</p>
            <ProInput name="nameEn" label={t("nameEn")} />
            <ProTextarea name="descriptionEn" label={t("descriptionEn")} rows={4} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="more">
          <AccordionTrigger className={SECTION_TRIGGER}>{t("more")}</AccordionTrigger>
          <AccordionContent className={SECTION_CONTENT}>
            <div className="grid gap-4 md:grid-cols-3">
              <ProInput
                name="comparePrice"
                label={t("comparePrice")}
                description={t("comparePriceHint")}
                inputMode="numeric"
              />
              <ProInput name="slug" label={t("slug")} description={t("slugHint")} />
              <ProInput name="sortOrder" label={t("sortOrder")} description={t("sortOrderHint")} inputMode="numeric" />
            </div>
            <ProSwitch name="isFeatured" label={t("isFeatured")} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function DeleteProduct({ product }: { product: AdminProduct }) {
  const t = useTranslations("admin.products");
  const common = useTranslations("admin.common");
  const errorText = useApiErrorText();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [remove, { isLoading }] = useDeleteProductMutation();

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        <Trash2 aria-hidden />
        {t("delete")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>{t("deleteBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              {common("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={async () => {
                try {
                  await remove(product.id).unwrap();
                  toast.success(t("deleted"));
                  router.replace(ADMIN_LINKS.products);
                } catch (error) {
                  toast.error(errorText(error));
                }
              }}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProductForm({ product }: { product?: AdminProduct }) {
  const t = useTranslations("admin.products");
  const availability = useTranslations("availability");
  const locale = useLocale() as "bn" | "en";
  const router = useRouter();
  const errorText = useApiErrorText();
  const [uploading, setUploading] = useState(false);
  const [create] = useCreateProductMutation();
  const [update] = useUpdateProductMutation();

  return (
    <ProForm
      schema={productSchema}
      defaultValues={product ? toFormValues(product) : BLANK}
      // Wide screens: details on the left; photos, Save and the page's actions on the right.
      className="grid gap-3 pb-20 md:pb-0 lg:grid-cols-[minmax(0,1fr)_26rem] lg:grid-rows-[auto_auto_1fr] lg:items-start lg:gap-4"
      onSubmit={async (values, form) => {
        try {
          if (product) {
            await update({ id: product.id, body: values }).unwrap();
            toast.success(t("saved"));
          } else {
            await create(values).unwrap();
            toast.success(t("created"));
            // Next keeps visited pages mounted, so this form must not come back filled in.
            form.reset(BLANK);
            router.push(ADMIN_LINKS.products);
          }
        } catch (error) {
          for (const { path, message } of apiFieldErrors(error)) {
            form.setError(path as keyof ProductFormValues, { message });
          }
          toast.error(errorText(error));
        }
      }}
    >
      <Panel className="min-w-0 lg:col-start-2 lg:row-start-1">
        <ImageUploader onBusyChange={setUploading} />
      </Panel>

      <div className="flex min-w-0 flex-col gap-3 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:gap-4">
        <Panel>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 xl:grid-cols-4">
            <ProInput
              name="name"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              required
              className="col-span-2"
            />
            <ProInput name="price" label={t("price")} inputMode="numeric" required />
            <ProSelect
              name="category"
              label={t("category")}
              options={CATEGORY_CODES.map((code) => ({ value: code, label: CATEGORIES[code][locale] }))}
            />
            <QuickPacks className="col-span-2 xl:col-span-4" />
            <ProInput name="packSize" label={t("packSize")} inputMode="decimal" required />
            <ProSelect
              name="packUnit"
              label={t("packUnit")}
              options={PACK_UNIT_CODES.map((code) => ({ value: code, label: PACK_UNITS[code][locale] }))}
            />
            <ProSelect
              name="availability"
              label={t("availability")}
              options={AVAILABILITIES.map((value) => ({ value, label: availability(value) }))}
              className="col-span-2"
            />
            <ProTextarea
              name="description"
              label={t("description")}
              placeholder={t("descriptionPlaceholder")}
              rows={4}
              className="col-span-2 xl:col-span-4"
            />
            <div className="col-span-2 xl:col-span-4">
              <ProSwitch name="isPublished" label={t("isPublished")} description={t("isPublishedHint")} />
            </div>
          </div>
        </Panel>

        <OptionalSections />
      </div>

      {product && (
        <div className="flex flex-wrap gap-2 lg:col-start-2 lg:row-start-3">
          <Button asChild variant="secondary">
            <Link href={`/products/${product.slug}`} target="_blank">
              <ExternalLink aria-hidden />
              {t("viewOnSite")}
            </Link>
          </Button>
          <DeleteProduct product={product} />
        </div>
      )}

      {/* On phones Save stays above the tab bar, so it is never a scroll away. */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:static md:border-0 md:bg-transparent md:p-0 lg:col-start-2 lg:row-start-2">
        <ProSubmit className="w-full md:w-auto lg:w-full" disabled={uploading}>
          {uploading ? t("uploadingWait") : t("save")}
        </ProSubmit>
      </div>
    </ProForm>
  );
}

export function NewProductView() {
  const t = useTranslations("admin.products");
  return (
    <>
      <PageHeader title={t("newTitle")} back={ADMIN_LINKS.products} />
      <ProductForm />
    </>
  );
}

export function EditProductView() {
  const t = useTranslations("admin.products");
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError, refetch } = useAdminProductQuery(id);

  return (
    <>
      <PageHeader title={t("editTitle")} back={ADMIN_LINKS.products} />
      {isError ? (
        <QueryError onRetry={refetch} />
      ) : isLoading || !product ? (
        <ListSkeleton rows={3} />
      ) : (
        <ProductForm key={product.id} product={product} />
      )}
    </>
  );
}
