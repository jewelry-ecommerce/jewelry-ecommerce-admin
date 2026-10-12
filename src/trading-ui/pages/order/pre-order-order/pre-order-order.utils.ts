import dayjs from 'dayjs';
import {
  PreOrderOrderStatus,
  TERMINAL_PRE_ORDER_ORDER_STATUSES,
  type PreOrderOrderDetail,
  type PreOrderOrderItem,
  type PreOrderOrderListItem,
  type TerminalPreOrderOrderStatus,
} from '../../../apis/pre-order-order';
import { parseAmount } from '../../../common/utils/number.utils';

const MAX_DISPLAYED_SKUS = 3;

export const normalizePreOrderOrderStatus = (status: string | null | undefined): PreOrderOrderStatus | null => {
  if (!status) return null;
  return Object.values(PreOrderOrderStatus).includes(status as PreOrderOrderStatus) ? (status as PreOrderOrderStatus) : null;
};

export const isTerminalPreOrderOrderStatus = (status: string | null | undefined): boolean => {
  const normalized = normalizePreOrderOrderStatus(status);
  return Boolean(normalized && (TERMINAL_PRE_ORDER_ORDER_STATUSES as readonly PreOrderOrderStatus[]).includes(normalized));
};

/** AC3: chỉ cho sửa SĐT ở Đặt trước / Đã có hàng / Gửi ZNS lỗi. Khóa Chờ thanh toán, Thành công, Đã hủy, Hết hạn. */
export const canEditPreOrderOrder = (status: string | null | undefined): boolean => {
  const normalized = normalizePreOrderOrderStatus(status);
  if (!normalized || isTerminalPreOrderOrderStatus(normalized)) return false;
  return normalized === PreOrderOrderStatus.PRE_ORDERED || normalized === PreOrderOrderStatus.STOCK_AVAILABLE || normalized === PreOrderOrderStatus.ZNS_FAILED;
};

/**
 * Nút "Hủy đơn" hiển thị đối với các trạng thái chưa thanh toán:
 * - Đặt trước (PreOrdered)
 * - Đã có hàng (StockAvailable)
 * - Gửi ZNS lỗi (ZnsFailed)
 * - Chờ thanh toán (AwaitingPayment)
 *
 * Ẩn với các trạng thái: Thành công (Converted), Đã hủy (Cancelled), Hết hạn (Expired).
 */
export const canCancelPreOrderOrder = (status: string | null | undefined): boolean => {
  const normalized = normalizePreOrderOrderStatus(status);
  return (
    normalized === PreOrderOrderStatus.PRE_ORDERED ||
    normalized === PreOrderOrderStatus.STOCK_AVAILABLE ||
    normalized === PreOrderOrderStatus.ZNS_FAILED ||
    normalized === PreOrderOrderStatus.AWAITING_PAYMENT
  );
};

/** Hết quota gửi lại ZNS (max 3 lần thất bại → znsRetryCount >= 4). Fallback chuyển chờ thanh toán thủ công. */
export const PRE_ORDER_ZNS_RETRY_EXHAUSTED_THRESHOLD = 4;

const isPreOrderZnsRetryExhausted = (znsRetryCount?: number | null): boolean => {
  const count = typeof znsRetryCount === 'number' && Number.isFinite(znsRetryCount) ? znsRetryCount : 0;
  return count >= PRE_ORDER_ZNS_RETRY_EXHAUSTED_THRESHOLD;
};

export const canSendPreOrderOrderZns = (status: string | null | undefined, znsRetryCount?: number | null): boolean => {
  if (isPreOrderZnsRetryExhausted(znsRetryCount)) return false;
  return normalizePreOrderOrderStatus(status) === PreOrderOrderStatus.STOCK_AVAILABLE;
};

export const canResendPreOrderOrderZns = (status: string | null | undefined, znsRetryCount?: number | null): boolean => {
  if (isPreOrderZnsRetryExhausted(znsRetryCount)) return false;
  return normalizePreOrderOrderStatus(status) === PreOrderOrderStatus.ZNS_FAILED;
};

export const canSendOrResendPreOrderOrderZns = (status: string | null | undefined, znsRetryCount?: number | null): boolean => {
  if (isPreOrderZnsRetryExhausted(znsRetryCount)) return false;
  const normalized = normalizePreOrderOrderStatus(status);
  return normalized === PreOrderOrderStatus.STOCK_AVAILABLE || normalized === PreOrderOrderStatus.ZNS_FAILED;
};

