import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { findPublicProduct, listPublicProducts } from "@/server/modules/product/product.service";
import { readSettings } from "@/server/modules/setting/setting.service";
import type { PublicSettings } from "@/types/settings";

/**
 * Cached reads for public pages. A dashboard save revalidates the tags, so the
 * long lifetime only matters when nothing has changed.
 */

export async function getProducts() {
  "use cache";
  cacheLife("days");
  cacheTag("products");
  return listPublicProducts();
}

export async function getProduct(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag("products", `product:${slug}`);
  return findPublicProduct(slug);
}

export async function getPublicSettings(): Promise<PublicSettings> {
  "use cache";
  cacheLife("days");
  cacheTag("settings");
  const { notifyEmail: _notifyEmail, ...settings } = await readSettings();
  return settings;
}

export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
