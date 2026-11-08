import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/site";
import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/catalog";

/** The URL of a path in a language: Bangla has no prefix, English is under /en. */
const localized = (path: string, locale: string) =>
  `${SITE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}${path === "/" && locale !== routing.defaultLocale ? "" : path}`;

type Entry = Omit<MetadataRoute.Sitemap[number], "url" | "alternates"> & { path: string };

/** One entry per language, each listing all of them as alternates (hreflang). */
const withLanguages = (entries: Entry[]): MetadataRoute.Sitemap =>
  entries.flatMap(({ path, ...rest }) => {
    const languages = Object.fromEntries(routing.locales.map((locale) => [locale, localized(path, locale)]));
    return routing.locales.map((locale) => ({ ...rest, url: localized(path, locale), alternates: { languages } }));
  });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  return withLanguages([
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/products", changeFrequency: "daily", priority: 0.9 },
    ...products.map((product) => ({
      path: `/products/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/policy", changeFrequency: "yearly", priority: 0.2 },
  ]);
}
