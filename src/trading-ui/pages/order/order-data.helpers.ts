import type { IOrderListSummary } from '../../apis/order';
import { formatDate, formatTime } from '../../common/utils';
import { ORDER_SUPPORTED_STATUS_FILTERS } from '../../common/constant/order/order.constants';
import type { Order, OrderAdvancedFilters, OrderStatusFilter } from './order.types';
import { getOrderGrandTotalAmount, getOrderStatusLabel } from '../../common/utils/order/order.utils';

export const createEmptyStatusCounts = (): Record<OrderStatusFilter, number> => ({
  all: 0,
  express: 0,
  shippingCombined: 0,
  returnCombined: 0,
  Pending: 0,
  Confirmed: 0,
  Picking: 0,
  Packed: 0,
  Shipping: 0,
  InTransit: 0,
  Delivered: 0,
  DeliveryFailed: 0,
  ReturnProcessing: 0,
  Cancelled: 0,
  Returned: 0,
  Refunded: 0,
  Completed: 0,
});

export const mapOrderSummaryToStatusCounts = (summary?: IOrderListSummary): Record<OrderStatusFilter, number> => {
  const nextCounts = createEmptyStatusCounts();

  if (!summary) {
    return nextCounts;
  }

  const rawSummary = summary as Record<string, unknown>;
  const getSummaryCount = (key: string): number => {
    const direct = rawSummary[key];
    if (typeof direct === 'number') return direct;

    const uppercase = rawSummary[key.toUpperCase()];
    if (typeof uppercase === 'number') return uppercase;

    return 0;
  };

  nextCounts.all = summary.ALL ?? 0;
  nextCounts.express = getSummaryCount('Express') || getSummaryCount('EXPRESS');

  ORDER_SUPPORTED_STATUS_FILTERS.forEach((status) => {
    nextCounts[status] = getSummaryCount(status);
  });
  nextCounts.shippingCombined = nextCounts.Shipping ?? 0;
  nextCounts.returnCombined = (nextCounts.Returned ?? 0) + (nextCounts.ReturnProcessing ?? 0);

  return nextCounts;
};

export const normalizeAdvancedFilters = (filters: OrderAdvancedFilters): OrderAdvancedFilters => ({
  ...filters,
  warehouseId: filters.warehouseId.trim(),
  createdById: filters.createdById.trim(),
  skuCode: filters.skuCode.trim(),
  provinceName: filters.provinceName.trim(),
});

export const areAdvancedFiltersEqual = (left: OrderAdvancedFilters, right: OrderAdvancedFilters) => {
  const normalizedLeft = normalizeAdvancedFilters(left);
  const normalizedRight = normalizeAdvancedFilters(right);

  return (
    normalizedLeft.source === normalizedRight.source &&
    normalizedLeft.paymentStatus === normalizedRight.paymentStatus &&
    normalizedLeft.warehouseId === normalizedRight.warehouseId &&
    normalizedLeft.createdById === normalizedRight.createdById &&
    normalizedLeft.skuCode === normalizedRight.skuCode &&
    normalizedLeft.provinceName === normalizedRight.provinceName &&
    (normalizedLeft.dateField || 'createdAt') === (normalizedRight.dateField || 'createdAt')
  );
};

export const countActiveAdvancedFilters = (filters: OrderAdvancedFilters) => {
  const normalizedFilters = normalizeAdvancedFilters(filters);

  const baseCount = [
    normalizedFilters.source,
    normalizedFilters.paymentStatus,
    normalizedFilters.warehouseId,
    normalizedFilters.createdById,
    normalizedFilters.skuCode,
    normalizedFilters.provinceName,
  ].filter(Boolean).length;

  return normalizedFilters.dateField === 'deliveredAt' ? baseCount + 1 : baseCount;
};

export const mapOrdersToExportRows = (sourceOrders: Order[]) => {
  return sourceOrders.map((order) => ({
    'Mã đơn hàng': order.orderCode,
    'Ngày tạo': formatDate(order.createdAt),
    'Giờ tạo': formatTime(order.createdAt),
    'Nguồn đơn': order.source,
    'Tên khách hàng': order.customer.primaryText,
    'Số điện thoại': order.customer.phone,
    'Địa chỉ': order.shippingAddress.addressLine,
    'Sản phẩm': order.items.map((item) => `${item.name || 'Sản phẩm không xác định'} (SKU: ${item.sku}, SL: ${item.quantity})`).join('; '),
    'Tổng tiền': getOrderGrandTotalAmount(order),
    // 'Tình trạng dữ liệu': order.paymentStatus,
    'Tình trạng dữ liệu': 'đang phát triển',
    'Trạng thái đơn': getOrderStatusLabel(order.status),
    'Trạng thái giao vận': order.shippingTrackingUrl,
    'Số sản phẩm': order.items.length,
  }));
};
