import { describe, expect, it } from "vitest";
import { normalizeBdPhone, toAsciiDigits } from "@/utils/phone";
import { formatPack, formatTaka, localized } from "@/utils/format";
import { checkoutFormSchema } from "@/schemas/order.schema";
import { dhakaDayStart, dhakaMonthStart, lastDayStarts } from "./dhakaTime";
import { isOrderable, orderTotals } from "./orderTotals";
import { decideRateLimit } from "./rateLimit";
import { banglaToLatin, toSlug, uniqueSlug } from "./slug";

describe("phone numbers", () => {
  it("accepts the ways people type a Bangladeshi mobile number", () => {
    for (const input of ["01712345678", "+8801712345678", "8801712345678", "008801712345678", "017-1234 5678", "০১৭১২৩৪৫৬৭৮"]) {
      expect(normalizeBdPhone(input)).toBe("01712345678");
    }
  });

  it("rejects numbers that are not mobile numbers", () => {
    for (const input of ["", "0171234567", "012123456789", "01212345678", "abc", "02123456789"]) {
      expect(normalizeBdPhone(input)).toBeNull();
    }
  });

  it("turns Bangla digits into English ones", () => {
    expect(toAsciiDigits("৳১২৫০")).toBe("৳1250");
  });
});

describe("slugs", () => {
  it("transliterates the shop's product names", () => {
    expect(toSlug("পাটালি গুড়")).toBe("patali-gur");
    expect(toSlug("ঝোলা গুড়")).toBe("jhola-gur");
    expect(toSlug("নালি গুড়")).toBe("nali-gur");
    expect(toSlug("দানাদার গুড়")).toBe("danadar-gur");
    expect(toSlug("মধু")).toBe("madhu");
    expect(toSlug("সরিষার তেল")).toBe("sarishar-tel");
  });

  it("keeps English names and handles the precomposed letter forms", () => {
    expect(toSlug("Patali Gur 1kg")).toBe("patali-gur-1kg");
    expect(banglaToLatin("গুড়")).toBe("gur");
  });

  it("never produces the same slug twice", async () => {
    const taken = new Set(["gur", "gur-2"]);
    await expect(uniqueSlug("গুড়", async (slug) => taken.has(slug))).resolves.toBe("gur-3");
  });

  it("falls back when nothing usable is left", async () => {
    await expect(uniqueSlug("!!!", async () => false)).resolves.toBe("product");
  });
});

describe("order totals", () => {
  it("adds line totals and the delivery charge", () => {
    const totals = orderTotals(
      [
        { price: 450, quantity: 2 },
        { price: 500, quantity: 1 },
      ],
      130,
    );
    expect(totals).toEqual({ subtotal: 1400, deliveryCharge: 130, total: 1530 });
  });

  it("lets pre-booked items be ordered, but not sold-out ones", () => {
    expect(isOrderable("IN_STOCK")).toBe(true);
    expect(isOrderable("PREBOOK")).toBe(true);
    expect(isOrderable("OUT_OF_STOCK")).toBe(false);
  });
});

describe("rate limit", () => {
  const now = new Date("2026-11-08T10:00:00Z");
  const later = new Date("2026-11-08T10:10:00Z");

  it("opens a new window", () => {
    expect(decideRateLimit(null, now, 2, 60_000)).toEqual({
      allowed: true,
      count: 1,
      windowEnd: new Date(now.getTime() + 60_000),
    });
  });

  it("refuses past the limit and opens again after the window", () => {
    const window = { count: 2, windowEnd: new Date(now.getTime() + 60_000) };
    expect(decideRateLimit(window, now, 2, 60_000).allowed).toBe(false);
    expect(decideRateLimit(window, later, 2, 60_000).count).toBe(1);
  });
});

describe("Dhaka time", () => {
  it("starts the day at 18:00 UTC the day before", () => {
    expect(dhakaDayStart(new Date("2026-11-08T17:59:00Z")).toISOString()).toBe("2026-11-07T18:00:00.000Z");
    expect(dhakaDayStart(new Date("2026-11-08T18:01:00Z")).toISOString()).toBe("2026-11-08T18:00:00.000Z");
  });

  it("starts the month in Dhaka, not UTC", () => {
    expect(dhakaMonthStart(new Date("2026-11-30T19:00:00Z")).toISOString()).toBe("2026-11-30T18:00:00.000Z");
  });

  it("lists the last days oldest first, ending today", () => {
    const days = lastDayStarts(new Date("2026-11-08T10:00:00Z"), 3).map((d) => d.toISOString());
    expect(days).toEqual(["2026-11-05T18:00:00.000Z", "2026-11-06T18:00:00.000Z", "2026-11-07T18:00:00.000Z"]);
  });
});

describe("formatting", () => {
  it("writes taka and pack sizes in the page's language", () => {
    expect(formatTaka(1250, "bn")).toBe("৳১,২৫০");
    expect(formatTaka(1250, "en")).toBe("৳1,250");
    expect(formatPack(1, "kg", "bn")).toBe("১ কেজি");
    expect(formatPack(1, "kg", "en")).toBe("1 kg");
    expect(formatPack(1.5, "l", "bn")).toBe("১.৫ লিটার");
  });

  it("falls back to Bangla when English is empty", () => {
    expect(localized("গুড়", "Gur", "en")).toBe("Gur");
    expect(localized("গুড়", "  ", "en")).toBe("গুড়");
    expect(localized("গুড়", null, "en")).toBe("গুড়");
    expect(localized("গুড়", "Gur", "bn")).toBe("গুড়");
  });
});

describe("checkout form", () => {
  const valid = {
    customerName: "রহিম",
    customerPhone: "০১৭১২৩৪৫৬৭৮",
    address: "গ্রাম, থানা, জেলা",
    deliveryOptionId: "inside-dhaka",
  };

  it("cleans the phone number while validating", () => {
    expect(checkoutFormSchema.parse(valid).customerPhone).toBe("01712345678");
  });

  it("reports errors as translation keys", () => {
    const result = checkoutFormSchema.safeParse({ ...valid, customerPhone: "123", customerName: "" });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message);
    expect(messages).toEqual(expect.arrayContaining(["phoneInvalid", "nameRequired"]));
  });
});
