"use client";

import { ChevronLeft, ChevronRight, RotateCw, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderStatus } from "@/constants/catalog";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { PageMeta } from "@/types/order";
import { formatNumber } from "@/utils/format";

/** A one-of-many choice (ToggleGroupItem): the chosen one fills with palm. */
export const CHOICE_ITEM =
  "text-[0.95rem] text-palm hover:bg-secondary hover:text-palm data-[state=on]:bg-palm data-[state=on]:text-white data-[state=on]:hover:bg-palm data-[state=on]:hover:text-white";

export function PageHeader({
  title,
  description,
  back,
  backOnPhoneOnly = false,
  actions,
}: {
  title: ReactNode;
  description?: string;
  back?: string;
  /** For pages the desktop sidebar already links to. */
  backOnPhoneOnly?: boolean;
  actions?: ReactNode;
}) {
  const t = useTranslations("admin.common");

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1">
        {back && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn("-ml-2 rounded-full text-palm hover:bg-secondary hover:text-palm", backOnPhoneOnly && "md:hidden")}
          >
            <Link href={back} aria-label={t("back")}>
              <ChevronLeft className="size-6" aria-hidden />
            </Link>
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-palm md:text-3xl">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions}
    </div>
  );
}

/** The dashboard's one content block: a Card, with a heading when it needs one. */
export function Panel({
  title,
  description,
  className,
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>
            <h2>{title}</h2>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  );
}

export function QueryError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("admin.common");
  return (
    <Card role="alert" className="items-start gap-3 px-5 py-5">
      <p>{t("loadError")}</p>
      <Button variant="secondary" onClick={onRetry}>
        <RotateCw aria-hidden />
        {t("retry")}
      </Button>
    </Card>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="leaf! items-center gap-0 px-6 py-12 text-center">
      <Icon className="size-9 text-frond" strokeWidth={1.5} aria-hidden />
      <h2 className="mt-3 text-xl font-semibold text-palm">{title}</h2>
      <p className="mt-1 max-w-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  NEW: "bg-honey text-soil",
  CONFIRMED: "bg-sky/60 text-palm",
  SHIPPED: "bg-secondary text-palm",
  DELIVERED: "bg-palm text-white",
  CANCELLED: "bg-muted text-muted-foreground",
};

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  const t = useTranslations("status");
  return (
    <Badge className={cn("h-auto px-2.5 py-0.5 text-[0.8rem] font-semibold", STATUS_STYLES[status], className)}>
      {t(status)}
    </Badge>
  );
}

export function PrebookBadge({ className }: { className?: string }) {
  const t = useTranslations("admin.orders");
  return <Badge className={cn("h-auto bg-honey/30 px-2 py-0.5 text-[0.8rem] text-soil", className)}>{t("prebook")}</Badge>;
}

export function Pagination({ meta, onPage }: { meta: PageMeta; onPage: (page: number) => void }) {
  const t = useTranslations("admin.common");
  const locale = useLocale();
  if (meta.totalPages <= 1) return null;

  return (
    <nav className="mt-5 flex items-center justify-between gap-3">
      <Button variant="secondary" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
        <ChevronLeft aria-hidden />
        {t("previous")}
      </Button>
      <span className="text-sm text-muted-foreground">
        {t("page", { page: formatNumber(meta.page, locale), pages: formatNumber(meta.totalPages, locale) })}
      </span>
      <Button variant="secondary" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>
        {t("next")}
        <ChevronRight aria-hidden />
      </Button>
    </nav>
  );
}
