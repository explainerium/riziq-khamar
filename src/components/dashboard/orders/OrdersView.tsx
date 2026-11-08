"use client";

import { ClipboardList, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ORDER_STATUSES, type OrderStatus } from "@/constants/catalog";
import { cn } from "@/lib/utils";
import { useAdminOrdersQuery, useOrderCountsQuery } from "@/redux/api/orderApi";
import { formatNumber } from "@/utils/format";
import { CHOICE_ITEM, EmptyState, ListSkeleton, PageHeader, Pagination, QueryError } from "../common";
import { OrderCard } from "./OrderCard";

const SEARCH_DELAY_MS = 350;
const ALL = "ALL";

export function OrdersView() {
  const t = useTranslations("admin.orders");
  const statusLabel = useTranslations("status");
  const locale = useLocale();

  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: counts } = useOrderCountsQuery();
  const { data, isLoading, isFetching, isError, refetch } = useAdminOrdersQuery({
    page,
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  });

  const onSearch = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSearch(value.trim());
      setPage(1);
    }, SEARCH_DELAY_MS);
  };

  const filter = (value: string, label: string, count: number | undefined) => (
    <ToggleGroupItem
      key={value}
      value={value}
      className={cn(CHOICE_ITEM, "h-10 gap-1.5 rounded-full bg-white px-3.5 ring-1 ring-foreground/10")}
    >
      {label}
      {count !== undefined && <span className="text-sm opacity-75">{formatNumber(count, locale)}</span>}
    </ToggleGroupItem>
  );

  return (
    <>
      <PageHeader title={t("title")} />

      {/* Phones: search, then the filters. Wide screens: one row, search on the right. */}
      <div className="mb-4 flex flex-col gap-3 xl:flex-row-reverse xl:items-center xl:justify-between">
        <div className="relative xl:w-96 xl:shrink-0">
          <Search className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            aria-label={t("search")}
            placeholder={t("search")}
            defaultValue=""
            onChange={(event) => onSearch(event.target.value)}
            className="pl-11"
          />
        </div>

        <ToggleGroup
          type="single"
          aria-label={t("status")}
          value={status ?? ALL}
          onValueChange={(value) => {
            // Tapping the chosen filter again sends an empty value: it stays chosen.
            if (!value) return;
            setStatus(value === ALL ? undefined : (value as OrderStatus));
            setPage(1);
          }}
          className="scrollbar-none -mx-4 w-auto justify-start overflow-x-auto px-4 py-1 md:mx-0 md:px-0.5 xl:min-w-0"
        >
          {filter(ALL, t("all"), counts?.ALL)}
          {ORDER_STATUSES.map((value) => filter(value, statusLabel(value), counts?.[value]))}
        </ToggleGroup>
      </div>

      {isError ? (
        <QueryError onRetry={refetch} />
      ) : isLoading || !data ? (
        <ListSkeleton />
      ) : data.data.length === 0 ? (
        <EmptyState icon={ClipboardList} title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <>
          <div className={cn("grid gap-3 lg:grid-cols-2 2xl:grid-cols-3", isFetching && "opacity-70")}>
            {data.data.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <Pagination meta={data.meta} onPage={setPage} />
        </>
      )}
    </>
  );
}
