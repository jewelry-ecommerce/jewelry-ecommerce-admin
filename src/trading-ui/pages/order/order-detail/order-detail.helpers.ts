import { OrderErrorType, OrderSource, OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod } from '../../../apis/order';
import { OrderKind } from '../../../apis/order/order.enum';
import { isJavaBackend } from '@/common/config/app.config';
import type { CustomerDisplayPrice, IOrder, IOrderItem, IOrderSetLine, IPromotion, OrderErrorLog } from '../../../apis/order/order.interface';
import { isOrderCancellableStatus, ORDER_CANCEL_ALLOWED_STATUSES } from '../../../common/constant/order/order.constants';
import { resolveOrderCustomerFullName } from '../../../common/utils/order/create-order.utils';
import { formatCurrency } from '../../../common/utils/number.utils';

export const ORDER_DETAIL_COLORS = {
  error: '#FF4D4F',
  warning: '#FAAD14',
  success: '#52C41A',
} as const;

const parseAmount = (value: string | number | null | undefined): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value == null || value === '') return 0;
  const n = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export const parseOrderAmount = parseAmount;

const readTrimmedMetaString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** Đơn giao đổi được giải phóng từ phiếu đổi trả (marker nằm trong `metadata`). */
export const isExchangeReleasedOrder = (order: Pick<IOrder, 'metadata'>): boolean => {
  const meta = order.metadata;
  if (!meta) return false;
  const fromReturnId = readTrimmedMetaString(meta.exchangeFromOrderReturnId);
  const ghnClientCode = readTrimmedMetaString(meta.exchangeGhnClientOrderCode);
  return Boolean(fromReturnId || ghnClientCode);
};

export type ExchangeReleasedPaymentBreakdown = {
  originalOrderDeduction: number;
  additionalCod: number;
  otherRevenue: number;
};

/** Phân bổ thanh toán đơn giao đổi: khấu trừ đơn gốc / COD thu thêm / doanh thu khác. */
export const resolveExchangeReleasedPaymentBreakdown = (order: Pick<IOrder, 'amountReceived' | 'codAmount' | 'otherRevenueNoRefund'>): ExchangeReleasedPaymentBreakdown => ({
  originalOrderDeduction: parseOrderAmount(order.amountReceived),
  additionalCod: parseOrderAmount(order.codAmount),
  otherRevenue: parseOrderAmount(order.otherRevenueNoRefund),
});

const getCustomerDisplayPriceMergeKey = (value: CustomerDisplayPrice | null | undefined): string => {
  if (!value) return 'NO_DISPLAY_PRICE';
  return [value.currency, value.compareAtPriceAfterTaxMinor ?? 'null', value.sellingPriceAfterTaxMinor, value.discountPercent ?? 'null', value.hasDiscount ? '1' : '0'].join('|');
};

type OrderAddressParts = {
  addressLine?: string;
  wardName?: string;
  provinceName?: string;
  warehouseName?: string;
};

const formatOrderAddressParts = (address?: OrderAddressParts | null): string => {
  if (!address) return '—';
  const parts = [address.addressLine, address.wardName, address.provinceName].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

/**
 * Thông tin liên hệ khách trên chi tiết đơn. Đơn POS nhận tại cửa hàng không có `shippingAddressSnapshot`
 * nên lấy từ các cột trên đơn. Khách lẻ POS (không có `customerId`) được lưu `receiverPhone` = SĐT cửa hàng,
 * không phải của khách, nên không hiển thị.
 */
export const getOrderCustomerContact = (order: IOrder) => {
  const snapshot = order.shippingAddressSnapshot;
  const isPosWalkIn = order.source === OrderSource.STORE_POS && !order.customerId;
  return {
    fullName: resolveOrderCustomerFullName(snapshot ?? order),
    phone: snapshot?.receiverPhone?.trim() || (isPosWalkIn ? '' : order.receiverPhone?.trim() || ''),
    email: order.contactEmail?.trim() || snapshot?.email?.trim() || '',
  };
};

/** Địa chỉ kho giao/nhận — gồm tên kho (nếu có) + địa chỉ. */
export const getOrderPickupAddressDisplay = (pickup?: OrderAddressParts | null): string => {
  if (!pickup) return '—';
  const address = formatOrderAddressParts(pickup);
  const warehouseName = pickup.warehouseName?.trim();
  if (warehouseName && address !== '—') return `${warehouseName} — ${address}`;
  if (warehouseName) return warehouseName;
  return address;
};

export const getOrderStatusBadgeColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return '#EAB308';
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      return '#94A3B8';
    case OrderStatus.DELIVERED:
    case OrderStatus.COMPLETED:
      return ORDER_DETAIL_COLORS.success;
    default:
      return '#2563EB';
  }
};

