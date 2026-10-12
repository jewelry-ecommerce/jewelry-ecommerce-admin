import {
  OrderCancellationReason,
  OrderReturnStatus,
  OrderSortBy,
  OrderStatus as ApiOrderStatus,
  OrderType,
  OrderSource,
  PaymentStatus,
  type IOrder,
  type IOrderItem,
  type IOrderReturnLineItem,
} from '../../../apis/order';
import { SHARED_TIME_FILTER_MENU_OPTIONS } from '../../../components/time-filter/shared-time-filter';
import { OrderReturnType } from '../../../apis/order/order.enum';
import { OrderReturnReason } from '../../../apis/order/order.enum';
import {
  type OrderAdvancedFilters,
  type OrderStatusOption,
  type OrderStatusFilter,
  type OrderSortField,
  type SortDirection,
  type ReturnItem,
  type ExchangeItem,
  type ReturnableOrderLine,
  type ReturnExchangeOrderSummary,
  type ReturnExchangeOption,
  type ReturnExchangeFlowStep,
} from '../../../pages/order/order.types';
import { TYPOGRAPHY_STYLES } from '../typography.constant';
import { type SxProps, type Theme } from '@mui/material';
import { type ReturnExchangeAdvancedFilters, type ReturnExchangeAdvancedFilterStatus } from '../../../pages/order/returns-exchanges/parts/returns-exchanges-advanced-filter-dialog.part';

export const ORDER_STATUS_OPTIONS: OrderStatusOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'express', label: 'Hỏa tốc', highlighted: true },
  { value: ApiOrderStatus.PENDING, label: 'Chờ xác nhận' },
  { value: ApiOrderStatus.CONFIRMED, label: 'Đã xác nhận' },
  { value: ApiOrderStatus.PICKING, label: 'Đang nhặt hàng' },
  { value: ApiOrderStatus.PACKED, label: 'Đã đóng gói' },
  { value: 'shippingCombined', label: 'Đang giao' },
  { value: ApiOrderStatus.DELIVERED, label: 'Giao thành công' },
  { value: ApiOrderStatus.DELIVERY_FAILED, label: 'Giao thất bại' },
  { value: ApiOrderStatus.CANCELLED, label: 'Đã hủy' },
  { value: 'returnCombined', label: 'Trả hàng' },
  { value: ApiOrderStatus.REFUNDED, label: 'Hoàn tiền' },
  { value: ApiOrderStatus.COMPLETED, label: 'Hoàn thành' },
];

/** Tab danh sách đơn → `orderStatus` string gửi BE (`OrderStatus` enum, không gửi key tab gộp). */
export const mapOrderStatusFilterToApiOrderStatus = (filter: OrderStatusFilter): ApiOrderStatus | undefined => {
  switch (filter) {
    case 'all':
    case 'express':
      return undefined;
    case 'shippingCombined':
      return ApiOrderStatus.SHIPPING;
    case 'returnCombined':
      return ApiOrderStatus.RETURNED;
    default:
      return filter;
  }
};

/**
 * Trạng thái đơn được phép **Điều chỉnh đơn** (menu ⋮): chỉ gọi API **thu hồi** (`recall`), không điều hướng sang màn chỉnh sửa đơn.
 */
export const ORDER_ADJUSTMENT_ALLOWED_STATUSES: ReadonlyArray<ApiOrderStatus> = [ApiOrderStatus.CONFIRMED];

/** Snackbar khi không được điều chỉnh đơn (đồng bộ với `ORDER_ADJUSTMENT_ALLOWED_STATUSES`). */
export const ORDER_ADJUSTMENT_BLOCKED_STATUS_MESSAGE = 'Chỉ điều chỉnh được đơn ở trạng thái Đã xác nhận.';

/** Hiển thị nút đồng bộ vận đơn GHN trên danh sách — có mã vận đơn và chưa giao thành công. */
export const canShowOrderGhnSyncButton = (input: { trackingCode?: string | null; status?: ApiOrderStatus | null }): boolean => {
  if (!input.trackingCode?.trim()) return false;
  if (input.status == null) return true;
  return input.status !== ApiOrderStatus.DELIVERED;
};

