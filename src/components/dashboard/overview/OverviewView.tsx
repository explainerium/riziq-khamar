"use client";

import { Package } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_LINKS } from "@/constants/site";
import { Link } from "@/i18n/navigation";
import { useDashboardQuery } from "@/redux/api/orderApi";
import { formatNumber, formatTaka } from "@/utils/format";
import { EmptyState, Panel, QueryError } from "../common";
import { OrderCard } from "../orders/OrderCard";
import { WeekBars } from "./WeekBars";

function Stat({ label, value, hint, href }: { label: string; value: ReactNode; hint?: string; href: string }) {
  return (
    <Link href={href} className="min-w-0 px-4 py-3.5 transition-colors hover:bg-mist">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-bold text-palm">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Link>
  );
}

function OverviewSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <Skeleton className="leaf h-56 w-full" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}

export function OverviewView() {
  const t = useTranslations("admin.overview");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useDashboardQuery(undefined, { refetchOnMountOrArgChange: true });

  if (isError) return <QueryError onRetry={refetch} />;
  if (isLoading || !data) return <OverviewSkeleton />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="sr-only">{t("todayLabel")}</h1>

      <section className="leaf grid gap-7 bg-palm p-5 text-white sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:p-7">
        <div>
          <p className="text-white/80">{t("todayLabel")}</p>
          <p className="mt-1 text-6xl leading-none font-bold">{formatNumber(data.todayOrders, locale)}</p>
          <p className="mt-3 text-white/80">{t("todayValue", { value: formatTaka(data.todayValue, locale) })}</p>
        </div>
        <WeekBars days={data.days} />
      </section>

      <Card className="grid grid-cols-2 gap-0 divide-border py-0 max-sm:[&>*:nth-child(-n+2)]:border-b sm:grid-cols-4 sm:divide-x max-sm:[&>*:nth-child(odd)]:border-r">
        <Stat label={t("newOrders")} value={formatNumber(data.newOrders, locale)} href={ADMIN_LINKS.orders} />
        <Stat label={t("toDeliver")} value={formatNumber(data.toDeliver, locale)} href={ADMIN_LINKS.orders} />
        <Stat
          label={t("monthSales")}
          value={formatTaka(data.monthSales, locale)}
          hint={t("monthSalesHint")}
          href={ADMIN_LINKS.orders}
        />
        <Stat label={t("products")} value={formatNumber(data.productCount, locale)} href={ADMIN_LINKS.products} />
      </Card>

      {data.productCount === 0 && (
        <EmptyState
          icon={Package}
          title={t("addFirstTitle")}
          body={t("addFirstBody")}
          action={
            <Button asChild size="lg">
              <Link href={ADMIN_LINKS.newProduct}>{t("addProduct")}</Link>
            </Button>
          }
        />
      )}

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-palm">{t("recent")}</h2>
          {data.recent.length > 0 && (
            <Button asChild variant="link" className="h-auto p-0 text-base text-frond underline">
              <Link href={ADMIN_LINKS.orders}>{t("viewAll")}</Link>
            </Button>
          )}
        </div>
        {data.recent.length === 0 ? (
          <Panel>
            <p className="text-muted-foreground">{t("noOrders")}</p>
          </Panel>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {data.recent.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