export const getPaymentStatusBadgeColor = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PAID:
      return ORDER_DETAIL_COLORS.success;
    case PaymentStatus.PARTIAL:
    case PaymentStatus.PARTIAL_PAID_COD:
      return ORDER_DETAIL_COLORS.warning;
    case PaymentStatus.FAILED:
    case PaymentStatus.REFUNDED:
      return ORDER_DETAIL_COLORS.error;
    default:
      return '#64748B';
  }
};

const PAYMENT_STATUS_FROM_GATEWAY_KEY: Record<string, PaymentStatus> = {
  PAID: PaymentStatus.PAID,
  UNPAID: PaymentStatus.UNPAID,
  FAILED: PaymentStatus.FAILED,
  PARTIAL: PaymentStatus.PARTIAL,
  PARTIALPAIDCOD: PaymentStatus.PARTIAL_PAID_COD,
  PARTIAL_PAID_COD: PaymentStatus.PARTIAL_PAID_COD,
  REFUNDED: PaymentStatus.REFUNDED,
};

/** Chuẩn hóa response `check-paid` (BE: `paid`, `status: "PAID"`) → `PaymentStatus` FE. */
export const resolvePaymentStatusFromCheckPaidPayload = (payload: { paymentStatus?: PaymentStatus | string; paid?: boolean; status?: string }): PaymentStatus | undefined => {
  const direct = payload.paymentStatus;
  if (typeof direct === 'string') {
    const normalized = direct.trim();
    if (Object.values(PaymentStatus).includes(normalized as PaymentStatus)) {
      return normalized as PaymentStatus;
    }
  }

  if (payload.paid === true) return PaymentStatus.PAID;
  if (payload.paid === false) return PaymentStatus.UNPAID;

  const gatewayKey = String(payload.status ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, '_');
  if (gatewayKey && PAYMENT_STATUS_FROM_GATEWAY_KEY[gatewayKey]) {
    return PAYMENT_STATUS_FROM_GATEWAY_KEY[gatewayKey];
  }

  return undefined;
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'Đã thanh toán';
    case PaymentStatus.UNPAID:
      return 'Chưa thanh toán';
    case PaymentStatus.PARTIAL_PAID_COD:
      return 'Thanh toán 1 phần';
    case PaymentStatus.PARTIAL:
      return 'Thanh toán một phần — COD';
    case PaymentStatus.FAILED:
      return 'Thanh toán thất bại';
    case PaymentStatus.REFUNDED:
      return 'Đã hoàn tiền';
    default:
      return status;
  }
};

/** Nhãn trạng thái vận chuyển (hiển thị cho CS). */
export const getFulfillmentShippingLabel = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
    case OrderStatus.CONFIRMED:
    case OrderStatus.PICKING:
    case OrderStatus.PACKED:
      return 'Chờ lấy hàng';
    case OrderStatus.SHIPPING:
    case OrderStatus.IN_TRANSIT:
    case OrderStatus.DELIVERY_FAILED:
      return 'Đang giao';
    case OrderStatus.DELIVERED:
    case OrderStatus.COMPLETED:
      return 'Đã giao';
    case OrderStatus.RETURN_PROCESSING:
    case OrderStatus.RETURNED:
      return 'Trả hàng';
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      return '—';
    default:
      return 'Chưa xác định';
  }
};

