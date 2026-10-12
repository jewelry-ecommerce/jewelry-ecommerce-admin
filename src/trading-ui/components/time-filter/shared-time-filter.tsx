import { CalendarTodayOutlined, KeyboardArrowDownRounded } from '@mui/icons-material';
import type { Dayjs } from 'dayjs';
import { OrderTimeFilter } from '../../apis/order';
import type { DataTableToolbarAction, DataTableToolbarOption } from '../data-table';
export { OrderTimeCustomRangeDialog, type OrderTimeCustomRangeDialogProps } from './time-custom-range-dialog';

export type SharedTimeRange = { from: Dayjs; to: Dayjs } | null;

export type SharedOrderTimeFilterPayload = {
  orderTimeFilter?: OrderTimeFilter;
  startDate?: string;
  endDate?: string;
};

export const SHARED_TIME_FILTER_MENU_OPTIONS: readonly DataTableToolbarOption[] = [
  { value: OrderTimeFilter.TODAY, label: 'Hôm nay' },
  { value: OrderTimeFilter.YESTERDAY, label: 'Hôm qua' },
  { value: OrderTimeFilter.LAST_7_DAYS, label: '7 ngày qua' },
  { value: OrderTimeFilter.LAST_30_DAYS, label: '30 ngày qua' },
  { value: OrderTimeFilter.THIS_MONTH, label: 'Tháng này' },
  { value: OrderTimeFilter.LAST_MONTH, label: 'Tháng trước' },
  { value: OrderTimeFilter.CUSTOM, label: 'Tùy chỉnh khoảng ngày', dividerBefore: true },
];

export const formatTimeFilterLabel = (selectedTimeOption: OrderTimeFilter | null, customDateRange: SharedTimeRange, defaultLabel = 'Thời gian'): string => {
  if (selectedTimeOption === OrderTimeFilter.CUSTOM && customDateRange) {
    const hasSpecificTime = customDateRange.from.format('HH:mm:ss') !== '00:00:00' || customDateRange.to.format('HH:mm:ss') !== '23:59:59';

    if (hasSpecificTime) {
      return `${customDateRange.from.format('DD/MM/YYYY HH:mm:ss')} - ${customDateRange.to.format('DD/MM/YYYY HH:mm:ss')}`;
    }
    return `${customDateRange.from.format('DD/MM/YYYY')} - ${customDateRange.to.format('DD/MM/YYYY')}`;
  }
  return SHARED_TIME_FILTER_MENU_OPTIONS.find((option) => option.value === selectedTimeOption)?.label ?? defaultLabel;
};

export const buildOrderTimeFilterPayload = (selectedTimeOption: OrderTimeFilter | null, customDateRange: SharedTimeRange): SharedOrderTimeFilterPayload => {
  if (!selectedTimeOption) return {};

  if (selectedTimeOption === OrderTimeFilter.CUSTOM) {
    if (!customDateRange) return { orderTimeFilter: undefined };
    return {
      orderTimeFilter: OrderTimeFilter.CUSTOM,
      startDate: customDateRange.from.toISOString(),
      endDate: customDateRange.to.toISOString(),
    };
  }

  return { orderTimeFilter: selectedTimeOption };
};

export const createSharedTimeFilterToolbarAction = ({
  selectedTimeLabel,
  onSelectCustom,
  onSelectPreset,
}: {
  selectedTimeLabel: string;
  onSelectCustom: () => void;
  onSelectPreset: (value: OrderTimeFilter) => void;
}): DataTableToolbarAction => ({
  key: 'time',
  label: 'Thời gian',
  selectedOptionLabel: selectedTimeLabel,
  icon: <CalendarTodayOutlined sx={{ fontSize: 16 }} />,
  endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
  options: SHARED_TIME_FILTER_MENU_OPTIONS,
  onSelectOption: (value) => {
    if (value === OrderTimeFilter.CUSTOM) {
      onSelectCustom();
      return;
    }
    onSelectPreset(value as OrderTimeFilter);
  },
});
