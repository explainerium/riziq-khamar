import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WhatsAppIcon } from "@/components/shared/BrandIcons";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { getPublicSettings } from "@/lib/catalog";
import { findOrderByToken } from "@/server/modules/order/order.service";
import { whatsappLink } from "@/utils/contact";
import { formatNumber, formatPack, formatTaka, localized, orderCode } from "@/utils/format";

type Props = PageProps<"/[locale]/order/[token]">;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("order");
  return { title: t("title"), robots: { index: false, follow: false } };
}

async function OrderContent({ params }: { params: Props["params"] }) {
  const { token } = await params;
  const [order, settings, locale, t] = await Promise.all([
    findOrderByToken(token),
    getPublicSettings(),
    getLocale(),
    getTranslations("order"),
  ]);
  if (!order) notFound();

  const code = orderCode(order.orderNo);
  const hasPrebook = order.items.some((item) => item.wasPrebook);
  const prebookNote = settings.prebookNote ? localized(settings.prebookNote, settings.prebookNoteEn, locale) : null;

  return (
    <Container className="max-w-xl py-10 md:py-16">
      <div className="leaf bg-palm px-5 py-8 text-center text-white">
        <CheckCircle2 className="mx-auto size-12 text-paddy" aria-hidden />
        <h1 className="mt-3 text-3xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-white/80">
          {t("number")} <strong className="text-paddy">{code}</strong>
        </p>
      </div>

      <section className="mt-5 rounded-xl bg-white p-4 sm:p-5">
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0">
              <div className="min-w-0">
                <p className="font-medium">{localized(item.productName, item.productNameEn, locale)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPack(item.packSize, item.packUnit, locale)} × {formatNumber(item.quantity, locale)}
                </p>
              </div>
              <span className="font-semibold">{formatTaka(item.lineTotal, locale)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 flex flex-col gap-1 border-t border-border pt-3">
          <div className="flex justify-between gap-4">
            <dt>{t("subtotal")}</dt>
            <dd>{formatTaka(order.subtotal, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>
              {t("delivery")} ({localized(order.deliveryLabel, order.deliveryLabelEn, locale)})
            </dt>
            <dd>{formatTaka(order.deliveryCharge, locale)}</dd>
          </div>
          <div className="mt-1 flex justify-between gap-4 text-lg font-bold text-palm">
            <dt>{t("total")}</dt>
            <dd>{formatTaka(order.total, locale)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5">
        <h2 className="text-xl font-semibold text-palm">{t("nextTitle")}</h2>
        <p className="mt-1">{t("nextBody")}</p>
        {hasPrebook && prebookNote && <p className="mt-3 rounded-lg bg-honey/25 px-3.5 py-2.5">{prebookNote}</p>}
      </section>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg" className="sm:flex-1">
          <a href={whatsappLink(settings.whatsapp, t("whatsappText", { code }))} target="_blank" rel="noreferrer">
            <WhatsAppIcon className="size-5" /> {t("whatsapp")}
          </a>
        </Button>
        <Button asChild size="lg" variant="secondary" className="sm:flex-1">
          <Link href="/products">{t("continue")}</Link>
        </Button>
      </div>
    </Container>
  );
}

function OrderSkeleton() {
  return (
    <Container aria-hidden className="flex max-w-xl flex-col gap-5 py-10">
      <Skeleton className="leaf h-44 w-full" />
      <Skeleton className="h-52 w-full" />
    </Container>
  );
}

export default function OrderPage({ params }: Props) {
  return (
    <main>
      <Suspense fallback={<OrderSkeleton />}>
        <OrderContent params={params} />
      </Suspense>
    </main>
  );
}
