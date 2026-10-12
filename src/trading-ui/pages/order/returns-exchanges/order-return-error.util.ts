import { isAxiosError } from 'axios';

const ERROR_MESSAGES: Record<string, string> = {
  ORDER_RETURN_REFUND_NOT_SUPPORTED: 'Yêu cầu này chỉ hỗ trợ đổi hàng.',
  ORDER_RETURN_RETURN_ITEMS_REQUIRED: 'Vui lòng chọn sản phẩm trả.',
  ORDER_RETURN_EXCHANGE_ITEMS_REQUIRED: 'Vui lòng chọn sản phẩm đổi.',
  ORDER_RETURN_CUSTOMER_OWNERSHIP_MISMATCH: 'Không có quyền đổi hàng cho đơn này.',
  ORDER_RETURN_SHIPPING_ADDRESS_REQUIRED: 'Vui lòng kiểm tra địa chỉ giao hàng đổi.',
  ORDER_RETURN_SHIPPING_QUOTE_UNAVAILABLE: 'Chưa thể báo phí vận chuyển. Vui lòng thử lại.',
};

export function isReturnQuoteStale(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const code = error.response?.data?.code;
  return code === 'ORDER_RETURN_PRICE_CHANGED' || code === 'ORDER_RETURN_SHIPPING_CHANGED' || code === 'ORDER_RETURN_SHIPPING_QUOTE_EXPIRED';
}

export function getReturnSafeError(error: unknown): string {
  if (isReturnQuoteStale(error)) return 'Giá hoặc phí vận chuyển đã thay đổi. Vui lòng xem báo giá mới trước khi gửi lại.';
  if (!isAxiosError(error)) return 'Không thể xử lý yêu cầu đổi hàng. Vui lòng thử lại.';
  const code = error.response?.data?.code;
  if (typeof code === 'string' && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  const message = error.response?.data?.message;
  return typeof message === 'string' && /[À-ỹ]/.test(message) && !/[\r\n<>]/.test(message) && message.length <= 180 ? message : 'Không thể xử lý yêu cầu đổi hàng. Vui lòng thử lại.';
}
