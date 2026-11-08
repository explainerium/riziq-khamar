import { revalidateTag } from "next/cache";
import { settingsPatchSchema } from "@/schemas/setting.schema";
import { ok, route } from "@/server/http/route";
import { readSettings, saveSettings } from "@/server/modules/setting/setting.service";

export const GET = route({ auth: true }, async () => ok(await readSettings()));

export const PATCH = route({ auth: true, body: settingsPatchSchema }, async ({ body }) => {
  const settings = await saveSettings(body);
  revalidateTag("settings", { expire: 0 });
  return ok(settings);
});
