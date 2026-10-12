import { type StatusPillConfig } from '../../components/status-pill';
import type { ShipmentStatus, ShipmentStatusFilter, ShipmentStatusOption } from './shipping.types';

export const SHIPPING_STATUS_OPTIONS: ShipmentStatusOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'awaitingPickup', label: 'Chờ lấy hàng' },
  { value: 'intransit', label: 'Đang giao' },
  { value: 'incident', label: 'Sự cố' },
  { value: 'awaitingReturn', label: 'Chờ hoàn hàng' },
  { value: 'finished', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export const SHIPPING_STATUS_LABELS: Record<ShipmentStatusFilter, string> = {
  all: 'Tất cả',
  awaitingPickup: 'Chờ lấy hàng',
  intransit: 'Đang giao',
  incident: 'Sự cố',
  awaitingReturn: 'Chờ hoàn hàng',
  finished: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

export const SHIPPING_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const SHIPPING_TRACKING_TAB_FILTER_MAP: Record<ShipmentStatusFilter, string | undefined> = {
  all: undefined,
  awaitingPickup: 'AwaitingPickup',
  intransit: 'InTransit',
  incident: 'Incident',
  awaitingReturn: 'AwaitingReturn',
  finished: 'Finished',
  cancelled: 'Cancelled',
};

const infoVariant = {
  color: '#155EEF',
  backgroundColor: '#EFF8FF',
  borderColor: '#B2DDFF',
};

const warningVariant = {
  color: '#B54708',
  backgroundColor: '#FFFAEB',
  borderColor: '#FDE68A',
};

const dangerVariant = {
  color: '#B42318',
  backgroundColor: '#FEF3F2',
  borderColor: '#FECDCA',
};

const successVariant = {
  color: '#027A48',
  backgroundColor: '#ECFDF3',
  borderColor: '#ABEFC6',
};

export const SHIPPING_STATUS_PILL_CONFIG: StatusPillConfig<ShipmentStatus> = {
  AWAITING_PICKUP: {
    label: 'Chờ lấy hàng',
    ...infoVariant,
  },
  PICKING_UP: {
    label: 'Đang lấy hàng',
    ...infoVariant,
  },
  AT_POST_SORTING_HUB: {
    label: 'Tại kho phân loại',
    ...infoVariant,
  },
  OUT_FOR_DELIVERY: {
    label: 'Đang giao',
    ...infoVariant,
  },
  DELIVERY_SUCCESSFUL: {
    label: 'Giao thành công',
    ...successVariant,
  },
  DELIVERY_INCIDENT: {
    label: 'Sự cố giao hàng',
    ...dangerVariant,
  },
  RISK_ALERT: {
    label: 'Cảnh báo rủi ro',
    ...warningVariant,
  },
  AWAITING_RETURN: {
    label: 'Chờ hoàn hàng',
    ...warningVariant,
  },
  RETURN_COMPLETED: {
    label: 'Hoàn hàng',
    ...successVariant,
  },
  FINISHED: {
    label: 'Hoàn tất',
    ...successVariant,
  },
  CANCELLED: {
    label: 'Đã hủy',
    ...dangerVariant,
  },
  ERROR: {
    label: 'Lỗi',
    ...dangerVariant,
  },
};
