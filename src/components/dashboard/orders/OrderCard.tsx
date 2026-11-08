"use client";

import { Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { WhatsAppIcon } from "@/components/shared/BrandIcons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_LINKS } from "@/constants/site";
import { Link } from "@/i18n/navigation";
import type { OrderRow } from "@/types/order";
import { telLink, whatsappLinkForLocal } from "@/utils/contact";
import { formatDateTime, formatNumber, formatTaka, orderCode } from "@/utils/format";
import { PrebookBadge, StatusPill } from "../common";

export function OrderCard({ order }: { order: OrderRow }) {
  const t = useTranslations("admin.orders");
  const locale = useLocale();
  const others = order.itemCount - 1;

  return (
    <Card>
      <CardContent>
        <Link href={`${ADMIN_LINKS.orders}/${order.id}`} className="block">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[1.05rem] font-semibold">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">
                <span>{orderCode(order.orderNo)}</span>
                <span className="ml-2.5">{formatDateTime(order.createdAt, locale)}</span>
              </p>
            </div>
            <StatusPill status={order.status} />
          </div>
          <p className="mt-2 truncate">
            {others > 0 ? t("moreItems", { first: order.firstItem ?? "", count: formatNumber(others, locale) }) : order.firstItem}
            {order.hasPrebook && <PrebookBadge className="ml-2" />}
          </p>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-palm">{formatTaka(order.total, locale)}</span>
          <div className="flex gap-1.5">
            <Button asChild variant="secondary" size="sm">
              <a href={telLink(order.customerPhone)}>
                <Phone aria-hidden />
                {t("call")}
              </a>
            </Button>
            <Button asChild variant="secondary" size="icon-sm" aria-label={t("whatsapp")}>
              <a href={whatsappLinkForLocal(order.customerPhone)} target="_blank" rel="noreferrer">
                <WhatsAppIcon className="size-4.5" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
