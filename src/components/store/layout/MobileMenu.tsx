"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const loadSheet = () => import("./MobileMenuSheet");
const MobileMenuSheet = dynamic(loadSheet, { ssr: false });

/** The sheet's code loads on the first tap: most visitors never open the menu, and all of them pay for the download. */
export function MobileMenu() {
  const t = useTranslations("layout");
  const trigger = useRef<HTMLButtonElement>(null);
  const [requested, setRequested] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label={t("menuOpen")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerDown={loadSheet}
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
        className="grid size-11 place-items-center rounded-full text-palm transition-colors hover:bg-secondary md:hidden"
      >
        <Menu className="size-6" aria-hidden />
      </button>
      {requested && <MobileMenuSheet open={open} onOpenChange={setOpen} returnFocusTo={trigger} />}
    </>
  );
}
