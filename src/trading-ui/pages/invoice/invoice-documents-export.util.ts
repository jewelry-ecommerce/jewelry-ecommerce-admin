import dayjs, { type Dayjs } from 'dayjs';
import { getImportExportTopicConfigs, getImportExportWorkerQueueProfiles, postImportExportTopicConfig } from '../../apis/import-export/import-export.api';
import type { OrderInvoiceExportFiltersDto } from '../../apis/import-export/import-export.interface';
import { TopicAction } from '../../apis/import-export/import-export.enum';
import { OrderTimeFilter } from '../../apis/order';
import type { InvoiceDocumentRow, InvoiceDocumentTypeFilter } from '../../hooks/invoice-documents/use-invoice-documents-list.hook';
import { buildOrderTimeFilterPayload } from '../../components/time-filter/shared-time-filter';
import { OMS_WORKER_CODE } from '../order/order-export.util';

export const ORDER_INVOICE_EXPORT_ROUTING_KEY = 'export.order.invoice';
export const ORDER_INVOICE_EXPORT_BULK_SIZE = 100;

/** Topic seed — worker giữ cố định 35 cột Fast HĐBH (`Hóa đơn bán hàng.xlsx`). */
export const ORDER_INVOICE_EXPORT_COLUMN_MAPPING: Record<string, string> = {
  '* Mã khách': '* Mã khách',
  'Tên khách hàng': 'Tên khách hàng',
  '* Ngày': '* Ngày',
  '* Số hóa đơn': '* Số hóa đơn',
  '* Ký hiệu': '* Ký hiệu',
  '* Mã hàng': '* Mã hàng',
  '* Đvt': '* Đvt',
  'Số lượng': 'Số lượng',
  'Giá bán': 'Giá bán',
  'Tiền hàng': 'Tiền hàng',
};

export const ORDER_INVOICE_EXPORT_FILTER_FIELDS = ['orderTimeFilter', 'startDate', 'endDate', 'status', 'documentType', 'search', 'page', 'take'] as const;

export type OrderInvoiceListExportScope = 'all' | 'current-page' | 'selected';

export const resolveOrderInvoiceExportTopicConfigId = async (): Promise<string> => {
  const profiles = await getImportExportWorkerQueueProfiles();
  const omsWorkerProfile = profiles.find((profile) => profile.workerCode === OMS_WORKER_CODE && profile.action === TopicAction.EXPORT);

  if (!omsWorkerProfile?.id) {
    throw new Error('Không tìm thấy cấu hình worker export hóa đơn (oms-worker).');
  }

  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === ORDER_INVOICE_EXPORT_ROUTING_KEY && config.workerQueueProfile?.id === omsWorkerProfile.id);

  if (existingConfig?.id) {
    return existingConfig.id;
  }

  const createdConfig = await postImportExportTopicConfig({
    workerQueueProfileId: omsWorkerProfile.id,
    routingKey: ORDER_INVOICE_EXPORT_ROUTING_KEY,
    columnMapping: ORDER_INVOICE_EXPORT_COLUMN_MAPPING,
    filterFields: [...ORDER_INVOICE_EXPORT_FILTER_FIELDS],
    bulkSize: ORDER_INVOICE_EXPORT_BULK_SIZE,
  });

  return createdConfig.id;
};

/** OMS/worker chưa hỗ trợ Last90Days — map sang Custom + start/end. */
const resolveInvoiceExportTimeFilters = (
  selectedTimeOption: OrderTimeFilter | null,
  customDateRange: { from: Dayjs; to: Dayjs } | null,
): Pick<OrderInvoiceExportFiltersDto, 'orderTimeFilter' | 'startDate' | 'endDate'> => {
  if (selectedTimeOption === OrderTimeFilter.LAST_90_DAYS) {
    const to = dayjs().endOf('day');
    const from = dayjs().subtract(89, 'day').startOf('day');
    return {
      orderTimeFilter: OrderTimeFilter.CUSTOM,
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    };
  }

  return buildOrderTimeFilterPayload(selectedTimeOption, customDateRange);
};

export const buildOrderInvoiceExportFiltersFromListState = ({
  page,
  pageSize,
  search,
  activeStatus,
  documentTypeFilter,
  selectedTimeOption,
  customDateRange,
  scope,
  selectedRowIds,
  visibleRows,
}: {
  page: number;
  pageSize: number;
  search: string;
  activeStatus: string;
  documentTypeFilter: InvoiceDocumentTypeFilter;
  selectedTimeOption: OrderTimeFilter | null;
  customDateRange: { from: Dayjs; to: Dayjs } | null;
  scope: OrderInvoiceListExportScope;
  selectedRowIds: string[];
  visibleRows: InvoiceDocumentRow[];
}): OrderInvoiceExportFiltersDto => {
  const filters: OrderInvoiceExportFiltersDto = {
    ...resolveInvoiceExportTimeFilters(selectedTimeOption, customDateRange),
  };

  if (activeStatus !== 'ALL') filters.status = activeStatus;
  if (documentTypeFilter !== 'ALL') filters.documentType = documentTypeFilter;
  if (search.trim()) filters.search = search.trim();

  if (scope === 'selected') {
    const selectedCodes = visibleRows
      .filter((row) => selectedRowIds.includes(row.id))
      .map((row) => row.invoiceCode?.trim())
      .filter((code): code is string => Boolean(code));

    if (selectedCodes.length) {
      filters.search = selectedCodes.join(',');
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
