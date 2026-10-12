import { getImportExportTopicConfigs, getImportExportWorkerQueueProfiles, postImportExportTopicConfig } from '../../apis/import-export/import-export.api';
import type { OrderReturnExportFiltersDto } from '../../apis/import-export/import-export.interface';
import { TopicAction } from '../../apis/import-export/import-export.enum';
import type { IOrderReturnListItem } from '../../apis/order';
import type { OrderTimeOptionValue } from './order.types';
import type { Dayjs } from 'dayjs';
import type { ReturnExchangeAdvancedFilters } from './returns-exchanges/parts/returns-exchanges-advanced-filter-dialog.part';
import { OMS_WORKER_CODE } from './order-export.util';
import { buildOrderReturnExportFiltersFromListState, ORDER_RETURN_EXPORT_FILTER_FIELDS, type OrderReturnListExportScope } from './order-return-export.util';

export const ORDER_RETURN_FAST_EXPORT_ROUTING_KEY = 'export.order.return.fast';
export const ORDER_RETURN_FAST_EXPORT_BULK_SIZE = 100;

/** Topic seed — worker giữ cố định cột Fast “Phiếu nhập hàng bán bị trả lại”. */
export const ORDER_RETURN_FAST_EXPORT_COLUMN_MAPPING: Record<string, string> = {
  '* Mã khách': '* Mã khách',
  'Tên khách hàng': 'Tên khách hàng',
  '* Ngày': '* Ngày',
  '* Số chứng từ': '* Số chứng từ',
  '* Mã hàng': '* Mã hàng',
  'Tên mặt hàng': 'Tên mặt hàng',
  Đvt: 'Đvt',
  '* Mã kho': '* Mã kho',
  'Số lượng': 'Số lượng',
  'Giá bán': 'Giá bán',
  'Tiền hàng': 'Tiền hàng',
  '* Mã thuế': '* Mã thuế',
  'Diễn giải': 'Diễn giải',
};

export const ORDER_RETURN_FAST_EXPORT_FILTER_FIELDS = [...ORDER_RETURN_EXPORT_FILTER_FIELDS] as const;

export const resolveOrderReturnFastExportTopicConfigId = async (): Promise<string> => {
  const profiles = await getImportExportWorkerQueueProfiles();
  const omsWorkerProfile = profiles.find((profile) => profile.workerCode === OMS_WORKER_CODE && profile.action === TopicAction.EXPORT);

  if (!omsWorkerProfile?.id) {
    throw new Error('Không tìm thấy cấu hình worker export đổi/trả (oms-worker).');
  }

  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === ORDER_RETURN_FAST_EXPORT_ROUTING_KEY && config.workerQueueProfile?.id === omsWorkerProfile.id);

  if (existingConfig?.id) {
    return existingConfig.id;
  }

  const createdConfig = await postImportExportTopicConfig({
    workerQueueProfileId: omsWorkerProfile.id,
    routingKey: ORDER_RETURN_FAST_EXPORT_ROUTING_KEY,
    columnMapping: ORDER_RETURN_FAST_EXPORT_COLUMN_MAPPING,
    filterFields: [...ORDER_RETURN_FAST_EXPORT_FILTER_FIELDS],
    bulkSize: ORDER_RETURN_FAST_EXPORT_BULK_SIZE,
  });

  return createdConfig.id;
};

/**
 * Bộ lọc export Hàng Bán Trả Lại Fast FBO từ list đổi/trả:
 * - theo bộ lọc list hiện tại
 * - worker luôn ép thêm status ∈ {Collected, Stored, Refunded, ExchangeReleased}
 */
export const buildOrderReturnFastExportFiltersFromListState = (params: {
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
  return buildOrderReturnExportFiltersFromListState(params);
};
