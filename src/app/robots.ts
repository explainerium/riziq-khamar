import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/site";

/** Crawlers may read the shop, not the dashboard, checkout, order pages or the API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/order/", "/api/", "/en/admin", "/en/checkout", "/en/order/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
