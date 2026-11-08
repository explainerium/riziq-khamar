"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSubmit } from "@/components/form/ProSubmit";
import { Logo } from "@/components/shared/Logo";
import { Card } from "@/components/ui/card";
import { ADMIN_LINKS } from "@/constants/site";
import { useApiErrorText } from "@/hooks/useApiErrorText";
import { useLoginMutation } from "@/redux/api/authApi";
import { loginSchema } from "@/schemas/auth.schema";

/** Only same-site paths, so a crafted ?next= cannot send someone elsewhere. */
function nextPath(fallback: string): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function LoginForm() {
  const t = useTranslations("admin.login");
  const locale = useLocale();
  const errorText = useApiErrorText();
  const [login] = useLoginMutation();

  return (
    <main className="flex flex-1 items-center justify-center bg-palm px-4 py-10">
      <Card className="leaf! w-full max-w-sm gap-0 p-6">
        <Logo />
        <h1 className="mt-5 text-2xl font-bold text-palm">{t("title")}</h1>
        <ProForm
          schema={loginSchema}
          defaultValues={{ email: "", password: "" }}
          className="mt-5 flex flex-col gap-4"
          onSubmit={async (values) => {
            try {
              await login(values).unwrap();
              // A full load, so the proxy and the dashboard both see the new cookie.
              window.location.assign(nextPath(`${locale === "en" ? "/en" : ""}${ADMIN_LINKS.overview}`));
            } catch (error) {
              toast.error(errorText(error));
            }
          }}
        >
          <ProInput name="email" label={t("email")} type="email" inputMode="email" autoComplete="username" required />
          <ProInput name="password" label={t("password")} type="password" autoComplete="current-password" required />
          <ProSubmit className="w-full">{t("submit")}</ProSubmit>
        </ProForm>
      </Card>
    </main>
  );
}
