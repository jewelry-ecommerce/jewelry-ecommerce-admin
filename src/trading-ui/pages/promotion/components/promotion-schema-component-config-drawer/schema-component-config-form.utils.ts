import type {
  PromotionAuthoringSchemaDefinition,
  PromotionDraftBenefitComponentDto,
  PromotionDraftConditionComponentDto,
  PromotionDraftSchemaComponentDto,
  PromotionSchemaComponentAuthoringOption,
} from '../../../../apis/promotion/promotion.entities';
import type { SingleObjectDefinitionV2 } from '../../../../apis/promotion/promotion-authoring-contract.types';
import type { SchemaComponentValidationErrors } from './promotion-schema-component-config-drawer.types';

type AuthoringOptionLike = PromotionSchemaComponentAuthoringOption | SingleObjectDefinitionV2;

const isRecordValue = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** Internal hold TTL injected on save; not shown in authoring UI. */
export const FLAT_PRICE_QUOTA_DEFAULT_HOLD_TTL_SECONDS = 900;

type ObjectAuthoringSchema = Extract<PromotionAuthoringSchemaDefinition, { type: 'object' }>;

const isObjectAuthoringSchema = (schema: PromotionAuthoringSchemaDefinition): schema is ObjectAuthoringSchema => schema.type === 'object';

const isMeaningfulAuthoringValue = (value: unknown): boolean => {
  if (value === undefined || value === null || value === '') return false;
  if (isRecordValue(value)) {
    return Object.values(value).some((nested) => isMeaningfulAuthoringValue(nested));
  }
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Merge saved/current values over schema defaults.
 * Empty / undefined / "" from stale state must not wipe schema defaults.
 */
export const mergeMeaningfulAuthoringValues = (defaults: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    if (!isMeaningfulAuthoringValue(value)) continue;
    if (isRecordValue(value) && isRecordValue(result[key])) {
      result[key] = mergeMeaningfulAuthoringValues(result[key] as Record<string, unknown>, value);
      continue;
    }
    result[key] = value;
  }
  return result;
};

/**
 * Keep only keys declared in the selected option config schema (and nested object schemas).
 * Strips stale fields left over when switching benefit config types.
 */
export const pickValuesByConfigSchema = (schema: PromotionAuthoringSchemaDefinition, values: Record<string, unknown>): Record<string, unknown> => {
  if (!isObjectAuthoringSchema(schema)) return {};
  const properties = schema.properties ?? {};
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(properties)) {
    if (!Object.prototype.hasOwnProperty.call(values, key)) continue;
    const fieldSchema = properties[key];
    const value = values[key];
    if (isObjectAuthoringSchema(fieldSchema)) {
      result[key] = sanitizeNestedObjectBySchema(value, fieldSchema);
      continue;
    }
    result[key] = value;
  }

  return result;
};

const sanitizeNestedObjectBySchema = (value: unknown, fieldSchema: ObjectAuthoringSchema): Record<string, unknown> => {
  if (typeof value === 'number' && fieldSchema.properties?.totalLimit) {
    return { totalLimit: value };
  }
  if (!isRecordValue(value)) {
    return {};
  }
  return pickValuesByConfigSchema(fieldSchema, value);
};

/**
 * quotaPolicyId / holdTtlSeconds are internal (hidden from configSchema) but required in save payload.
 */
const injectQuotaPolicyInternalsForSave = (schema: PromotionAuthoringSchemaDefinition, values: Record<string, unknown>, context?: { schemaId?: string }): Record<string, unknown> => {
  if (!isObjectAuthoringSchema(schema) || !schema.properties?.quotaPolicy) {
    return values;
  }

  const existing = isRecordValue(values.quotaPolicy) ? values.quotaPolicy : {};
  const schemaId = context?.schemaId?.trim();
  const nextQuota: Record<string, unknown> = { ...existing };

  if (schemaId) {
    nextQuota.quotaPolicyId = schemaId;
  }
  if (nextQuota.holdTtlSeconds === undefined || nextQuota.holdTtlSeconds === null || nextQuota.holdTtlSeconds === '') {
    nextQuota.holdTtlSeconds = FLAT_PRICE_QUOTA_DEFAULT_HOLD_TTL_SECONDS;
  }

  return {
    ...values,
    quotaPolicy: nextQuota,
  };
};

export const normalizeAuthoringValuesForDisplay = (option: Pick<PromotionSchemaComponentAuthoringOption, 'configType' | 'configSchema'>, values: Record<string, unknown>): Record<string, unknown> =>
  pickValuesByConfigSchema(option.configSchema, values);

