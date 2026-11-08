"use client";

import { useTranslations } from "next-intl";
import { apiErrorKey } from "@/utils/apiError";

/** Turns an API error into a sentence in the page's language. */
export function useApiErrorText() {
  const t = useTranslations("api");

  return (error: unknown): string => {
    const key = apiErrorKey(error);
    if (key && t.has(key as never)) return t(key as never);
    // No response at all: the connection dropped.
    if (error && typeof error === "object" && "status" in error && error.status === "FETCH_ERROR") return t("network");
    return t("serverError");
  };
}
