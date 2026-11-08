/** The `message` of an API error response (RTK Query `error.data`): a key in messages `api.*`. */
export function apiErrorKey(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("data" in error)) return null;
  const { data } = error as { data?: { message?: unknown } };
  return typeof data?.message === "string" ? data.message : null;
}

/** Field errors of a 400 response (`errors: [{ path, message }]`); `message` is a key in `validation.*`. */
export function apiFieldErrors(error: unknown): { path: string; message: string }[] {
  if (!error || typeof error !== "object" || !("data" in error)) return [];
  const { data } = error as { data?: { errors?: unknown } };
  if (!Array.isArray(data?.errors)) return [];
  return data.errors.filter(
    (e): e is { path: string; message: string } =>
      !!e && typeof e === "object" && typeof e.path === "string" && typeof e.message === "string",
  );
}