export const normalizeAuthoringValuesForSave = (
  option: Pick<PromotionSchemaComponentAuthoringOption, 'configType' | 'configSchema'>,
  values: Record<string, unknown>,
  context?: { schemaId?: string },
): Record<string, unknown> => {
  const picked = pickValuesByConfigSchema(option.configSchema, values);
  return injectQuotaPolicyInternalsForSave(option.configSchema, picked, context);
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object';

/** Prefer API `message` + optional `detail` (axios interceptor rejects with response.data). */
export const getAuthoringSaveErrorMessage = (error: unknown, fallback: string): string => {
  const message = (isRecord(error) && typeof error.message === 'string' && error.message.trim()) || (error instanceof Error ? error.message : '') || fallback;
  const detail = isRecord(error) && typeof error.detail === 'string' ? error.detail.trim() : '';
  if (!detail || detail === message) return message;
  return `${message}\nChi tiết: ${detail}`;
};

export const getOptionTitle = (option: AuthoringOptionLike): string => option.title ?? option.configSchema.title ?? option.configType;

export const getDefaultValuesFromOption = (option: AuthoringOptionLike): Record<string, unknown> => {
  if ('defaultValues' in option && option.defaultValues && Object.keys(option.defaultValues).length > 0) {
    return { ...option.defaultValues };
  }
  return {};
};

const getEnumFallback = (schema: PromotionAuthoringSchemaDefinition): unknown => {
  if (schema.type !== 'string' && schema.type !== 'number') return undefined;
  if (!schema.enum?.length) return undefined;
  return schema.enum[0];
};

export const getFormValueFromSchema = (schema: PromotionAuthoringSchemaDefinition): unknown => {
  if (schema.default !== undefined) return schema.default;
  if (schema.type === 'object') return getObjectDefaults(schema);
  if (schema.type === 'string') {
    const enumFallback = getEnumFallback(schema);
    return enumFallback !== undefined ? enumFallback : '';
  }
  if (schema.type === 'number') {
    const enumFallback = getEnumFallback(schema);
    return enumFallback !== undefined ? enumFallback : undefined;
  }
  if (schema.type === 'boolean') return false;
  if (schema.type === 'array') return [];
  return undefined;
};

const getObjectDefaults = (schema: ObjectAuthoringSchema) => {
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(schema.properties ?? {})) {
    result[key] = getFormValueFromSchema(child);
  }
  return result;
};

/** Fill empty holes in form state with schema defaults / first enum values. */
export const applySchemaDefaultsToFormValues = (schema: PromotionAuthoringSchemaDefinition, values: Record<string, unknown>): Record<string, unknown> => {
  const defaults = getFormValueFromSchema(schema);
  if (!isRecordValue(defaults)) return values;
  return mergeMeaningfulAuthoringValues(defaults, values);
};

export const getSavedConfigType = (savedComponent: PromotionDraftSchemaComponentDto | null | undefined): string | null => {
  if (!savedComponent || !isRecordValue(savedComponent.config)) return null;
  return typeof savedComponent.config.type === 'string' ? savedComponent.config.type : null;
};

export const resolveFormValues = (
  option: Pick<PromotionSchemaComponentAuthoringOption, 'configType' | 'configSchema'>,
  savedComponent: PromotionDraftSchemaComponentDto | null | undefined,
  defaultValues: Record<string, unknown>,
): Record<string, unknown> => {
  if (!savedComponent || !isRecordValue(savedComponent.authoringValues)) {
    return applySchemaDefaultsToFormValues(option.configSchema, defaultValues);
  }
  const merged = mergeMeaningfulAuthoringValues(defaultValues, savedComponent.authoringValues);
  return normalizeAuthoringValuesForDisplay(option, applySchemaDefaultsToFormValues(option.configSchema, merged));
};

export const buildInitialValues = (option: AuthoringOptionLike): Record<string, unknown> => {
  const defaultVals = getDefaultValuesFromOption(option);
  const schemaVals = getFormValueFromSchema(option.configSchema);
  const merged = isRecordValue(schemaVals) ? mergeMeaningfulAuthoringValues(schemaVals, defaultVals) : defaultVals;
  return normalizeAuthoringValuesForDisplay(option, applySchemaDefaultsToFormValues(option.configSchema, merged));
};

export const hasNoUserFields = (schema: PromotionAuthoringSchemaDefinition): boolean => {
  if (schema.type !== 'object') return false;
  return !schema.properties || Object.keys(schema.properties).length === 0;
};

