import type {
  CmsBlockArraySchemaDefinition,
  CmsBlockObjectSchemaDefinition,
  CmsBlockSchemaDefinition,
  CmsBlockSchemaEnumValue,
  CmsBlockStringSchemaDefinition,
} from '../../../../apis/cms/cms-schema-definition.interface';
import { getResolvedCmsMediaItemType, isCmsMediaTypeItemObjectSchema, shouldSkipRequiredForCmsMediaItem, shouldShowCmsMediaItemProperty } from './cms-schema-media-item.utils';
import { isCmsRichTextHtmlEmpty, isCmsRichTextStringSchema } from './cms-schema-rich-text-field.utils';

export type CmsBlockSchemaPath = Array<string | number>;
export type CmsBlockSchemaValidationErrors = Record<string, string>;

const SUPPORTED_SCHEMA_TYPES = new Set(['object', 'string', 'number', 'boolean', 'array']);

const isPlainObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const cloneValue = <T>(value: T): T => {
  if (value === undefined) return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
};

export const joinSchemaPath = (path: CmsBlockSchemaPath): string => path.map(String).join('.');

/** Nhãn tiếng Việt cho tên thuộc tính schema (camelCase) khi schema không khai báo `title`. */
const CMS_SCHEMA_PROPERTY_LABEL_VI: Record<string, string> = {
  schemadefinition: 'Cấu hình khối',
  placementcode: 'Mã vị trí hiển thị',
  layoutstyle: 'Kiểu bố cục',
  actiontarget: 'Liên kết đích',
  mediatype: 'Loại nội dung',
  mediaurl: 'Đường dẫn tệp',
  mediamobileurl: 'Đường dẫn tệp (điện thoại)',
  item: 'Phần tử',
  items: 'Phần tử mảng',
};

export const getSchemaPathLabel = (path: CmsBlockSchemaPath): string => path.map((segment) => (typeof segment === 'number' ? `#${segment + 1}` : humanizeSchemaKey(segment))).join(' / ');

export const humanizeSchemaKey = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  const mapped = CMS_SCHEMA_PROPERTY_LABEL_VI[normalized];
  if (mapped) return mapped;
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());
};

export const getSchemaNodeLabel = (schema: CmsBlockSchemaDefinition | undefined, fallback?: string): string => schema?.title?.trim() || (fallback ? humanizeSchemaKey(fallback) : 'Trường');

export const isCmsBlockSchemaDefinition = (value: unknown): value is CmsBlockSchemaDefinition => {
  if (!isPlainObject(value)) return false;
  const type = value.type;
  if (typeof type !== 'string' || !SUPPORTED_SCHEMA_TYPES.has(type)) return false;

  if ('enum' in value && value.enum !== undefined && !Array.isArray(value.enum)) return false;
  if ('enumNames' in value && value.enumNames !== undefined && !Array.isArray(value.enumNames)) return false;
  if ('required' in value && value.required !== undefined && !Array.isArray(value.required)) return false;

  if (type === 'object') {
    if ('properties' in value && value.properties !== undefined) {
      if (!isPlainObject(value.properties)) return false;
      for (const child of Object.values(value.properties)) {
        if (!isCmsBlockSchemaDefinition(child)) return false;
      }
    }
    return true;
  }

  if (type === 'array') {
    if ('items' in value && value.items !== undefined && !isCmsBlockSchemaDefinition(value.items)) return false;
    return true;
  }

  return true;
};

export const normalizeCmsBlockSchemaDefinition = (value: unknown): CmsBlockSchemaDefinition | null => {
  if (value == null) return null;
  return isCmsBlockSchemaDefinition(value) ? value : null;
};

const createDefaultArrayItem = (schema: CmsBlockSchemaDefinition | undefined): unknown => {
  if (!schema) return {};
  const next = getDefaultValueForSchema(schema);
  if (next !== undefined) return next;
  if (schema.type === 'object') return {};
  if (schema.type === 'array') return [];
  return undefined;
};

const shouldIncludeObjectProperty = (key: string, childSchema: CmsBlockSchemaDefinition, childDefault: unknown, requiredKeys: Set<string>): boolean => {
  if (childDefault !== undefined) return true;
  if (requiredKeys.has(key)) return true;
  if (childSchema.type === 'object') return true;
  if (childSchema.type === 'array' && (childSchema.minItems ?? 0) > 0) return true;
  return false;
};

