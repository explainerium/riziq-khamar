import { describe, expect, it } from "vitest";
import { settingsPatchSchema } from "./setting.schema";

describe("settingsPatchSchema", () => {
  it("keeps only the fields that were sent, so saving one page cannot touch another", () => {
    expect(settingsPatchSchema.parse({ notifyEmail: "shop@example.com" })).toEqual({ notifyEmail: "shop@example.com" });
    expect(settingsPatchSchema.parse({ announcement: "নোটিশ" })).toEqual({ announcement: "নোটিশ" });
    expect(settingsPatchSchema.parse({})).toEqual({});
  });

  it("clears an optional field that was sent empty", () => {
    expect(settingsPatchSchema.parse({ notifyEmail: "" })).toEqual({ notifyEmail: null });
    expect(settingsPatchSchema.parse({ announcement: "" })).toEqual({ announcement: null });
  });

  it("normalizes numbers and stores WhatsApp with the country code", () => {
    expect(settingsPatchSchema.parse({ phone: "০১৭১২৩৪৫৬৭৮", whatsapp: "01712345678" })).toEqual({
      phone: "01712345678",
      whatsapp: "8801712345678",
    });
  });

  it("still validates what was sent", () => {
    expect(settingsPatchSchema.safeParse({ phone: "12345" }).success).toBe(false);
    expect(settingsPatchSchema.safeParse({ deliveryOptions: [] }).success).toBe(false);
  });
});
