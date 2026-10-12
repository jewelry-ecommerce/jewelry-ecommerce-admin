import { PreOrderCampaignStatus, PreOrderProductSourceType, ProductSpuStatus } from '../../../apis';
import { formatDateTime } from '../../../common/utils';

export const PRE_ORDER_CAMPAIGN_NAME_MAX = 100;
export const PRE_ORDER_CAMPAIGN_DEFAULT_MAX_PURCHASE_QTY = 2;
export const PRE_ORDER_CAMPAIGN_DEFAULT_PAYMENT_TIMEOUT_HOURS = 48;
export const PRE_ORDER_CAMPAIGN_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const PRE_ORDER_SKU_PICKER_PAGE_SIZE = 20;
export const PRE_ORDER_SKU_PICKER_SEARCH_DEBOUNCE_MS = 400;
export const PRE_ORDER_SKU_PICKER_LIST_MAX_HEIGHT = 360;

/** Filter mặc định khi search SKU tạo/sửa campaign. */
export const PRE_ORDER_CAMPAIGN_SKU_SEARCH_PRODUCT_STATUSES = [ProductSpuStatus.PUBLISHED, ProductSpuStatus.DISCONTINUED] as const;

export const PRE_ORDER_CAMPAIGN_STATUS_LABEL: Record<PreOrderCampaignStatus, string> = {
  [PreOrderCampaignStatus.DRAFT]: 'Nháp',
  [PreOrderCampaignStatus.SCHEDULED]: 'Đã lên lịch',
  [PreOrderCampaignStatus.ACTIVE]: 'Đang chạy',
  [PreOrderCampaignStatus.PAUSED]: 'Tạm ngưng',
  [PreOrderCampaignStatus.ENDED]: 'Đã kết thúc',
};

/** Thứ tự tab trên list — khớp design. */
export const PRE_ORDER_CAMPAIGN_STATUS_TAB_ORDER: PreOrderCampaignStatus[] = [
  PreOrderCampaignStatus.DRAFT,
  PreOrderCampaignStatus.ACTIVE,
  PreOrderCampaignStatus.SCHEDULED,
  PreOrderCampaignStatus.PAUSED,
  PreOrderCampaignStatus.ENDED,
];

export type PreOrderCampaignStatusTab = 'all' | PreOrderCampaignStatus;

export const PRE_ORDER_CAMPAIGN_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  ...PRE_ORDER_CAMPAIGN_STATUS_TAB_ORDER.map((value) => ({
    value,
    label: PRE_ORDER_CAMPAIGN_STATUS_LABEL[value],
  })),
];

export const formatPreOrderCampaignSchedule = (startAt?: string | null, endAt?: string | null): string => {
  if (!startAt && !endAt) return '—';
  return `${formatDateTime(startAt)} - ${formatDateTime(endAt)}`;
};

export const PRE_ORDER_PRODUCT_SOURCE_OPTIONS = [
  { value: PreOrderProductSourceType.COLLECTION, label: 'Bộ sưu tập' },
  { value: PreOrderProductSourceType.CATEGORY, label: 'Danh mục sản phẩm' },
  { value: PreOrderProductSourceType.VARIANT, label: 'Biến thể sản phẩm' },
];

export const getPreOrderCampaignStatusLabel = (status: PreOrderCampaignStatus | string): string => PRE_ORDER_CAMPAIGN_STATUS_LABEL[status as PreOrderCampaignStatus] ?? String(status);