export const getOrderSourceLabel = (source: OrderSource): string => {
  const map: Partial<Record<OrderSource, string>> = {
    // [OrderSource.ADMIN]: 'Admin',
    [OrderSource.WEBSITE]: 'Website',
    // [OrderSource.APP]: 'Ứng dụng',
    [OrderSource.TIKTOK]: 'TikTok Shop',
    [OrderSource.SHOPEE]: 'Shopee',
    [OrderSource.STORE_POS]: 'POS',
  };
  return map[source] ?? source;
};

/** Nhân viên POS (thu ngân / tư vấn): `Mã - Tên` (giống màn ca bán) — thiếu phần nào thì bỏ phần đó. */
export const formatPosStaffLabel = (name?: string | null, code?: string | null): string => {
  const n = name?.trim() ?? '';
  const c = code?.trim() ?? '';
  if (n && c && n.toUpperCase() !== c.toUpperCase()) return `${c} - ${n}`;
  return n || c || '—';
};

/** Danh sách nhân viên tư vấn của đơn POS, mỗi người `Mã - Tên`, cách nhau dấu phẩy. */
export const formatPosSellersLabel = (sellers?: Array<{ name?: string | null; code?: string | null }> | null): string => {
  const labels = (sellers ?? []).map((seller) => formatPosStaffLabel(seller.name, seller.code)).filter((label) => label !== '—');
  return labels.length > 0 ? labels.join(', ') : '—';
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [PaymentMethod.COD]: 'Thanh toán khi nhận hàng (COD)',
  [PaymentMethod.QR_CODE]: 'QR Code (Ngân hàng / Ví)',
  [PaymentMethod.CREDIT_CARD]: 'Thẻ quốc tế (Visa/Master/JCB)',
  [PaymentMethod.DIGITAL_WALLET]: 'Ví điện tử (Apple Pay / Samsung Pay)',
  [PaymentMethod.MOMO_WALLET]: 'Ví MoMo',
  [PaymentMethod.ZALO_PAY]: 'Ví ZaloPay',
  [PaymentMethod.ZALOPAY]: 'Ví ZaloPay',
  [PaymentMethod.INSTALLMENT]: 'Trả góp',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
  [PaymentMethod.ATM_CARD]: 'Thẻ ATM nội địa',
  [PaymentMethod.VNPAY]: 'Ví VNPAY',
  [PaymentMethod.CASH]: 'Tiền mặt',
  CARD_POS_PAYOO: 'Thẻ / Chạm',
};

/** Thanh toán tại quầy POS có khoản thu riêng (OMS counter-payment): tiền mặt + thẻ máy POS Payoo. */
export const COUNTER_PAYMENT_METHODS = ['CASH', 'CARD_POS_PAYOO'] as const;

export const isCounterPaymentMethod = (method?: PaymentMethod | string | null): boolean =>
  (COUNTER_PAYMENT_METHODS as readonly string[]).includes(
    String(method ?? '')
      .toUpperCase()
      .trim(),
  );

export const getPaymentMethodDisplay = (method?: PaymentMethod | string | null): string => {
  if (!method) return '—';
  const normalized = String(method).toUpperCase().trim();
  switch (normalized) {
    case PaymentMethod.COD:
      return 'COD';
    case PaymentMethod.BANK_TRANSFER:
      return 'Chuyển khoản';
    case PaymentMethod.VNPAY:
      return 'VNPAY';
    case PaymentMethod.MOMO_WALLET:
      return 'Ví MoMo';
    case PaymentMethod.ZALOPAY:
      return 'ZALOPAY';
    case PaymentMethod.ZALO_PAY:
      return 'ZALOPAY';
    case PaymentMethod.QR_CODE:
    case 'QR_CODE':
      return 'QR Code (Ngân hàng / Ví)';
    case PaymentMethod.CREDIT_CARD:
    case 'CREDIT_CARD':
      return 'Thẻ quốc tế (Visa/Master/JCB)';
    case PaymentMethod.DIGITAL_WALLET:
    case 'DIGITAL_WALLET':
      return 'Ví điện tử (Apple Pay / Samsung Pay)';
    case 'MOMO_WALLET':
      return 'Ví MoMo';
    case 'ZALO_PAY':
    case 'ZALOPAY':
      return 'Ví ZaloPay';
    case PaymentMethod.INSTALLMENT:
    case 'INSTALLMENT':
      return 'Trả góp';
    case 'BANK_TRANSFER':
      return 'Chuyển khoản ngân hàng';
    case 'ATM_CARD':
      return 'Thẻ ATM nội địa';
    case 'VNPAY':
      return 'Ví VNPAY';
    case PaymentMethod.CASH:
    case 'CASH':
      return 'Tiền mặt';
    case 'CARD_POS_PAYOO':
      return 'Thẻ / Chạm';
    default:
      return PAYMENT_METHOD_LABELS[normalized] ?? String(method);
  }
};

