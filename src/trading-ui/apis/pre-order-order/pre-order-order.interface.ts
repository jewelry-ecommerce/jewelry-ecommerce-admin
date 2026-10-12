import type { OrderSource, PaymentMethod, ShippingMethod } from '../order';
import { type PreOrderOrderStatus } from './pre-order-order.enum';

export interface PreOrderOrderItem {
  id: string;
  productId?: string;
  variationId?: string;
  productName: string;
  variationName?: string;
  skuCode: string;
  image?: string | null;
  quantity: number;
  unitPrice?: string | number | null;
  salePrice?: string | number | null;
  lineTotal?: string | number | null;
  customerDisplayPrice?: {
    currency?: string;
    compareAtPriceAfterTaxMinor?: number | null;
    sellingPriceAfterTaxMinor?: number;
    discountPercent?: number | null;
    hasDiscount?: boolean;
  };
}

export interface PreOrderOrderAddress {
  firstName?: string | null;
  lastName?: string | null;
  receiverPhone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  wardCode?: number | null;
  wardName?: string | null;
  provinceCode?: number | null;
  provinceName?: string | null;
}

export interface PreOrderOrderWarehouseSnapshot {
  warehouseId?: string | null;
  warehouseName?: string | null;
  addressLine?: string | null;
  phone?: string | null;
  provinceName?: string | null;
  wardName?: string | null;
}

export interface PreOrderOrderTimelineEntry {
  id: string;
  status: PreOrderOrderStatus | string;
  fromStatus?: string | null;
  toStatus?: string | null;
  title?: string | null;
  note?: string | null;
  changedByName?: string | null;
  createdAt: string;
}

export interface PreOrderOrderListItem {
  id: string;
  createdAt: string;
  updatedAt?: string;
  preOrderCode: string;
  omsOrderCode?: string | null;
  omsOrderId?: string | null;
  status: PreOrderOrderStatus | string;
  source?: OrderSource | string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  totalQuantity?: number;
  grandTotal?: string | number | null;
  /** Số lần hệ thống đã thử gửi ZNS (kể cả lần đầu). >= 4 → hết quota gửi lại. */
  znsRetryCount?: number;
  items: PreOrderOrderItem[];
}

export interface PreOrderOrderDetail extends PreOrderOrderListItem {
  paymentMethod?: PaymentMethod | string | null;
  shippingMethod?: ShippingMethod | string | null;
  shippingCarrier?: string | null;
  carrierServiceName?: string | null;
  subtotal?: string | number | null;
  discountTotal?: string | number | null;
  discountCode?: string | null;
  shippingFee?: string | number | null;
  customerNote?: string | null;
  shipperNote?: string | null;
  internalNotes?: Array<{ id: string; content: string; createdAt: string; createdByName?: string | null }>;
  shippingAddressSnapshot?: PreOrderOrderAddress | null;
  warehouseSnapshot?: PreOrderOrderWarehouseSnapshot | null;
  websiteOrderUrl?: string | null;
  awaitingPaymentExpiresAt?: string | null;
  /** Thời gian dự kiến bán hàng (BE: `expectedStockAt`). */
  expectedStockAt?: string | null;
  statusHistory?: PreOrderOrderTimelineEntry[];
}

/** Body POST `order/pre-orders/admin/bulk-mark-awaiting-payment` */
export interface BulkMarkPreOrderAwaitingPaymentDto {
  preOrderIds: string[];
}

/** Body POST `order/pre-orders/admin/bulk-send-zns` */
export interface BulkSendPreOrderZnsDto {
  preOrderIds: string[];
}

export interface PreOrderOrderStatusCounts {
  all?: number;
  [PreOrderOrderStatus.DRAFT]?: number;
  [PreOrderOrderStatus.PRE_ORDERED]?: number;
  [PreOrderOrderStatus.STOCK_AVAILABLE]?: number;
  [PreOrderOrderStatus.ZNS_FAILED]?: number;
  [PreOrderOrderStatus.AWAITING_PAYMENT]?: number;
  [PreOrderOrderStatus.CONVERTED]?: number;
  [PreOrderOrderStatus.CANCELLED]?: number;
  [PreOrderOrderStatus.EXPIRED]?: number;
}

/** Body POST `order/pre-orders/admin/filter` */
export interface QueryPreOrderOrderDto {
  page: number;
  pageSize: number;
  /** Tìm nhanh theo mã đơn, SĐT khách, tên sản phẩm / SKU (BE OR-match). */
  keyword?: string;
  statuses?: Array<PreOrderOrderStatus | string>;
  createdFrom?: string;
  createdTo?: string;
  sortField?: 'createdAt' | 'updatedAt' | 'grandTotal' | 'preOrderCode';
  sortDirection?: 'ASC' | 'DESC';
}

export interface ResListPreOrderOrder {
  list: PreOrderOrderListItem[];
  total: number;
  page?: number;
  pageSize?: number;
  counts?: PreOrderOrderStatusCounts;
  pagination?: { total?: number };
}

export interface UpdatePreOrderReceiverPhoneDto {
  phone: string;
}

export interface CancelPreOrderOrderDto {
  reason: string;
}