export const canMovePreOrderOrderToAwaitingPayment = (status: string | null | undefined, znsRetryCount?: number | null): boolean => {
  if (!isPreOrderZnsRetryExhausted(znsRetryCount)) return false;
  const normalized = normalizePreOrderOrderStatus(status);
  if (!normalized) return false;
  if (isTerminalPreOrderOrderStatus(normalized)) return false;
  if (normalized === PreOrderOrderStatus.AWAITING_PAYMENT) return false;
  return true;
};

export const canInlineEditPreOrderPhone = (status: string | null | undefined): boolean => normalizePreOrderOrderStatus(status) === PreOrderOrderStatus.ZNS_FAILED;

export const getPreOrderOrderTotalQuantity = (order: Pick<PreOrderOrderListItem, 'items' | 'totalQuantity'>): number => {
  if (typeof order.totalQuantity === 'number' && Number.isFinite(order.totalQuantity)) return order.totalQuantity;
  return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
};

export const getPreOrderOrderGrandTotal = (order: Pick<PreOrderOrderListItem, 'grandTotal'>): number => Math.max(0, parseAmount(order.grandTotal));

export const getPreOrderOrderDisplayedSkus = (items: PreOrderOrderItem[]): { skus: string[]; remainingCount: number } => {
  const uniqueSkus = Array.from(new Set(items.map((item) => item.skuCode?.trim()).filter((sku): sku is string => Boolean(sku))));
  if (uniqueSkus.length <= MAX_DISPLAYED_SKUS) {
    return { skus: uniqueSkus, remainingCount: 0 };
  }
  return {
    skus: uniqueSkus.slice(0, MAX_DISPLAYED_SKUS),
    remainingCount: uniqueSkus.length - MAX_DISPLAYED_SKUS,
  };
};

const getPreOrderDisplayPriceMergeKey = (value: PreOrderOrderItem['customerDisplayPrice'] | null | undefined): string => {
  if (!value) return 'NO_DISPLAY_PRICE';
  return [value.currency, value.compareAtPriceAfterTaxMinor ?? 'null', value.sellingPriceAfterTaxMinor, value.discountPercent ?? 'null', value.hasDiscount ? '1' : '0'].join('|');
};

/**
 * Gộp dòng sản phẩm trùng `skuCode` trên UI chi tiết (cộng SL + lineTotal).
 * Giữ thứ tự lần xuất hiện đầu; không gộp nếu cùng SKU nhưng khác giá hiển thị.
 */
export const mergePreOrderOrderItemsBySkuCode = (items: PreOrderOrderItem[]): PreOrderOrderItem[] => {
  const byKey = new Map<string, PreOrderOrderItem>();
  const keyOrder: string[] = [];

  for (const item of items) {
    const skuKey = item.skuCode?.trim() || item.id;
    const mergeKey = `${skuKey}::${getPreOrderDisplayPriceMergeKey(item.customerDisplayPrice)}`;
    const existing = byKey.get(mergeKey);
    if (!existing) {
      byKey.set(mergeKey, { ...item });
      keyOrder.push(mergeKey);
      continue;
    }

    existing.quantity += item.quantity || 0;
    existing.lineTotal = String(parseAmount(existing.lineTotal) + parseAmount(item.lineTotal));
    existing.customerDisplayPrice ??= item.customerDisplayPrice;
  }

  return keyOrder.map((key) => byKey.get(key)!);
};

export const formatPreOrderAddress = (parts: Array<string | null | undefined>): string =>
  parts
    .filter((part) => Boolean(part?.trim()))
    .map((part) => part!.trim())
    .join(', ') || '—';

export const getPreOrderCustomerDisplayName = (order: Pick<PreOrderOrderDetail, 'customerName' | 'shippingAddressSnapshot'>): string => {
  if (order.customerName?.trim()) return order.customerName.trim();
  const address = order.shippingAddressSnapshot;
  const composed = [address?.lastName, address?.firstName].filter(Boolean).join(' ').trim();
  return composed || '—';
};

export const getPreOrderCustomerEmail = (order: Pick<PreOrderOrderDetail, 'customerEmail' | 'shippingAddressSnapshot'>): string =>
  order.customerEmail?.trim() || order.shippingAddressSnapshot?.email?.trim() || '—';

/** Countdown label from BE `awaitingPaymentExpiresAt` (recompute every tick / after refetch). */
export const formatAwaitingPaymentCountdown = (expiresAt: string | null | undefined, nowMs: number = Date.now()): string | null => {
  if (!expiresAt) return null;
  const expires = dayjs(expiresAt);
  if (!expires.isValid()) return null;
  const diffMs = expires.diff(dayjs(nowMs));
  if (diffMs <= 0) return 'Đã hết hạn';
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  const seconds = Math.floor((diffMs % 60_000) / 1_000);
  return `${hours}h ${minutes}m ${seconds}s`;
};

export type { TerminalPreOrderOrderStatus };
