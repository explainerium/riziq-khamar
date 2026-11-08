import type { OrderStatus } from "@/constants/catalog";
import type { DashboardSummary, OrderCounts, OrderDetail, OrderRow, PageMeta } from "@/types/order";
import { baseApi } from "./baseApi";

interface OrderListArgs {
  page: number;
  status?: OrderStatus;
  search?: string;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminOrders: build.query<{ data: OrderRow[]; meta: PageMeta }, OrderListArgs>({
      query: (params) => ({ url: "/admin/orders", params }),
      providesTags: ["Order"],
    }),
    orderCounts: build.query<OrderCounts, void>({
      query: () => "/admin/orders/counts",
      providesTags: ["Order"],
    }),
    adminOrder: build.query<OrderDetail, string>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),
    updateOrder: build.mutation<OrderDetail, { id: string; status?: OrderStatus; adminNote?: string | null }>({
      query: ({ id, ...body }) => ({ url: `/admin/orders/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Order", "Dashboard"],
    }),
    dashboard: build.query<DashboardSummary, void>({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard", "Order"],
    }),
  }),
});

export const {
  useAdminOrdersQuery,
  useOrderCountsQuery,
  useAdminOrderQuery,
  useUpdateOrderMutation,
  useDashboardQuery,
} = orderApi;
