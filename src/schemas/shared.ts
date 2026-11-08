import { z } from "zod";
import { toAsciiDigits } from "@/utils/phone";

/**
 * Error messages in these schemas are keys in `validation.*`, so the same
 * schema speaks Bangla or English depending on the page showing the error.
 */

/** Optional text: empty becomes null, which also clears a stored value. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "tooLong")
    .nullish()
    .transform((value) => (value ? value : null));

/** A whole number, typed with English or Bangla digits. */
export const wholeNumber = (requiredKey: string, min: number, max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? Number(toAsciiDigits(value.trim()) || Number.NaN) : value),
    z.number({ error: requiredKey }).int("wholeNumber").min(min, requiredKey).max(max, "tooLarge"),
  );
