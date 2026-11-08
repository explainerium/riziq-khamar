import type { LoginValues, PasswordValues } from "@/schemas/auth.schema";
import { baseApi } from "./baseApi";

export interface AdminMe {
  id: string;
  name: string;
  email: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<AdminMe, void>({
      query: () => "/auth/me",
      providesTags: ["Me"],
    }),
    login: build.mutation<AdminMe, LoginValues>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    changePassword: build.mutation<void, PasswordValues>({
      query: (body) => ({ url: "/auth/password", method: "PATCH", body }),
    }),
  }),
});

export const { useGetMeQuery, useLoginMutation, useLogoutMutation, useChangePasswordMutation } = authApi;