export const getDefaultValueForSchema = (schema: CmsBlockSchemaDefinition): unknown => {
  if (schema.default !== undefined) return cloneValue(schema.default);

  if (schema.type === 'object') {
    const properties = schema.properties ?? {};
    const requiredKeys = new Set(schema.required ?? []);
    const output: Record<string, unknown> = {};

    for (const [key, childSchema] of Object.entries(properties)) {
      const childDefault = getDefaultValueForSchema(childSchema);
      if (!shouldIncludeObjectProperty(key, childSchema, childDefault, requiredKeys)) continue;
      if (childDefault !== undefined) {
        output[key] = childDefault;
        continue;
      }
      output[key] = childSchema.type === 'array' ? [] : {};
    }

    return output;
  }

  if (schema.type === 'array') {
    const minItems = schema.minItems ?? 0;
    if (minItems <= 0) return [];
    return Array.from({ length: minItems }, () => cloneValue(createDefaultArrayItem(schema.items)));
  }

  return undefined;
};

export const createInitialBlockConfig = (schema: CmsBlockSchemaDefinition | null | undefined): Record<string, unknown> => {
  if (!schema || schema.type !== 'object') return {};
  const next = getDefaultValueForSchema(schema);
  return isPlainObject(next) ? next : {};
};

export const getSchemaValueAtPath = (root: unknown, path: CmsBlockSchemaPath): unknown => {
  let current: unknown = root;

  for (const segment of path) {
    if (typeof segment === 'number') {
      if (!Array.isArray(current)) return undefined;
      current = current[segment];
      continue;
    }

    if (!isPlainObject(current)) return undefined;
    current = current[segment];
  }

  return current;
};

const cloneContainerForPath = (value: unknown, nextSegment: string | number): Record<string, unknown> | unknown[] => {
  if (typeof nextSegment === 'number') {
    return Array.isArray(value) ? [...value] : [];
  }
  return isPlainObject(value) ? { ...value } : {};
};

export const setSchemaValueAtPath = (root: unknown, path: CmsBlockSchemaPath, nextValue: unknown): unknown => {
  if (path.length === 0) return nextValue;

  const [currentSegment, ...remainingPath] = path;
  const container = cloneContainerForPath(root, currentSegment);

  if (typeof currentSegment === 'number') {
    const arrayContainer = Array.isArray(container) ? [...container] : [];
    arrayContainer[currentSegment] = remainingPath.length === 0 ? nextValue : setSchemaValueAtPath(arrayContainer[currentSegment], remainingPath, nextValue);
    return arrayContainer;
  }

  const objectContainer = isPlainObject(container) ? { ...container } : {};
  objectContainer[currentSegment] = remainingPath.length === 0 ? nextValue : setSchemaValueAtPath(objectContainer[currentSegment], remainingPath, nextValue);
  return objectContainer;
};

const buildEnumError = (allowedValues: CmsBlockSchemaEnumValue[]): string => `Giá trị không hợp lệ. Cho phép: ${allowedValues.join(', ')}`;

const isRequiredValuePresent = (schema: CmsBlockSchemaDefinition | undefined, value: unknown): boolean => {
  if (!schema) return value !== undefined && value !== null;

  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') return false;
      if (isCmsRichTextStringSchema(schema as CmsBlockStringSchemaDefinition)) {
        return !isCmsRichTextHtmlEmpty(value);
      }
      return value.trim().length > 0;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return isPlainObject(value);
    default:
      return value !== undefined && value !== null;
  }
};