/**
 * Cho phép mở màn `/order/:id/edit` — chỉ đơn **Chờ xác nhận** (sửa trước khi duyệt).
 */
export const ORDER_EDIT_PAGE_ALLOWED_STATUSES: ReadonlyArray<ApiOrderStatus> = [ApiOrderStatus.PENDING];

/**
 * Popup “có hủy đơn gốc khi sao chép?” chỉ áp dụng cho đơn **Chờ xác nhận**.
 * Đơn đã hủy, đã xác nhận và các trạng thái sau (WMS/3PL) → vào thẳng màn tạo đơn sao chép, không hỏi hủy đơn cũ.
 */
export const shouldPromptCancelOriginalWhenCloningOrder = (status: ApiOrderStatus): boolean => status === ApiOrderStatus.PENDING;

/** Cho phép hiển thị / thực hiện **Hủy đơn** (danh sách, chi tiết, chỉnh sửa khi mở được màn đó). */
export const ORDER_CANCEL_ALLOWED_STATUSES: ReadonlyArray<ApiOrderStatus> = [ApiOrderStatus.PENDING, ApiOrderStatus.CONFIRMED, ApiOrderStatus.PICKING];

/** Snackbar / dialog khi không được hủy (đồng bộ với `ORDER_CANCEL_ALLOWED_STATUSES`). */
export const ORDER_CANCEL_BLOCKED_STATUS_MESSAGE = 'Chỉ hủy được đơn ở trạng thái Chờ xác nhận, Đã xác nhận hoặc Đang nhặt hàng.';

export const isOrderCancellableStatus = (status: ApiOrderStatus): boolean => ORDER_CANCEL_ALLOWED_STATUSES.includes(status);

/** Nhãn hiển thị cho Select lý do hủy đơn (màn chỉnh sửa / dialog hủy) */
export const ORDER_CANCELLATION_REASON_OPTIONS: { value: OrderCancellationReason; label: string }[] = [
  { value: OrderCancellationReason.CHANGE_MIND, label: 'Đổi ý' },
  { value: OrderCancellationReason.WRONG_ORDER_INFO, label: 'Thông tin đơn không đúng' },
  { value: OrderCancellationReason.FOUND_CHEAPER_ELSEWHERE, label: 'Tìm được nơi bán rẻ hơn' },
  { value: OrderCancellationReason.SHIPPING_TOO_LONG, label: 'Giao hàng quá lâu' },
  { value: OrderCancellationReason.DUPLICATE_ORDER, label: 'Đặt trùng đơn' },
  { value: OrderCancellationReason.PAYMENT_ISSUE, label: 'Vấn đề thanh toán' },
  { value: OrderCancellationReason.OTHER, label: 'Khác' },
];

export const ORDER_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const ORDER_DEFAULT_SORT: { field: OrderSortField; direction: SortDirection } = {
  field: 'createdAt',
  direction: 'desc',
};

export const ORDER_TIME_MENU_OPTIONS = SHARED_TIME_FILTER_MENU_OPTIONS;

export const ORDER_FILTER_MENU_OPTIONS = [
  { value: 'website', label: 'Đơn Website' },
  { value: 'cod', label: 'Đơn COD' },
  { value: 'priority-confirmation', label: 'Ưu tiên gọi xác nhận' },
  { value: 'vip-customer', label: 'Khách VIP' },
] as const;

export const ORDER_SOURCE_FILTER_OPTIONS = [
  { value: OrderSource.SHOPEE, label: 'Shopee' },
  { value: OrderSource.TIKTOK, label: 'Tiktok Shop' },
  { value: OrderSource.FACEBOOK, label: 'Facebook' },
  // { value: OrderSource.INSTAGRAM, label: 'Instagram' },
  { value: OrderSource.WEBSITE, label: 'Website' },
  // { value: OrderSource.APP, label: 'Ứng dụng' },
  { value: OrderSource.STORE_POS, label: 'Store POS (Cửa hàng)' },
  // { value: OrderSource.STORE_SHIP_FROM_STORE, label: 'Store Ship from Store' },
  { value: OrderSource.MANUAL, label: 'Manual (Tạo thủ công)' },
  // { value: OrderSource.AFFILIATE, label: 'Affiliate (Tiếp thị liên kết)' },
  // { value: OrderSource.LIVE_STREAM, label: 'Livestream' },
] as const;

