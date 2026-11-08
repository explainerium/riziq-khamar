"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("common");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <p className="max-w-sm text-lg text-palm">{t("error")}</p>
      <Button size="lg" onClick={reset}>
        {t("retry")}
      </Button>
    </main>
  );
}
