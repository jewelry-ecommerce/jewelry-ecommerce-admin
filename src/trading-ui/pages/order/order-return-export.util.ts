import { getImportExportTopicConfigs, getImportExportWorkerQueueProfiles, postImportExportTopicConfig } from '../../apis/import-export/import-export.api';
import type { OrderReturnExportFiltersDto } from '../../apis/import-export/import-export.interface';
import { TopicAction } from '../../apis/import-export/import-export.enum';
import type { OrderReturnReason, OrderReturnStatus, OrderReturnType, IOrderReturnListItem } from '../../apis/order';
import { buildOrderTimeFilterPayload } from '../../components/time-filter/shared-time-filter';
import type { OrderTimeOptionValue } from './order.types';
import type { Dayjs } from 'dayjs';
import type { ReturnExchangeAdvancedFilters } from './returns-exchanges/parts/returns-exchanges-advanced-filter-dialog.part';
import { OMS_WORKER_CODE } from './order-export.util';

export const ORDER_RETURN_EXPORT_ROUTING_KEY = 'export.order.return';
export const ORDER_RETURN_EXPORT_BULK_SIZE = 100;

/** Topic seed — worker merge với default columns đầy đủ. */
export const ORDER_RETURN_EXPORT_COLUMN_MAPPING: Record<string, string> = {
  'Mã yêu cầu': 'returnCode',
  'Mã đơn gốc': 'originalOrderCode',
  'Trạng thái yêu cầu': 'statusLabel',
  'Loại yêu cầu': 'typeLabel',
  'Ngày tạo': 'createdAtDate',
};

export const ORDER_RETURN_EXPORT_FILTER_FIELDS = ['orderTimeFilter', 'startDate', 'endDate', 'status', 'type', 'reason', 'reasonCategory', 'orderId', 'search', 'page', 'take'] as const;

export type OrderReturnListExportScope = 'all' | 'current-page' | 'selected';

export const resolveOrderReturnExportTopicConfigId = async (): Promise<string> => {
  const profiles = await getImportExportWorkerQueueProfiles();
  const omsWorkerProfile = profiles.find((profile) => profile.workerCode === OMS_WORKER_CODE && profile.action === TopicAction.EXPORT);

  if (!omsWorkerProfile?.id) {
    throw new Error('Không tìm thấy cấu hình worker export đổi/trả (oms-worker).');
  }

  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === ORDER_RETURN_EXPORT_ROUTING_KEY && config.workerQueueProfile?.id === omsWorkerProfile.id);

  if (existingConfig?.id) {
    return existingConfig.id;
  }

  const createdConfig = await postImportExportTopicConfig({
    workerQueueProfileId: omsWorkerProfile.id,
    routingKey: ORDER_RETURN_EXPORT_ROUTING_KEY,
    columnMapping: ORDER_RETURN_EXPORT_COLUMN_MAPPING,
    filterFields: [...ORDER_RETURN_EXPORT_FILTER_FIELDS],
    bulkSize: ORDER_RETURN_EXPORT_BULK_SIZE,
  });

  return createdConfig.id;
};

export const buildOrderReturnExportFiltersFromListState = ({
  page,
  pageSize,
  search,
  activeStatus,
  selectedTimeOption,
  customDateRange,
  advancedFilters,
  scope,
  selectedRowIds,
  visibleRows,
}: {
  page: number;
  pageSize: number;
  search: string;
  activeStatus: string;
  selectedTimeOption: OrderTimeOptionValue | null;
  customDateRange: { from: Dayjs; to: Dayjs } | null;
  advancedFilters: ReturnExchangeAdvancedFilters;
  scope: OrderReturnListExportScope;
  selectedRowIds: string[];
  visibleRows: IOrderReturnListItem[];
}): OrderReturnExportFiltersDto => {
  const timeRangePayload = buildOrderTimeFilterPayload(selectedTimeOption, customDateRange);
  const statusPayload: OrderReturnStatus | undefined = activeStatus !== 'ALL' ? (activeStatus as OrderReturnStatus) : advancedFilters.status || undefined;
  const typePayload: OrderReturnType | undefined = advancedFilters.type || undefined;
  const reasonPayload: OrderReturnReason | undefined = advancedFilters.reason || undefined;

  const filters: OrderReturnExportFiltersDto = {
    ...timeRangePayload,
  };

  if (statusPayload) filters.status = statusPayload;
  if (typePayload) filters.type = typePayload;
  if (reasonPayload) filters.reason = reasonPayload;
  if (advancedFilters.orderId.trim()) filters.orderId = advancedFilters.orderId.trim();
  if (search.trim()) filters.search = search.trim();

  if (scope === 'selected') {
    const selectedReturnCodes = visibleRows
      .filter((row) => selectedRowIds.includes(row.id))
      .map((row) => row.returnCode?.trim())
      .filter((code): code is string => Boolean(code));

    if (selectedReturnCodes.length) {
      filters.search = selectedReturnCodes.join(',');
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
