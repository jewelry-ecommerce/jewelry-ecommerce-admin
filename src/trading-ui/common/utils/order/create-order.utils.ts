import { useEffect, useState } from 'react';
import { OrderPurpose, PaymentMethod } from '../../../apis/order/order.enum';
import type { IOrder, IOrderItem, IOrderPackagingRelation, IOrderProductVariation, IOrderProductVariationListItem } from '../../../apis/order/order.interface';
import type { CartLine } from '../../../pages/order/create-order/create-order.interface';
import { resolveCustomerDisplayPrice } from './customer-display-price.util';

export type OrderLineItemPayload = { variationId: string; quantity: number };

/** Flatten giỏ hàng → payload `items` gửi BE (chỉ gửi SP chính, không gửi biến thể bao bì/hộp đi kèm). */
export const buildOrderItemsFromCartLines = (cartLines: CartLine[]): OrderLineItemPayload[] => {
  const quantityByVariation = new Map<string, number>();

  const addItem = (variationId: string, quantity: number) => {
    const id = variationId.trim();
    if (!id || quantity <= 0) return;
    quantityByVariation.set(id, (quantityByVariation.get(id) ?? 0) + quantity);
  };

  for (const line of cartLines) {
    addItem(line.variation.id, line.quantity);
  }

  return Array.from(quantityByVariation, ([variationId, quantity]) => ({ variationId, quantity }));
};

/** Tồn kho giả lập khi khôi phục dòng từ chi tiết đơn (API không trả stock theo dòng). */
export const CLONED_LINE_STOCK_PLACEHOLDER = 999_999;