export const getShippingMethodLabel = (method?: ShippingMethod): string => {
  switch (method) {
    case ShippingMethod.STANDARD:
      return 'Tiêu chuẩn';
    case ShippingMethod.STORE_PICKUP:
      return 'Bán tại quầy';
    default:
      return '—';
  }
};

/** BR-11.1 + thanh toán (US). */
export function getOrderActionVisibility(
  status: OrderStatus,
  paymentStatus: PaymentStatus,
  paymentMethod?: PaymentMethod,
  errorLog?: OrderErrorLog,
  orderKind?: OrderKind,
  hasDispatchEvidence?: boolean,
) {
  const isError = errorLog && stringifyOrderErrorLog(errorLog);
  const isTerminal = status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED;
  // const paidOrFailedNeedingConfirm =
  //   paymentStatus !== PaymentStatus.PAID && !isError && paymentMethod !== PaymentMethod.COD;
  const canDispatchByKind = paymentMethod === PaymentMethod.COD || paymentStatus === PaymentStatus.PAID || orderKind === OrderKind.RECALL || orderKind === OrderKind.RETURN;

  // Đơn Return/đổi: vận đơn GHN thường tạo trước khi xác nhận → vẫn hiện nút đi đơn dù đã có trackingCode.
  const canShowDispatchOrder = canDispatchByKind && (orderKind === OrderKind.RETURN || !hasDispatchEvidence);

  return {
    /** Chỉ khi đơn chờ xác nhận. */
    showConfirmOrder: status === OrderStatus.PENDING && !isError && canShowDispatchOrder,
    /** hủy đơn. */
    showCancelOrder: !isTerminal && ORDER_CANCEL_ALLOWED_STATUSES.includes(status),
    // chỉnh sửa đơn
    showEditOrder: status === OrderStatus.PENDING || (isJavaBackend() && status === OrderStatus.CONFIRMED),
    // thu hồi đơn
    showRevokeConfirmation: !isJavaBackend() && status === OrderStatus.CONFIRMED,
    // in hóa đơn
    showPrintInvoice: !isJavaBackend() && !isTerminal,
    // in vận đơn
    showPrintSlip: !isJavaBackend() && !isTerminal,
    // xác nhận thanh toán — không dùng cho đơn Return (đi đơn qua showConfirmOrder)
    showConfirmPayment: isJavaBackend() && paymentStatus === PaymentStatus.UNPAID && [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPING].includes(status),
    // thanh toán 1 phần COD
    showCodShortfall: !isTerminal && (paymentStatus === PaymentStatus.PARTIAL || paymentStatus === PaymentStatus.PARTIAL_PAID_COD),
    showModifyActions: status === OrderStatus.PENDING || status === OrderStatus.CONFIRMED,
  };
}

export type OrderDetailActionVisibility = ReturnType<typeof getOrderActionVisibility>;

const stringifyOrderErrorLog = (errorLog: OrderErrorLog): string => {
  if (!errorLog) return '';
  if (typeof errorLog === 'string') return errorLog;
  return Object.values(errorLog)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ');
};

const parseOrderErrorType = (key: string): OrderErrorType => {
  const normalized = key.trim().toLowerCase();
  const hit = (Object.values(OrderErrorType) as string[]).find((v) => v === normalized);
  return (hit as OrderErrorType | undefined) ?? OrderErrorType.OTHER;
};

