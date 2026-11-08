import type { Availability, OrderStatus } from "@/constants/catalog";
import type { DeliveryOption } from "./settings";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuoteLine {
  productId: string;
  slug: string;
  name: string;
  nameEn: string | null;
  packSize: number;
  packUnit: string;
  price: number;
  quantity: number;
  lineTotal: number;
  availability: Availability;
  imageUrl: string | null;
  orderable: boolean;
}

export interface Quote {
  lines: QuoteLine[];
  /** Cart lines whose product no longer exists or is hidden. */
  missing: string[];
  deliveryOptions: DeliveryOption[];
  selectedDeliveryId: string | null;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  prebookNote: string | null;
  prebookNoteEn: string | null;
}

export interface PlacedOrder {
  token: string;
  orderNo: number;
}

export interface OrderItemView {
  id: string;
  productName: string;
  productNameEn: string | null;
  packSize: number;
  packUnit: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
  wasPrebook: boolean;
}

export interface OrderRow {
  id: string;
  orderNo: number;
  customerName: string;
  customerPhone: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  itemCount: number;
  firstItem: string | null;
  hasPrebook: boolean;
}

export interface OrderDetail {
  id: string;
  orderNo: number;
  customerName: string;
  customerPhone: string;
  address: string;
  customerNote: string | null;
  locale: string;
  deliveryLabel: string;
  deliveryLabelEn: string | null;
  deliveryCharge: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemView[];
}

export type OrderCounts = Record<OrderStatus, number> & { ALL: number };

export interface DashboardSummary {
  todayOrders: number;
  todayValue: number;
  newOrders: number;
  toDeliver: number;
  monthSales: number;
  productCount: number;
  days: { date: string; orders: number }[];
  recent: OrderRow[];
}
