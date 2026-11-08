import "server-only";
import { prisma } from "../db/prisma";
import { decideRateLimit } from "../domain/rateLimit";
import { ApiError } from "./ApiError";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Counts in the database: a serverless host runs many short-lived instances,
 * so a limiter held in memory would count each one separately.
 */
export async function enforceRateLimit(key: string, limit: number, windowMs: number, errorKey: string): Promise<void> {
  const now = new Date();
  const current = await prisma.rateLimit.findUnique({ where: { key } });
  const decision = decideRateLimit(current, now, limit, windowMs);

  if (!decision.allowed) throw new ApiError(429, errorKey);

  const values = { count: decision.count, windowEnd: decision.windowEnd };
  await prisma.rateLimit.upsert({ where: { key }, create: { key, ...values }, update: values });

  // A new window is a good moment to clear the leftovers of old ones.
  if (decision.count === 1) {
    await prisma.rateLimit.deleteMany({ where: { windowEnd: { lt: new Date(now.getTime() - DAY_MS) } } });
  }
}
