import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PromotionVoucherCardDto, PromotionVoucherCheckoutContext } from '../../apis/promotion/promotion.interface';
import { buildAdminOrderPromotionVoucherCheckoutContext } from '../../common/utils/order/admin-order-voucher.helpers';
import type { CartLine } from '../../pages/order/create-order/create-order.interface';
import { addOrReplaceVoucher, DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS, type SelectedAdminOrderVoucher, toggleVoucher } from '../../pages/order/create-order/voucher/admin-order-voucher.mapper';

const EMPTY_SEGMENT_IDS: readonly string[] = [];

/** Fingerprint theo bộ sản phẩm (variation), không gồm số lượng — đổi SP thì clear voucher. */
export const buildAdminOrderCartProductFingerprint = (cartLines: CartLine[]): string =>
  cartLines
    .map((line) => line.variation.id.trim())
    .filter(Boolean)
    .sort()
    .join('|');

export interface UseAdminOrderVoucherArgs {
  enabled: boolean;
  cartLines: CartLine[];
  customerId?: string | null;
  segmentIds?: readonly string[];
}

export function useAdminOrderVoucher({ enabled, cartLines, customerId, segmentIds = EMPTY_SEGMENT_IDS }: UseAdminOrderVoucherArgs) {
  const [selectedVouchers, setSelectedVouchers] = useState<SelectedAdminOrderVoucher[]>([]);
  const cartProductFingerprint = useMemo(() => buildAdminOrderCartProductFingerprint(cartLines), [cartLines]);
  const lastCartProductFingerprintRef = useRef<string | null>(null);

  const promotionVoucherCheckoutContext = useMemo<PromotionVoucherCheckoutContext | null>(() => {
    if (!enabled || cartLines.length === 0) return null;
    return buildAdminOrderPromotionVoucherCheckoutContext(cartLines, selectedVouchers, {
      customerId,
      segmentIds: [...segmentIds],
    });
  }, [cartLines, customerId, enabled, segmentIds, selectedVouchers]);

  const handleVoucherToggle = useCallback((card: PromotionVoucherCardDto) => {
    if (card.disabled) return;
    setSelectedVouchers((prev) => toggleVoucher(prev, card, DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS));
  }, []);

  const handleVoucherApply = useCallback((card: PromotionVoucherCardDto) => {
    if (card.disabled) return;
    setSelectedVouchers((prev) => addOrReplaceVoucher(prev, card, DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS));
  }, []);

  const clearSelectedVouchers = useCallback(() => {
    setSelectedVouchers([]);
  }, []);

  const seedSelectedVouchers = useCallback((vouchers: SelectedAdminOrderVoucher[]) => {
    setSelectedVouchers(vouchers.slice(0, DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS));
  }, []);

  const retainSelectedVoucherCodes = useCallback((codes: readonly string[]) => {
    const allowedCodes = new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean));
    setSelectedVouchers((current) => {
      const retained = current.filter((voucher) => allowedCodes.has(voucher.code.trim().toUpperCase()));
      return retained.length === current.length ? current : retained;
    });
  }, []);

  const selectedVoucherCodes = useMemo(() => selectedVouchers.map((voucher) => voucher.code.trim()).filter(Boolean), [selectedVouchers]);

  useEffect(() => {
    if (!enabled) {
      setSelectedVouchers([]);
      lastCartProductFingerprintRef.current = null;
      return;
    }

    const previousFingerprint = lastCartProductFingerprintRef.current;
    if (previousFingerprint === null) {
      lastCartProductFingerprintRef.current = cartProductFingerprint;
      return;
    }

    if (previousFingerprint === cartProductFingerprint) return;

    lastCartProductFingerprintRef.current = cartProductFingerprint;
    // Giữ seed khi prefill ('' → có SP). Chỉ clear khi bộ SP đổi giữa hai giỏ đã có SP.
    if (previousFingerprint !== '') {
      setSelectedVouchers([]);
    }
  }, [cartProductFingerprint, enabled]);

  return {
    selectedVouchers,
    selectedVoucherCodes,
    promotionVoucherCheckoutContext,
    handleVoucherToggle,
    handleVoucherApply,
    clearSelectedVouchers,
    seedSelectedVouchers,
    retainSelectedVoucherCodes,
  };
}
