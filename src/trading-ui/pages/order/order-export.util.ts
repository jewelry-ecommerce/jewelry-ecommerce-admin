import { getImportExportTopicConfigs, getImportExportWorkerQueueProfiles, patchImportExportTopicConfig, postImportExportTopicConfig } from '../../apis/import-export/import-export.api';
import type { OrderExportFiltersDto } from '../../apis/import-export/import-export.interface';
import { TopicAction } from '../../apis/import-export/import-export.enum';
import { buildOrderListRequest } from './order.constant';
import type { Order, OrderAdvancedFilters, OrderStatusFilter, OrderTimeOptionValue } from './order.types';
import type { Dayjs } from 'dayjs';
import {OrderTimeFilter} from '../../apis/order/order.enum';

export const OMS_WORKER_CODE = 'oms-worker';
/** Export SKU: 1 dòng Excel = 1 dòng hàng. */
export const ORDER_EXPORT_ROUTING_KEY = 'export.order';
/** Export: 1 dòng Excel = 1 đơn, cột SKU gộp bằng dấu phẩy (cùng bộ cột với Export SKU). */
export const ORDER_SUMMARY_EXPORT_ROUTING_KEY = 'export.order.summary';
export const ORDER_EXPORT_BULK_SIZE = 100;

/** Bộ cột file Danh sách đơn hàng (Export + Export SKU) — worker giữ cố định đúng thứ tự này. */
export const ORDER_EXPORT_COLUMN_MAPPING: Record<string, string> = {
  'Mã đơn hàng': 'orderCode',
  'Loại đơn': 'orderType',
  'Mã Pre-order': 'preOrderCode',
  'Trạng thái đơn': 'orderStatus',
  'Trạng thái thanh toán': 'paymentStatus',
  Vote: 'vote',
  'Loại dòng hàng': 'lineType',
  'Mã SKU': 'skuCode',
  'Tên sản phẩm': 'productName',
  'Số lượng': 'quantity',
  'Giá gốc': 'unitPrice',
  'Đơn giá (Giá bán)': 'salePrice',
  'Thành tiền dòng (trước CK)': 'lineTotal',
  'Thành tiền': 'lineTotal',
  'Giảm giá dòng': 'discountAmount',
  'Thành tiền dòng': 'finalAmount',
  'Tổng tiền hàng': 'subtotal',
  'Giảm giá': 'discountTotal',
  Thuế: 'taxTotal',
  'Phí ship': 'shippingFee',
  'Phí khai giá': 'declaredValueFee',
  'Tổng thanh toán': 'grandTotal',
  'Số tiền thực nhận': 'amountReceived',
  'Ngày tạo': 'createdAt',
  'Mã thương hiệu': 'tenantCode',
  'Phương thức thanh toán': 'paymentMethod',
  'Nguồn đơn': 'source',
  'Cửa hàng': 'storeName',
  'Phân loại đơn': 'orderKind',
  'Loại khách': 'customerType',
  'Hình thức giao': 'shippingMethod',
  'Đơn vị vận chuyển': 'shippingCarrier',
  'Mã vận đơn': 'trackingCode',
  'Tên kho': 'warehouseName',
  'Ca làm việc': 'shiftLabel',
  'Thu ngân': 'cashierName',
  'NV Tư vấn': 'sellerNames',
  'Yêu cầu xuất HĐĐT': 'vatRequested',
  'Tình trạng VAT': 'vatStatus',
  'Tên công ty': 'vatCompanyName',
  'Mã số thuế': 'vatTaxCode',
  'Địa chỉ công ty': 'vatCompanyAddress',
  'Email nhận hóa đơn': 'vatEmail',
  'Tên người nhận': 'receiverName',
  'SĐT người nhận': 'receiverPhone',
  'Tỉnh/Thành': 'provinceName',
  'Phường/Xã': 'wardName',
  'Địa chỉ chi tiết': 'addressLine',
  'Email liên hệ': 'contactEmail',
  'Người trả phí ship': 'shippingFeePayer',
  'Mã giao dịch thanh toán': 'paymentTransactionId',
  'Mã chuẩn chi': 'approvalCode',
  'Ghi chú đơn': 'note',
  'Ghi chú nội bộ': 'internalNote',
  'Mã phiếu đổi/trả': 'orderReturnCode',
  'Ngày giao cho ĐVVC': 'shippedAt',
  'Ngày giao thành công': 'deliveredAt',
  'Ngày hoàn tất': 'completedAt',
  'Ngày hủy đơn': 'cancelledAt',
  'Người hủy đơn': 'cancelledBy',
  'Lý do hủy đơn': 'cancelReason',
};