const validatePrimitiveValue = (value: unknown, fieldSchema: PromotionAuthoringSchemaDefinition, fieldTitle: string): string | null => {
  if (fieldSchema.type === 'number') return validateNumberValue(value, fieldSchema, fieldTitle);
  if (fieldSchema.type === 'string') {
    if (typeof value !== 'string') return `${fieldTitle} phải là chuỗi.`;
    if (fieldSchema.minLength !== undefined && value.length < fieldSchema.minLength) {
      return `${fieldTitle} tối thiểu ${fieldSchema.minLength} ký tự.`;
    }
    if (fieldSchema.maxLength !== undefined && value.length > fieldSchema.maxLength) {
      return `${fieldTitle} tối đa ${fieldSchema.maxLength} ký tự.`;
    }
    if (fieldSchema.pattern) {
      try {
        if (!new RegExp(fieldSchema.pattern).test(value)) {
          return `${fieldTitle} không đúng định dạng.`;
        }
      } catch {
        // ignore invalid pattern from schema
      }
    }
    if (fieldSchema.enum?.length && !fieldSchema.enum.includes(value)) {
      return `${fieldTitle} phải là một trong các giá trị cho phép.`;
    }
    return null;
  }
  if (fieldSchema.type === 'boolean') {
    if (typeof value !== 'boolean') return `${fieldTitle} phải là boolean.`;
    return null;
  }
  if (fieldSchema.type === 'array') return validateArrayValue(value, fieldSchema, fieldTitle);
  return null;
};

const validateNumberValue = (value: unknown, fieldSchema: Extract<PromotionAuthoringSchemaDefinition, { type: 'number' }>, fieldTitle: string): string | null => {
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return `${fieldTitle} phải là số.`;
  if (fieldSchema.minimum !== undefined && num < fieldSchema.minimum) {
    return `${fieldTitle} phải lớn hơn hoặc bằng ${fieldSchema.minimum}.`;
  }
  if (fieldSchema.maximum !== undefined && num > fieldSchema.maximum) {
    return `${fieldTitle} phải nhỏ hơn hoặc bằng ${fieldSchema.maximum}.`;
  }
  if (fieldSchema.enum?.length && !fieldSchema.enum.includes(num)) {
    return `${fieldTitle} phải là một trong các giá trị cho phép.`;
  }
  return null;
};

const validateArrayValue = (value: unknown, fieldSchema: Extract<PromotionAuthoringSchemaDefinition, { type: 'array' }>, fieldTitle: string): string | null => {
  if (!Array.isArray(value)) return `${fieldTitle} phải là mảng.`;
  if (fieldSchema.minItems !== undefined && value.length < fieldSchema.minItems) {
    return `${fieldTitle} cần ít nhất ${fieldSchema.minItems} phần tử.`;
  }
  return null;
};

export const validateVisibleValues = (values: Record<string, unknown>, schema: PromotionAuthoringSchemaDefinition): SchemaComponentValidationErrors => {
  const errors: SchemaComponentValidationErrors = {};
  if (schema.type !== 'object') return errors;
  const requiredKeys = new Set(schema.required ?? []);
  for (const [key, fieldSchema] of Object.entries(schema.properties ?? {})) {
    validateField(errors, values, key, fieldSchema, requiredKeys);
  }
  applyObjectAllOfRules(errors, values, schema);
  return errors;
};

const asRecord = (value: unknown): Record<string, unknown> | null => (typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null);

/** Apply JSON-Schema allOf if/then rules used by voucher visibility policy (and similar). */
const applyObjectAllOfRules = (
  errors: SchemaComponentValidationErrors,
  values: Record<string, unknown>,
  schema: Extract<PromotionAuthoringSchemaDefinition, { type: 'object' }>,
  pathPrefix = '',
): void => {
  if (Array.isArray(schema.allOf)) {
    for (const rule of schema.allOf) {
      const ruleObject = asRecord(rule);
      if (!ruleObject) continue;
      const ifSchema = asRecord(ruleObject.if);
      const thenSchema = asRecord(ruleObject.then);
      if (!ifSchema || !thenSchema) continue;
      if (!matchesIfSchema(values, ifSchema)) continue;
      applyThenSchemaConstraints(errors, values, thenSchema, schema, pathPrefix);
    }
  }

  for (const [key, fieldSchema] of Object.entries(schema.properties ?? {})) {
    if (fieldSchema.type !== 'object') continue;
    const nested = asRecord(values[key]);
    if (!nested) continue;
    const nextPrefix = pathPrefix ? `${pathPrefix}.${key}` : key;
    applyObjectAllOfRules(errors, nested, fieldSchema, nextPrefix);
  }
};

