import { TargetConfigType, TargetDiscountStateFilter, type Category, type PromotionTargetConfigV1, type PromotionTargetSkuItemDto } from '../../../../apis';
import type { LabelDisplaySelectedProduct } from '../../../content-display/label/label-display/label-display.interface';
import { createDefaultPromotionTargetFormValues, normalizeUploadBatchId, type PromotionTargetFormValues } from '../../promotion.constant';

export const TARGET_TYPE_SELECT_OPTIONS = [
  { value: TargetConfigType.ALL, label: 'Tất cả sản phẩm' },
  { value: TargetConfigType.CATEGORY, label: 'Danh mục sản phẩm' },
  { value: TargetConfigType.COLLECTION, label: 'Bộ sưu tập' },
  { value: TargetConfigType.MANUAL, label: 'Biến thể sản phẩm' },
];

export const flattenCategorySelectOptions = (categories: readonly Category[]): Array<{ value: string; label: string }> => {
  const options: Array<{ value: string; label: string }> = [];
  const walk = (nodes: readonly Category[]) => {
    for (const category of nodes) {
      options.push({ value: category.id, label: category.name });
      if (category.children?.length) walk(category.children);
    }
  };
  walk(categories);
  return options;
};

export const parseSelectAllValues = (raw: unknown): string[] => (Array.isArray(raw) ? raw.map(String).filter(Boolean) : []);

export const mapTargetSkuItemToSelectedProduct = (item: PromotionTargetSkuItemDto): LabelDisplaySelectedProduct => {
  const productVariantId = String(item.id ?? '').trim();
  const skuCode = String(item.skuCode ?? '').trim() || productVariantId;
  const name = String(item.name ?? item.productName ?? '').trim() || skuCode || productVariantId;
  return {
    productVariantId,
    productId: String(item.productId ?? '').trim() || productVariantId,
    skuCode,
    name,
    imageUrl: String(item.imageUrl ?? '').trim(),
  };
};

export const mapTargetToFormValues = (target?: PromotionTargetConfigV1 | null): PromotionTargetFormValues => {
  const defaults = createDefaultPromotionTargetFormValues();
  if (!target) return defaults;

  const targetType = target.type === TargetConfigType.UPLOAD_FILE ? TargetConfigType.MANUAL : target.type;

  return {
    targetType,
    categoryIds: target.type === TargetConfigType.CATEGORY ? [...target.categoryIds] : [],
    collectionIds: target.type === TargetConfigType.COLLECTION ? [...target.collectionIds] : [],
    uploadBatchId: target.type === TargetConfigType.UPLOAD_FILE ? normalizeUploadBatchId(target.uploadBatchId) : '',
    skuIds: target.type === TargetConfigType.MANUAL ? target.skuIds : target.type === TargetConfigType.UPLOAD_FILE ? [...(target.skuIds ?? [])] : [],
    excludedSkuIds: [...(target.excludedSkuIds ?? [])],
    discountStateFilter: target.lineFilter?.discountState ?? TargetDiscountStateFilter.ANY,
  };
};

export const resolveDisplayedSkuProducts = (
  skuIds: readonly string[],
  localProducts: readonly LabelDisplaySelectedProduct[],
  enrichedProducts: readonly LabelDisplaySelectedProduct[],
): LabelDisplaySelectedProduct[] => {
  const enrichedMap = new Map<string, LabelDisplaySelectedProduct>();
  enrichedProducts.forEach((item) => {
    enrichedMap.set(item.productVariantId, item);
    enrichedMap.set(item.skuCode, item);
  });

  const localMap = new Map<string, LabelDisplaySelectedProduct>();
  localProducts.forEach((item) => {
    localMap.set(item.productVariantId, item);
    localMap.set(item.skuCode, item);
  });

  return skuIds.map(
    (skuId) =>
      localMap.get(skuId) ??
      enrichedMap.get(skuId) ?? {
        productVariantId: skuId,
        productId: skuId,
        skuCode: skuId,
        name: skuId,
        imageUrl: '',
      },
  );
};
