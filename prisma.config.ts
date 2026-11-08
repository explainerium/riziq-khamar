import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Migrate needs a session connection, so DIRECT_URL wins over the pooled
 * DATABASE_URL. Read from process.env rather than Prisma's env() helper so
 * `prisma generate` works without any database URL (postinstall, CI).
 */
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  ...(url ? { datasource: { url } } : {}),
});