export const ORDER_PAYMENT_STATUS_FILTER_OPTIONS = [
  { value: PaymentStatus.UNPAID, label: 'Chưa thanh toán' },
  { value: PaymentStatus.PAID, label: 'Đã thanh toán' },
  { value: PaymentStatus.PARTIAL_PAID_COD, label: 'Thanh toán 1 phần' },
  { value: PaymentStatus.FAILED, label: 'Thanh toán thất bại' },
  { value: PaymentStatus.REFUNDED, label: 'Đã hoàn tiền' },
] as const;

export const ORDER_INITIAL_ADVANCED_FILTERS: OrderAdvancedFilters = {
  source: '',
  paymentStatus: '',
  warehouseId: '',
  createdById: '',
  skuCode: '',
  provinceName: '',
  dateField: 'createdAt',
};

export const ORDER_SUPPORTED_STATUS_FILTERS = [
  ApiOrderStatus.PENDING,
  ApiOrderStatus.CONFIRMED,
  ApiOrderStatus.PICKING,
  ApiOrderStatus.PACKED,
  ApiOrderStatus.SHIPPING,
  ApiOrderStatus.IN_TRANSIT,
  ApiOrderStatus.DELIVERED,
  ApiOrderStatus.DELIVERY_FAILED,
  ApiOrderStatus.RETURN_PROCESSING,
  ApiOrderStatus.CANCELLED,
  ApiOrderStatus.RETURNED,
  ApiOrderStatus.REFUNDED,
  ApiOrderStatus.COMPLETED,
] as const;

export const ORDER_API_SORT_FIELD_MAP: Partial<Record<OrderSortField, OrderSortBy>> = {
  createdAt: OrderSortBy.CREATED_AT,
  orderCode: OrderSortBy.ORDER_CODE,
  totalAmount: OrderSortBy.TOTAL_AMOUNT,
};

export const ORDER_API_SORT_DIRECTION_MAP: Record<SortDirection, OrderType> = {
  asc: OrderType.ASC,
  desc: OrderType.DESC,
};

export const ORDER_STATUS_LABELS = ORDER_STATUS_OPTIONS.reduce<Record<OrderStatusFilter, string>>(
  (accumulator, option) => {
    accumulator[option.value] = option.label;
    return accumulator;
  },
  {
    all: 'Tất cả',
    express: 'Hỏa tốc',
    shippingCombined: 'Đang giao',
    returnCombined: 'Trả hàng',
    [ApiOrderStatus.PENDING]: 'Chờ xác nhận',
    [ApiOrderStatus.CONFIRMED]: 'Đã xác nhận',
    [ApiOrderStatus.PICKING]: 'Đang nhặt hàng',
    [ApiOrderStatus.PACKED]: 'Đã đóng gói',
    [ApiOrderStatus.SHIPPING]: 'Đang giao',
    [ApiOrderStatus.IN_TRANSIT]: 'Đang giao',
    [ApiOrderStatus.DELIVERED]: 'Giao thành công',
    [ApiOrderStatus.DELIVERY_FAILED]: 'Giao thất bại',
    [ApiOrderStatus.RETURN_PROCESSING]: 'Trả hàng',
    [ApiOrderStatus.CANCELLED]: 'Đã hủy',
    [ApiOrderStatus.RETURNED]: 'Trả hàng',
    [ApiOrderStatus.REFUNDED]: 'Hoàn tiền',
    [ApiOrderStatus.COMPLETED]: 'Hoàn thành',
  } as Record<OrderStatusFilter, string>,
);

// returns & exchanges

export const RETURN_EXCHANGE_CONFIG = { allowCrossProductExchange: true } as const;