const matchesIfSchema = (values: Record<string, unknown>, ifSchema: Record<string, unknown>): boolean => {
  const properties = asRecord(ifSchema.properties);
  if (!properties) return false;
  for (const [key, expectedSchema] of Object.entries(properties)) {
    const expected = asRecord(expectedSchema);
    if (!expected) continue;
    if (Object.prototype.hasOwnProperty.call(expected, 'const') && values[key] !== expected.const) {
      return false;
    }
  }
  return true;
};

const applyThenSchemaConstraints = (
  errors: SchemaComponentValidationErrors,
  values: Record<string, unknown>,
  thenSchema: Record<string, unknown>,
  parentSchema: Extract<PromotionAuthoringSchemaDefinition, { type: 'object' }>,
  pathPrefix: string,
): void => {
  const properties = asRecord(thenSchema.properties);
  if (!properties) return;
  for (const [key, constraint] of Object.entries(properties)) {
    const constraintObject = asRecord(constraint);
    if (!constraintObject) continue;
    const minItems = typeof constraintObject.minItems === 'number' ? constraintObject.minItems : undefined;
    if (minItems === undefined) continue;
    const value = values[key];
    const errorKey = pathPrefix ? `${pathPrefix}.${key}` : key;
    if (!Array.isArray(value) || value.length < minItems) {
      const fieldTitle = parentSchema.properties?.[key]?.title ?? key;
      errors[errorKey] = `${fieldTitle} cần ít nhất ${minItems} phần tử.`;
    }
  }
};

const validateField = (
  errors: SchemaComponentValidationErrors,
  values: Record<string, unknown>,
  key: string,
  fieldSchema: PromotionAuthoringSchemaDefinition,
  requiredKeys: ReadonlySet<string>,
): void => {
  const value = values[key];
  const fieldTitle = fieldSchema.title ?? key;
  if (requiredKeys.has(key) && (value === undefined || value === null || value === '')) {
    errors[key] = `${fieldTitle} là bắt buộc.`;
    return;
  }
  if (value === undefined || value === null || value === '') return;
  const fieldError = validatePrimitiveValue(value, fieldSchema, fieldTitle);
  if (fieldError) errors[key] = fieldError;
  collectNestedErrors(errors, key, value, fieldSchema);
};

const collectNestedErrors = (errors: SchemaComponentValidationErrors, key: string, value: unknown, fieldSchema: PromotionAuthoringSchemaDefinition): void => {
  if (fieldSchema.type === 'object' && isRecordValue(value)) {
    for (const [nestedKey, nestedError] of Object.entries(validateVisibleValues(value, fieldSchema))) {
      errors[`${key}.${nestedKey}`] = nestedError;
    }
  }
  if (fieldSchema.type === 'array' && Array.isArray(value) && fieldSchema.items) {
    collectArrayItemErrors(errors, key, value, fieldSchema.items);
  }
};

const collectArrayItemErrors = (errors: SchemaComponentValidationErrors, key: string, items: unknown[], itemSchema: PromotionAuthoringSchemaDefinition): void => {
  items.forEach((item, index) => {
    if (itemSchema.type === 'object') {
      if (!isRecordValue(item)) return;
      for (const [nestedKey, nestedError] of Object.entries(validateVisibleValues(item, itemSchema))) {
        errors[`${key}[${index}].${nestedKey}`] = nestedError;
      }
      return;
    }

    const itemError = validatePrimitiveValue(item, itemSchema, itemSchema.title ?? `${key}[${index}]`);
    if (itemError) {
      errors[`${key}[${index}]`] = itemError;
    }
  });
};

export const getInitialAuthoringState = (
  options: readonly AuthoringOptionLike[],
  initialComponent: PromotionDraftConditionComponentDto | PromotionDraftBenefitComponentDto | null | undefined,
): {
  selectedOptionIndex: number;
  formValues: Record<string, unknown>;
} => {
  if (options.length === 0) return { selectedOptionIndex: -1, formValues: {} };
  const savedType = getSavedConfigType(initialComponent);
  const initialOptionIndex = savedType ? options.findIndex((option) => option.configType === savedType) : 0;
  const nextOptionIndex = initialOptionIndex >= 0 ? initialOptionIndex : 0;
  const option = options[nextOptionIndex];
  const defaultValues = buildInitialValues(option);
  return {
    selectedOptionIndex: nextOptionIndex,
    formValues: initialComponent ? resolveFormValues(option, initialComponent, defaultValues) : defaultValues,
  };
};
