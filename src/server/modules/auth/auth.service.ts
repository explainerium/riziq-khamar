import "server-only";
import bcrypt from "bcrypt";
import { signSessionToken } from "../../auth/token";
import type { AdminIdentity } from "../../auth/session";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/ApiError";
import { enforceRateLimit } from "../../http/rateLimit";

const ROUNDS = 12;

/** Compared against when the email is unknown, so timing does not reveal which emails exist. */
const placeholderHash = bcrypt.hash("placeholder-for-unknown-admin", ROUNDS);

export async function login(email: string, password: string, ip: string) {
  await enforceRateLimit(`login:${ip}`, 10, 15 * 60_000, "tooManyLogins");

  const admin = await prisma.admin.findUnique({ where: { email } });
  const matches = await bcrypt.compare(password, admin?.passwordHash ?? (await placeholderHash));
  if (!admin || !matches) throw new ApiError(401, "invalidCredentials");

  return {
    token: await signSessionToken({ adminId: admin.id, tokenVersion: admin.tokenVersion }),
    admin: { id: admin.id, name: admin.name, email: admin.email },
  };
}

/** Bumps the token version, which signs out every other device. Returns a token for this one. */
export async function changePassword(identity: AdminIdentity, currentPassword: string, newPassword: string) {
  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: identity.id } });
  if (!(await bcrypt.compare(currentPassword, admin.passwordHash))) {
    throw new ApiError(400, "wrongPassword");
  }

  const updated = await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(newPassword, ROUNDS), tokenVersion: { increment: 1 } },
    select: { id: true, tokenVersion: true },
  });
  return signSessionToken({ adminId: updated.id, tokenVersion: updated.tokenVersion });
}
