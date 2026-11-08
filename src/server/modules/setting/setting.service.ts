import "server-only";
import type { Prisma } from "@prisma/client";
import { DEFAULT_DELIVERY_OPTIONS, DEFAULT_SETTINGS } from "@/constants/defaultSettings";
import type { SettingsPatch } from "@/schemas/setting.schema";
import type { DeliveryOption, StoreSettings } from "@/types/settings";
import { prisma } from "../../db/prisma";

/** The JSON column, read defensively: a malformed entry is dropped, never a 500. */
function readDeliveryOptions(json: unknown): DeliveryOption[] {
  if (!Array.isArray(json)) return DEFAULT_DELIVERY_OPTIONS;
  const options = json.filter(
    (entry): entry is DeliveryOption =>
      !!entry &&
      typeof entry === "object" &&
      typeof (entry as DeliveryOption).id === "string" &&
      typeof (entry as DeliveryOption).label === "string" &&
      typeof (entry as DeliveryOption).charge === "number",
  );
  return options.length ? options : DEFAULT_DELIVERY_OPTIONS;
}

/** The saved settings, or the defaults until the dashboard has saved any. */
export async function readSettings(): Promise<StoreSettings> {
  const row = await prisma.storeSetting.findUnique({ where: { id: 1 } });
  if (!row) return DEFAULT_SETTINGS;

  const { id: _id, updatedAt: _updatedAt, deliveryOptions, ...fields } = row;
  return { ...fields, deliveryOptions: readDeliveryOptions(deliveryOptions) };
}

const toJson = (options: DeliveryOption[]) => options as unknown as Prisma.InputJsonValue;

/** Changes only the fields in `patch`. The first save starts from the defaults for everything else. */
export async function saveSettings(patch: SettingsPatch): Promise<StoreSettings> {
  const { deliveryOptions, ...fields } = patch;
  const current = await readSettings();

  await prisma.storeSetting.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      ...current,
      ...fields,
      deliveryOptions: toJson(deliveryOptions ?? current.deliveryOptions),
    },
    update: { ...fields, ...(deliveryOptions ? { deliveryOptions: toJson(deliveryOptions) } : {}) },
  });
  return readSettings();
}
