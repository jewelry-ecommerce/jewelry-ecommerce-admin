import type { PromotionVoucherCardDto, PromotionVoucherCheckoutContext } from '../../../../apis/promotion/promotion.interface';

export const DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS = 1;

export interface SelectedAdminOrderVoucher {
  voucherCodeId: string;
  code: string;
  codeMask: string;
  title: string;
  benefitSummary: string;
}

export const mapCardToSelected = (card: PromotionVoucherCardDto): SelectedAdminOrderVoucher => ({
  voucherCodeId: card.voucherCodeId,
  code: card.code,
  codeMask: card.codeMask?.trim() || card.code,
  title: card.title,
  benefitSummary: card.benefitSummary?.trim() ?? '',
});

export const isVoucherSelected = (selected: SelectedAdminOrderVoucher[], voucherCodeId: string): boolean => selected.some((voucher) => voucher.voucherCodeId === voucherCodeId);

export const toggleVoucher = (selected: SelectedAdminOrderVoucher[], card: PromotionVoucherCardDto, maxVouchers = DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS): SelectedAdminOrderVoucher[] => {
  const alreadySelected = isVoucherSelected(selected, card.voucherCodeId);
  if (alreadySelected) {
    return selected.filter((voucher) => voucher.voucherCodeId !== card.voucherCodeId);
  }
  if (selected.length >= maxVouchers) return selected;
  return [...selected, mapCardToSelected(card)];
};

export const addOrReplaceVoucher = (selected: SelectedAdminOrderVoucher[], card: PromotionVoucherCardDto, maxVouchers = DEFAULT_MAX_SELECTED_ADMIN_ORDER_VOUCHERS): SelectedAdminOrderVoucher[] => {
  if (isVoucherSelected(selected, card.voucherCodeId)) return selected;
  const deduped = selected.filter((voucher) => voucher.code !== card.code);
  if (deduped.length >= maxVouchers) {
    return [...deduped.slice(0, Math.max(0, maxVouchers - 1)), mapCardToSelected(card)];
  }
  return [...deduped, mapCardToSelected(card)];
};

export const serializePromotionVoucherCheckoutContext = (context?: PromotionVoucherCheckoutContext | null): string => {
  if (!context) return '';

  return JSON.stringify({
    customerId: context.customer?.customerId ?? null,
    segmentIds: [...(context.customer?.segmentIds ?? [])].sort(),
    cartId: context.cart?.cartId ?? null,
    checkoutSessionId: context.cart?.checkoutSessionId ?? null,
    couponCodes: [...(context.couponCodes ?? [])].map((code) => code.trim().toLowerCase()).sort(),
    lines: (context.lines ?? []).map((line) => ({
      lineId: line.lineId,
      skuId: line.skuId,
      quantity: line.quantity,
      unitPriceMinor: line.unitPriceMinor,
      lineSubtotalMinor: line.lineSubtotalMinor,
      categoryIds: [...(line.categoryIds ?? [])].sort(),
      collectionIds: [...(line.collectionIds ?? [])].sort(),
      hasExistingPromotion: Boolean(line.hasExistingPromotion),
      hasExistingDiscount: Boolean(line.hasExistingDiscount),
    })),
  });
};
