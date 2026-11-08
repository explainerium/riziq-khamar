import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "Set DATABASE_URL (see .env.example)"),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().optional(),
  JWT_SECRET: z.string().min(32, "Set JWT_SECRET to at least 32 characters"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3006"),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(),
});

// An empty value in .env means "not set".
const present = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ""));

export const env = schema.parse(present);
