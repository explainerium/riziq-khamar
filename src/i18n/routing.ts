import { defineRouting } from "next-intl/routing";

/**
 * Bangla first (no URL prefix), English under /en. The browser language is not
 * used to redirect: "/" is always Bangla, and the header switch changes it.
 */
export const routing = defineRouting({
  locales: ["bn", "en"],
  defaultLocale: "bn",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
