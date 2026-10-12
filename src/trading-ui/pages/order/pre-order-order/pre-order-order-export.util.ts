import { getImportExportTopicConfigs, getImportExportWorkerQueueProfiles } from '../../../apis/import-export/import-export.api';
import { TopicAction } from '../../../apis/import-export/import-export.enum';
import type { PreOrderOrderStatus } from '../../../apis/pre-order-order';
import type { PreOrderOrderListItem, QueryPreOrderOrderDto } from '../../../apis/pre-order-order/pre-order-order.interface';

export const PRE_ORDER_EXPORT_OMS_WORKER_CODE = 'oms-worker';
export const PRE_ORDER_EXPORT_ROUTING_KEY = 'export.pre-order';
export const PRE_ORDER_ITEM_EXPORT_ROUTING_KEY = 'export.pre-order-item';

export interface PreOrderOrderExportFiltersDto {
  keyword?: string;
  statuses?: Array<PreOrderOrderStatus | string>;
  createdFrom?: string;
  createdTo?: string;
  preOrderIds?: string[];
  page?: number;
  take?: number;
  sortField?: string;
  sortDirection?: string;
}

export type PreOrderOrderExportScope = 'all' | 'current-page' | 'selected';

/**
 * Lấy topic config id cho export pre-order từ API dựa trên routingKey (mặc định: `export.pre-order`).
 * Nếu hệ thống chưa cấu hình hoặc API lỗi sẽ throw error để thông báo cho người dùng.
 */
export const resolvePreOrderExportTopicConfigId = async (routingKey: string = PRE_ORDER_EXPORT_ROUTING_KEY): Promise<string> => {
  const profiles = await getImportExportWorkerQueueProfiles();
  const omsWorkerProfile = profiles.find((profile) => profile.workerCode === PRE_ORDER_EXPORT_OMS_WORKER_CODE && profile.action === TopicAction.EXPORT);

  if (!omsWorkerProfile?.id) {
    throw new Error('Không tìm thấy cấu hình worker export (oms-worker) trên hệ thống. Vui lòng liên hệ quản trị viên.');
  }

  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === routingKey && config.workerQueueProfile?.id === omsWorkerProfile.id);

  if (!existingConfig?.id) {
    const targetLabel = routingKey === PRE_ORDER_ITEM_EXPORT_ROUTING_KEY ? 'SKU đơn đặt trước' : 'đơn đặt trước';
    throw new Error(`Chưa tìm thấy cấu hình topic export ${targetLabel}. Vui lòng liên hệ quản trị viên.`);
  }

  return existingConfig.id;
};

/**
 * Xây dựng filter payload cho API export dựa trên trạng thái danh sách hiện tại.
 */
export const buildPreOrderExportFilters = ({
  queryBody,
  scope,
  selectedOrderIds,
  visibleOrders,
}: {
  queryBody: QueryPreOrderOrderDto;
  scope: PreOrderOrderExportScope;
  selectedOrderIds: string[];
  visibleOrders: PreOrderOrderListItem[];
}): PreOrderOrderExportFiltersDto => {
  const filters: PreOrderOrderExportFiltersDto = {};

  if (queryBody.keyword) filters.keyword = queryBody.keyword;
  if (queryBody.statuses?.length) filters.statuses = queryBody.statuses;
  if (queryBody.createdFrom) filters.createdFrom = queryBody.createdFrom;
  if (queryBody.createdTo) filters.createdTo = queryBody.createdTo;
  if (queryBody.sortField) filters.sortField = queryBody.sortField;
  if (queryBody.sortDirection) filters.sortDirection = queryBody.sortDirection;

  if (scope === 'selected') {
    const selectedPreOrderIds = visibleOrders
      .filter((order) => selectedOrderIds.includes(order.id))
      .map((order) => order.id)
      .filter(Boolean);

    return {
      preOrderIds: selectedPreOrderIds.length > 0 ? selectedPreOrderIds : selectedOrderIds,
    };
  }

  if (scope === 'all') {
    return filters;
  }

  // current-page
  filters.page = Math.max(1, queryBody.page ?? 1);
  filters.take = Math.max(1, queryBody.pageSize ?? 20);
  return filters;
};