/** Số SP mỗi trang khi chọn sản phẩm đổi (catalog API). */
export const EXCHANGE_CATALOG_PAGE_SIZE = 20;

export const RETURN_REASON_LABELS: Record<OrderReturnReason, string> = {
  [OrderReturnReason.WRONG_ORDER_DELIVERED]: 'Giao nhầm đơn',
  [OrderReturnReason.EMPTY_BOX_DELIVERED]: 'Giao thùng rỗng',
  [OrderReturnReason.MISSING_ITEMS_DELIVERED]: 'Giao thiếu hàng',
  [OrderReturnReason.WRONG_PRODUCT_DELIVERED]: 'Giao sai sản phẩm',
  [OrderReturnReason.DEFECTIVE_PRODUCT]: 'Hàng bị lỗi (rớt đá, móp...)',
  [OrderReturnReason.PRODUCT_NOT_AS_DESCRIBED]: 'Hàng khác với mô tả',
  [OrderReturnReason.CHANGED_MIND]: 'Đổi ý',
};

export const RETURN_TYPE_LABELS: Record<OrderReturnType, string> = {
  [OrderReturnType.COMPENSATION]: 'Bồi thường',
  [OrderReturnType.EXCHANGE]: 'Đổi hàng',
  [OrderReturnType.REFUND]: 'Hoàn tiền',
};

export const RETURN_REASON_OPTIONS: ReturnExchangeOption[] = [
  OrderReturnReason.DEFECTIVE_PRODUCT,
  OrderReturnReason.WRONG_ORDER_DELIVERED,
  OrderReturnReason.EMPTY_BOX_DELIVERED,
  OrderReturnReason.MISSING_ITEMS_DELIVERED,
  OrderReturnReason.WRONG_PRODUCT_DELIVERED,
  OrderReturnReason.PRODUCT_NOT_AS_DESCRIBED,
  OrderReturnReason.CHANGED_MIND,
].map((value) => ({
  value,
  label: RETURN_REASON_LABELS[value],
}));

export const REQUEST_TYPE_OPTIONS: ReturnExchangeOption[] = [OrderReturnType.EXCHANGE, OrderReturnType.REFUND].map((value) => ({
  value,
  label: RETURN_TYPE_LABELS[value],
}));

/** Khi đã chọn sản phẩm đổi (step 2) thì không cho chọn loại yêu cầu Hoàn tiền. */
export const getRequestTypeOptions = (hasExchangeItems: boolean): ReturnExchangeOption[] =>
  hasExchangeItems ? REQUEST_TYPE_OPTIONS.filter((option) => option.value !== OrderReturnType.REFUND) : REQUEST_TYPE_OPTIONS;

export const RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS = {
  lastName: '',
  firstName: '',
  receiverPhone: '',
  wardCode: 0,
  wardName: '',
  addressLine: '',
  provinceCode: 0,
  provinceName: '',
};

export const mapOrderToReturnExchangeShippingAddress = (order: IOrder) => {
  const snapshot = order.shippingAddressSnapshot;
  if (!snapshot) return RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS;
  return {
    lastName: snapshot.lastName || RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.lastName,
    firstName: snapshot.firstName || RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.firstName,
    receiverPhone: snapshot.receiverPhone || RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.receiverPhone,
    wardCode: snapshot.wardCode || RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.wardCode,
    wardName: snapshot.wardName || RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.wardName,
    addressLine: snapshot.addressLine || RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.addressLine,
    provinceCode: snapshot.provinceCode || RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.provinceCode,
    provinceName: snapshot.provinceName || RETURN_EXCHANGE_DEFAULT_SHIPPING_ADDRESS.provinceName,
  };
};

export const clampQty = (value: number): number => Math.max(0, Math.floor(value));

export const parseAmount = (value?: number | string): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const normalized = Number(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(normalized) ? normalized : 0;
};

/**
 * Đơn giá từng dòng đơn (giá khách đã mua) — ưu tiên `customerDisplayPrice.sellingPriceAfterTaxMinor`,
 * rồi `salePrice`/`unitPrice`. Không dùng `finalAmount`/`lineTotal` làm đơn giá trừ khi thiếu cả hai.
 */
