"use client";

import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSubmit } from "@/components/form/ProSubmit";
import { ProTextarea } from "@/components/form/ProTextarea";
import { Container } from "@/components/shared/Container";
import { ProductImage } from "@/components/shared/ProductImage";
import { AvailabilityPill } from "@/components/store/product/AvailabilityPill";
import { QuantityStepper } from "@/components/store/product/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiErrorText } from "@/hooks/useApiErrorText";
import { useIsClient } from "@/hooks/useIsClient";
import { Link, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useGetQuoteQuery, usePlaceOrderMutation } from "@/redux/api/checkoutApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearCart,
  removeFromCart,
  selectCartHydrated,
  selectCartLines,
  setQuantity,
  type CartLine,
} from "@/redux/slices/cartSlice";
import { checkoutFormSchema, type CheckoutFormValues } from "@/schemas/order.schema";
import type { Quote } from "@/types/order";
import { apiFieldErrors } from "@/utils/apiError";
import { formatPack, formatTaka, localized } from "@/utils/format";
import { uuid } from "@/utils/uuid";

function CheckoutSkeleton() {
  return (
    <div aria-hidden className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function EmptyCart() {
  const t = useTranslations("checkout");
  return (
    <div className="leaf bg-white px-6 py-12 text-center">
      <h2 className="text-xl font-semibold text-palm">{t("emptyTitle")}</h2>
      <p className="mt-1 text-muted-foreground">{t("emptyBody")}</p>
      <Button asChild size="lg" className="mt-5">
        <Link href="/products">{t("emptyCta")}</Link>
      </Button>
    </div>
  );
}

function CartLineRow({ line, quote }: { line: CartLine; quote: Quote | undefined }) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const dispatch = useAppDispatch();

  const quoted = quote?.lines.find((entry) => entry.productId === line.productId);
  const gone = quote?.missing.includes(line.productId) ?? false;
  const blocked = gone || quoted?.orderable === false;
  const source = quoted ?? line;
  const name = localized(source.name, source.nameEn, locale);

  return (
    <li className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
      <ProductImage url={line.imageUrl} alt="" sizes="72px" className="leaf-sm size-18 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">
              {formatPack(source.packSize, source.packUnit, locale)}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("remove", { name })}
            onClick={() => dispatch(removeFromCart(line.productId))}
            className="-mt-1 -mr-1 grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <Trash2 className="size-4.5" aria-hidden />
          </button>
        </div>

        {blocked ? (
          <p className="mt-1 text-sm font-medium text-destructive">{t("unavailable")}</p>
        ) : (
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <QuantityStepper
              value={line.quantity}
              onChange={(quantity) => dispatch(setQuantity({ productId: line.productId, quantity }))}
            />
            <span className="font-bold text-palm">{formatTaka(source.price * line.quantity, locale)}</span>
          </div>
        )}
        {source.availability === "PREBOOK" && <AvailabilityPill availability="PREBOOK" className="mt-1.5" />}
      </div>
    </li>
  );
}

