import { getImportExportTopicConfigs, getImportExportWorkerQueueProfiles, postImportExportTopicConfig } from '../../apis/import-export/import-export.api';
import type { OrderExportFiltersDto } from '../../apis/import-export/import-export.interface';
import { TopicAction } from '../../apis/import-export/import-export.enum';
import { OMS_WORKER_CODE, buildOrderExportFiltersFromListState, type OrderListExportScope } from './order-export.util';
import type { Order, OrderAdvancedFilters, OrderStatusFilter, OrderTimeOptionValue } from './order.types';
import type { Dayjs } from 'dayjs';

export const ORDER_CUSTOMER_FBO_EXPORT_ROUTING_KEY = 'export.order.customer';
export const ORDER_CUSTOMER_FBO_EXPORT_BULK_SIZE = 100;

/** Topic seed — worker giữ cố định cột Fast FBO Danh mục khách hàng (theo AC). */
export const ORDER_CUSTOMER_FBO_EXPORT_COLUMN_MAPPING: Record<string, string> = {
  'Mã khách': 'Mã khách',
  'Tên khách hàng': 'Tên khách hàng',
  'Tên khác': 'Tên khác',
  'Loại khách hàng': 'Loại khách hàng',
  'Địa chỉ': 'Địa chỉ',
  'Mã số thuế': 'Mã số thuế',
  'Đối tác': 'Đối tác',
  'Nv bán hàng': 'Nv bán hàng',
  'Tài khoản ngầm định': 'Tài khoản ngầm định',
  'Tài khoản nhập mua': 'Tài khoản nhập mua',
  'Mã thanh toán': 'Mã thanh toán',
  'Giới hạn tiền nợ': 'Giới hạn tiền nợ',
  'Đến ngày': 'Đến ngày',
  'Khách hàng': 'Khách hàng',
  'Nhà cung cấp': 'Nhà cung cấp',
  'Nhân viên': 'Nhân viên',
  'Nhóm 1': 'Nhóm 1',
  'Nhóm 2': 'Nhóm 2',
  'Nhóm 3': 'Nhóm 3',
  'Nhóm khách tính giá': 'Nhóm khách tính giá',
  'Điện thoại': 'Điện thoại',
  'Số gửi bản sao (Fax)': 'Số gửi bản sao (Fax)',
  'Thư (Email)': 'Thư (Email)',
  'Trang chủ': 'Trang chủ',
  'Tài khoản ngân hàng': 'Tài khoản ngân hàng',
  'Tên người thụ hưởng': 'Tên người thụ hưởng',
  'Tên ngân hàng': 'Tên ngân hàng',
  'Chi nhánh': 'Chi nhánh',
  'Tỉnh thành': 'Tỉnh thành',
  'Ghi chú': 'Ghi chú',
};

export const ORDER_CUSTOMER_FBO_EXPORT_FILTER_FIELDS = [
  'orderTimeFilter',
  'startDate',
  'endDate',
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

export const resolveOrderCustomerFboExportTopicConfigId = async (): Promise<string> => {
  const profiles = await getImportExportWorkerQueueProfiles();
  const omsWorkerProfile = profiles.find((profile) => profile.workerCode === OMS_WORKER_CODE && profile.action === TopicAction.EXPORT);

  if (!omsWorkerProfile?.id) {
    throw new Error('Không tìm thấy cấu hình worker export đơn hàng (oms-worker).');
  }

  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === ORDER_CUSTOMER_FBO_EXPORT_ROUTING_KEY && config.workerQueueProfile?.id === omsWorkerProfile.id);

  if (existingConfig?.id) {
    return existingConfig.id;
  }

  const createdConfig = await postImportExportTopicConfig({
    workerQueueProfileId: omsWorkerProfile.id,
    routingKey: ORDER_CUSTOMER_FBO_EXPORT_ROUTING_KEY,
    columnMapping: ORDER_CUSTOMER_FBO_EXPORT_COLUMN_MAPPING,
    filterFields: [...ORDER_CUSTOMER_FBO_EXPORT_FILTER_FIELDS],
    bulkSize: ORDER_CUSTOMER_FBO_EXPORT_BULK_SIZE,
  });

  return createdConfig.id;
};

/**
 * Bộ lọc export danh mục khách hàng Fast FBO:
 * - theo bộ lọc list hiện tại (AC4)
 * - worker luôn ép thêm: status ∈ {Delivered, Completed} + invoiceCreated = false
 * - worker dedupe theo Mã khách
 */
export const buildOrderCustomerFboExportFiltersFromListState = (params: {
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