export type OrderErrorLogEntry = {
  /** Khóa gốc từ BE (vd. `payment`). */
  rawKey: string;
  type: OrderErrorType;
  message: string;
};

/** Nhãn pill theo loại — khớp UI thiết kế (thanh toán / địa chỉ / …). */
export const ORDER_ERROR_LOG_BADGE_LABEL: Record<OrderErrorType, string> = {
  [OrderErrorType.PAYMENT]: 'Chênh lệch thanh toán',
  [OrderErrorType.ADDRESS]: 'Lỗi địa chỉ',
  [OrderErrorType.STOCK]: 'Tồn kho / SKU',
  [OrderErrorType.CATALOG]: 'Danh mục',
  [OrderErrorType.OTHER]: 'Lỗi xử lý',
};

export const getOrderErrorLogEntries = (errorLog: OrderErrorLog): OrderErrorLogEntry[] => {
  if (!errorLog) return [];
  if (typeof errorLog === 'string') {
    const raw = errorLog.trim();
    return raw ? [{ rawKey: 'message', type: OrderErrorType.OTHER, message: raw }] : [];
  }

  return Object.entries(errorLog)
    .map(([key, value]) => {
      if (typeof value !== 'string') return null;
      const message = value.trim();
      if (!message) return null;
      return {
        rawKey: key,
        type: parseOrderErrorType(key),
        message,
      };
    })
    .filter((e): e is OrderErrorLogEntry => e != null);
};

export const getOrderErrorLogMessages = (errorLog: OrderErrorLog): string[] => getOrderErrorLogEntries(errorLog).map((e) => e.message);

/**
 * Đơn cần đi flow "Hủy + Yêu cầu hoàn tiền":
 * đã thanh toán online, chưa bàn giao 3PL (status còn cancellable).
 */
export const shouldShowCancelWithRefund = (input: { status?: OrderStatus | string; paymentStatus?: PaymentStatus | string; paymentMethod?: PaymentMethod | string }): boolean => {
  if (!input.status || !isOrderCancellableStatus(input.status as OrderStatus)) return false;
  if (input.paymentStatus !== PaymentStatus.PAID) return false;
  if (!input.paymentMethod || input.paymentMethod === PaymentMethod.COD) return false;
  return true;
};

/**
 * Heuristic: địa chỉ cảnh báo 3PL từ errorLog (BE có thể bổ sung field chuyên dụng).
 * Không quét `note` vì đó là ghi chú tự do của khách, dễ chứa từ khóa "địa chỉ" gây cảnh báo sai.
 */
export const inferAddressMismatch3pl = (errorLog?: OrderErrorLog): boolean => {
  const haystack = stringifyOrderErrorLog(errorLog).toLowerCase();
  return haystack.includes('địa chỉ') || haystack.includes('3pl');
};

/** BR-11.2: phí ship API > phí khách trả — cần cả hai giá trị từ BE; tạm thời so sánh optional. */
export const inferShippingFeeDiscrepancy = (customerShippingFee: number, apiShippingFee?: number | null): boolean => apiShippingFee != null && apiShippingFee > customerShippingFee + 0.01;

/** Gộp các dòng đơn hàng trùng `skuCode` (cộng SL và tiền) — giữ thứ tự lần xuất hiện đầu tiên. */
export const mergeOrderItemsBySkuCode = (items: IOrderItem[]): IOrderItem[] => {
  const bySku = new Map<string, IOrderItem>();
  const skuOrder: string[] = [];

  for (const item of items) {
    const skuKey = item.skuCode?.trim() || item.id;
    const mergeKey = `${skuKey}::${getCustomerDisplayPriceMergeKey(item.customerDisplayPrice)}`;
    const existing = bySku.get(mergeKey);
    if (!existing) {
      bySku.set(mergeKey, { ...item });
      skuOrder.push(mergeKey);
      continue;
    }

    existing.quantity += item.quantity;
    existing.lineTotal = String(parseOrderAmount(existing.lineTotal) + parseOrderAmount(item.lineTotal));
    existing.discountAmount = String(parseOrderAmount(existing.discountAmount) + parseOrderAmount(item.discountAmount));
    existing.finalAmount = String(parseOrderAmount(existing.finalAmount) + parseOrderAmount(item.finalAmount));
    existing.customerDisplayPrice ??= item.customerDisplayPrice;
  }

  return skuOrder.map((skuKey) => bySku.get(skuKey)!);
};

