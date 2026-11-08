import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { type Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { DEFAULT_SETTINGS } from "../src/constants/defaultSettings";

/**
 * Creates the dashboard account and the default store settings. Safe to run
 * again: nothing that already exists is changed. Products come from the
 * dashboard, so there are none here.
 */
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (8+ characters) in .env");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL }),
  });

  try {
    await prisma.admin.upsert({
      where: { email },
      create: { email, name: "Riziq Khamar", passwordHash: await bcrypt.hash(password, 12) },
      update: {},
    });

    const settings = {
      ...DEFAULT_SETTINGS,
      deliveryOptions: DEFAULT_SETTINGS.deliveryOptions as unknown as Prisma.InputJsonValue,
    };
    await prisma.storeSetting.upsert({ where: { id: 1 }, create: { id: 1, ...settings }, update: {} });

    console.log("Seeded the admin account and store settings.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