export const parseMoneyAmount = (v: string | number | undefined | null): number => {
  if (v === undefined || v === null) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const parsePaymentMethod = (raw: string | undefined): PaymentMethod => {
  if (!raw) return PaymentMethod.COD;
  return (Object.values(PaymentMethod) as string[]).includes(raw) ? (raw as PaymentMethod) : PaymentMethod.COD;
};

const sortVariationAttrs = (attrs?: IOrderProductVariationListItem['attributes']) => [...(attrs ?? [])].sort((a, b) => a.attributeCode.localeCompare(b.attributeCode));

export const buildOrderVariationMetaMap = (variationsByProduct: Array<{ productId: string; variations: IOrderProductVariationListItem[] } | null>): Map<string, IOrderProductVariationListItem> => {
  const map = new Map<string, IOrderProductVariationListItem>();
  variationsByProduct.forEach((entry) => {
    if (!entry) return;
    entry.variations.forEach((variation) => {
      if (!map.has(variation.id)) map.set(variation.id, variation);
    });
  });
  return map;
};

const matchesPackagingRelation = (item: IOrderItem, relation: IOrderPackagingRelation): boolean => item.variationId === relation.packagingVariationId || item.skuCode === relation.packagingSkuCode;

const isPackagingOrderItem = (item: IOrderItem, items: IOrderItem[], variationMeta: Map<string, IOrderProductVariationListItem>): boolean => {
  for (const merchItem of items) {
    if (merchItem.variationId === item.variationId) continue;
    const relations = variationMeta.get(merchItem.variationId)?.packagingRelations ?? [];
    if (relations.some((relation) => matchesPackagingRelation(item, relation))) return true;
  }
  return false;
};

const resolvePackagingRelationsForMerchItem = (
  merchItem: IOrderItem,
  packagingItems: IOrderItem[],
  variationMeta: Map<string, IOrderProductVariationListItem>,
  usedPackagingItemIds: Set<string>,
): IOrderPackagingRelation[] => {
  const relationDefs = variationMeta.get(merchItem.variationId)?.packagingRelations ?? [];
  if (!relationDefs.length) return [];

  return relationDefs.flatMap((relation) => {
    const matchedPackagingItem = packagingItems.find((pkgItem) => !usedPackagingItemIds.has(pkgItem.id) && matchesPackagingRelation(pkgItem, relation));
    if (!matchedPackagingItem) return [];

    usedPackagingItemIds.add(matchedPackagingItem.id);
    const includedPrice = parseMoneyAmount(matchedPackagingItem.unitPrice ?? matchedPackagingItem.salePrice ?? relation.includedPriceAfterTax);
    return [
      {
        ...relation,
        includedPriceAfterTax: String(includedPrice),
        image: matchedPackagingItem.image || relation.image,
        packagingName: matchedPackagingItem.productName || matchedPackagingItem.variationName || relation.packagingName,
        packagingSkuCode: matchedPackagingItem.skuCode || relation.packagingSkuCode,
        packagingVariationId: matchedPackagingItem.variationId || relation.packagingVariationId,
      },
    ];
  });
};

type VariationPricingSource = Pick<IOrderProductVariationListItem, 'price' | 'unitPrice' | 'salePrice' | 'sellingPriceAfterTaxMinor' | 'compareAtPriceAfterTaxMinor' | 'customerDisplayPrice'>;

/** Giá bán sau thuế dùng để tính tiền — luôn ưu tiên `customerDisplayPrice.sellingPriceAfterTaxMinor`. */
export const resolveCartLineSellingPrice = (variation: Pick<IOrderProductVariation, 'customerDisplayPrice' | 'salePrice'>): number => {
  const displaySelling = variation.customerDisplayPrice?.sellingPriceAfterTaxMinor;
  if (displaySelling != null) return parseMoneyAmount(displaySelling);
  return parseMoneyAmount(variation.salePrice);
};

/** Giá gạch chỉ để hiển thị — không dùng tính tổng tiền. */
export const resolveCartLineCompareAtPrice = (variation: Pick<IOrderProductVariation, 'customerDisplayPrice' | 'unitPrice'>): number | null => {
  if (variation.customerDisplayPrice != null) {
    return variation.customerDisplayPrice.compareAtPriceAfterTaxMinor;
  }
  const legacyUnit = parseMoneyAmount(variation.unitPrice);
  return legacyUnit > 0 ? legacyUnit : null;
};

export const resolveOrderProductVariationPricing = (row: VariationPricingSource): Pick<IOrderProductVariation, 'salePrice' | 'unitPrice' | 'customerDisplayPrice'> => {
  const customerDisplayPrice =
    row.customerDisplayPrice ??
    resolveCustomerDisplayPrice({
      displayPriceAfterTaxMinor: row.sellingPriceAfterTaxMinor ?? row.salePrice ?? row.price,
      sellingPriceAfterTaxMinor: row.sellingPriceAfterTaxMinor ?? row.salePrice ?? row.price,
      compareAtPriceAfterTaxMinor: row.compareAtPriceAfterTaxMinor ?? row.unitPrice,
    });
  const salePrice = customerDisplayPrice.sellingPriceAfterTaxMinor;
  const compareAt = customerDisplayPrice.compareAtPriceAfterTaxMinor;
  return {
    salePrice,
    unitPrice: compareAt ?? undefined,
    customerDisplayPrice,
  };
};

const mapOrderItemToCartLine = (item: IOrderItem, idx: number, variationMeta: Map<string, IOrderProductVariationListItem>, packagingRelations?: IOrderPackagingRelation[]): CartLine => {
  const apiVariation = variationMeta.get(item.variationId);
  const sortedAttrs = sortVariationAttrs(apiVariation?.attributes);
  const customerDisplayPrice =
    item.customerDisplayPrice ??
    resolveCustomerDisplayPrice({
      displayPriceAfterTaxMinor: item.salePrice,
      sellingPriceAfterTaxMinor: item.salePrice,
      compareAtPriceAfterTaxMinor: item.unitPrice,
    });
  const salePrice = customerDisplayPrice.sellingPriceAfterTaxMinor;
  const unitPrice = customerDisplayPrice.compareAtPriceAfterTaxMinor ?? salePrice;
  const variation: IOrderProductVariation = {
    id: item.variationId,
    skuCode: item.skuCode,
    unitPrice,
    salePrice,
    customerDisplayPrice,
    stockQuantity: CLONED_LINE_STOCK_PLACEHOLDER,
    colorLabel: sortedAttrs[0]?.value?.trim() ? sortedAttrs[0].value : null,
    sizeLabel: sortedAttrs[1]?.value?.trim() ? sortedAttrs[1].value : null,
    weightGram: apiVariation?.weightGram ?? undefined,
    lengthCm: apiVariation?.lengthCm ?? undefined,
    widthCm: apiVariation?.widthCm ?? undefined,
    heightCm: apiVariation?.heightCm ?? undefined,
    packagingRelations: packagingRelations?.length ? packagingRelations : undefined,
    variationValue: sortedAttrs.map((attr) => attr.value),
  };

  return {
    key: `${item.variationId}-${idx}`,
    productId: item.productId ?? '',
    productName: item.productName ?? item.variationName,
    image: item.image,
    variation,
    quantity: item.quantity,
  };
};

/**
 * Tổng tiền hàng từ giỏ — luôn tính theo `customerDisplayPrice.sellingPriceAfterTaxMinor`.
 * Edit/clone: cộng thêm giá bao bì đi kèm (`includedPriceAfterTax`).
 */
export const computeCartSubtotal = (cartLines: CartLine[], options?: { useOrderMerchandiseUnitPrice?: boolean }): number => {
  const includePackaging = options?.useOrderMerchandiseUnitPrice ?? false;

  return cartLines.reduce((sum, line) => {
    let lineTotal = resolveCartLineSellingPrice(line.variation) * line.quantity;

    if (includePackaging) {
      for (const relation of line.variation.packagingRelations ?? []) {
        const pkgUnit = parseMoneyAmount(relation.includedPriceAfterTax);
        if (pkgUnit <= 0) continue;
        const pkgQty = Math.max(1, relation.quantity) * line.quantity;
        lineTotal += pkgUnit * pkgQty;
      }
    }

    return sum + lineTotal;
  }, 0);
};

/** Map từng dòng đơn → cart line (không gộp bao bì đi kèm). */
export const orderItemsToCartLines = (order: IOrder): CartLine[] => order.items.map((item, idx) => mapOrderItemToCartLine(item, idx, new Map()));

/**
 * Khôi phục cart từ chi tiết đơn: bao bì đi kèm gắn vào `variation.packagingRelations`
 * thay vì hiển thị như một sản phẩm độc lập.
 */
export const orderItemsToCartLinesWithPackaging = (order: IOrder, variationMeta: Map<string, IOrderProductVariationListItem>): CartLine[] => {
  const items = order.items ?? [];
  if (!items.length) return [];

  const hasPackagingMeta = Array.from(variationMeta.values()).some((variation) => (variation.packagingRelations?.length ?? 0) > 0);
  if (!hasPackagingMeta) return orderItemsToCartLines(order);

  const packagingItems = items.filter((item) => isPackagingOrderItem(item, items, variationMeta));
  const merchandiseItems = items.filter((item) => !packagingItems.some((pkgItem) => pkgItem.id === item.id));
  const usedPackagingItemIds = new Set<string>();

  return merchandiseItems.map((item, idx) => {
    const packagingRelations = resolvePackagingRelationsForMerchItem(item, packagingItems, variationMeta, usedPackagingItemIds);
    return mapOrderItemToCartLine(item, idx, variationMeta, packagingRelations);
  });
};

export const resolveOrderPurpose = (order: IOrder): OrderPurpose => order.purpose ?? OrderPurpose.ADDITIONAL;

/** Định dạng tiền VNĐ hiển thị */
export const formatVnd = (amount: number) => `${amount.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ`;

/** Chuẩn hóa SĐT VN về dạng 0xxxxxxxxx (10 số) hoặc null */
export const normalizeVnPhone = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith('84')) {
    return `0${digits.slice(2)}`;
  }
  if (digits.length === 12 && digits.startsWith('84')) {
    return `0${digits.slice(2)}`;
  }
  return null;
};

export const isValidVnMobile10 = (raw: string): boolean => normalizeVnPhone(raw) !== null;

/** Họ tên: chữ cái + khoảng trắng (Unicode) */
export const isValidPersonName = (value: string) => /^[\p{L}\s'-]+$/u.test(value.trim()) && value.trim().length > 0;

/**
 * Tách chuỗi họ tên đầy đủ → họ (last) + tên (first).
 * Token cuối = tên, phần còn lại = họ.
 */
export const resolveOrderCustomerFullName = (snapshot?: { firstName?: string | null; lastName?: string | null } | null): string => {
  const first = snapshot?.firstName?.trim() ?? '';
  // const last = snapshot?.lastName?.trim() ?? '';
  if (!first) return '';
  if (first.includes(' ')) return first;
  return `${first}`.trim();
};

export const splitVnFullName = (full: string) => {
  const tokens = full.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { lastName: '', firstName: '' };
  if (tokens.length === 1) return { lastName: tokens[0]!, firstName: '' };
  return { firstName: tokens[tokens.length - 1]!, lastName: tokens.slice(0, -1).join(' ') };
};

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