export const getOrderLineUnitPrice = (item: IOrderItem): number => {
  const displaySelling = item.customerDisplayPrice?.sellingPriceAfterTaxMinor;
  if (displaySelling != null && Number.isFinite(displaySelling)) {
    return Math.max(0, displaySelling);
  }

  const unit = parseAmount(item.salePrice ?? item.unitPrice);
  if (unit > 0) return unit;

  const lineTotal = parseAmount(item.finalAmount ?? item.lineTotal);
  const qty = Math.max(item.quantity, 1);
  if (lineTotal > 0) return lineTotal / qty;

  return 0;
};

/** Đơn giá dòng đổi/trả — ưu tiên giá khách đã mua (`customerDisplayPrice.sellingPriceAfterTaxMinor`). */
export const getReturnLineUnitPrice = (line: Pick<IOrderReturnLineItem, 'customerDisplayPrice' | 'salePrice' | 'unitPrice'>): number => {
  const displaySelling = line.customerDisplayPrice?.sellingPriceAfterTaxMinor;
  if (displaySelling != null && Number.isFinite(displaySelling)) {
    return Math.max(0, displaySelling);
  }
  return Math.max(0, parseAmount(line.salePrice ?? line.unitPrice));
};

export const mapOrderToReturnExchangeSummary = (order: IOrder): ReturnExchangeOrderSummary => {
  const customerName = [order.shippingAddressSnapshot?.lastName, order.shippingAddressSnapshot?.firstName].filter(Boolean).join(' ').trim();

  return {
    orderCode: order.orderCode,
    customerName: customerName || order.shippingAddressSnapshot?.receiverPhone || 'Khách hàng',
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    lines: order.items.map((item) => ({
      lineId: item.id,
      productId: item.productId || item.variationId,
      productName: item.productName?.trim() || item.variationName || 'Sản phẩm',
      sku: item.skuCode,
      variantId: item.variationId,
      imageUrl: item.image || '',
      quantityPurchased: item.quantity,
      priceSnapshot: getOrderLineUnitPrice(item),
    })),
  };
};

export const deriveReturnItems = (lines: ReturnableOrderLine[], selectedQuantities: Record<string, number>): ReturnItem[] => {
  return lines
    .filter((line) => (selectedQuantities[line.lineId] ?? 0) > 0)
    .map((line) => ({
      lineId: line.lineId,
      productId: line.productId,
      variantId: line.variantId,
      sku: line.sku,
      quantity: selectedQuantities[line.lineId] ?? 0,
      priceSnapshot: line.priceSnapshot,
      productName: line.productName,
      imageUrl: line.imageUrl,
    }));
};

export const deriveExchangeCatalog = (lines: ReturnableOrderLine[], returnItems: ReturnItem[]): ReturnableOrderLine[] => {
  if (RETURN_EXCHANGE_CONFIG.allowCrossProductExchange) return lines;
  const returnedProductIds = new Set(returnItems.map((item) => item.productId));
  return lines.filter((line) => returnedProductIds.has(line.productId));
};

export const validateReturnItems = (returnItems: ReturnItem[], lines: ReturnableOrderLine[]): string[] => {
  if (returnItems.length === 0) return ['Vui lòng chọn ít nhất một sản phẩm trả.'];

  const purchasedByLineId = new Map(lines.map((line) => [line.lineId, line.quantityPurchased]));
  return returnItems.flatMap((item) => {
    const max = purchasedByLineId.get(item.lineId) ?? 0;
    if (item.quantity <= 0) return [`Số lượng trả cho ${item.sku} phải lớn hơn 0.`];
    if (item.quantity > max) return [`Số lượng trả cho ${item.sku} không được vượt quá số lượng mua (${max}).`];
    return [];
  });
};

