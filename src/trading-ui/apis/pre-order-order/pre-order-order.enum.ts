/** BE `PreOrderStatus` — string values must match API exactly. */
export enum PreOrderOrderStatus {
  DRAFT = 'Draft',
  PRE_ORDERED = 'PreOrdered',
  /** WMS báo đã cấp phát xong — chờ Admin gửi ZNS thủ công */
  STOCK_AVAILABLE = 'StockAvailable',
  /** Admin gửi ZNS thất bại — cần Admin chỉnh SĐT / gửi lại */
  ZNS_FAILED = 'ZnsFailed',
  AWAITING_PAYMENT = 'AwaitingPayment',
  CONVERTED = 'Converted',
  CANCELLED = 'Cancelled',
  EXPIRED = 'Expired',
}

/** Các trạng thái terminal — không cho phép chuyển tiếp */
export const TERMINAL_PRE_ORDER_ORDER_STATUSES = [PreOrderOrderStatus.CONVERTED, PreOrderOrderStatus.CANCELLED, PreOrderOrderStatus.EXPIRED] as const;

export type TerminalPreOrderOrderStatus = (typeof TERMINAL_PRE_ORDER_ORDER_STATUSES)[number];
