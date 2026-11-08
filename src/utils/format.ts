import { PACK_UNITS, CATEGORIES, type CategoryCode, type PackUnit } from "@/constants/catalog";
import { TIME_ZONE } from "@/constants/site";

type AppLocale = "bn" | "en" | string;

const numberLocale = (locale: AppLocale) => (locale === "bn" ? "bn-BD" : "en-IN");
const dateLocale = (locale: AppLocale) => (locale === "bn" ? "bn-BD" : "en-GB");

export const formatNumber = (value: number, locale: AppLocale): string =>
  new Intl.NumberFormat(numberLocale(locale)).format(value);

/** ৳১,২৫০ in Bangla, ৳1,250 in English. */
export const formatTaka = (amount: number, locale: AppLocale): string => `৳${formatNumber(amount, locale)}`;

/** ১ কেজি in Bangla, 1 kg in English. */
export function formatPack(size: number, unit: string, locale: AppLocale): string {
  const labels = PACK_UNITS[unit as PackUnit];
  const label = labels ? labels[locale === "bn" ? "bn" : "en"] : unit;
  return `${formatNumber(size, locale)} ${label}`;
}

export function categoryLabel(code: string, locale: AppLocale): string {
  const labels = CATEGORIES[code as CategoryCode];
  return labels ? labels[locale === "bn" ? "bn" : "en"] : code;
}

export const orderCode = (orderNo: number): string => `RK-${orderNo}`;

export const formatDateTime = (value: string | Date, locale: AppLocale): string =>
  new Intl.DateTimeFormat(dateLocale(locale), {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

/** Short day name for the chart ("রবি", "Sun"). */
export const formatWeekday = (value: string | Date, locale: AppLocale): string =>
  new Intl.DateTimeFormat(dateLocale(locale), { timeZone: TIME_ZONE, weekday: "short" }).format(new Date(value));

/** English when it is there and the page is English, otherwise Bangla. */
export const localized = (bangla: string, english: string | null | undefined, locale: AppLocale): string =>
  locale === "en" && english?.trim() ? english : bangla;
