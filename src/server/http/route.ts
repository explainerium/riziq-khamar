import "server-only";
import { Prisma } from "@prisma/client";
import { unstable_rethrow } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType, type output } from "zod";
import { clearSessionCookie, requireAdmin, type AdminIdentity } from "../auth/session";
import { ApiError } from "./ApiError";

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** The one success shape every endpoint returns. */
export function ok<T>(data?: T, options: { status?: number; meta?: Meta } = {}): NextResponse {
  const statusCode = options.status ?? 200;
  return NextResponse.json(
    {
      success: true,
      statusCode,
      message: "ok",
      ...(options.meta ? { meta: options.meta } : {}),
      ...(data !== undefined ? { data } : {}),
    },
    { status: statusCode },
  );
}

function fail(statusCode: number, message: string, errors?: { path: string; message: string }[]): NextResponse {
  return NextResponse.json(
    { success: false, statusCode, message, ...(errors ? { errors } : {}) },
    { status: statusCode },
  );
}

function toErrorResponse(error: unknown, req: NextRequest): NextResponse {
  if (error instanceof ZodError) {
    return fail(
      400,
      "validationFailed",
      error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    );
  }
  if (error instanceof ApiError) {
    const response = fail(error.statusCode, error.message);
    // A cookie the server no longer accepts must go, or the login page would keep bouncing to the dashboard.
    if (error.message === "unauthorized") clearSessionCookie(response);
    return response;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return fail(404, "notFound");
    if (error.code === "P2002" || error.code === "P2003") return fail(409, "conflict");
  }
  console.error(`[api] ${req.method} ${req.nextUrl.pathname}`, error);
  return fail(500, "serverError");
}

type Parsed<S> = S extends ZodType ? output<S> : undefined;

interface RouteConfig<B, Q, A extends boolean> {
  /** Require a signed-in admin. */
  auth?: A;
  body?: B;
  query?: Q;
}

interface RouteContext<B, Q, A extends boolean> {
  req: NextRequest;
  body: Parsed<B>;
  query: Parsed<Q>;
  params: Record<string, string>;
  admin: A extends true ? AdminIdentity : null;
}

async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "invalidJson");
  }
}

/**
 * Wraps a Route Handler: session check, input validation, and one error shape.
 * Does the work of Express's catchAsync, validateRequest and the global error
 * handler, so a route.ts only says what it does.
 */
export function route<
  B extends ZodType | undefined = undefined,
  Q extends ZodType | undefined = undefined,
  A extends boolean = false,
>(config: RouteConfig<B, Q, A>, handler: (context: RouteContext<B, Q, A>) => Promise<NextResponse>) {
  return async (req: NextRequest, segment: { params: Promise<Record<string, string>> }): Promise<NextResponse> => {
    try {
      const admin = config.auth ? await requireAdmin(req) : null;
      const body = config.body ? await config.body.parseAsync(await readJson(req)) : undefined;
      const query = config.query
        ? await config.query.parseAsync(Object.fromEntries(req.nextUrl.searchParams))
        : undefined;

      return await handler({
        req,
        body: body as Parsed<B>,
        query: query as Parsed<Q>,
        params: await segment.params,
        admin: admin as RouteContext<B, Q, A>["admin"],
      });
    } catch (error) {
      // Next.js signals things like "this route is dynamic" by throwing; those are not failures.
      unstable_rethrow(error);
      return toErrorResponse(error, req);
    }
  };
}

/** The visitor's address behind the host's proxy. */
export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
