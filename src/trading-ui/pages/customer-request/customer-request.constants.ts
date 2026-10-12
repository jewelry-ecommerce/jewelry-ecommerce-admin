import { BackInStockRequestStatus, CustomerRequestOrderType, NewsletterRequestStatus, OrderSupportRequestStatus, type CustomerRequestListQuery } from '../../apis/customer-request';
import { OrderTimeFilter } from '../../apis/order';
import type { SharedTimeRange } from '../../components/time-filter/shared-time-filter';
import type { CustomerRequestStatusOption } from './customer-request.interface';

export const CUSTOMER_REQUEST_ALL_FILTER_VALUE = 'all';

export const BACK_IN_STOCK_STATUS_OPTIONS: CustomerRequestStatusOption[] = [
  { value: CUSTOMER_REQUEST_ALL_FILTER_VALUE, label: 'Tất cả' },
  { value: BackInStockRequestStatus.NEW, label: 'Mới' },
  { value: BackInStockRequestStatus.UNPROCESSED, label: 'Chưa xử lý' },
  { value: BackInStockRequestStatus.CONTACTED, label: 'Đã liên hệ' },
];

export const ORDER_SUPPORT_STATUS_OPTIONS: CustomerRequestStatusOption[] = [
  { value: CUSTOMER_REQUEST_ALL_FILTER_VALUE, label: 'Tất cả' },
  { value: OrderSupportRequestStatus.NEW, label: 'Mới' },
  { value: OrderSupportRequestStatus.IN_PROGRESS, label: 'Đang xử lý' },
  { value: OrderSupportRequestStatus.COMPLETED, label: 'Hoàn tất' },
];

export const ORDER_SUPPORT_ORDER_TYPE_OPTIONS: CustomerRequestStatusOption[] = [
  { value: CUSTOMER_REQUEST_ALL_FILTER_VALUE, label: 'Tất cả loại đơn' },
  { value: CustomerRequestOrderType.ORDER, label: 'Đơn hàng' },
  { value: CustomerRequestOrderType.PRE_ORDER, label: 'Đơn đặt trước' },
];

export const NEWSLETTER_STATUS_OPTIONS: CustomerRequestStatusOption[] = [
  { value: CUSTOMER_REQUEST_ALL_FILTER_VALUE, label: 'Tất cả' },
  { value: NewsletterRequestStatus.NEW, label: 'Mới' },
  { value: NewsletterRequestStatus.UNPROCESSED, label: 'Chưa xử lý' },
  { value: NewsletterRequestStatus.CONTACTED, label: 'Đã liên hệ' },
];

export const buildCustomerRequestTimeParams = (selectedTimeOption: OrderTimeFilter | null, customDateRange: SharedTimeRange): Pick<CustomerRequestListQuery, 'timeFilter' | 'timeFrom' | 'timeTo'> => {
  if (!selectedTimeOption) return {};
  if (selectedTimeOption === OrderTimeFilter.CUSTOM) {
    if (!customDateRange) return {};
    return {
      timeFilter: OrderTimeFilter.CUSTOM,
      timeFrom: customDateRange.from.startOf('day').toISOString(),
      timeTo: customDateRange.to.endOf('day').toISOString(),
    };
  }
  return { timeFilter: selectedTimeOption };
};
