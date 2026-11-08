import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { tagTypes } from "../tag-types";

/** Same origin, so the session cookie goes along by itself and no CORS is involved. */
const rawBaseQuery = fetchBaseQuery({ baseUrl: "/api/v1" });

interface Envelope {
  data?: unknown;
  meta?: unknown;
}

/** Where a 401 means the session ended, not "wrong password". */
const NEEDS_SESSION = /^\/(admin\/|auth\/me)/;

function goToLogin() {
  const prefix = document.documentElement.lang === "en" ? "/en" : "";
  // Outside React, so no router; a full load also clears everything from the old session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`${prefix}/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
}

/**
 * Unwraps the `{ success, data, meta }` envelope: endpoints get their data, and
 * paginated ones get `{ data, meta }`. Feature endpoints are added with
 * baseApi.injectEndpoints() in sibling files.
 */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const url = typeof args === "string" ? args : args.url;
    if (result.error.status === 401 && NEEDS_SESSION.test(url)) goToLogin();
    return result;
  }

  const body = result.data as Envelope;
  return {
    data: body.meta ? { data: body.data, meta: body.meta } : (body.data ?? null),
    meta: result.meta,
  };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes,
  endpoints: () => ({}),
});
