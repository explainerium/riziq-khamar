"use client";

import { ChevronRight, LogOut, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useFieldArray, useFormContext, type DefaultValues } from "react-hook-form";
import { toast } from "sonner";
import type { input } from "zod";
import { ProForm, type FormSchema } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSubmit } from "@/components/form/ProSubmit";
import { ProTextarea } from "@/components/form/ProTextarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ADMIN_LINKS } from "@/constants/site";
import { useApiErrorText } from "@/hooks/useApiErrorText";
import { Link } from "@/i18n/navigation";
import { useChangePasswordMutation } from "@/redux/api/authApi";
import { useAdminSettingsQuery, useUpdateSettingsMutation } from "@/redux/api/settingApi";
import { passwordSchema } from "@/schemas/auth.schema";
import {
  alertSettingsSchema,
  deliverySettingsSchema,
  noticeSettingsSchema,
  storeSettingsSchema,
  type DeliverySettingsValues,
  type SettingsPatchValues,
} from "@/schemas/setting.schema";
import type { StoreSettings } from "@/types/settings";
import { apiFieldErrors } from "@/utils/apiError";
import { uuid } from "@/utils/uuid";
import { useSignOut } from "../AdminShell";
import { ListSkeleton, PageHeader, Panel, QueryError } from "../common";
import { SETTINGS_MENU, type SettingsSection } from "./menu";

