import { BellRing, KeyRound, Megaphone, Store, Truck, type LucideIcon } from "lucide-react";
import { ADMIN_LINKS } from "@/constants/site";

export type SettingsSection = "store" | "delivery" | "notices" | "alerts" | "password";

/** The settings pages: the sidebar's sub-menu and the phone's menu list both come from here. */
export const SETTINGS_MENU: { key: SettingsSection; href: string; icon: LucideIcon }[] = [
  { key: "store", href: `${ADMIN_LINKS.settings}/store`, icon: Store },
  { key: "delivery", href: `${ADMIN_LINKS.settings}/delivery`, icon: Truck },
  { key: "notices", href: `${ADMIN_LINKS.settings}/notices`, icon: Megaphone },
  { key: "alerts", href: `${ADMIN_LINKS.settings}/alerts`, icon: BellRing },
  { key: "password", href: `${ADMIN_LINKS.settings}/password`, icon: KeyRound },
];
