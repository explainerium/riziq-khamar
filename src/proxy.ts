import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE, verifySessionToken } from "./server/auth/token";

const intlMiddleware = createMiddleware(routing);

// /admin (Bangla) and /en/admin (English).
const ADMIN_PATH = /^(\/en)?\/admin(?:\/|$)/;

/**
 * Locale routing, plus a fast redirect for signed-out visitors. The redirect
 * is UX only: every admin API route checks the session itself.
 */
export default async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const admin = pathname.match(ADMIN_PATH);

  if (admin) {
    const prefix = admin[1] ?? "";
    const loginPath = `${prefix}/admin/login`;
    const isLogin = pathname === loginPath;
    const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

    if (!session && !isLogin) {
      const url = req.nextUrl.clone();
      url.pathname = loginPath;
      url.search = "";
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    if (session && isLogin) {
      const url = req.nextUrl.clone();
      url.pathname = `${prefix}/admin`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  // Everything except the API, Next/Vercel internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
