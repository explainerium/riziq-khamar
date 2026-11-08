import type { Messages } from "next-intl";

/**
 * Only what Client Components use goes to the browser, so a shopper on a phone
 * does not download the dashboard's text.
 */
export const STORE_CLIENT_MESSAGES = [
  "common",
  "validation",
  "api",
  "availability",
  "layout",
  "products",
  "product",
  "checkout",
] as const satisfies readonly (keyof Messages)[];

export const ADMIN_CLIENT_MESSAGES = [
  "common",
  "validation",
  "api",
  "availability",
  "status",
  "layout",
  "admin",
] as const satisfies readonly (keyof Messages)[];

export function pickMessages(messages: Messages, keys: readonly (keyof Messages)[]) {
  return Object.fromEntries(keys.map((key) => [key, messages[key]]));
}
