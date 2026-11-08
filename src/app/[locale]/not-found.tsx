import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-palm">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </main>
  );
}
