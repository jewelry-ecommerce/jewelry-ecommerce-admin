import { AudienceConfigType, type PromotionAudienceConfigV1 } from '../../../apis';
import { PROMOTION_VALIDATION_MESSAGES } from './promotion-labels.util';

export const splitPromotionIdLines = (value: string): string[] =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export type PromotionAudienceFormValues = {
  audienceType: AudienceConfigType | '';
  segmentIdsText: string;
  customerIds: string[];
  audienceUploadBatchId: string;
};

export const createDefaultPromotionAudienceFormValues = (): PromotionAudienceFormValues => ({
  audienceType: '',
  segmentIdsText: '',
  customerIds: [],
  audienceUploadBatchId: '',
});

const hasSegmentIds = (value: string | undefined): boolean => splitPromotionIdLines(value ?? '').length > 0;

export const normalizeAudienceUploadBatchId = (audienceUploadBatchId: string | undefined | null): string => (audienceUploadBatchId ?? '').trim();

export type PromotionAudienceFormErrors = Partial<Record<keyof PromotionAudienceFormValues, string>>;

export const validatePromotionAudienceForm = (values: PromotionAudienceFormValues): PromotionAudienceFormErrors => {
  const errors: PromotionAudienceFormErrors = {};

  if (!values.audienceType) {
    errors.audienceType = PROMOTION_VALIDATION_MESSAGES.AUDIENCE_TYPE_REQUIRED;
    return errors;
  }

  if (values.audienceType === AudienceConfigType.CUSTOMER_SEGMENT && !hasSegmentIds(values.segmentIdsText)) {
    errors.segmentIdsText = PROMOTION_VALIDATION_MESSAGES.SEGMENT_IDS_REQUIRED;
  }
  if (values.audienceType === AudienceConfigType.MANUAL_CUSTOMER) {
    const hasUploadBatch = normalizeAudienceUploadBatchId(values.audienceUploadBatchId).length > 0;
    if (!hasUploadBatch && values.customerIds.length === 0) {
      errors.customerIds = PROMOTION_VALIDATION_MESSAGES.CUSTOMER_IDS_REQUIRED;
    }
  }
  if (values.audienceType === AudienceConfigType.UPLOAD_FILE && !normalizeAudienceUploadBatchId(values.audienceUploadBatchId)) {
    errors.audienceUploadBatchId = PROMOTION_VALIDATION_MESSAGES.AUDIENCE_UPLOAD_BATCH_REQUIRED;
  }

  return errors;
};

export const buildPromotionAudienceConfig = (values: PromotionAudienceFormValues): PromotionAudienceConfigV1 => {
  if (values.audienceType === AudienceConfigType.ALL) {
    return { type: AudienceConfigType.ALL, version: '1.0.0' };
  }
  if (values.audienceType === AudienceConfigType.CUSTOMER_SEGMENT) {
    return { type: AudienceConfigType.CUSTOMER_SEGMENT, version: '1.0.0', segmentIds: splitPromotionIdLines(values.segmentIdsText) };
  }

  const audienceUploadBatchId = normalizeAudienceUploadBatchId(values.audienceUploadBatchId);
  if (audienceUploadBatchId) {
    return {
      type: AudienceConfigType.UPLOAD_FILE,
      version: '1.0.0',
      uploadBatchId: audienceUploadBatchId,
      ...(values.customerIds.length > 0 ? { customerIds: values.customerIds } : {}),
    };
  }

  return { type: AudienceConfigType.MANUAL_CUSTOMER, version: '1.0.0', customerIds: values.customerIds };
};

export const arePromotionAudienceFormValuesEqual = (left: PromotionAudienceFormValues, right: PromotionAudienceFormValues): boolean => JSON.stringify(left) === JSON.stringify(right);

export const isPromotionAudienceFormSavable = (values: PromotionAudienceFormValues): boolean => Object.keys(validatePromotionAudienceForm(values)).length === 0;
