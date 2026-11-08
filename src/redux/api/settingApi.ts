import type { SettingsPatchValues } from "@/schemas/setting.schema";
import type { StoreSettings } from "@/types/settings";
import { baseApi } from "./baseApi";

export const settingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminSettings: build.query<StoreSettings, void>({
      query: () => "/admin/settings",
      providesTags: ["Settings"],
    }),
    updateSettings: build.mutation<StoreSettings, SettingsPatchValues>({
      query: (body) => ({ url: "/admin/settings", method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useAdminSettingsQuery, useUpdateSettingsMutation } = settingApi;
