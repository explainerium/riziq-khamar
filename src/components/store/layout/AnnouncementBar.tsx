import { getLocale } from "next-intl/server";
import { getPublicSettings } from "@/lib/catalog";
import { localized } from "@/utils/format";

export async function AnnouncementBar() {
  const [settings, locale] = await Promise.all([getPublicSettings(), getLocale()]);
  if (!settings.announcement) return null;

  return (
    <p className="bg-palm px-4 py-1.5 text-center text-sm font-medium text-paddy">
      {localized(settings.announcement, settings.announcementEn, locale)}
    </p>
  );
}
