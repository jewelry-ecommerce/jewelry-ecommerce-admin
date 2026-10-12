export const ADMIN_ORDER_CONTEXT_VERSION = 2 as const;

export const ADMIN_ORDER_V2_ERROR_CODE = {
  PRICE_CHANGED: 'CHECKOUT_PRICE_CHANGED',
  IDEMPOTENCY_CONFLICT: 'ADMIN_ORDER_IDEMPOTENCY_CONFLICT',
  PERSISTED_RESPONSE_UNAVAILABLE: 'ADMIN_ORDER_PERSISTED_RESPONSE_UNAVAILABLE',
  FINALIZATION_RETRY_UNAVAILABLE: 'ADMIN_ORDER_FINALIZATION_RETRY_UNAVAILABLE',
} as const;

export const ADMIN_ORDER_TRANSPORT_ERROR_CODES = ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'] as const;
export const ADMIN_ORDER_SERVER_ERROR_STATUS = 500;

export const ADMIN_ORDER_V2_MESSAGE = {
  PRICING_PENDING: 'Đang cập nhật tổng đơn hàng',
  QUOTE_REQUIRED: 'Vui lòng chờ cập nhật tổng đơn hàng trước khi tạo đơn.',
  INVALID_QUOTE: 'Không thể đọc báo giá. Vui lòng thử lại.',
  PRICE_CHANGED: 'Giá hoặc ưu đãi đã thay đổi. Vui lòng kiểm tra báo giá mới và xác nhận lại.',
  UNCERTAIN_RESULT: 'Kết quả tạo đơn chưa xác định. Lần thử tiếp theo sẽ gửi lại đúng yêu cầu cũ.',
} as const;