const validatePrimitiveValue = (schema: CmsBlockSchemaDefinition, value: unknown, path: CmsBlockSchemaPath): CmsBlockSchemaValidationErrors => {
  const pathKey = joinSchemaPath(path);
  const errors: CmsBlockSchemaValidationErrors = {};

  if (value === undefined || value === null || value === '') return errors;

  if (schema.type === 'string') {
    if (typeof value !== 'string') {
      errors[pathKey] = 'Giá trị phải là chuỗi';
      return errors;
    }
    if (schema.enum && !schema.enum.includes(value)) {
      errors[pathKey] = buildEnumError(schema.enum);
    }
    return errors;
  }

  if (schema.type === 'number') {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      errors[pathKey] = 'Giá trị phải là số';
      return errors;
    }
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors[pathKey] = `Giá trị phải lớn hơn hoặc bằng ${schema.minimum}`;
      return errors;
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors[pathKey] = `Giá trị phải nhỏ hơn hoặc bằng ${schema.maximum}`;
      return errors;
    }
    if (schema.enum && !schema.enum.includes(value)) {
      errors[pathKey] = buildEnumError(schema.enum);
    }
    return errors;
  }

  if (schema.type === 'boolean' && typeof value !== 'boolean') {
    errors[pathKey] = 'Giá trị phải là đúng hoặc sai';
  }

  return errors;
};

const validateObjectSchema = (schema: CmsBlockObjectSchemaDefinition, value: unknown, path: CmsBlockSchemaPath): CmsBlockSchemaValidationErrors => {
  const errors: CmsBlockSchemaValidationErrors = {};
  const objectValue = isPlainObject(value) ? value : {};
  const properties = schema.properties ?? {};
  const isMediaItem = isCmsMediaTypeItemObjectSchema(schema);
  const mediaType = isMediaItem ? getResolvedCmsMediaItemType(objectValue, schema) : null;

  for (const requiredKey of schema.required ?? []) {
    if (isMediaItem && mediaType && shouldSkipRequiredForCmsMediaItem(requiredKey, mediaType)) continue;
    const childSchema = properties[requiredKey];
    const childValue = objectValue[requiredKey];
    if (isRequiredValuePresent(childSchema, childValue)) continue;
    const pathKey = joinSchemaPath([...path, requiredKey]);
    errors[pathKey] = `${getSchemaNodeLabel(childSchema, requiredKey)} là bắt buộc`;
  }

  if (isMediaItem && mediaType === 'VIDEO') {
    const videoUrl = objectValue.videoUrl;
    if (videoUrl === undefined || videoUrl === null || String(videoUrl).trim() === '') {
      errors[joinSchemaPath([...path, 'videoUrl'])] = 'Vui lòng nhập đường dẫn video';
    }
    const thumb = objectValue.thumbnailUrl;
    if (thumb === undefined || thumb === null || String(thumb).trim() === '') {
      errors[joinSchemaPath([...path, 'thumbnailUrl'])] = 'Vui lòng tải ảnh thumbnail cho video';
    }
  }

  for (const [key, childSchema] of Object.entries(properties)) {
    if (isMediaItem && mediaType && !shouldShowCmsMediaItemProperty(key, mediaType)) continue;
    Object.assign(errors, validateBlockConfigBySchema(childSchema, objectValue[key], [...path, key]));
  }

  return errors;
};

const validateArraySchema = (schema: CmsBlockArraySchemaDefinition, value: unknown, path: CmsBlockSchemaPath): CmsBlockSchemaValidationErrors => {
  const errors: CmsBlockSchemaValidationErrors = {};
  const pathKey = joinSchemaPath(path);
  const items = Array.isArray(value) ? value : [];

  if (schema.minItems !== undefined && items.length < schema.minItems) {
    errors[pathKey] = `${getSchemaNodeLabel(schema, path.at(-1)?.toString())} cần tối thiểu ${schema.minItems} phần tử`;
  }

  if (schema.maxItems !== undefined && items.length > schema.maxItems) {
    errors[pathKey] = `${getSchemaNodeLabel(schema, path.at(-1)?.toString())} chỉ được tối đa ${schema.maxItems} phần tử`;
  }

  if (!schema.items) return errors;

  items.forEach((item, index) => {
    Object.assign(errors, validateBlockConfigBySchema(schema.items!, item, [...path, index]));
  });

  return errors;
};

export const validateBlockConfigBySchema = (schema: CmsBlockSchemaDefinition | null | undefined, value: unknown, path: CmsBlockSchemaPath = []): CmsBlockSchemaValidationErrors => {
  if (!schema) return {};

  if (schema.type === 'object') {
    return validateObjectSchema(schema, value, path);
  }

  if (schema.type === 'array') {
    return validateArraySchema(schema, value, path);
  }

  return validatePrimitiveValue(schema, value, path);
};
