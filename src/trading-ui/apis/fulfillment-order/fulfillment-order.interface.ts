import type { PaginatedResultResponse } from '../../common/constant/ware-house/api-base-response.interface';
import type { BaseFilterQuery } from '../../common/constant/ware-house/wms-base.interface';

/** Trạng thái phiếu xuất — camelCase đồng bộ JSON API / summary (`pending`, …). Dùng cho hiển thị (list/detail/tab counts). */
export const FULFILLMENT_ORDER_STATUSES = ['pending', 'picking', 'picked', 'packed', 'shipped', 'completed', 'cancelled', 'cancelledProcessed', 'exception'] as const;
export type FulfillmentOrderStatus = (typeof FULFILLMENT_ORDER_STATUSES)[number];

/** BE OutboundStatusEnum — numeric values. The `/outbound/filter` endpoint now takes this (not a string). */
export enum FulfillmentOrderStatusEnum {
  Pending = 1,
  Picking = 2,
  Packed = 3,
  Shipped = 4,
  Cancelled = 5,
  Exception = 6,
  Picked = 7,
  CancelledProcessed = 8,
  Completed = 9,
}

export const FULFILLMENT_ORDER_STATUS_LABELS: Record<FulfillmentOrderStatusEnum, string> = {
  [FulfillmentOrderStatusEnum.Pending]: 'Chờ xử lý',
  [FulfillmentOrderStatusEnum.Picking]: 'Đang nhặt hàng',
  [FulfillmentOrderStatusEnum.Picked]: 'Đã nhặt hàng',
  [FulfillmentOrderStatusEnum.Packed]: 'Đã đóng gói',
  [FulfillmentOrderStatusEnum.Shipped]: 'Đã vận chuyển',
  [FulfillmentOrderStatusEnum.Completed]: 'Đã giao tại quầy',
  [FulfillmentOrderStatusEnum.Cancelled]: 'Chờ hủy',
  [FulfillmentOrderStatusEnum.CancelledProcessed]: 'Đã xử lý hủy',
  [FulfillmentOrderStatusEnum.Exception]: 'Ngoại lệ',
};

/** Nguồn phát sinh phiếu xuất — đồng bộ với BE OutboundSourceEnum. */
export enum FulfillmentOrderSourceEnum {
  FromOMS = 1,
  FromPOS = 2,
  FromTO = 3,
}

export const FULFILLMENT_ORDER_SOURCE_LABELS: Record<FulfillmentOrderSourceEnum, string> = {
  [FulfillmentOrderSourceEnum.FromOMS]: 'Xuất bán online',
  [FulfillmentOrderSourceEnum.FromPOS]: 'Xuất bán lẻ',
  [FulfillmentOrderSourceEnum.FromTO]: 'Điều chuyển',
};

/** Maps the camelCase display status to the numeric enum value the filter endpoint expects. */
export const FULFILLMENT_ORDER_STATUS_TO_ENUM: Record<FulfillmentOrderStatus, FulfillmentOrderStatusEnum> = {
  pending: FulfillmentOrderStatusEnum.Pending,
  picking: FulfillmentOrderStatusEnum.Picking,
  picked: FulfillmentOrderStatusEnum.Picked,
  packed: FulfillmentOrderStatusEnum.Packed,
  shipped: FulfillmentOrderStatusEnum.Shipped,
  completed: FulfillmentOrderStatusEnum.Completed,
  cancelled: FulfillmentOrderStatusEnum.Cancelled,
  cancelledProcessed: FulfillmentOrderStatusEnum.CancelledProcessed,
  exception: FulfillmentOrderStatusEnum.Exception,
};

/** Loại zone theo BRD (badge màu). */
export type FulfillmentZoneType = 'Sale' | 'Quarantine' | 'Diamond';

/** Ưu tiên giao hàng. */
export type FulfillmentPriority = 'Normal' | 'Fast' | 'Express';

export interface FulfillmentOrderListQuery extends BaseFilterQuery {
  status?: FulfillmentOrderStatus;
  source?: FulfillmentOrderSourceEnum;
  orderType?: 'all' | 'single' | 'multi';
  /** Kho nhận (phiếu xuất điều chuyển). Undefined means all. */
  warehouseReceiptId?: string;
}

export type FulfillmentOrderSummaryQuery = Pick<FulfillmentOrderListQuery, 'keyword' | 'source' | 'orderType' | 'fromDate' | 'toDate' | 'warehouseReceiptId'>;

export interface FulfillmentOrderListItem {
  id: string;
  wmsCode: string;
  orderCode: string;
  createdOn: number;
  skuCount: number;
  detailsCount: number;
  /** BE OutboundStatusEnum — numeric. Map to a Vietnamese label via foStatusLabelVi(). */
  status: FulfillmentOrderStatusEnum;
  /** BE OutboundSourceEnum — numeric. */
  source: FulfillmentOrderSourceEnum;
  skus: string[];
  /** Kho nhận — chỉ có giá trị với phiếu xuất điều chuyển. */
  warehouseReceiptId?: string | null;
  warehouseReceiptCode?: string | null;
  warehouseReceiptName?: string | null;
}

/** Kết quả danh sách + counter tab (mock; BE có thể tách endpoint sau). */
export interface FulfillmentOrderListPageData extends PaginatedResultResponse<FulfillmentOrderListItem> {
  tabCounts?: FulfillmentOrderSummaryDto;
}

export interface FulfillmentOrderLineDto {
  id: string;
  skuCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface FulfillmentOrderDetailDto {
  id: string;
  wmsCode?: string;
  orderId: string;
  orderCode: string;
  /** BE OutboundStatusEnum — numeric. Map to a Vietnamese label via foStatusLabelVi(). */
  status: FulfillmentOrderStatusEnum;
  createdOn: number;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddressJson: string;
  pickupAddressJson: string;
  note: string;
  details: FulfillmentOrderLineDto[];
  /** Kho nhận — chỉ có giá trị với phiếu xuất điều chuyển. */
  warehouseReceiptId?: string | null;
  warehouseReceiptCode?: string | null;
  warehouseReceiptName?: string | null;
}

export interface FulfillmentOrderSummaryDto {
  total: number;
  pending: number;
  picking: number;
  picked: number;
  packed: number;
  shipped: number;
  completed: number;
  cancelled: number;
  cancelledProcessed: number;
  exception: number;
}

export interface PutbackPackageSkuItem {
  packageSkuCode: string;
  quantity: number;
}
