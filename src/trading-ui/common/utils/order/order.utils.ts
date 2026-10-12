import dayjs from 'dayjs';
import { type Order, type OrderSortField, type SortDirection } from '../../../pages/order/order.types';
import { ORDER_STATUS_LABELS } from '../../constant/order/order.constants';

export const getMaskedPhone = (phone?: string | null) => {
  const compactPhone = phone?.replace(/\s+/g, '') ?? '';

  if (!compactPhone) return '';

  if (compactPhone.length < 7) return compactPhone;

  return `${compactPhone.slice(0, 3)}****${compactPhone.slice(-3)}`;
};

export const getOrderTotalQuantity = (order: Order) => {
  return order.items.reduce((total, item) => total + item.quantity, 0);
};

export const getOrderProductCount = (order: Order) => {
  return order.items.length;
};

const parseAmount = (value: string | number | null | undefined) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const normalizedValue = String(value).replace(/[^\d.-]/g, '');
  const amount = Number(normalizedValue);

  return Number.isFinite(amount) ? amount : 0;
};

export const getOrderFinalAmount = (order: Order) => {
  return Math.max(0, parseAmount(order.subtotal) - parseAmount(order.discountTotal));
};

/** Tổng tiền hiển thị list/export: ưu tiên `grandTotal` từ BE; thiếu thì tạm tính từ subtotal − giảm giá. */
export const getOrderGrandTotalAmount = (order: Order): number => {
  if (order.grandTotal !== null && order.grandTotal !== undefined && String(order.grandTotal).trim() !== '') {
    return Math.max(0, parseAmount(order.grandTotal));
  }
  return getOrderFinalAmount(order);
};

export const getOrderDiscountAmount = (order: Order) => {
  return Math.max(0, parseAmount(order.discountTotal));
};

export const getOrderStatusLabel = (status: Order['status']) => {
  return ORDER_STATUS_LABELS[status];
};

export const getOrderDataIssues = (order: Order) => {
  const issues: string[] = [];

  if (!order.shippingAddress.firstName?.trim() && !order.shippingAddress.lastName?.trim()) {
    issues.push('Thiếu tên khách hàng');
  }

  if (!order.shippingAddress.receiverPhone) {
    issues.push('Thiếu số điện thoại');
  }

  if (!order.shippingAddress.provinceName) {
    issues.push('Thiếu Tỉnh/Thành phố');
  }

  if (!order.shippingAddress.addressLine) {
    issues.push('Thiếu địa chỉ nhận hàng');
  }

  if (!order.items.length) {
    issues.push('Đơn hàng chưa có sản phẩm');
  }

  return issues;
};

export const getPrimaryOrderItem = (order: Order) => order.items[0];

export const getAdditionalItemCount = (order: Order) => Math.max(order.items.length - 1, 0);

export const matchesOrderKeyword = (order: Order, keyword: string) => {
  if (!keyword.trim()) return true;

  const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi-VN');
  const searchableValues = [
    order.orderCode,
    order.trackingCode,
    order.customer.primaryText,
    order.customer.secondaryText,
    order.customer.phone,
    order.customer.maskedPhone,
    order.customer.email,
    order.source,
  ];

  return searchableValues.some((value) => value.toLocaleLowerCase('vi-VN').includes(normalizedKeyword));
};

const getSortableValue = (order: Order, field: OrderSortField): number | string => {
  switch (field) {
    case 'orderCode':
      return order.orderCode;
    case 'createdAt':
      return dayjs(order.createdAt).valueOf();
    case 'source':
      return order.source;
    case 'customer':
      return order.customer.primaryText;
    case 'product':
      return getPrimaryOrderItem(order)?.name ?? '';
    case 'quantity':
      return getOrderProductCount(order);
    case 'brand':
      return order.brand;
    case 'totalAmount':
      return getOrderGrandTotalAmount(order);
    default:
      return '';
  }
};

export const sortOrders = (orders: Order[], field: OrderSortField, direction: SortDirection) => {
  return orders
    .map((order, index) => ({ order, index }))
    .sort((left, right) => {
      const leftValue = getSortableValue(left.order, field);
      const rightValue = getSortableValue(right.order, field);

      let comparison = 0;

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        comparison = leftValue - rightValue;
      } else {
        comparison = String(leftValue).localeCompare(String(rightValue), 'vi', {
          sensitivity: 'base',
          numeric: true,
        });
      }

      if (comparison === 0) {
        comparison = left.index - right.index;
      }

      return direction === 'asc' ? comparison : -comparison;
    })
    .map(({ order }) => order);
};

export const getPaginationTokens = (page: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (page >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
};
