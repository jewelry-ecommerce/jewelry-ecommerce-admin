import type { CustomerAddress } from "@/apis/customer/customer.interface";

/**
 * Order contract mirroring `jewelry-commerce-client/src/utils/api/order/order.interface.ts`.
 *
 * `PENDING → CONFIRMED → PREPARING → PACKED → SHIPPING → DELIVERED` is the happy path; the remaining
 * values are terminal or exception states.
 */
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "PACKED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "DELIVERY_FAILED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUND_PENDING"
  | "REFUNDED";

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "CREDIT_CARD" | "E_WALLET";
export type PaymentStatus = "UNPAID" | "DEPOSIT_PAID" | "PAID" | "REFUND_PENDING" | "REFUNDED" | "FAILED";
export type ShippingMethod = "STANDARD" | "EXPRESS" | "BOUTIQUE_PICKUP";
export type OrderChannel = "ONLINE" | "BOUTIQUE";

export type OrderLine = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  skuCode: string;
  variantLabel: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineDiscount: number;
  lineTotal: number;
  /** Present when this line belongs to a curated set instance. */
  setId: string | null;
  setName: string | null;
  setLineId: string | null;
  setItemId: string | null;
};

export type OrderTimelineEntry = {
  id: string;
  status: OrderStatus;
  occurredAt: string;
  note: string;
  actor: string;
};

export type OrderTotals = {
  subtotal: number;
  productDiscount: number;
  voucherDiscount: number;
  shippingFee: number;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  grandTotal: number;
  depositAmount: number | null;
};

export type Order = {
  id: string;
  code: string;
  status: OrderStatus;
  channel: OrderChannel;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isGuest: boolean;
  shippingAddress: CustomerAddress;
  shippingMethod: ShippingMethod;
  trackingCode: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  appliedVoucherCode: string | null;
  isPreOrder: boolean;
  expectedDeliveryAt: string | null;
  lines: OrderLine[];
  totals: OrderTotals;
  timeline: OrderTimelineEntry[];
  note: string;
  placedAt: string;
  updatedAt: string;
};

export type OrderListQuery = {
  page?: number;
  take?: number;
  search?: string;
  status?: OrderStatus | "ALL";
  paymentStatus?: PaymentStatus;
  channel?: OrderChannel;
  fromDate?: string;
  toDate?: string;
};

/* ------------------------------------------------------------------------------------------------
 * Admin-side contracts
 * ---------------------------------------------------------------------------------------------- */

export type OrderRow = {
  id: string;
  code: string;
  status: OrderStatus;
  channel: OrderChannel;
  customerName: string;
  customerPhone: string;
  isGuest: boolean;
  lineCount: number;
  itemCount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingMethod: ShippingMethod;
  trackingCode: string | null;
  isPreOrder: boolean;
  placedAt: string;
  updatedAt: string;
};

export type OrderStatusCount = {
  status: OrderStatus | "ALL";
  count: number;
};

export type OrderListResult = {
  list: OrderRow[];
  total: number;
  page: number;
  take: number;
  statusCounts: OrderStatusCount[];
};

export type UpdateOrderStatusPayload = {
  code: string;
  status: OrderStatus;
  note: string;
  /** Set when moving into `SHIPPING`. */
  trackingCode?: string | null;
  actor?: string;
};

export type CancelOrderPayload = {
  code: string;
  reason: string;
  actor?: string;
};

export type ReturnOrderPayload = {
  code: string;
  reason: string;
  /** Lines the customer is sending back; empty means the whole order. */
  lineIds: string[];
  actor?: string;
};

export type RefundOrderPayload = {
  code: string;
  amount: number;
  reason: string;
  actor?: string;
};
