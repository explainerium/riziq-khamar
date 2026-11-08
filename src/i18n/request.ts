import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { TIME_ZONE } from "@/constants/site";
import { routing } from "./routing";

/** The `[locale]` root param; undefined where there is none (Route Handlers). */
async function rootLocale(): Promise<string | undefined> {
  try {
    return await rootParams.locale();
  } catch {
    return undefined;
  }
}

/**
 * The locale comes from the `[locale]` root param, which keeps pages static
 * under Cache Components.
 */
export default getRequestConfig(async ({ locale: explicit }) => {
  const locale = explicit ?? (await rootLocale()) ?? routing.defaultLocale;
  if (!hasLocale(routing.locales, locale)) notFound();

  return {
    locale,
    timeZone: TIME_ZONE,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
