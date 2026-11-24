import type { DashboardKpi, DashboardRange } from "@/apis/dashboard/dashboard.interface";
import type { OrderStatus, PaymentStatus } from "@/apis/order/order.interface";
import { formatCurrency, formatNumber, formatPercent } from "@/common/utils/format.util";
import type { FormSelectOption } from "@/components/form/form-field.interface";
import type { StatusTone } from "@/theme/design-tokens";

export const DASHBOARD_RANGE_OPTIONS: FormSelectOption<DashboardRange>[] = [
  { value: "LAST_7_DAYS", label: "7 ngày gần nhất" },
  { value: "LAST_30_DAYS", label: "30 ngày gần nhất" },
  { value: "LAST_12_MONTHS", label: "12 tháng gần nhất" },
];

export const DEFAULT_DASHBOARD_RANGE: DashboardRange = "LAST_30_DAYS";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  PACKED: "Đã đóng gói",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  DELIVERY_FAILED: "Giao thất bại",
  RETURN_REQUESTED: "Yêu cầu đổi trả",
  RETURNED: "Đã trả hàng",
  REFUND_PENDING: "Chờ hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
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
  UNPAID: "Chưa thanh toán",
  DEPOSIT_PAID: "Đã đặt cọc",
  PAID: "Đã thanh toán",
  REFUND_PENDING: "Chờ hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thanh toán thất bại",
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
