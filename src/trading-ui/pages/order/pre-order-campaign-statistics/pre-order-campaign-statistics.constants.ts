import { PreOrderCampaignStatus } from '../../../apis';
import { getPreOrderCampaignStatusLabel, PRE_ORDER_CAMPAIGN_STATUS_LABEL } from '../pre-order-campaign/pre-order-campaign.constants';

export const PRE_ORDER_CAMPAIGN_STATISTICS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Trạng thái hiển thị mặc định trên Thống kê — loại trừ Nháp (AC1). */
export const PRE_ORDER_CAMPAIGN_STATISTICS_DEFAULT_STATUSES: PreOrderCampaignStatus[] = [
  PreOrderCampaignStatus.SCHEDULED,
  PreOrderCampaignStatus.ACTIVE,
  PreOrderCampaignStatus.PAUSED,
  PreOrderCampaignStatus.ENDED,
];

export type PreOrderCampaignStatisticsStatusFilter = 'all' | PreOrderCampaignStatus;

export const PRE_ORDER_CAMPAIGN_STATISTICS_STATUS_FILTER_OPTIONS: Array<{ value: PreOrderCampaignStatisticsStatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: PreOrderCampaignStatus.ACTIVE, label: PRE_ORDER_CAMPAIGN_STATUS_LABEL[PreOrderCampaignStatus.ACTIVE] },
  { value: PreOrderCampaignStatus.SCHEDULED, label: PRE_ORDER_CAMPAIGN_STATUS_LABEL[PreOrderCampaignStatus.SCHEDULED] },
  { value: PreOrderCampaignStatus.PAUSED, label: PRE_ORDER_CAMPAIGN_STATUS_LABEL[PreOrderCampaignStatus.PAUSED] },
  { value: PreOrderCampaignStatus.ENDED, label: PRE_ORDER_CAMPAIGN_STATUS_LABEL[PreOrderCampaignStatus.ENDED] },
];

export const PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS = {
  orderCount: 'Số lượng đơn hàng hợp lệ có chứa sản phẩm của chiến dịch, đã trừ đơn Hủy',
  orderedQuantity: 'Tổng số lượng vật lý khách đặt mua, đã trừ đơn Hủy',
  readyQuantity: 'Lượng sản phẩm nằm trong các Đơn hàng đã gom đủ 100%. Không đại diện cho tồn kho thực tế.',
  progressPercent: 'Tỷ lệ % khối lượng sản phẩm thuộc các đơn đã đủ hàng (sẵn sàng xuất kho)',
  skuOrderCount: 'Số lượng đơn hàng phát sinh chứa SKU này',
} as const;

export const formatStatisticsNumber = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('vi-VN').format(value);
};

export const formatStatisticsPercent = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) return '-';
  return `${Math.round(value)}%`;
};

export const getStatisticsProgressColor = (percent: number | null | undefined): string => {
  if (percent == null) return '#2E90FA';
  return percent >= 100 ? '#12B76A' : '#2E90FA';
};

export { getPreOrderCampaignStatusLabel };
