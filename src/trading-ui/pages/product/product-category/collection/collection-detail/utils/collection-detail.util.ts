import { CollectionStatus } from '@/trading-ui/apis/pim';
import type { Collection, Product, ProductCollection, ProductVariation } from '@/trading-ui/apis/pim';
import { formatCurrency, parseAmount } from '../../../../../../common/utils/number.utils';
import type { CollectionDetailHeaderInfo, CollectionDetailRow } from '../collection-detail.interface';

const EM = '—';

const unitPrice = (v: ProductVariation): number => {
  const sellingAfterTaxMinor = parseAmount(v.sellingPriceAfterTaxMinor);
  if (sellingAfterTaxMinor > 0) return sellingAfterTaxMinor;

  const sale = parseAmount(v.salePrice);
  if (sale > 0) return sale;

  const base = parseAmount(v.price);
  if (base > 0) return base;

  return parseAmount(v.compareAtPriceAfterTaxMinor);
};

/** Format giá 1 biến thể dạng `1.199.000đ`. */
const priceLabel = (v: ProductVariation): string => `${formatCurrency(unitPrice(v))}đ`;

/** Lấy tên danh mục hiển thị (fallback `—`). */
export const getProductCategoryName = (product: { category?: Product['category'] | null }): string => product.category?.name ?? EM;

/** Số biến thể hiển thị: ưu tiên `skuCount` từ BE; fallback đếm `variations`. */
export const getProductVariantCount = (product: { variations?: ProductVariation[]; skuCount?: number }): number => {
  const n = product.skuCount;
  if (n != null && Number.isFinite(n) && n >= 0) return n;
  return product.variations?.length ?? 0;
};

/** Giá hiển thị trên card list: ưu tiên defaultVariationId; */
export const getProductPriceLabel = (product: { variations?: ProductVariation[]; defaultVariationId?: string | null }): string => {
  const list = product.variations ?? [];
  if (list.length === 0) return EM;

  const defId = product.defaultVariationId;
  const def = list.find((v) => v.id === defId) ?? list[0];
  return priceLabel(def);
};

/** Header màn collection: map entity `Collection` → info hiển thị + trạng thái active. */
export const buildCollectionHeader = (collection: Collection | null | undefined, fallback?: CollectionDetailHeaderInfo | null): CollectionDetailHeaderInfo => {
  if (!collection) {
    return fallback ?? { id: '', name: EM, brandName: EM, isActive: true };
  }
  const description = collection.description?.trim();
  return {
    id: collection.id,
    name: collection.name,
    ...(description ? { description } : {}),
    brandId: collection.brandId,
    brandName: collection.brand?.name ?? EM,
    isActive: collection.status === CollectionStatus.ACTIVE,
  };
};

/** Type-guard: chỉ giữ các row đã embed `product` (UI require). */
const hasProduct = (pc: ProductCollection): pc is CollectionDetailRow => Boolean(pc.product);

/** Rows trong collection: lọc row có product + sort theo `order` tăng dần. */
export const buildCollectionDetailRows = (collection: Collection | null | undefined): CollectionDetailRow[] =>
  (collection?.productCollections ?? [])
    .filter(hasProduct)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

/** Search row theo keyword: match spuCode, name, category name. */
export const matchesCollectionRow = (row: CollectionDetailRow, keyword: string): boolean => {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  const text = [row.product.spuCode, row.product.name, getProductCategoryName(row.product)].filter(Boolean).join(' ').toLowerCase();
  return text.includes(q);
};
