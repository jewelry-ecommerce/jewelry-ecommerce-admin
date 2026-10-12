import { getImportExportTopicConfigs, getImportExportWorkerQueueProfiles, postImportExportTopicConfig } from '../../apis/import-export/import-export.api';
import type { OrderRefundExportFiltersDto } from '../../apis/import-export/import-export.interface';
import { TopicAction } from '../../apis/import-export/import-export.enum';
import type { IRefundProposalListItem } from '../../apis/refund-proposal';
import type { RefundProposalAdvancedFilters } from '../../hooks/refund-proposal/use-refund-proposal-list.hook';
import { OMS_WORKER_CODE } from '../order/order-export.util';

export const ORDER_REFUND_EXPORT_ROUTING_KEY = 'export.order.refund';
export const ORDER_REFUND_EXPORT_BULK_SIZE = 100;

/** Topic seed — worker merge với default columns đầy đủ. */
export const ORDER_REFUND_EXPORT_COLUMN_MAPPING: Record<string, string> = {
  'Mã yêu cầu': 'proposalCode',
  'Mã đơn gốc': 'originalOrderCode',
  'Trạng thái': 'statusLabel',
  Nguồn: 'sourceTypeLabel',
  'Ngày tạo': 'createdAt',
};

export const ORDER_REFUND_EXPORT_FILTER_FIELDS = ['status', 'paymentChannel', 'originalPaymentMethod', 'sourceType', 'brand', 'search', 'page', 'take'] as const;

export type OrderRefundListExportScope = 'all' | 'current-page' | 'selected';

export const resolveOrderRefundExportTopicConfigId = async (): Promise<string> => {
  const profiles = await getImportExportWorkerQueueProfiles();
  const omsWorkerProfile = profiles.find((profile) => profile.workerCode === OMS_WORKER_CODE && profile.action === TopicAction.EXPORT);

  if (!omsWorkerProfile?.id) {
    throw new Error('Không tìm thấy cấu hình worker export hoàn tiền (oms-worker).');
  }

  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === ORDER_REFUND_EXPORT_ROUTING_KEY && config.workerQueueProfile?.id === omsWorkerProfile.id);

  if (existingConfig?.id) {
    return existingConfig.id;
  }

  const createdConfig = await postImportExportTopicConfig({
    workerQueueProfileId: omsWorkerProfile.id,
    routingKey: ORDER_REFUND_EXPORT_ROUTING_KEY,
    columnMapping: ORDER_REFUND_EXPORT_COLUMN_MAPPING,
    filterFields: [...ORDER_REFUND_EXPORT_FILTER_FIELDS],
    bulkSize: ORDER_REFUND_EXPORT_BULK_SIZE,
  });

  return createdConfig.id;
};

export const buildOrderRefundExportFiltersFromListState = ({
  page,
  pageSize,
  search,
  activeStatus,
  advancedFilters,
  scope,
  selectedRowIds,
  visibleRows,
}: {
  page: number;
  pageSize: number;
  search: string;
  activeStatus: string;
  advancedFilters: RefundProposalAdvancedFilters;
  scope: OrderRefundListExportScope;
  selectedRowIds: string[];
  visibleRows: IRefundProposalListItem[];
}): OrderRefundExportFiltersDto => {
  const filters: OrderRefundExportFiltersDto = {};

  if (activeStatus !== 'ALL') filters.status = activeStatus;
  if (advancedFilters.paymentChannel) filters.paymentChannel = advancedFilters.paymentChannel;
  if (advancedFilters.sourceType) filters.sourceType = advancedFilters.sourceType;
  if (advancedFilters.brand.trim()) filters.brand = advancedFilters.brand.trim();
  if (search.trim()) filters.search = search.trim();

  if (scope === 'selected') {
    const selectedCodes = visibleRows
      .filter((row) => selectedRowIds.includes(row.id))
      .map((row) => row.proposalCode?.trim())
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
