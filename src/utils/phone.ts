const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

/** "০১৭" → "017". Phones with a Bangla keyboard type these digits. */
export const toAsciiDigits = (value: string): string =>
  value.replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)));

/**
 * A Bangladeshi mobile number as 01XXXXXXXXX, or null when it is not one.
 * Accepts Bangla digits, spaces, dashes and the +880 / 880 / 00880 prefixes.
 */
export function normalizeBdPhone(input: string): string | null {
  let digits = toAsciiDigits(input).replace(/\D/g, "");
  if (digits.startsWith("00880")) digits = digits.slice(4);
  else if (digits.startsWith("880")) digits = digits.slice(2);
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
}
