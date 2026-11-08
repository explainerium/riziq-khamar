import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { env } from "../config/env";
import { prisma } from "../db/prisma";
import { ApiError } from "../http/ApiError";
import { SESSION_COOKIE, SESSION_MAX_AGE, verifySessionToken } from "./token";

export interface AdminIdentity {
  id: string;
  name: string;
  email: string;
  tokenVersion: number;
}

/** The real check behind every admin route: a valid token for an admin whose password has not changed since. */
export async function requireAdmin(req: NextRequest): Promise<AdminIdentity> {
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) throw new ApiError(401, "unauthorized");

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, name: true, email: true, tokenVersion: true },
  });
  if (!admin || admin.tokenVersion !== session.tokenVersion) throw new ApiError(401, "unauthorized");
  return admin;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
};

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_MAX_AGE });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
