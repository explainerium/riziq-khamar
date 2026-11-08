import { z } from "zod";
import { normalizeBdPhone } from "@/utils/phone";
import { phoneField } from "./order.schema";
import { optionalText, wholeNumber } from "./shared";

const deliveryOptionSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().trim().min(2, "nameRequired").max(60, "tooLong"),
  labelEn: optionalText(60),
  charge: wholeNumber("chargeRequired", 0, 100_000),
});

/** One schema per settings page: each page validates and saves only its own fields. */
export const storeSettingsSchema = z.object({
  phone: phoneField,
  /** Stored with the country code, as wa.me wants it. */
  whatsapp: z
    .string()
    .trim()
    .transform((value, context) => {
      const phone = normalizeBdPhone(value);
      if (!phone) {
        context.addIssue({ code: "custom", message: "phoneInvalid" });
        return z.NEVER;
      }
      return `88${phone}`;
    }),
  facebookUrl: z.url("urlInvalid").max(300, "tooLong"),
  address: z.string().trim().min(2, "addressRequired").max(200, "tooLong"),
  addressEn: optionalText(200),
});

export const deliverySettingsSchema = z.object({
  deliveryOptions: z.array(deliveryOptionSchema).min(1, "deliveryRequired").max(10, "tooLong"),
});

export const noticeSettingsSchema = z.object({
  announcement: optionalText(200),
  announcementEn: optionalText(200),
  prebookNote: optionalText(400),
  prebookNoteEn: optionalText(400),
});

export const alertSettingsSchema = z.object({
  notifyEmail: z.preprocess(
    (value) => (value === "" ? null : value),
    z.email("emailInvalid").max(200, "tooLong").nullish().transform((value) => value ?? null),
  ),
});

/** What the API accepts: any mix of the fields above, and only those sent are changed. */
export const settingsPatchSchema = z
  .object({
    ...storeSettingsSchema.shape,
    ...deliverySettingsSchema.shape,
    ...noticeSettingsSchema.shape,
    ...alertSettingsSchema.shape,
  })
  .partial();

export type DeliverySettingsValues = z.input<typeof deliverySettingsSchema>;
export type SettingsPatchValues = z.input<typeof settingsPatchSchema>;
export type SettingsPatch = z.output<typeof settingsPatchSchema>;
