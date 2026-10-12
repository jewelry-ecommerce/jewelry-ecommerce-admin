export type ShipmentStatusFilter = 'all' | 'awaitingPickup' | 'intransit' | 'incident' | 'awaitingReturn' | 'finished' | 'cancelled';

export type ShipmentStatus =
  | 'AWAITING_PICKUP'
  | 'PICKING_UP'
  | 'AT_POST_SORTING_HUB'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERY_SUCCESSFUL'
  | 'DELIVERY_INCIDENT'
  | 'RISK_ALERT'
  | 'AWAITING_RETURN'
  | 'RETURN_COMPLETED'
  | 'FINISHED'
  | 'CANCELLED'
  | 'ERROR';

export type ShipmentSortField = 'createdAt' | 'orderCode' | 'trackingCode' | 'codAmount' | 'estimatedFee' | 'actualFee';

export type SortDirection = 'asc' | 'desc';

export interface Shipment {
  id: string;
  orderId: string;
  orderCode: string;
  trackingCode: string;
  createdAt: string;
  status: ShipmentStatus | null;
  carrier: string;
  carrierName: string;
  orderCategory: string | null;
  orderCategoryLabel: string | null;
  trackingStatus: string | null;
  trackingTab: string | null;
  trackingTabKey: ShipmentStatusFilter;
  trackingTabLabel: string | null;
  carrierRawStatus: string | null;
  statusDetail: string | null;
  codAmount: number;
  estimatedFee: number;
  actualFee: number;
  feeDiff: number;
  warehouseId: string | null;
  warehouseName: string | null;
}

export interface ShipmentStatusOption {
  value: ShipmentStatusFilter;
  label: string;
}

export interface ShipmentDetail extends Shipment {
  updatedAt?: string | null;
  deletedAt?: string | null;
  tenantCode?: string | null;
  carrierServiceId?: number | null;
  carrierServiceTypeId?: number | null;
  receiverName?: string | null;
  receiverPhone?: string | null;
  requestPayload?: unknown;
  responsePayload?: unknown;
  orderContext?: unknown;
  lastCarrierRawStatus?: string | null;
  lastCarrierDescription?: string | null;
  lastEventAt?: string | null;
  errorMessage?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  note?: string | null;
}
