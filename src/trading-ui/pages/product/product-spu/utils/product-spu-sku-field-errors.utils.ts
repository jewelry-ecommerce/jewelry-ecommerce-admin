import { MIN_AFTER_TAX_PRICE_VND } from '../product-spu.constant';

export type ProductSpuSkuLeafFieldErrors = {
  skuCode?: string;
  costPriceAfterTaxMinor?: string;
  compareAtPriceAfterTaxMinor?: string;
  sellingPriceAfterTaxMinor?: string;
};

const LEAF_ERROR_FIELD_KEYS = ['skuCode', 'costPriceAfterTaxMinor', 'compareAtPriceAfterTaxMinor', 'sellingPriceAfterTaxMinor'] as const;

type LeafErrorFieldKey = (typeof LEAF_ERROR_FIELD_KEYS)[number];

const MIN_PRICE_LABEL = MIN_AFTER_TAX_PRICE_VND.toLocaleString('vi-VN');

const FIELD_EMPTY_MESSAGE: Record<LeafErrorFieldKey, string> = {
  skuCode: 'Mã biến thể không được để trống',
  costPriceAfterTaxMinor: `Giá nhập sau thuế phải từ ${MIN_PRICE_LABEL} trở lên`,
  compareAtPriceAfterTaxMinor: 'Giá gạch không được để trống',
  sellingPriceAfterTaxMinor: 'Giá bán không được để trống',
};

const FIELD_MIN_MESSAGE: Partial<Record<LeafErrorFieldKey, string>> = {
  costPriceAfterTaxMinor: `Giá nhập sau thuế phải từ ${MIN_PRICE_LABEL} trở lên`,
  compareAtPriceAfterTaxMinor: `Giá gạch phải từ ${MIN_PRICE_LABEL} trở lên`,
  sellingPriceAfterTaxMinor: `Giá bán phải từ ${MIN_PRICE_LABEL} trở lên`,
};

const SKU_FIELD_PATH_RE = /^skus(?:\.upsert)?\.(\d+)\.([A-Za-z0-9_]+)\b/;

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object';

const readFieldMessage = (rowErr: Record<string, unknown>, key: LeafErrorFieldKey): string | undefined => {
  const field = rowErr[key];
  if (!isRecord(field)) return undefined;
  const message = field.message;
  return typeof message === 'string' && message.trim() ? message.trim() : undefined;
};

/** Map RHF `errors.skus` / `errors.skus.upsert` row array → leaf matrix field errors. */
export const mapRhfSkuRowErrorsToLeafFieldErrors = (rowErrors: unknown): readonly (ProductSpuSkuLeafFieldErrors | undefined)[] | undefined => {
  if (!Array.isArray(rowErrors)) return undefined;
  return rowErrors.map((rowErr) => {
    if (!isRecord(rowErr)) return undefined;
    const next: ProductSpuSkuLeafFieldErrors = {};
    for (const key of LEAF_ERROR_FIELD_KEYS) {
      const message = readFieldMessage(rowErr, key);
      if (message) next[key] = message;
    }
    return Object.keys(next).length > 0 ? next : undefined;
  });
};

const collectApiMessages = (error: unknown): string[] => {
  if (!isRecord(error)) return [];
  const raw = error.message;
  if (typeof raw === 'string' && raw.trim()) return [raw.trim()];
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim());
  }
  return [];
};

const isLeafErrorFieldKey = (field: string): field is LeafErrorFieldKey => (LEAF_ERROR_FIELD_KEYS as readonly string[]).includes(field);

const vietnameseMessageForSkuConstraint = (field: LeafErrorFieldKey, englishMessage: string): string => {
  if (/should not be empty|must be a string|is required/i.test(englishMessage)) {
    return FIELD_EMPTY_MESSAGE[field];
  }
  if (/must not be less than|must be a number|min/i.test(englishMessage)) {
    return FIELD_MIN_MESSAGE[field] ?? FIELD_EMPTY_MESSAGE[field];
  }
  return FIELD_EMPTY_MESSAGE[field];
};

export type ProductSpuSkuApiFieldError = {
  formPath: string;
  message: string;
};

/** Parse Nest/class-validator path messages like `skus.0.skuCode should not be empty`. */
export const mapProductSkuApiValidationErrors = (error: unknown, formMode: 'create' | 'update'): ProductSpuSkuApiFieldError[] => {
  const messages = collectApiMessages(error);
  const mapped: ProductSpuSkuApiFieldError[] = [];

  for (const message of messages) {
    const match = SKU_FIELD_PATH_RE.exec(message);
    if (!match) continue;
    const index = match[1];
    const field = match[2];
    if (!isLeafErrorFieldKey(field)) continue;
    const formPath = formMode === 'create' ? `skus.${index}.${field}` : `skus.upsert.${index}.${field}`;
    mapped.push({
      formPath,
      message: vietnameseMessageForSkuConstraint(field, message),
    });
  }

  return mapped;
};

/** True when every API message is a mappable `skus[.upsert].N.field` constraint. */
export const isOnlyProductSkuApiFieldValidationError = (error: unknown): boolean => {
  const messages = collectApiMessages(error);
  if (messages.length === 0) return false;
  return messages.every((message) => {
    const match = SKU_FIELD_PATH_RE.exec(message);
    return Boolean(match && isLeafErrorFieldKey(match[2]));
  });
};