function DeliveryOptions({ quote }: { quote: Quote | undefined }) {
  const t = useTranslations("checkout");
  const validation = useTranslations("validation");
  const locale = useLocale();
  const { field, fieldState } = useController<CheckoutFormValues, "deliveryOptionId">({ name: "deliveryOptionId" });

  return (
    <fieldset>
      <legend className="mb-1.5 text-[0.95rem] font-medium">
        {t("deliveryArea")} <span className="text-destructive">*</span>
      </legend>
      <div className="flex flex-col gap-2">
        {quote?.deliveryOptions.map((option) => {
          const checked = field.value === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "flex min-h-13 cursor-pointer items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/30",
                checked ? "border-frond bg-secondary" : "border-input bg-card",
              )}
            >
              <span className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name={field.name}
                  value={option.id}
                  checked={checked}
                  onChange={() => field.onChange(option.id)}
                  className="size-4.5 accent-[var(--palm)]"
                />
                {localized(option.label, option.labelEn, locale)}
              </span>
              <span className="font-semibold">{formatTaka(option.charge, locale)}</span>
            </label>
          );
        })}
      </div>
      {fieldState.error?.message && (
        <p role="alert" className="mt-1.5 text-sm text-destructive">
          {validation("deliveryRequired")}
        </p>
      )}
    </fieldset>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", strong && "text-lg font-bold text-palm")}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function CheckoutBody({ lines }: { lines: CartLine[] }) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const { register } = useFormContext<CheckoutFormValues>();
  const deliveryOptionId = useWatch<CheckoutFormValues, "deliveryOptionId">({ name: "deliveryOptionId" });

  const { data: quote, isError, refetch } = useGetQuoteQuery({
    items: lines.map(({ productId, quantity }) => ({ productId, quantity })),
    deliveryOptionId: deliveryOptionId || null,
  });

  const blocked = !quote || quote.missing.length > 0 || quote.lines.some((line) => !line.orderable);
  const hasPrebook = quote?.lines.some((line) => line.availability === "PREBOOK");
  const prebookNote = quote?.prebookNote ? localized(quote.prebookNote, quote.prebookNoteEn, locale) : null;

  return (
    <>
      <div className="flex min-w-0 flex-col gap-5">
        <section className="leaf bg-white p-4 sm:p-5" aria-label={t("itemsTitle")}>
          <ul className="divide-y divide-border">
            {lines.map((line) => (
              <CartLineRow key={line.productId} line={line} quote={quote} />
            ))}
          </ul>
        </section>

        <section className="leaf flex flex-col gap-4 bg-white p-4 sm:p-5">
          <h2 className="text-xl font-semibold text-palm">{t("yourDetails")}</h2>
          <ProInput name="customerName" label={t("name")} required autoComplete="name" />
          <ProInput
            name="customerPhone"
            label={t("phone")}
            type="tel"
            inputMode="tel"
            placeholder={t("phonePlaceholder")}
            required
            autoComplete="tel"
          />
          <ProTextarea
            name="address"
            label={t("address")}
            placeholder={t("addressPlaceholder")}
            required
            autoComplete="street-address"
          />
          <DeliveryOptions quote={quote} />
          <ProTextarea name="customerNote" label={t("note")} rows={2} />

          {/* Hidden from people; bots fill it in. */}
          <input
            {...register("website")}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute -left-[9999px] size-px opacity-0"
          />
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <section className="leaf bg-white p-4 sm:p-5">
          <h2 className="text-xl font-semibold text-palm">{t("summary")}</h2>

          {isError ? (
            <div role="alert" className="mt-3">
              <p className="text-destructive">{t("quoteError")}</p>
              <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => refetch()}>
                {t("retry")}
              </Button>
            </div>
          ) : (
            <dl className="mt-3 flex flex-col gap-1.5">
              <SummaryRow label={t("subtotal")} value={quote ? formatTaka(quote.subtotal, locale) : "…"} />
              <SummaryRow
                label={t("delivery")}
                value={quote?.selectedDeliveryId ? formatTaka(quote.deliveryCharge, locale) : t("deliveryPick")}
              />
              <div className="my-1 border-t border-border" />
              <SummaryRow label={t("total")} value={quote ? formatTaka(quote.total, locale) : "…"} strong />
            </dl>
          )}

          <p className="mt-4 rounded-lg bg-secondary px-3 py-2.5 text-[0.95rem] text-palm">{t("paymentCod")}</p>
          {hasPrebook && prebookNote && <p className="mt-2 rounded-lg bg-honey/25 px-3 py-2.5 text-[0.95rem]">{prebookNote}</p>}

          <ProSubmit className="mt-4 w-full" disabled={blocked} pendingLabel={t("confirming")}>
            {t("confirm")}
          </ProSubmit>
          {quote && blocked && <p className="mt-2 text-sm text-destructive">{t("removeUnavailable")}</p>}
        </section>
      </aside>
    </>
  );
}

function Checkout() {
  const t = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const errorText = useApiErrorText();
  const lines = useAppSelector(selectCartLines);
  const hydrated = useAppSelector(selectCartHydrated);
  const [placeOrder] = usePlaceOrderMutation();
  const [placed, setPlaced] = useState(false);
  // One key per order: if the connection drops and the customer taps again, the server returns the same order.
  const idempotencyKey = useRef<string | null>(null);

  if (!hydrated || placed) return <CheckoutSkeleton />;
  if (lines.length === 0) return <EmptyCart />;

  return (
    <ProForm
      schema={checkoutFormSchema}
      defaultValues={{
        customerName: "",
        customerPhone: "",
        address: "",
        deliveryOptionId: "",
        customerNote: "",
        website: "",
      }}
      className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-8"
      onSubmit={async (values, form) => {
        idempotencyKey.current ??= uuid();
        try {
          const order = await placeOrder({
            ...values,
            locale,
            idempotencyKey: idempotencyKey.current,
            items: lines.map(({ productId, quantity }) => ({ productId, quantity })),
          }).unwrap();
          setPlaced(true);
          dispatch(clearCart());
          router.replace(`/order/${order.token}`);
        } catch (error) {
          for (const { path, message } of apiFieldErrors(error)) {
            form.setError(path as keyof CheckoutFormValues, { message });
          }
          toast.error(errorText(error));
        }
      }}
    >
      <h1 className="sr-only">{t("title")}</h1>
      <CheckoutBody lines={lines} />
    </ProForm>
  );
}

export function CheckoutView() {
  const isClient = useIsClient();
  return <Container className="py-6 md:py-10">{isClient ? <Checkout /> : <CheckoutSkeleton />}</Container>;
}
