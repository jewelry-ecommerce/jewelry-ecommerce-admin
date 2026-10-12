import { TargetConfigType, TargetDiscountStateFilter, type PromotionTargetConfigV1 } from '../../../apis';
import { PROMOTION_VALIDATION_MESSAGES } from './promotion-labels.util';

export type PromotionTargetFormValues = {
  targetType: TargetConfigType | '';
  categoryIds: string[];
  collectionIds: string[];
  uploadBatchId: string;
  skuIds: string[];
  excludedSkuIds: string[];
  discountStateFilter: TargetDiscountStateFilter;
};

export const createDefaultPromotionTargetFormValues = (): PromotionTargetFormValues => ({
  targetType: '',
  categoryIds: [],
  collectionIds: [],
  uploadBatchId: '',
  skuIds: [],
  excludedSkuIds: [],
  discountStateFilter: TargetDiscountStateFilter.ANY,
});

export type PromotionTargetFormErrors = Partial<Record<keyof PromotionTargetFormValues, string>>;

/** uploadBatchId có thể tạm thời undefined (trước khi import trả job.id, hoặc dữ liệu cũ từ backend thiếu field) — luôn chuẩn hóa qua đây trước khi dùng string API. */
export const normalizeUploadBatchId = (uploadBatchId: string | undefined | null): string => (uploadBatchId ?? '').trim();

export const validatePromotionTargetForm = (values: PromotionTargetFormValues): PromotionTargetFormErrors => {
  const errors: PromotionTargetFormErrors = {};

  if (!values.targetType) {
    errors.targetType = PROMOTION_VALIDATION_MESSAGES.TARGET_TYPE_REQUIRED;
    return errors;
  }

  if (!values.discountStateFilter) {
    errors.discountStateFilter = PROMOTION_VALIDATION_MESSAGES.DISCOUNT_STATE_FILTER_REQUIRED;
  }

  if (values.targetType === TargetConfigType.CATEGORY && values.categoryIds.length === 0) {
    errors.categoryIds = PROMOTION_VALIDATION_MESSAGES.CATEGORY_REQUIRED;
  }
  if (values.targetType === TargetConfigType.COLLECTION && values.collectionIds.length === 0) {
    errors.collectionIds = PROMOTION_VALIDATION_MESSAGES.COLLECTION_REQUIRED;
  }
  if (values.targetType === TargetConfigType.UPLOAD_FILE && !normalizeUploadBatchId(values.uploadBatchId)) {
    errors.uploadBatchId = PROMOTION_VALIDATION_MESSAGES.UPLOAD_BATCH_REQUIRED;
  }
  if (values.targetType === TargetConfigType.MANUAL) {
    const hasUploadBatch = normalizeUploadBatchId(values.uploadBatchId).length > 0;
    if (!hasUploadBatch && values.skuIds.length === 0) {
      errors.skuIds = PROMOTION_VALIDATION_MESSAGES.MANUAL_SKU_REQUIRED;
    }
  }

  return errors;
};

const uniqueSkuIds = (skuIds: readonly string[]): string[] => [...new Set(skuIds.map((skuId) => skuId.trim()).filter(Boolean))];

const withExcludedSkuIds = <TConfig extends PromotionTargetConfigV1>(config: TConfig, excludedSkuIds: readonly string[]): TConfig => {
  const nextExcludedSkuIds = uniqueSkuIds(excludedSkuIds);
  if (nextExcludedSkuIds.length === 0) return config;
  return { ...config, excludedSkuIds: nextExcludedSkuIds };
};

export const buildPromotionTargetConfig = (values: PromotionTargetFormValues): PromotionTargetConfigV1 => {
  const lineFilter = {
    discountState: values.discountStateFilter,
  };
  const excludedSkuIds = values.excludedSkuIds;

  if (values.targetType === TargetConfigType.ALL) {
    return withExcludedSkuIds({ type: TargetConfigType.ALL, version: '1.0.0', lineFilter }, excludedSkuIds);
  }
  if (values.targetType === TargetConfigType.CATEGORY) {
    return withExcludedSkuIds({ type: TargetConfigType.CATEGORY, version: '1.0.0', categoryIds: [...values.categoryIds], lineFilter }, excludedSkuIds);
  }
  if (values.targetType === TargetConfigType.COLLECTION) {
    return withExcludedSkuIds({ type: TargetConfigType.COLLECTION, version: '1.0.0', collectionIds: [...values.collectionIds], lineFilter }, excludedSkuIds);
  }
  if (values.targetType === TargetConfigType.UPLOAD_FILE) {
    return withExcludedSkuIds(
      {
        type: TargetConfigType.UPLOAD_FILE,
        version: '1.0.0',
        uploadBatchId: normalizeUploadBatchId(values.uploadBatchId),
        ...(values.skuIds.length > 0 ? { skuIds: values.skuIds } : {}),
        lineFilter,
      },
      excludedSkuIds,
    );
  }
  if (values.targetType === TargetConfigType.MANUAL) {
    const uploadBatchId = normalizeUploadBatchId(values.uploadBatchId);
    if (uploadBatchId) {
      return withExcludedSkuIds(
        {
          type: TargetConfigType.UPLOAD_FILE,
          version: '1.0.0',
          uploadBatchId,
          ...(values.skuIds.length > 0 ? { skuIds: values.skuIds } : {}),
          lineFilter,
        },
        excludedSkuIds,
      );
    }
    return withExcludedSkuIds({ type: TargetConfigType.MANUAL, version: '1.0.0', skuIds: uniqueSkuIds(values.skuIds), lineFilter }, excludedSkuIds);
  }
  return withExcludedSkuIds({ type: TargetConfigType.MANUAL, version: '1.0.0', skuIds: uniqueSkuIds(values.skuIds), lineFilter }, excludedSkuIds);
};

export const arePromotionTargetFormValuesEqual = (left: PromotionTargetFormValues, right: PromotionTargetFormValues): boolean => JSON.stringify(left) === JSON.stringify(right);

export const isPromotionTargetFormSavable = (values: PromotionTargetFormValues): boolean => Object.keys(validatePromotionTargetForm(values)).length === 0;
