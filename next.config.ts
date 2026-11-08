import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    // AVIF first: the same photo in fewer bytes on phones that can decode it, and most can.
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
  },
  // Keep AGENTS.md out of the repo; `next dev` would otherwise create it.
  agentRules: false,
  serverExternalPackages: ["cloudinary"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