export const validateExchangeItems = (exchangeItems: ExchangeItem[], returnItems: ReturnItem[]): string[] => {
  // Cho phép danh sách sản phẩm đổi rỗng để hỗ trợ use case Hoàn tiền (REFUND)
  // — khách hàng có thể chỉ trả hàng mà không cần chọn sản phẩm đổi.
  if (exchangeItems.length === 0) return [];
  const returnedProductIds = new Set(returnItems.map((item) => item.productId));
  const lineErrors = exchangeItems.flatMap((item) => {
    const errors: string[] = [];
    if (item.quantity <= 0) {
      errors.push(`Số lượng đổi cho ${item.sku} phải lớn hơn 0.`);
    }
    if (!RETURN_EXCHANGE_CONFIG.allowCrossProductExchange && !returnedProductIds.has(item.productId)) {
      errors.push(`Đổi sản phẩm khác không được phép. ${item.sku} không phải là sản phẩm trả.`);
    }
    return errors;
  });

  return lineErrors;
};

export const calculatePriceDiff = (returnItems: ReturnItem[], exchangeItems: ExchangeItem[]): number => {
  const returnTotal = returnItems.reduce((sum, item) => sum + item.quantity * item.priceSnapshot, 0);
  const exchangeTotal = exchangeItems.reduce((sum, item) => sum + item.quantity * item.priceSnapshot, 0);
  return exchangeTotal - returnTotal;
};

export const SELLER_PAYS_RETURN_SHIPPING_REASONS = new Set<string>([
  OrderReturnReason.WRONG_ORDER_DELIVERED,
  OrderReturnReason.EMPTY_BOX_DELIVERED,
  OrderReturnReason.MISSING_ITEMS_DELIVERED,
  OrderReturnReason.WRONG_PRODUCT_DELIVERED,
  OrderReturnReason.DEFECTIVE_PRODUCT,
  OrderReturnReason.PRODUCT_NOT_AS_DESCRIBED,
]);

export const isSellerPaysReturnShipping = (returnReason: string): boolean => SELLER_PAYS_RETURN_SHIPPING_REASONS.has(returnReason);

/** COD thu khi shipper thu hồi — chỉ phí vận chuyển; chênh lệch SP thu khi giao đơn mới. */
export const calculateReturnPickupCodTotal = ({ returnShippingFee, returnReason }: { returnShippingFee: number; returnReason: string }): number => {
  if (isSellerPaysReturnShipping(returnReason)) return 0;
  return Math.max(0, returnShippingFee);
};
//end

export const STATUS_LABELS: Record<string, string> = {
  [OrderReturnStatus.PENDING]: 'Chờ xác nhận',
  [OrderReturnStatus.APPROVED]: 'Đã xác nhận',
  [OrderReturnStatus.AWAITING_PICKUP]: 'Chờ thu hồi',
  [OrderReturnStatus.COLLECTION_FAILED]: 'Thu hồi thất bại',
  [OrderReturnStatus.COLLECTED]: 'Đã thu hồi',
  [OrderReturnStatus.INSPECTION]: 'Đang kiểm định',
  [OrderReturnStatus.REJECTED]: 'Từ chối',
  [OrderReturnStatus.CANCELLED]: 'Đã huỷ',
  [OrderReturnStatus.STORED]: 'Đã nhập kho',
  [OrderReturnStatus.AWAITING_EXCHANGE]: 'Chờ hàng đổi',
  [OrderReturnStatus.EXCHANGE_RELEASED]: 'Giải phóng đơn mới',
  [OrderReturnStatus.REFUNDED]: 'Hoàn tiền',
};

/** Mở / chỉnh sửa yêu cầu đổi trả (danh sách + màn chỉnh sửa). */
export const RETURN_EXCHANGE_EDIT_PAGE_ALLOWED_STATUSES: ReadonlySet<OrderReturnStatus> = new Set([OrderReturnStatus.PENDING, OrderReturnStatus.AWAITING_EXCHANGE]);

/** Xác nhận / Hủy yêu cầu trên danh sách — chỉ khi chờ xác nhận. */
export const RETURN_EXCHANGE_LIST_PENDING_ACTION_STATUSES: ReadonlySet<OrderReturnStatus> = new Set([OrderReturnStatus.PENDING]);

export const isReturnExchangeEditableOnList = (status: string | OrderReturnStatus | undefined): boolean =>
  status != null && RETURN_EXCHANGE_EDIT_PAGE_ALLOWED_STATUSES.has(status as OrderReturnStatus);

