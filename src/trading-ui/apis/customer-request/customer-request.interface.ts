import type { OrderTimeFilter } from '../order';
import type { BackInStockRequestStatus, CustomerRequestOrderType, CustomerRequestType, NewsletterRequestStatus, OrderSupportRequestStatus } from './customer-request.enum';

export type CustomerRequestStatus = BackInStockRequestStatus | OrderSupportRequestStatus | NewsletterRequestStatus;

export interface CustomerRequestListItem {
  id: string;
  type: CustomerRequestType;
  contactChannel: 'PHONE' | 'EMAIL';
  contactValue: string;
  requestedAt: string;
  createdAt: string;
  status: CustomerRequestStatus;
  productId?: string;
  productVariantId?: string;
  skuCode?: string;
  productNameSnapshot?: string;
  productImageUrlSnapshot?: string | null;
  variantTextSnapshot?: string | null;
  orderId?: string;
  orderCode?: string;
  orderType?: CustomerRequestOrderType;
}

export interface CustomerRequestListQuery {
  page: number;
  take: number;
  keyword?: string;
  status?: string;
  timeFilter?: OrderTimeFilter;
  timeFrom?: string;
  timeTo?: string;
  orderType?: CustomerRequestOrderType;
}

export interface CustomerRequestListResponse {
  items: CustomerRequestListItem[];
  total: number;
  page: number;
  take: number;
}

export interface UpdateCustomerRequestStatusRequest {
  status: string;
}

export interface BulkUpdateCustomerRequestStatusRequest extends UpdateCustomerRequestStatusRequest {
  ids: string[];
  type: CustomerRequestType;
}
