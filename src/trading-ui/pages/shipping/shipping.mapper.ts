import type { IShipmentListItem, IShipmentListSummary } from '../../apis/shipment';
import { formatDate, formatTime } from '../../common/utils';
import type { Shipment, ShipmentStatus, ShipmentStatusFilter } from './shipping.types';

const TRACKING_TAB_KEY_MAP: Record<string, ShipmentStatusFilter> = {
  AwaitingPickup: 'awaitingPickup',
  InTransit: 'intransit',
  Incident: 'incident',
  AwaitingReturn: 'awaitingReturn',
  Finished: 'finished',
  Cancelled: 'cancelled',
};

const SHIPMENT_STATUS_SET = new Set<ShipmentStatus>([
  'AWAITING_PICKUP',
  'PICKING_UP',
  'AT_POST_SORTING_HUB',
  'OUT_FOR_DELIVERY',
  'DELIVERY_SUCCESSFUL',
  'DELIVERY_INCIDENT',
  'RISK_ALERT',
  'AWAITING_RETURN',
  'RETURN_COMPLETED',
  'FINISHED',
  'CANCELLED',
  'ERROR',
]);

const parseAmount = (value?: string | number | null): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const normalized = String(value).replace(/[^\d.-]/g, '');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

const toShipmentStatus = (value?: string | null): ShipmentStatus | null => {
  if (!value) return null;
  return SHIPMENT_STATUS_SET.has(value as ShipmentStatus) ? (value as ShipmentStatus) : null;
};

export const normalizeTrackingTabKey = (tab?: string | null): ShipmentStatusFilter => {
  if (!tab) return 'all';
  return TRACKING_TAB_KEY_MAP[tab] ?? 'all';
};

export const mapApiShipmentListItemToShipment = (item: IShipmentListItem): Shipment => ({
  id: item.id,
  orderId: item.orderId,
  orderCode: item.orderCode,
  trackingCode: item.trackingCode,
  createdAt: item.createdAt,
  status: toShipmentStatus(item.status),
  carrier: String(item.carrier ?? ''),
  carrierName: item.carrierName?.trim() || String(item.carrier ?? ''),
  orderCategory: item.orderCategory ?? null,
  orderCategoryLabel: item.orderCategoryLabel ?? null,
  trackingStatus: item.trackingStatus ?? null,
  trackingTab: item.trackingTab ?? null,
  trackingTabKey: normalizeTrackingTabKey(item.trackingTab),
  trackingTabLabel: item.trackingTabLabel ?? null,
  carrierRawStatus: item.carrierRawStatus ?? null,
  statusDetail: item.statusDetail ?? null,
  codAmount: parseAmount(item.codAmount),
  estimatedFee: parseAmount(item.estimatedFee),
  actualFee: parseAmount(item.actualFee),
  feeDiff: parseAmount(item.feeDiff),
  warehouseId: item.warehouseId ?? null,
  warehouseName: item.warehouseName ?? null,
});

export const createEmptyStatusCounts = (): Record<ShipmentStatusFilter, number> => ({
  all: 0,
  awaitingPickup: 0,
  intransit: 0,
  incident: 0,
  awaitingReturn: 0,
  finished: 0,
  cancelled: 0,
});

export const mapShipmentSummaryToStatusCounts = (summary?: IShipmentListSummary): Record<ShipmentStatusFilter, number> => {
  const counts = createEmptyStatusCounts();

  if (!summary) return counts;

  counts.all = summary.ALL ?? 0;
  counts.awaitingPickup = summary.awaitingPickup ?? 0;
  counts.intransit = summary.intransit ?? (summary as Record<string, number | undefined>).inTransit ?? 0;
  counts.incident = summary.incident ?? 0;
  counts.awaitingReturn = summary.awaitingReturn ?? 0;
  counts.finished = summary.finished ?? 0;
  counts.cancelled = summary.cancelled ?? 0;

  return counts;
};

export const mapShipmentsToExportRows = (sourceShipments: Shipment[]) => {
  return sourceShipments.map((shipment) => ({
    'Mã vận đơn': shipment.trackingCode,
    'Mã đơn hàng': shipment.orderCode,
    'Ngày tạo': formatDate(shipment.createdAt),
    'Giờ tạo': formatTime(shipment.createdAt),
    'Đơn vị vận chuyển': shipment.carrierName || shipment.carrier || '',
    'Kho xử lý': shipment.warehouseName || '',
    'Trạng thái theo dõi': shipment.trackingTabLabel || shipment.trackingStatus || '',
    COD: shipment.codAmount,
    'Phí dự kiến': shipment.estimatedFee,
    'Phí thực tế': shipment.actualFee,
    'Chênh lệch phí': shipment.feeDiff,
  }));
};
