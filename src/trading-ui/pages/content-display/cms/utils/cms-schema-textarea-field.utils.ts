import type { CmsBlockSchemaDefinition, CmsBlockStringSchemaDefinition } from '../../../../apis/cms/cms-schema-definition.interface';

export const CMS_SCHEMA_TEXTAREA_MIN_ROWS = 8;

const normalizeKey = (key: string) => key.toLowerCase().replace(/[_-]/g, '');

export function isCmsSchemaTextareaStringField(schema: CmsBlockSchemaDefinition, propertyKey: string | undefined): schema is CmsBlockStringSchemaDefinition {
  if (schema.type !== 'string') return false;

  const str = schema as CmsBlockStringSchemaDefinition;
  if (str.enum && str.enum.length > 0) return false;
  if (str.format === 'textarea' || str.format === 'json') return true;

  const key = normalizeKey(propertyKey ?? '');
  return key === 'jsoncontent' || key.endsWith('json');
}
