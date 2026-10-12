/** US-16 — packing station (mobile outbound-packing APIs). */

import { FulfillmentOrderStatusEnum } from '../../../../apis/fulfillment-order/fulfillment-order.interface';

export const PACKING_STATION_SESSION_KEY_PREFIX = 'packing-station:session:';

export const PACKING_STATION_MAX_WIDTH_PX = 1200;

export const PACKING_SHIFT_OPTIONS = [
  { value: 'all' as const, label: 'Tất cả ca' },
  { value: '0-12' as const, label: 'Ca 0h → 12h' },
  { value: '12-24' as const, label: 'Ca 12h → 24h' },
];

export type PackingShiftFilter = (typeof PACKING_SHIFT_OPTIONS)[number]['value'];

export const PACKING_LIST_STATUS_TABS = [
  { value: 'picked' as const, label: 'Đã nhặt hàng' },
  { value: 'picking' as const, label: 'Đang nhặt hàng' },
  { value: 'cancelled' as const, label: 'Chờ hủy' },
] as const;

export type PackingListStatusTab = (typeof PACKING_LIST_STATUS_TABS)[number]['value'];

/** Chỉ đơn đã nhặt xong (picked) mới vào đóng gói. */
export const PACKING_ALLOWED_STATUSES = [FulfillmentOrderStatusEnum.Picked] as const;

export const PACKING_LIST_START_WAIT_TOOLTIP = 'Chờ nhặt xong';

/** Kích thước tem GHN khi gọi POST order/orders/shipments/ghn/print */
export const PACKING_GHN_WAYBILL_PAGE_SIZE = '4x6' as const;
