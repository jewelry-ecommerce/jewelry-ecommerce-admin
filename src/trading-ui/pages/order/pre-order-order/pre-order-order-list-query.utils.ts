import dayjs from 'dayjs';
import { OrderTimeFilter } from '../../../apis/order';
import type { SharedTimeRange } from '../../../components/time-filter/shared-time-filter';

/** Map UI time filter → `createdFrom` / `createdTo` for `pre-orders/admin/filter`. */
export const buildPreOrderOrderCreatedRange = (selectedTimeOption: OrderTimeFilter | null, customDateRange: SharedTimeRange): { createdFrom?: string; createdTo?: string } => {
  if (!selectedTimeOption) return {};

  if (selectedTimeOption === OrderTimeFilter.CUSTOM) {
    if (!customDateRange) return {};
    return {
      createdFrom: customDateRange.from.startOf('day').toISOString(),
      createdTo: customDateRange.to.endOf('day').toISOString(),
    };
  }

  const now = dayjs();
  switch (selectedTimeOption) {
    case OrderTimeFilter.TODAY:
      return { createdFrom: now.startOf('day').toISOString(), createdTo: now.endOf('day').toISOString() };
    case OrderTimeFilter.YESTERDAY: {
      const day = now.subtract(1, 'day');
      return { createdFrom: day.startOf('day').toISOString(), createdTo: day.endOf('day').toISOString() };
    }
    case OrderTimeFilter.LAST_7_DAYS:
      return { createdFrom: now.subtract(6, 'day').startOf('day').toISOString(), createdTo: now.endOf('day').toISOString() };
    case OrderTimeFilter.LAST_30_DAYS:
      return { createdFrom: now.subtract(29, 'day').startOf('day').toISOString(), createdTo: now.endOf('day').toISOString() };
    case OrderTimeFilter.LAST_90_DAYS:
      return { createdFrom: now.subtract(89, 'day').startOf('day').toISOString(), createdTo: now.endOf('day').toISOString() };
    case OrderTimeFilter.THIS_MONTH:
      return { createdFrom: now.startOf('month').toISOString(), createdTo: now.endOf('month').toISOString() };
    case OrderTimeFilter.LAST_MONTH: {
      const month = now.subtract(1, 'month');
      return { createdFrom: month.startOf('month').toISOString(), createdTo: month.endOf('month').toISOString() };
    }
    default:
      return {};
  }
};
