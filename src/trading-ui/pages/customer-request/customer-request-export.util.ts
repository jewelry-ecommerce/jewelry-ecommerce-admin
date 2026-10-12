import { getImportExportTopicConfigs } from '../../apis/import-export/import-export.api';
import type { CustomerRequestExportFiltersDto } from '../../apis/import-export/import-export.interface';
import { TopicAction } from '../../apis/import-export/import-export.enum';
import type { CustomerRequestOrderType } from '../../apis/customer-request';
import type { OrderTimeFilter } from '../../apis/order';
import type { SharedTimeRange } from '../../components/time-filter/shared-time-filter';
import { buildCustomerRequestTimeParams, CUSTOMER_REQUEST_ALL_FILTER_VALUE } from './customer-request.constants';

export type CustomerRequestExportKind = 'back-in-stock' | 'order-support' | 'newsletter';
export type CustomerRequestListExportScope = 'all' | 'current-page' | 'selected';

export const CUSTOMER_REQUEST_EXPORT_ROUTING_KEY: Record<CustomerRequestExportKind, string> = {
  'back-in-stock': 'export.customer-request.back-in-stock',
  'order-support': 'export.customer-request.order-support',
  newsletter: 'export.customer-request.newsletter',
};

export const resolveCustomerRequestExportTopicConfigId = async (kind: CustomerRequestExportKind): Promise<string> => {
  const routingKey = CUSTOMER_REQUEST_EXPORT_ROUTING_KEY[kind];
  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === routingKey && config.workerQueueProfile?.action === TopicAction.EXPORT);

  if (!existingConfig?.id) {
    throw new Error(`Chưa cấu hình topic export «${routingKey}». Seed topic-config trên IE trước.`);
  }

  return existingConfig.id;
};

export const buildCustomerRequestExportFiltersFromListState = ({
  page,
  pageSize,
  keyword,
  status,
  orderType,
  selectedTimeOption,
  customDateRange,
  scope,
  selectedRowIds,
}: {
  page: number;
  pageSize: number;
  keyword: string;
  status: string;
  orderType?: string;
  selectedTimeOption: OrderTimeFilter | null;
  customDateRange: SharedTimeRange;
  scope: CustomerRequestListExportScope;
  selectedRowIds: string[];
}): CustomerRequestExportFiltersDto => {
  const filters: CustomerRequestExportFiltersDto = {
    ...buildCustomerRequestTimeParams(selectedTimeOption, customDateRange),
  };

  if (status !== CUSTOMER_REQUEST_ALL_FILTER_VALUE) filters.status = status;
  if (keyword.trim()) filters.keyword = keyword.trim();
  if (orderType && orderType !== CUSTOMER_REQUEST_ALL_FILTER_VALUE) {
    filters.orderType = orderType as CustomerRequestOrderType;
  }

  if (scope === 'selected') {
    if (selectedRowIds.length) filters.ids = selectedRowIds;
    return filters;
  }

  if (scope === 'all') return filters;

  filters.page = Math.max(1, page);
  filters.take = Math.max(1, pageSize);
  return filters;
};
