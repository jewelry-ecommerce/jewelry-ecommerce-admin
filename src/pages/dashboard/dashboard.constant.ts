import type { DashboardKpi, DashboardRange } from "@/apis/dashboard/dashboard.interface";
import type { OrderStatus, PaymentStatus } from "@/apis/order/order.interface";
import { formatCurrency, formatNumber, formatPercent } from "@/common/utils/format.util";
import type { FormSelectOption } from "@/components/form/form-field.interface";
import type { StatusTone } from "@/theme/design-tokens";

export const DASHBOARD_RANGE_OPTIONS: FormSelectOption<DashboardRange>[] = [
  { value: "LAST_7_DAYS", label: "Last 7 days" },
  { value: "LAST_30_DAYS", label: "Last 30 days" },
  { value: "LAST_12_MONTHS", label: "Last 12 months" },
];

export const DEFAULT_DASHBOARD_RANGE: DashboardRange = "LAST_30_DAYS";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  PACKED: "Packed",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  DELIVERY_FAILED: "Delivery failed",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
};

export const ORDER_STATUS_TONES: Record<OrderStatus, StatusTone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PREPARING: "info",
  PACKED: "info",
  SHIPPING: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
  DELIVERY_FAILED: "danger",
  RETURN_REQUESTED: "warning",
  RETURNED: "danger",
  REFUND_PENDING: "warning",
  REFUNDED: "neutral",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  DEPOSIT_PAID: "Deposit paid",
  PAID: "Paid",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

/** Renders a KPI according to the format the API declared, so no screen guesses the unit. */
export const formatKpiValue = (kpi: DashboardKpi): string => {
  if (kpi.format === "CURRENCY") return formatCurrency(kpi.value);
  if (kpi.format === "PERCENT") return formatPercent(kpi.value);
  return formatNumber(kpi.value);
};

/** `null` when the API reported no comparable previous period. */
export const formatKpiDelta = (deltaPercent: number | null): string | undefined => {
  if (deltaPercent === null) return undefined;
  const sign = deltaPercent > 0 ? "+" : "";
  return `${sign}${formatPercent(deltaPercent)}`;
};
