import { ConditionAuthoringMode, PromotionDraftSchemaType, type CreatePromotionDraftSchemaDto, type PromotionDraftSchema, type UpdatePromotionDraftSchemaDto } from '../../../../apis';
import { isoToStoredDateTime, parseStoredDateTime } from '../../../../common/utils/date-format.util';
import { SCHEMA_HEADER_DEFAULT_DRAFT } from './promotion-schema-header-drawer.constants';
import type { SchemaHeaderDraft, SchemaHeaderParentWindow, SchemaHeaderValidation } from './promotion-schema-header-drawer.types';

const SCHEMA_HEADER_DATE_MESSAGES = {
  START_IN_PARENT: 'Ngày bắt đầu phải nằm trong thời gian áp dụng của chương trình khuyến mãi.',
  END_IN_PARENT: 'Ngày kết thúc phải nằm trong thời gian áp dụng của chương trình khuyến mãi.',
  END_AFTER_START: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.',
} as const;

export const createSchemaHeaderDraft = (schema?: PromotionDraftSchema | null): SchemaHeaderDraft => {
  if (!schema) return { ...SCHEMA_HEADER_DEFAULT_DRAFT };
  return {
    name: schema.name,
    description: schema.description ?? '',
    schemaType: schema.schemaType,
    scope: schema.scope,
    costSources: [...(schema.costSources ?? [])],
    status: schema.status,
    schemaStartsAt: schema.schemaStartsAt ?? '',
    schemaEndsAt: schema.schemaEndsAt ?? '',
  };
};

const parseIsoTimestamp = (value?: string | null): number => {
  if (!value?.trim()) return Number.NaN;
  return Date.parse(value);
};

export const validateSchemaHeaderDraft = (draft: SchemaHeaderDraft, parentWindow?: SchemaHeaderParentWindow | null): SchemaHeaderValidation => {
  const errors: SchemaHeaderValidation['errors'] = {};
  if (!draft.name.trim()) errors.name = 'Tên hình thức khuyến mãi không được để trống.';
  if (!draft.schemaType) errors.schemaType = 'Vui lòng chọn loại hình khuyến mãi.';
  if (draft.costSources.length === 0) errors.costSources = 'Vui lòng chọn nguồn chi phí.';

  const startMs = parseIsoTimestamp(draft.schemaStartsAt);
  const endMs = parseIsoTimestamp(draft.schemaEndsAt);
  const parentStartMs = parseIsoTimestamp(parentWindow?.startsAt);
  const parentEndMs = parseIsoTimestamp(parentWindow?.endsAt);
  const hasStart = Number.isFinite(startMs);
  const hasEnd = Number.isFinite(endMs);

  if (hasStart && Number.isFinite(parentStartMs) && startMs < parentStartMs) {
    errors.schemaStartsAt = SCHEMA_HEADER_DATE_MESSAGES.START_IN_PARENT;
  } else if (hasStart && Number.isFinite(parentEndMs) && startMs > parentEndMs) {
    errors.schemaStartsAt = SCHEMA_HEADER_DATE_MESSAGES.START_IN_PARENT;
  }

  if (hasEnd && Number.isFinite(parentStartMs) && endMs < parentStartMs) {
    errors.schemaEndsAt = SCHEMA_HEADER_DATE_MESSAGES.END_IN_PARENT;
  } else if (hasEnd && Number.isFinite(parentEndMs) && endMs > parentEndMs) {
    errors.schemaEndsAt = SCHEMA_HEADER_DATE_MESSAGES.END_IN_PARENT;
  }

  if (!errors.schemaEndsAt && hasStart && hasEnd && startMs > endMs) {
    errors.schemaEndsAt = SCHEMA_HEADER_DATE_MESSAGES.END_AFTER_START;
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const getSchemaScopeLabel = (schemaType: PromotionDraftSchemaType): string => {
  if (schemaType === PromotionDraftSchemaType.MARKDOWN) return 'Dòng hàng';
  if (schemaType === PromotionDraftSchemaType.FLAT_PRICE) return 'Dòng hàng';
  if (schemaType === PromotionDraftSchemaType.VOUCHER) return 'Giỏ hàng';
  return '-';
};

export const resolveConditionModeFromSchemaType = (schemaType: PromotionDraftSchemaType | ''): ConditionAuthoringMode | undefined => {
  if (!schemaType) return undefined;
  if (schemaType === PromotionDraftSchemaType.VOUCHER) return ConditionAuthoringMode.EXPLICIT;
  if (schemaType === PromotionDraftSchemaType.MARKDOWN || schemaType === PromotionDraftSchemaType.FLAT_PRICE) {
    return ConditionAuthoringMode.IMPLICIT_ALWAYS;
  }
  return ConditionAuthoringMode.EXPLICIT;
};

export const buildSchemaHeaderCreatePayload = (draft: SchemaHeaderDraft): CreatePromotionDraftSchemaDto => ({
  name: draft.name.trim(),
  description: draft.description.trim() || null,
  schemaType: draft.schemaType as PromotionDraftSchemaType,
  ...(draft.schemaType === PromotionDraftSchemaType.MARKDOWN ? { scope: draft.scope } : {}),
  costSources: [...draft.costSources],
  status: draft.status,
  conditionMode: resolveConditionModeFromSchemaType(draft.schemaType),
  schemaStartsAt: draft.schemaStartsAt || null,
  schemaEndsAt: draft.schemaEndsAt || null,
});

export const buildSchemaHeaderUpdatePayload = (draft: SchemaHeaderDraft): UpdatePromotionDraftSchemaDto => ({
  name: draft.name.trim(),
  description: draft.description.trim() || null,
  costSources: [...draft.costSources],
  status: draft.status,
  conditionMode: resolveConditionModeFromSchemaType(draft.schemaType),
  schemaStartsAt: draft.schemaStartsAt || null,
  schemaEndsAt: draft.schemaEndsAt || null,
});

/** Convert parent/API ISO datetime to TextDateInput stored format. */
export const toSchemaHeaderStoredDateTime = (value?: string | null): string => isoToStoredDateTime(value);

/** Earlier of two TextDateInput stored datetimes (inclusive-friendly bound helper). */
export const resolveEarlierStoredDateTime = (left?: string, right?: string): string | undefined => {
  if (!left) return right || undefined;
  if (!right) return left || undefined;
  const leftDate = parseStoredDateTime(left);
  const rightDate = parseStoredDateTime(right);
  if (!leftDate) return right;
  if (!rightDate) return left;
  return leftDate.isAfter(rightDate) ? right : left;
};

/** Later of two TextDateInput stored datetimes (inclusive-friendly bound helper). */
export const resolveLaterStoredDateTime = (left?: string, right?: string): string | undefined => {
  if (!left) return right || undefined;
  if (!right) return left || undefined;
  const leftDate = parseStoredDateTime(left);
  const rightDate = parseStoredDateTime(right);
  if (!leftDate) return right;
  if (!rightDate) return left;
  return leftDate.isBefore(rightDate) ? right : left;
};
