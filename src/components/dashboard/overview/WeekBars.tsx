"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatNumber, formatWeekday } from "@/utils/format";

const PLOT_HEIGHT = 96;
/** A day with no orders still shows where its bar would stand. */
const MIN_BAR = 2;

/**
 * One series, so one colour and no legend: the panel title says what it is.
 * Today is the bar that matters, so it alone carries a number; the rest show
 * theirs on hover or focus, and the hidden table holds them all.
 */
export function WeekBars({ days }: { days: { date: string; orders: number }[] }) {
  const t = useTranslations("admin.overview");
  const locale = useLocale();
  const max = Math.max(1, ...days.map((day) => day.orders));

  return (
    <figure className="min-w-0">
      <figcaption className="text-sm text-white/75">{t("lastWeek")}</figcaption>

      <div className="mt-6 grid grid-cols-7 border-b border-white/25" style={{ height: PLOT_HEIGHT }} aria-hidden>
        {days.map((day, index) => {
          const today = index === days.length - 1;
          const height = Math.max(MIN_BAR, (day.orders / max) * (PLOT_HEIGHT - 4));
          const value = formatNumber(day.orders, locale);
          return (
            // The whole column is the hover and tap target, wider and taller than the bar.
            <div key={day.date} tabIndex={0} className="group relative flex items-end justify-center outline-none">
              <span
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 text-sm font-semibold whitespace-nowrap text-white",
                  today ? "opacity-100" : "opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100",
                )}
                style={{ bottom: height + 2 }}
              >
                {value}
              </span>
              <span
                className={cn(
                  "w-[min(1.5rem,70%)] rounded-t bg-paddy transition-opacity group-hover:opacity-100 group-focus:opacity-100",
                  !today && "opacity-60",
                )}
                style={{ height }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 grid grid-cols-7 text-center text-xs text-white/75" aria-hidden>
        {days.map((day) => (
          <span key={day.date}>{formatWeekday(day.date, locale)}</span>
        ))}
      </div>

      <table className="sr-only">
        <caption>{t("chartLabel")}</caption>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <th scope="row">{formatWeekday(day.date, locale)}</th>
              <td>{formatNumber(day.orders, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
