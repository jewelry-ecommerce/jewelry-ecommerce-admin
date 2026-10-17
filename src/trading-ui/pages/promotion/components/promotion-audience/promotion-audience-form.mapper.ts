import { AudienceConfigType, type PromotionAudienceConfigV1 } from '../../../../apis';
import { isJavaBackend } from '@/common/config/app.config';
import { createDefaultPromotionAudienceFormValues, normalizeAudienceUploadBatchId, type PromotionAudienceFormValues } from '../../promotion.constant';
import type { PromotionImportedCustomerRow } from '../../utils/promotion-customer-import-result.util';

export const AUDIENCE_TYPE_SELECT_OPTIONS = [
  { value: AudienceConfigType.ALL, label: 'Tất cả khách hàng' },
  { value: AudienceConfigType.MANUAL_CUSTOMER, label: 'Chọn thủ công' },
  { value: AudienceConfigType.UPLOAD_FILE, label: 'Tải lên file' },
].filter(option => !isJavaBackend() || option.value === AudienceConfigType.ALL);

export const mapAudienceToFormValues = (audience?: PromotionAudienceConfigV1 | null): PromotionAudienceFormValues => {
  const defaults = createDefaultPromotionAudienceFormValues();
  if (!audience) return defaults;
  return {
    audienceType: audience.type,
    segmentIdsText: audience.type === AudienceConfigType.CUSTOMER_SEGMENT ? audience.segmentIds.join('\n') : '',
    customerIds: audience.type === AudienceConfigType.MANUAL_CUSTOMER ? [...audience.customerIds] : audience.type === AudienceConfigType.UPLOAD_FILE ? [...(audience.customerIds ?? [])] : [],
    audienceUploadBatchId: audience.type === AudienceConfigType.UPLOAD_FILE ? normalizeAudienceUploadBatchId(audience.uploadBatchId) : '',
  };
};

export const getImportedCustomerKey = (customer: PromotionImportedCustomerRow): string => customer.normalizedPhone || customer.phone;

export const getImportedCustomerDisplayName = (customer: PromotionImportedCustomerRow): string => customer.fullName?.trim() || customer.memberCode?.trim() || customer.phone;
