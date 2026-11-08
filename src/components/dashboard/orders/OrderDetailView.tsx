"use client";

import { Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/shared/BrandIcons";
import { ProductImage } from "@/components/shared/ProductImage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ORDER_STATUSES, type OrderStatus } from "@/constants/catalog";
import { ADMIN_LINKS } from "@/constants/site";
import { useApiErrorText } from "@/hooks/useApiErrorText";
import { cn } from "@/lib/utils";
import { useAdminOrderQuery, useUpdateOrderMutation } from "@/redux/api/orderApi";
import type { OrderDetail } from "@/types/order";
import { telLink, whatsappLinkForLocal } from "@/utils/contact";
import { formatDateTime, formatNumber, formatPack, formatTaka, orderCode } from "@/utils/format";
import { CHOICE_ITEM, ListSkeleton, PageHeader, Panel, PrebookBadge, QueryError } from "../common";

function StatusControl({ order }: { order: OrderDetail }) {
  const t = useTranslations("status");
  const orders = useTranslations("admin.orders");
  const errorText = useApiErrorText();
  const [update, { isLoading }] = useUpdateOrderMutation();

  const choose = async (status: OrderStatus) => {
    if (status === order.status) return;
    try {
      await update({ id: order.id, status }).unwrap();
      toast.success(orders("statusSaved"));
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  return (
    <ToggleGroup
      type="single"
      aria-label={orders("status")}
      value={order.status}
      disabled={isLoading}
      onValueChange={(value) => {
        // Tapping the current status sends an empty value: nothing to change.
        if (value) choose(value as OrderStatus);
      }}
      className="w-full flex-wrap justify-start"
    >
      {ORDER_STATUSES.map((status) => (
        <ToggleGroupItem key={status} value={status} className={cn(CHOICE_ITEM, "h-11 bg-secondary px-3.5")}>
          {t(status)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function NoteForm({ order }: { order: OrderDetail }) {
  const t = useTranslations("admin.orders");
  const errorText = useApiErrorText();
  const [note, setNote] = useState(order.adminNote ?? "");
  const [update, { isLoading }] = useUpdateOrderMutation();

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          await update({ id: order.id, adminNote: note }).unwrap();
          toast.success(t("noteSaved"));
        } catch (error) {
          toast.error(errorText(error));
        }
      }}
    >
      <Label htmlFor="admin-note" className="sr-only">
        {t("adminNote")}
      </Label>
      <Textarea
        id="admin-note"
        rows={2}
        value={note}
        placeholder={t("adminNotePlaceholder")}
        onChange={(event) => setNote(event.target.value)}
      />
      <Button type="submit" variant="secondary" className="mt-2" disabled={isLoading}>
        {t("saveNote")}
      </Button>
    </form>
  );
}

export function OrderDetailView() {
  const t = useTranslations("admin.orders");
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useAdminOrderQuery(id);

  if (isError) return <QueryError onRetry={refetch} />;
  if (isLoading || !order) return <ListSkeleton rows={3} />;

  return (
    <>
      <PageHeader title={orderCode(order.orderNo)} back={ADMIN_LINKS.orders} />
      <p className="-mt-4 mb-4 text-sm text-muted-foreground">{formatDateTime(order.createdAt, locale)}</p>

      <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
        <div className="flex min-w-0 flex-col gap-3">
          <Panel title={t("status")}>
            <StatusControl order={order} />
          </Panel>

          <Panel title={t("customer")}>
            <p className="text-[1.05rem] font-semibold">{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerPhone}</p>
            <p className="mt-2 whitespace-pre-line">{order.address}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("language", { language: order.locale === "en" ? "English" : "বাংলা" })}
            </p>
            <div className="mt-3 flex gap-2">
              <Button asChild className="flex-1">
                <a href={telLink(order.customerPhone)}>
                  <Phone aria-hidden />
                  {t("call")}
                </a>
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <a
                  href={whatsappLinkForLocal(order.customerPhone, `${orderCode(order.orderNo)}`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppIcon className="size-4.5" />
                  {t("whatsapp")}
                </a>
              </Button>
            </div>
          </Panel>

          {order.customerNote && (
            <Panel title={t("customerNote")}>
              <p className="whitespace-pre-line">{order.customerNote}</p>
            </Panel>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <Panel title={t("items")}>
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 py-2.5 first:pt-0">
                  <ProductImage url={item.imageUrl} alt="" sizes="56px" className="leaf-sm size-14 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {item.productName}
                      {item.wasPrebook && <PrebookBadge className="ml-2" />}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPack(item.packSize, item.packUnit, locale)} × {formatNumber(item.quantity, locale)}
                    </p>
                  </div>
                  <span className="font-semibold">{formatTaka(item.lineTotal, locale)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 flex flex-col gap-1 border-t border-border pt-2.5">
              <div className="flex justify-between gap-4">
                <dt>{t("subtotal")}</dt>
                <dd>{formatTaka(order.subtotal, locale)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>
                  {t("delivery")} ({order.deliveryLabel})
                </dt>
                <dd>{formatTaka(order.deliveryCharge, locale)}</dd>
              </div>
              <div className="mt-1 flex justify-between gap-4 text-lg font-bold text-palm">
                <dt>{t("total")}</dt>
                <dd>{formatTaka(order.total, locale)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-sm text-muted-foreground">{t("paymentCod")}</p>
          </Panel>

          <Panel title={t("adminNote")}>
            <NoteForm key={order.id} order={order} />
          </Panel>
        </div>
      </div>
    </>
  );
}