/** `/admin/settings`: where the phone's Settings tab lands. On desktop the sidebar lists the same pages. */
export function SettingsHub() {
  const t = useTranslations("admin.settings");
  const nav = useTranslations("admin.nav");
  const signOut = useSignOut();

  return (
    <>
      <PageHeader title={t("title")} />

      <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {SETTINGS_MENU.map(({ key, href, icon: Icon }) => (
          <li key={key}>
            <Link href={href} className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <Card className="flex-row items-center gap-3 px-4 transition-colors group-hover:bg-secondary/60">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-palm">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-palm">{t(key)}</span>
                  <span className="block text-sm text-muted-foreground">{t(`${key}Hint`)}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <Button type="button" variant="secondary" className="mt-4 w-full md:hidden" onClick={signOut}>
        <LogOut aria-hidden />
        {nav("logout")}
      </Button>
    </>
  );
}

function SectionHeader({ section }: { section: SettingsSection }) {
  const t = useTranslations("admin.settings");
  return (
    <PageHeader title={t(section)} description={t(`${section}Hint`)} back={ADMIN_LINKS.settings} backOnPhoneOnly />
  );
}

/** One settings page: the heading, then the form once the saved values have arrived. */
function SectionPage({
  section,
  children,
}: {
  section: SettingsSection;
  children: (settings: StoreSettings) => ReactNode;
}) {
  const { data, isLoading, isError, refetch } = useAdminSettingsQuery();

  return (
    <>
      <SectionHeader section={section} />
      {isError ? <QueryError onRetry={refetch} /> : isLoading || !data ? <ListSkeleton rows={2} /> : children(data)}
    </>
  );
}

function SectionForm<S extends FormSchema>({
  schema,
  defaultValues,
  children,
}: {
  schema: S;
  defaultValues: DefaultValues<input<S>>;
  children: ReactNode;
}) {
  const t = useTranslations("admin.settings");
  const errorText = useApiErrorText();
  const [update] = useUpdateSettingsMutation();

  return (
    <ProForm
      schema={schema}
      defaultValues={defaultValues}
      className="flex flex-col gap-3"
      onSubmit={async (values, form) => {
        try {
          await update(values as SettingsPatchValues).unwrap();
          toast.success(t("saved"));
        } catch (error) {
          for (const { path, message } of apiFieldErrors(error)) {
            form.setError(path as never, { message });
          }
          toast.error(errorText(error));
        }
      }}
    >
      {children}
      <ProSubmit className="w-full sm:w-auto sm:self-start">{t("save")}</ProSubmit>
    </ProForm>
  );
}

export function StoreSettingsView() {
  const t = useTranslations("admin.settings");

  return (
    <SectionPage section="store">
      {(settings) => (
        <SectionForm
          schema={storeSettingsSchema}
          defaultValues={{
            phone: settings.phone,
            // Stored with the country code for wa.me; people type the local number.
            whatsapp: settings.whatsapp.replace(/^88/, ""),
            facebookUrl: settings.facebookUrl,
            address: settings.address,
            addressEn: settings.addressEn ?? "",
          }}
        >
          <Panel>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              <ProInput name="phone" label={t("phone")} type="tel" inputMode="tel" required />
              <ProInput name="whatsapp" label={t("whatsapp")} type="tel" inputMode="tel" required />
              <ProInput name="facebookUrl" label={t("facebookUrl")} inputMode="url" required />
              <ProInput name="address" label={t("address")} required />
              <ProInput name="addressEn" label={t("addressEn")} />
            </div>
          </Panel>
        </SectionForm>
      )}
    </SectionPage>
  );
}

function DeliveryOptionFields() {
  const t = useTranslations("admin.settings");
  const { control } = useFormContext<DeliverySettingsValues>();
  // keyName: the options have their own `id`, which must reach the server unchanged.
  const { fields, append, remove } = useFieldArray({ control, name: "deliveryOptions", keyName: "key" });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {fields.map((field, index) => (
          <div key={field.key} className="flex flex-col gap-3 rounded-lg bg-mist p-3">
            <ProInput name={`deliveryOptions.${index}.label`} label={t("optionLabel")} required />
            <ProInput name={`deliveryOptions.${index}.labelEn`} label={t("optionLabelEn")} />
            <div className="flex items-end gap-2">
              <ProInput
                name={`deliveryOptions.${index}.charge`}
                label={t("optionCharge")}
                inputMode="numeric"
                required
                className="flex-1"
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-lg"
                  aria-label={t("removeOption")}
                  onClick={() => remove(index)}
                >
                  <Trash2 aria-hidden />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-fit"
        onClick={() => append({ id: uuid(), label: "", labelEn: "", charge: "" })}
      >
        <Plus aria-hidden />
        {t("addOption")}
      </Button>
    </div>
  );
}

export function DeliverySettingsView() {
  return (
    <SectionPage section="delivery">
      {(settings) => (
        <SectionForm
          schema={deliverySettingsSchema}
          defaultValues={{
            deliveryOptions: settings.deliveryOptions.map((option) => ({
              ...option,
              labelEn: option.labelEn ?? "",
              charge: String(option.charge),
            })),
          }}
        >
          <Panel>
            <DeliveryOptionFields />
          </Panel>
        </SectionForm>
      )}
    </SectionPage>
  );
}

export function NoticeSettingsView() {
  const t = useTranslations("admin.settings");

  return (
    <SectionPage section="notices">
      {(settings) => (
        <SectionForm
          schema={noticeSettingsSchema}
          defaultValues={{
            announcement: settings.announcement ?? "",
            announcementEn: settings.announcementEn ?? "",
            prebookNote: settings.prebookNote ?? "",
            prebookNoteEn: settings.prebookNoteEn ?? "",
          }}
        >
          <Panel>
            <div className="grid gap-4 lg:grid-cols-2">
              <ProInput name="announcement" label={t("announcement")} description={t("announcementHint")} />
              <ProInput name="announcementEn" label={t("announcementEn")} />
              <ProTextarea name="prebookNote" label={t("prebookNote")} description={t("prebookNoteHint")} rows={3} />
              <ProTextarea name="prebookNoteEn" label={t("prebookNoteEn")} rows={3} />
            </div>
          </Panel>
        </SectionForm>
      )}
    </SectionPage>
  );
}

export function AlertSettingsView() {
  const t = useTranslations("admin.settings");

  return (
    <SectionPage section="alerts">
      {(settings) => (
        <SectionForm schema={alertSettingsSchema} defaultValues={{ notifyEmail: settings.notifyEmail ?? "" }}>
          <Panel>
            <ProInput
              name="notifyEmail"
              label={t("notifyEmail")}
              description={t("notifyEmailHint")}
              type="email"
              inputMode="email"
              className="max-w-xl"
            />
          </Panel>
        </SectionForm>
      )}
    </SectionPage>
  );
}

export function PasswordSettingsView() {
  const t = useTranslations("admin.settings");
  const errorText = useApiErrorText();
  const [change] = useChangePasswordMutation();

  return (
    <>
      <SectionHeader section="password" />
      <ProForm
        schema={passwordSchema}
        defaultValues={{ currentPassword: "", newPassword: "" }}
        className="flex flex-col gap-3"
        onSubmit={async (values, form) => {
          try {
            await change(values).unwrap();
            toast.success(t("passwordChanged"));
            form.reset();
          } catch (error) {
            toast.error(errorText(error));
          }
        }}
      >
        <Panel>
          <div className="grid max-w-3xl gap-4 md:grid-cols-2">
            <ProInput
              name="currentPassword"
              label={t("currentPassword")}
              type="password"
              autoComplete="current-password"
              required
            />
            <ProInput name="newPassword" label={t("newPassword")} type="password" autoComplete="new-password" required />
          </div>
        </Panel>
        <ProSubmit className="w-full sm:w-auto sm:self-start">{t("changePassword")}</ProSubmit>
      </ProForm>
    </>
  );
}
