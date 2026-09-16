import type { StatusTone } from "@/theme/design-tokens";
import type { OrderChannel, OrderStatus, PaymentStatus } from "@/apis/order/order.interface";

/** One headline number on the dashboard. */
export type DashboardKpi = {
  key: string;
  label: string;
  value: number;
  /** Percentage change against the previous period; null when there is no comparison. */
  deltaPercent: number | null;
  deltaTone: StatusTone;
  format: "CURRENCY" | "NUMBER" | "PERCENT";
  caption: string;
};

export type DashboardSeries = {
  labels: string[];
  series: { name: string; values: number[] }[];
};

export type DashboardRecentOrder = {
  code: string;
  customerName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  channel: OrderChannel;
  grandTotal: number;
  placedAt: string;
};

export type DashboardLowStockRow = {
  skuCode: string;
  productName: string;
  variantLabel: string;
  warehouseCode: string;
  available: number;
  reorderPoint: number;
};

/** Best sellers of the selected period, ranked by revenue. */
export type DashboardTopProductRow = {
  productId: string;
  productName: string;
  categoryName: string;
  image: string;
  unitsSold: number;
  revenue: number;
};

export type DashboardRange = "LAST_7_DAYS" | "LAST_30_DAYS" | "LAST_12_MONTHS";

export type DashboardOverview = {
  kpis: DashboardKpi[];
  revenue: DashboardSeries;
  ordersByStatus: { status: OrderStatus; count: number }[];
  recentOrders: DashboardRecentOrder[];
  lowStock: DashboardLowStockRow[];
  topProducts: DashboardTopProductRow[];
};
