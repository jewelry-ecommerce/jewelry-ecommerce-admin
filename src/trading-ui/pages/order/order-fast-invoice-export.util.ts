import { getImportExportTopicConfigs, getImportExportWorkerQueueProfiles, postImportExportTopicConfig } from '../../apis/import-export/import-export.api';
import type { OrderExportFiltersDto } from '../../apis/import-export/import-export.interface';
import { TopicAction } from '../../apis/import-export/import-export.enum';
import { OMS_WORKER_CODE, buildOrderExportFiltersFromListState, type OrderListExportScope } from './order-export.util';
import type { Order, OrderAdvancedFilters, OrderStatusFilter, OrderTimeOptionValue } from './order.types';
import type { Dayjs } from 'dayjs';

export const ORDER_FAST_INVOICE_EXPORT_ROUTING_KEY = 'export.order.fast-invoice';
export const ORDER_FAST_INVOICE_EXPORT_BULK_SIZE = 100;

/** Topic seed — worker giữ cố định 35 cột Fast HĐBH (`Hóa đơn bán hàng.xlsx`). */
export const ORDER_FAST_INVOICE_EXPORT_COLUMN_MAPPING: Record<string, string> = {
  '* Mã khách': '* Mã khách',
  'Tên khách hàng': 'Tên khách hàng',
  '* Ngày': '* Ngày',
  '* Số hóa đơn': '* Số hóa đơn',
  '* Ký hiệu': '* Ký hiệu',
  'Diễn giải': 'Diễn giải',
  '* Mã hàng': '* Mã hàng',
  'Tên mặt hàng': 'Tên mặt hàng',
  Đvt: 'Đvt',
  '* Mã kho': '* Mã kho',
  'Số lượng': 'Số lượng',
  'Giá bán': 'Giá bán',
  'Tiền hàng': 'Tiền hàng',
  '* Mã thuế': '* Mã thuế',
};

export const ORDER_FAST_INVOICE_EXPORT_FILTER_FIELDS = [
  'orderTimeFilter',
  'startDate',
  'endDate',
  'dateField',
  'orderStatus',
  'paymentStatus',
  'source',
  'skuCode',
  'shippingMethod',
  'provinceName',
  'wardName',
  'search',
  'page',
  'take',
] as const;

export const resolveOrderFastInvoiceExportTopicConfigId = async (): Promise<string> => {
  const profiles = await getImportExportWorkerQueueProfiles();
  const omsWorkerProfile = profiles.find((profile) => profile.workerCode === OMS_WORKER_CODE && profile.action === TopicAction.EXPORT);

  if (!omsWorkerProfile?.id) {
    throw new Error('Không tìm thấy cấu hình worker export đơn hàng (oms-worker).');
  }

  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === ORDER_FAST_INVOICE_EXPORT_ROUTING_KEY && config.workerQueueProfile?.id === omsWorkerProfile.id);

  if (existingConfig?.id) {
    return existingConfig.id;
  }

  const createdConfig = await postImportExportTopicConfig({
    workerQueueProfileId: omsWorkerProfile.id,
    routingKey: ORDER_FAST_INVOICE_EXPORT_ROUTING_KEY,
    columnMapping: ORDER_FAST_INVOICE_EXPORT_COLUMN_MAPPING,
    filterFields: [...ORDER_FAST_INVOICE_EXPORT_FILTER_FIELDS],
    bulkSize: ORDER_FAST_INVOICE_EXPORT_BULK_SIZE,
  });

  return createdConfig.id;
};

/**
 * Bộ lọc export HĐBH Fast FBO từ list đơn:
 * - theo bộ lọc list hiện tại
 * - worker luôn ép thêm: status ∈ {Delivered, Completed} + invoiceCreated = false
 */
export const buildOrderFastInvoiceExportFiltersFromListState = (params: {
  page: number;
  pageSize: number;
  search: string;
  activeStatus: OrderStatusFilter;
  selectedTimeOption: OrderTimeOptionValue | null;
  customDateRange: { from?: Dayjs | null; to?: Dayjs | null; dateField?: 'createdAt' | 'deliveredAt' } | null;
  advancedFilters: OrderAdvancedFilters;
  scope: OrderListExportScope;
  selectedOrderIds: string[];
  visibleOrders: Order[];
  dateField?: 'createdAt' | 'deliveredAt';
  customStartDate?: string;
  customEndDate?: string;
}): OrderExportFiltersDto => {
  return buildOrderExportFiltersFromListState(params);
};
