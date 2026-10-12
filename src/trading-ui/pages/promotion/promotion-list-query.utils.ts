import type { GetCampaignOverviewQueryDto } from '../../apis/promotion/promotion.interface';
import { PromotionCampaignTimeFilter } from '../../apis/promotion/promotion.enum';
import { OrderTimeFilter } from '../../apis/order';
import { buildOrderTimeFilterPayload, type SharedTimeRange } from '../../components/time-filter/shared-time-filter';

const ORDER_TIME_TO_PROMOTION_CAMPAIGN_TIME: Record<OrderTimeFilter, PromotionCampaignTimeFilter> = {
  [OrderTimeFilter.TODAY]: PromotionCampaignTimeFilter.TODAY,
  [OrderTimeFilter.YESTERDAY]: PromotionCampaignTimeFilter.YESTERDAY,
  [OrderTimeFilter.LAST_7_DAYS]: PromotionCampaignTimeFilter.LAST_7_DAYS,
  [OrderTimeFilter.LAST_30_DAYS]: PromotionCampaignTimeFilter.LAST_30_DAYS,
  [OrderTimeFilter.LAST_90_DAYS]: PromotionCampaignTimeFilter.LAST_90_DAYS,
  [OrderTimeFilter.THIS_MONTH]: PromotionCampaignTimeFilter.THIS_MONTH,
  [OrderTimeFilter.LAST_MONTH]: PromotionCampaignTimeFilter.LAST_MONTH,
  [OrderTimeFilter.CUSTOM]: PromotionCampaignTimeFilter.CUSTOM,
};

export const buildPromotionCampaignTimeParams = (
  selectedTimeOption: OrderTimeFilter | null,
  customDateRange: SharedTimeRange,
): Pick<GetCampaignOverviewQueryDto, 'timeFilter' | 'timeFrom' | 'timeTo'> => {
  const payload = buildOrderTimeFilterPayload(selectedTimeOption, customDateRange);
  if (!payload.orderTimeFilter) return {};

  return {
    timeFilter: ORDER_TIME_TO_PROMOTION_CAMPAIGN_TIME[payload.orderTimeFilter],
    timeFrom: payload.startDate,
    timeTo: payload.endDate,
  };
};
