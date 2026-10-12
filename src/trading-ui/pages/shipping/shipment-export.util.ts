import type { Dayjs } from 'dayjs';
import { getImportExportTopicConfigs, getImportExportWorkerQueueProfiles, postImportExportTopicConfig } from '../../apis/import-export/import-export.api';
import type { ShipmentExportFiltersDto } from '../../apis/import-export/import-export.interface';
import { TopicAction } from '../../apis/import-export/import-export.enum';
import { buildOrderTimeFilterPayload } from '../../components/time-filter/shared-time-filter';
import type { OrderTimeOptionValue } from '../order/order.types';
import { SHIPPING_TRACKING_TAB_FILTER_MAP } from './shipping.constants';
import type { Shipment, ShipmentStatusFilter } from './shipping.types';

export const SHIPPING_WORKER_CODE = 'shipping-worker';
export const SHIPMENT_EXPORT_ROUTING_KEY = 'export.shipment';
export const SHIPMENT_EXPORT_BULK_SIZE = 100;

/** Topic seed — worker merge với default columns đầy đủ. */
export const SHIPMENT_EXPORT_COLUMN_MAPPING: Record<string, string> = {
  'Mã vận đơn': 'trackingCode',
  'Mã đơn hàng': 'orderCode',
  'Ngày tạo': 'createdAtDate',
  'Đơn vị vận chuyển': 'carrier',
  'Trạng thái theo dõi': 'trackingTabLabel',
};

export const SHIPMENT_EXPORT_FILTER_FIELDS = [
  'orderTimeFilter',
  'startDate',
  'endDate',
  'carrier',
  'orderCategory',
  'shipmentStatus',
  'trackingTab',
  'warehouseId',
  'orderId',
  'orderCode',
  'trackingCode',
  'search',
  'shipmentIds',
  'page',
  'take',
] as const;

export type ShipmentListExportScope = 'all' | 'current-page' | 'selected';

export const resolveShipmentExportTopicConfigId = async (): Promise<string> => {
  const profiles = await getImportExportWorkerQueueProfiles();
  const shippingWorkerProfile = profiles.find((profile) => profile.workerCode === SHIPPING_WORKER_CODE && profile.action === TopicAction.EXPORT);

  if (!shippingWorkerProfile?.id) {
    throw new Error('Không tìm thấy cấu hình worker export vận đơn (shipping-worker). Hãy tạo worker-queue-profile EXPORT trước.');
  }

  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === SHIPMENT_EXPORT_ROUTING_KEY && config.workerQueueProfile?.id === shippingWorkerProfile.id);

  if (existingConfig?.id) {
    return existingConfig.id;
  }

  const createdConfig = await postImportExportTopicConfig({
    workerQueueProfileId: shippingWorkerProfile.id,
    routingKey: SHIPMENT_EXPORT_ROUTING_KEY,
    columnMapping: SHIPMENT_EXPORT_COLUMN_MAPPING,
    filterFields: [...SHIPMENT_EXPORT_FILTER_FIELDS],
    bulkSize: SHIPMENT_EXPORT_BULK_SIZE,
  });

  return createdConfig.id;
};

export const buildShipmentExportFiltersFromListState = ({
  page,
  pageSize,
  search,
  activeStatus,
  selectedTimeOption,
  customDateRange,
  scope,
  selectedShipmentIds,
  visibleShipments,
}: {
  page: number;
  pageSize: number;
  search: string;
  activeStatus: ShipmentStatusFilter;
  selectedTimeOption: OrderTimeOptionValue | null;
  customDateRange: { from: Dayjs; to: Dayjs } | null;
  scope: ShipmentListExportScope;
  selectedShipmentIds: string[];
  visibleShipments: Shipment[];
}): ShipmentExportFiltersDto => {
  const filters: ShipmentExportFiltersDto = {
    ...buildOrderTimeFilterPayload(selectedTimeOption, customDateRange),
  };

  const trackingTab = SHIPPING_TRACKING_TAB_FILTER_MAP[activeStatus];
  if (trackingTab) filters.trackingTab = trackingTab;
  if (search.trim()) filters.search = search.trim();

  if (scope === 'selected') {
    const ids = visibleShipments.filter((row) => selectedShipmentIds.includes(row.id)).map((row) => row.id);
    if (ids.length) {
      filters.shipmentIds = ids.join(',');
    }
    return filters;
  }

  if (scope === 'all') {
    return filters;
  }

  filters.page = Math.max(1, page);
  filters.take = Math.max(1, pageSize);
  return filters;
};
