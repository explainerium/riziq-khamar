"use client";

import {
  ChevronDown,
  ClipboardList,
  ExternalLink,
  Home,
  LogOut,
  Package,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useState, type ReactNode } from "react";
import { Logo } from "@/components/shared/Logo";
import { LanguageSwitch, LanguageSwitchFallback } from "@/components/store/layout/LanguageSwitch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ADMIN_LINKS } from "@/constants/site";
import { useIsClient } from "@/hooks/useIsClient";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useLogoutMutation } from "@/redux/api/authApi";
import { baseApi } from "@/redux/api/baseApi";
import { useOrderCountsQuery } from "@/redux/api/orderApi";
import { useAppDispatch } from "@/redux/hooks";
import { formatNumber } from "@/utils/format";
import { SETTINGS_MENU } from "./settings/menu";

type NavKey = "overview" | "orders" | "products" | "settings";

const NAV: { key: NavKey; href: string; icon: LucideIcon }[] = [
  { key: "overview", href: ADMIN_LINKS.overview, icon: Home },
  { key: "orders", href: ADMIN_LINKS.orders, icon: ClipboardList },
  { key: "products", href: ADMIN_LINKS.products, icon: Package },
  { key: "settings", href: ADMIN_LINKS.settings, icon: Settings },
];

const isActive = (pathname: string, href: string) =>
  href === ADMIN_LINKS.overview ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/** How many new orders wait; refreshes while the dashboard is open. */
function CountBadge({ className }: { className?: string }) {
  const locale = useLocale();
  const { data } = useOrderCountsQuery(undefined, { pollingInterval: 60_000 });
  const count = data?.NEW ?? 0;
  if (count === 0) return null;

  return <Badge className={cn("rounded-full bg-honey font-bold text-soil", className)}>{formatNumber(count, locale)}</Badge>;
}

/** RTK Query reads the clock, so the count only exists in the browser. */
function NewOrdersBadge({ className }: { className?: string }) {
  return useIsClient() ? <CountBadge className={className} /> : null;
}

const sidebarItem =
  "flex h-11 w-full items-center gap-3 rounded-lg px-3 font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-white/40";

/** Starts open on a settings page; after that the visitor's own choice wins. */
function SettingsMenu({ pathname }: { pathname: string }) {
  const nav = useTranslations("admin.nav");
  const t = useTranslations("admin.settings");
  const inside = isActive(pathname, ADMIN_LINKS.settings);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const open = chosen ?? inside;

  return (
    <Collapsible open={open} onOpenChange={setChosen}>
      <CollapsibleTrigger className={cn(sidebarItem, inside ? "text-white" : "text-white/85", "hover:bg-white/10")}>
        <Settings className="size-5" aria-hidden />
        <span className="flex-1 text-left">{nav("settings")}</span>
        <ChevronDown
          className={cn("size-4 transition-transform duration-150 motion-reduce:transition-none", open && "rotate-180")}
          aria-hidden
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden [--accordion-panel-height:var(--radix-collapsible-content-height)] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
        <ul className="mt-1 ml-5.5 flex flex-col gap-0.5 border-l border-white/20 pl-2.5">
          {SETTINGS_MENU.map(({ key, href }) => {
            const active = pathname === href;
            return (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center rounded-lg px-3 py-1 text-[0.95rem] leading-snug transition-colors outline-none focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:ring-inset",
                    active ? "bg-paddy font-medium text-palm" : "text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {t(key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  const t = useTranslations("admin.nav");

  return (
    <nav className="mt-7 flex flex-col gap-1">
      {NAV.map(({ key, href, icon: Icon }) => {
        if (key === "settings") return <SettingsMenu key={key} pathname={pathname} />;

        const active = isActive(pathname, href);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(sidebarItem, active ? "bg-paddy text-palm" : "text-white/85 hover:bg-white/10")}
          >
            <Icon className="size-5" aria-hidden />
            <span className="flex-1">{t(key)}</span>
            {key === "orders" && <NewOrdersBadge className="h-6 min-w-6 px-1.5 text-sm" />}
          </Link>
        );
      })}
    </nav>
  );
}

function BottomTabs({ pathname }: { pathname: string }) {
  const t = useTranslations("admin.nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV.map(({ key, href, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-16 flex-col items-center justify-center gap-0.5 text-[0.8rem] font-medium",
              active ? "text-palm" : "text-muted-foreground",
            )}
          >
            <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active && "bg-paddy")}>
              <Icon className="size-5" aria-hidden />
            </span>
            {t(key)}
            {key === "orders" && (
              <NewOrdersBadge className="absolute top-1 left-1/2 ml-2 h-5 min-w-5 px-1 text-xs" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// The active item needs the pathname, which dynamic routes only know at request time.
function CurrentSidebarNav() {
  return <SidebarNav pathname={usePathname()} />;
}

function CurrentBottomTabs() {
  return <BottomTabs pathname={usePathname()} />;
}

export function useSignOut() {
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  return async () => {
    await logout().unwrap().catch(() => undefined);
    // Nothing from the session stays in memory.
    dispatch(baseApi.util.resetApiState());
    router.replace(ADMIN_LINKS.login);
  };
}

const sidebarAction =
  "h-10 w-full justify-start gap-3 px-3 text-white/85 hover:bg-white/10 hover:text-white focus-visible:ring-white/40";

function SignOutAction() {
  const t = useTranslations("admin.nav");
  const signOut = useSignOut();

  return (
    <Button type="button" variant="ghost" onClick={signOut} className={sidebarAction}>
      <LogOut className="size-4.5" aria-hidden />
      {t("logout")}
    </Button>
  );
}

function SignOutButton() {
  return useIsClient() ? <SignOutAction /> : <div className="h-10" aria-hidden />;
}

/**
 * The frame around every dashboard page: a sidebar on wide screens, a top bar
 * and bottom tabs on phones. It always renders its children; each page has its
 * own AdminGate. Pages fill the width, and each decides how to use it.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations("admin.nav");

  return (
    <div className="flex-1 md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="scrollbar-none sticky top-0 hidden h-dvh flex-col overflow-y-auto bg-palm p-4 text-white md:flex">
        <Link href={ADMIN_LINKS.overview} className="px-2 py-1">
          <Logo tone="light" />
        </Link>

        <Suspense fallback={<SidebarNav pathname="" />}>
          <CurrentSidebarNav />
        </Suspense>

        <div className="mt-auto flex flex-col gap-1 pt-4">
          <Suspense fallback={<LanguageSwitchFallback className="mb-2 w-fit" />}>
            <LanguageSwitch className="mb-2 w-fit" />
          </Suspense>
          <Button asChild variant="ghost" className={sidebarAction}>
            <Link href="/">
              <ExternalLink className="size-4.5" aria-hidden />
              {t("viewSite")}
            </Link>
          </Button>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-white px-4 md:hidden">
          <Link href={ADMIN_LINKS.overview}>
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <Suspense fallback={<LanguageSwitchFallback />}>
              <LanguageSwitch />
            </Suspense>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full text-palm hover:bg-secondary hover:text-palm"
            >
              <Link href="/" aria-label={t("viewSite")}>
                <ExternalLink className="size-5" aria-hidden />
              </Link>
            </Button>
          </div>
        </header>

        <main className="w-full min-w-0 flex-1 overscroll-contain px-4 pt-5 pb-28 md:px-6 md:pt-7 md:pb-12 xl:px-8">
          {children}
        </main>
      </div>

      <Suspense fallback={<BottomTabs pathname="" />}>
        <CurrentBottomTabs />
      </Suspense>
    </div>
  );
}