export const getOrderSetLines = (order: Pick<IOrder, 'lines'>): IOrderSetLine[] => (order.lines ?? []).filter((line): line is IOrderSetLine => line.type === 'SET');

export const getOrderLooseItems = (order: Pick<IOrder, 'items' | 'lines'>): IOrderItem[] => {
  const setLineIds = new Set(getOrderSetLines(order).map((line) => line.setLineId));
  return order.items.filter((item) => !item.setLineId || !setLineIds.has(item.setLineId));
};

const toQuantity = (value: string | number | null | undefined): number => Math.max(0, Math.trunc(Number(value ?? 0) || 0));

const toToken = (value: unknown): string => (typeof value === 'string' ? value.trim().toUpperCase() : '');

export const isOrderSummaryPromotion = (promotion: IPromotion): boolean => {
  if (String(promotion.orderItemId ?? '').trim()) {
    return false;
  }

  const sourceScope = toToken(promotion['sourceScope']);
  if (sourceScope === 'LINE_ITEM' || sourceScope === 'SKU_ITEM' || sourceScope === 'LINE') {
    return false;
  }

  const discountLayer = toToken(promotion['discountLayer']);
  if (discountLayer === 'LINE') {
    return false;
  }

  return true;
};

export const resolveOrderDisplayLineTotal = (item: Pick<IOrderItem, 'customerDisplayPrice' | 'lineTotal' | 'salePrice' | 'unitPrice' | 'quantity' | 'finalAmount'>): number => {
  const quantity = toQuantity(item.quantity);
  const displaySelling = item.customerDisplayPrice?.sellingPriceAfterTaxMinor;
  if (displaySelling != null) {
    return Math.max(0, displaySelling * quantity);
  }

  const lineTotal = parseOrderAmount(item.lineTotal);
  if (lineTotal > 0) {
    return lineTotal;
  }

  const saleTotal = parseOrderAmount(item.salePrice) * quantity;
  if (saleTotal > 0) {
    return saleTotal;
  }

  const unitTotal = parseOrderAmount(item.unitPrice) * quantity;
  if (unitTotal > 0) {
    return unitTotal;
  }

  return parseOrderAmount(item.finalAmount);
};

export const resolveOrderItemUnitPrice = (item: Pick<IOrderItem, 'customerDisplayPrice' | 'unitPrice'>): number => {
  const displayCompareAt = item.customerDisplayPrice?.compareAtPriceAfterTaxMinor;
  if (displayCompareAt != null) {
    return Math.max(0, displayCompareAt);
  }

  return parseOrderAmount(item.unitPrice);
};

export const resolveOrderItemSalePrice = (item: Pick<IOrderItem, 'customerDisplayPrice' | 'salePrice'>): number => {
  const displaySelling = item.customerDisplayPrice?.sellingPriceAfterTaxMinor;
  if (displaySelling != null) {
    return Math.max(0, displaySelling);
  }

  return parseOrderAmount(item.salePrice);
};

