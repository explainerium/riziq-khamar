import { jwtVerify, SignJWT } from "jose";

/** No "server-only" here: proxy.ts imports this too. */

export const SESSION_COOKIE = "rk_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export interface SessionPayload {
  adminId: string;
  tokenVersion: number;
}

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export const signSessionToken = ({ adminId, tokenVersion }: SessionPayload): Promise<string> =>
  new SignJWT({ v: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.v !== "number") return null;
    return { adminId: payload.sub, tokenVersion: payload.v };
  } catch {
    return null;
  }
}