export const ORDER_EXPORT_FILTER_FIELDS = [
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

export type OrderListExportScope = 'all' | 'current-page' | 'selected';

export const resolveOrderExportTopicConfigId = async (routingKey: string = ORDER_EXPORT_ROUTING_KEY): Promise<string> => {
  const profiles = await getImportExportWorkerQueueProfiles();
  const omsWorkerProfile = profiles.find((profile) => profile.workerCode === OMS_WORKER_CODE && profile.action === TopicAction.EXPORT);

  if (!omsWorkerProfile?.id) {
    throw new Error('Không tìm thấy cấu hình worker export đơn hàng (oms-worker).');
  }

  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === routingKey && config.workerQueueProfile?.id === omsWorkerProfile.id);

  if (existingConfig?.id) {
    const existingKeys = Object.keys(existingConfig.columnMapping ?? {});
    const targetKeys = Object.keys(ORDER_EXPORT_COLUMN_MAPPING);
    const isUpToDate = targetKeys.length === existingKeys.length && targetKeys.every((k) => existingConfig.columnMapping?.[k] === ORDER_EXPORT_COLUMN_MAPPING[k]);
    if (!isUpToDate) {
      await patchImportExportTopicConfig(existingConfig.id, {
        columnMapping: ORDER_EXPORT_COLUMN_MAPPING,
        filterFields: [...ORDER_EXPORT_FILTER_FIELDS],
      }).catch(() => undefined);
    }
    return existingConfig.id;
  }

  const createdConfig = await postImportExportTopicConfig({
    workerQueueProfileId: omsWorkerProfile.id,
    routingKey,
    columnMapping: ORDER_EXPORT_COLUMN_MAPPING,
    filterFields: [...ORDER_EXPORT_FILTER_FIELDS],
    bulkSize: ORDER_EXPORT_BULK_SIZE,
  });

  return createdConfig.id;
};

const pickOrderExportFilterFields = (listRequest: ReturnType<typeof buildOrderListRequest>): OrderExportFiltersDto => {
  const filters: OrderExportFiltersDto = {};

  if (listRequest.orderTimeFilter) filters.orderTimeFilter = listRequest.orderTimeFilter;
  if (listRequest.startDate) filters.startDate = listRequest.startDate;
  if (listRequest.endDate) filters.endDate = listRequest.endDate;
  if (listRequest.orderStatus) filters.orderStatus = listRequest.orderStatus;
  if (listRequest.paymentStatus) filters.paymentStatus = listRequest.paymentStatus;
  if (listRequest.source) filters.source = listRequest.source;
  if (listRequest.skuCode) filters.skuCode = listRequest.skuCode;
  if (listRequest.shippingMethod) filters.shippingMethod = listRequest.shippingMethod;
  if (listRequest.provinceName) filters.provinceName = listRequest.provinceName;
  if (listRequest.search) filters.search = listRequest.search;

  return filters;
};

export const buildOrderExportFiltersFromListState = ({
  page,
  pageSize,
  search,
  activeStatus,
  selectedTimeOption,
  customDateRange,
  advancedFilters,
  scope,
  selectedOrderIds,
  visibleOrders,
  dateField,
  customStartDate,
  customEndDate,
}: {
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
  const listRequest = buildOrderListRequest({
    page,
    pageSize,
    search,
    activeStatus,
    sortField: null,
    sortDirection: 'desc',
    selectedTimeOption,
    customDateRange: customDateRange?.from && customDateRange.to ? {from:customDateRange.from,to:customDateRange.to} : null,
    advancedFilters,
  });

  const filters = pickOrderExportFilterFields(listRequest);

  const resolvedDateField = dateField || customDateRange?.dateField;
  if (resolvedDateField) {
    filters.dateField = resolvedDateField;
  }
  if (customStartDate !== undefined || customEndDate !== undefined) {
    filters.startDate = customStartDate || undefined;
    filters.endDate = customEndDate || undefined;
    if (customStartDate || customEndDate) {
      filters.orderTimeFilter = OrderTimeFilter.CUSTOM;
    }
  }

  if (scope === 'selected') {
    const selectedOrderCodes = visibleOrders
      .filter((order) => selectedOrderIds.includes(order.id))
      .map((order) => order.orderCode.trim())
      .filter(Boolean);

    if (selectedOrderCodes.length) {
      filters.search = selectedOrderCodes.join(',');
    }

    return filters;
  }

  if (scope === 'all') {
    return filters;
  }

  filters.page = Math.max(1, listRequest.page ?? 1);
  filters.take = Math.max(1, listRequest.take ?? pageSize);
  return filters;
};

export const isUnsupportedOrderExportStatusFilter = (activeStatus: OrderStatusFilter): boolean => activeStatus === 'express';