export const resolveOrderPromotionQuantityNote = (items: IOrderItem[], promotions: IPromotion[] | undefined, skuCode: string, displayQuantity: number): string | null => {
  const skuKey = skuCode?.trim();
  if (!skuKey || displayQuantity <= 0) return null;

  const matchingItemIds = new Set(items.filter((item) => (item.skuCode?.trim() || item.id) === skuKey).map((item) => item.id));
  if (!matchingItemIds.size) return null;

  const matchingPromotions = (promotions ?? []).filter((promotion) => {
    const orderItemId = String(promotion.orderItemId ?? '').trim();
    if (!orderItemId || !matchingItemIds.has(orderItemId)) return false;
    return toQuantity(promotion.appliedQuantity) > 0 || toQuantity(promotion.regularQuantity) > 0 || toQuantity(promotion.quotaExceededQuantity) > 0;
  });

  if (!matchingPromotions.length) return null;

  const appliedQuantity = matchingPromotions.reduce((sum, promotion) => sum + toQuantity(promotion.appliedQuantity), 0);
  if (appliedQuantity <= 0) return null;

  const regularQuantityFromPromotions = matchingPromotions.reduce((sum, promotion) => sum + toQuantity(promotion.regularQuantity), 0);
  const quotaExceededQuantity = matchingPromotions.reduce((sum, promotion) => sum + toQuantity(promotion.quotaExceededQuantity), 0);
  const remainingQuantity = Math.max(0, displayQuantity - appliedQuantity);
  const regularQuantity = Math.min(remainingQuantity, regularQuantityFromPromotions > 0 ? regularQuantityFromPromotions : quotaExceededQuantity > 0 ? quotaExceededQuantity : remainingQuantity);
  if (regularQuantity <= 0) return null;

  return `${appliedQuantity} sản phẩm giá khuyến mãi, ${regularQuantity} sản phẩm giá gốc`;
};

/** Đơn bán tại quầy POS (BE trả `StorePos`, dữ liệu cũ có thể là `POS`). */
export const isPosOrder = (order: Pick<IOrder, 'source'>): boolean => order.source === OrderSource.STORE_POS || (order.source as string) === 'POS';
const readPromotionText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** Tên khuyến mãi là loại schema (VOUCHER, MARKDOWN…) thì không dùng làm nhãn. */
const PROMOTION_SCHEMA_NAMES = new Set(['VOUCHER', 'MARKDOWN', 'DISCOUNT', 'COUPON']);

export interface OrderPromotionSummaryLine {
  key: string;
  label: string;
  amount: number;
}

/** Ưu đãi cấp đơn: layer CART, hoặc scope CART không có layer (đơn đồng bộ POS), hoặc dòng không gắn sản phẩm. */
const isOrderLevelPromotion = (promotion: IPromotion): boolean => {
  const layer = toToken(promotion['discountLayer']);
  if (layer) return layer === 'CART';
  const scope = toToken(promotion['sourceScope']);
  if (scope) return scope === 'CART';
  return isOrderSummaryPromotion(promotion);
};

const readVoucherCode = (promotion: IPromotion): string => {
  const details = (promotion['details'] ?? null) as Record<string, unknown> | null;
  return readPromotionText(promotion['voucherCode']) || readPromotionText(details?.['voucherCode']);
};

/**
 * Các dòng khuyến mãi dưới "Tổng khuyến mãi": voucher chia cho nhiều sản phẩm được gộp thành một dòng.
 * Nhãn `Voucher <mã>`; không có mã thì tên chương trình, cuối cùng là `Giảm <số tiền> đ`.
 */
export const buildOrderPromotionSummaryLines = (promotions: IPromotion[] | null | undefined): OrderPromotionSummaryLine[] => {
  const lines = new Map<string, OrderPromotionSummaryLine & { name: string; voucherCode: string }>();
  for (const promotion of promotions ?? []) {
    if (!isOrderLevelPromotion(promotion)) continue;
    const amount = parseAmount(promotion.discountAmount);
    if (amount <= 0) continue;
    const voucherCode = readVoucherCode(promotion);
    const rawName = readPromotionText(promotion['promotionName']) || readPromotionText(promotion.code);
    const name = PROMOTION_SCHEMA_NAMES.has(rawName.toUpperCase()) ? '' : rawName;
    const key = voucherCode || readPromotionText(promotion['promotionCode']) || readPromotionText(promotion.code) || name || `promotion-${lines.size}`;
    const existing = lines.get(key);
    if (existing) {
      existing.amount += amount;
      continue;
    }
    lines.set(key, { key, label: '', amount, name, voucherCode });
  }
  return [...lines.values()].map(({ key, amount, name, voucherCode }) => ({
    key,
    amount,
    label: voucherCode ? `Voucher ${voucherCode}` : name || `Giảm ${formatCurrency(amount)} đ`,
  }));
};