export const canReturnExchangeConfirmOrCancelOnList = (status: string | OrderReturnStatus | undefined): boolean =>
  status != null && RETURN_EXCHANGE_LIST_PENDING_ACTION_STATUSES.has(status as OrderReturnStatus);

export const sxRoot: SxProps<Theme> = { width: '100%', px: 3, py: 2.25, flexShrink: 0 };

export const sxStepCircle = (isDone: boolean, isActive: boolean): SxProps<Theme> => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  bgcolor: isDone ? '#00A63E' : isActive ? '#0F172A' : '#EAECF0',
  color: isDone || isActive ? '#FFFFFF' : '#667085',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...TYPOGRAPHY_STYLES.base.regular,
});

export const sxConnector = (completed: boolean): SxProps<Theme> => ({
  width: 64,
  borderTop: completed ? '2px solid #00A63E' : '2px solid #E4E7EC',
  ml: 0.5,
});

export const STEP_LABEL_BY_ID: Record<ReturnExchangeFlowStep, string> = {
  1: 'Chọn sản phẩm trả',
  2: 'Chọn sản phẩm đổi',
  3: 'Phân loại lý do và xác nhận',
};

export const fieldLabelSx = { mb: 0.75, fontSize: 14, fontWeight: 600, color: '#111827' };
export const fieldSx = {
  '& .MuiOutlinedInput-root': { height: 44, borderRadius: 2, backgroundColor: '#FFFFFF' },
  '& .MuiOutlinedInput-input': { fontSize: 14 },
};

export const STATUS_OPTIONS: Array<{ value: ReturnExchangeAdvancedFilterStatus; label: string }> = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: OrderReturnStatus.PENDING, label: 'Chờ xác nhận' },
  { value: OrderReturnStatus.AWAITING_PICKUP, label: 'Chờ thu hồi' },
  { value: OrderReturnStatus.COLLECTION_FAILED, label: 'Thu hồi thất bại' },
  { value: OrderReturnStatus.COLLECTED, label: 'Đã thu hồi' },
  { value: OrderReturnStatus.INSPECTION, label: 'Đang kiểm định' },
  { value: OrderReturnStatus.REJECTED, label: 'Từ chối' },
  { value: OrderReturnStatus.STORED, label: 'Đã nhập kho' },
  { value: OrderReturnStatus.AWAITING_EXCHANGE, label: 'Chờ hàng đổi' },
  { value: OrderReturnStatus.EXCHANGE_RELEASED, label: 'Giải phóng đơn mới' },
];

export const TYPE_OPTIONS: Array<{ value: OrderReturnType | ''; label: string }> = [
  { value: '', label: 'Tất cả loại yêu cầu' },
  { value: OrderReturnType.EXCHANGE, label: 'Đổi trả' },
  { value: OrderReturnType.REFUND, label: 'Hoàn tiền' },
];

export const REASON_OPTIONS: Array<{ value: OrderReturnReason | ''; label: string }> = [
  { value: '', label: 'Tất cả lý do' },
  { value: OrderReturnReason.DEFECTIVE_PRODUCT, label: 'Hàng bị lỗi (rớt đá, móp...)' },
  { value: OrderReturnReason.WRONG_ORDER_DELIVERED, label: 'Giao nhầm đơn' },
  { value: OrderReturnReason.EMPTY_BOX_DELIVERED, label: 'Giao thùng rỗng' },
  { value: OrderReturnReason.MISSING_ITEMS_DELIVERED, label: 'Giao thiếu hàng' },
  { value: OrderReturnReason.WRONG_PRODUCT_DELIVERED, label: 'Giao sai sản phẩm' },
  { value: OrderReturnReason.CHANGED_MIND, label: 'Đổi ý' },
];

export const RETURN_EXCHANGE_INITIAL_ADVANCED_FILTERS: ReturnExchangeAdvancedFilters = {
  orderCode: '',
  type: '',
  orderId: '',
  reason: '',
  status: '',
};
