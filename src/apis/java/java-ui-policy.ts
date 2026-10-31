export const JAVA_ORDER_ACTIONS = {
  Pending: { target: 'CONFIRMED', label: 'Xác nhận đơn hàng' },
  Confirmed: { target: 'SHIPPING', label: 'Gửi lệnh giao hàng' },
  Shipping: { target: 'DELIVERED', label: 'Xác nhận giao thành công' },
} as const;
