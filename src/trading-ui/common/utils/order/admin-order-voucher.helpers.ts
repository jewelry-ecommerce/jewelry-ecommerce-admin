import type { DiscoverOrderPromotionVouchersRequestDto, PromotionVoucherCheckoutContext, RuntimeEvaluateLineDto } from '../../../apis/promotion/promotion.interface';
import type { CartLine } from '../../../pages/order/create-order/create-order.interface';
import type { SelectedAdminOrderVoucher } from '../../../pages/order/create-order/voucher/admin-order-voucher.mapper';
import { resolveCartLineSellingPrice } from './create-order.utils';

const normalizeStringArray = (values: readonly string[]): string[] => [...new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))];

export const buildAdminOrderVoucherLines = (cartLines: CartLine[]): RuntimeEvaluateLineDto[] =>
  cartLines.map((line) => {
    const unitPrice = resolveCartLineSellingPrice(line.variation);
    const lineSubtotal = unitPrice * line.quantity;
    return {
      lineId: line.key,
      skuId: line.variation.id,
      quantity: line.quantity,
      unitPriceMinor: String(unitPrice),
      lineSubtotalMinor: String(lineSubtotal),
      categoryIds: [],
      collectionIds: [],
      hasExistingPromotion: false,
      hasExistingDiscount: false,
    };
  });

export const buildAdminOrderPromotionVoucherCheckoutContext = (
  cartLines: CartLine[],
  selectedVouchers: SelectedAdminOrderVoucher[],
  params?: {
    customerId?: string | null;
    segmentIds?: string[];
  },
): PromotionVoucherCheckoutContext => {
  const segmentIds = normalizeStringArray(params?.segmentIds ?? []);
  return {
    customer: {
      customerId: params?.customerId ?? null,
      ...(segmentIds.length > 0 ? { segmentIds } : {}),
    },
    cart: {
      cartId: null,
      checkoutSessionId: null,
    },
    lines: buildAdminOrderVoucherLines(cartLines),
    couponCodes: selectedVouchers.map((voucher) => voucher.code),
  };
};

/** Map checkout context → body POST order/orders/promotion-vouchers/discover */
export const buildDiscoverOrderPromotionVouchersRequest = (checkoutContext?: PromotionVoucherCheckoutContext | null): DiscoverOrderPromotionVouchersRequestDto => {
  const items = (checkoutContext?.lines ?? [])
    .map((line) => {
      const variationId = String(line.skuId ?? '').trim();
      if (!variationId || line.quantity <= 0) return null;
      return {
        variationId,
        quantity: line.quantity,
        unitPriceMinor: String(line.unitPriceMinor ?? '0'),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);

  const customerId = checkoutContext?.customer?.customerId?.trim() || null;
  const couponCodes = normalizeStringArray(checkoutContext?.couponCodes ?? []);

  return {
    items,
    customerId,
    couponCodes,
  };
};
