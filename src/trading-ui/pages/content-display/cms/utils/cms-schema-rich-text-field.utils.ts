import type { CmsBlockSchemaDefinition, CmsBlockStringSchemaDefinition } from '../../../../apis/cms/cms-schema-definition.interface';

export function isCmsRichTextHtmlEmpty(value: string): boolean {
  const text = value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return text.length === 0;
}

export function isCmsRichTextStringSchema(schema: CmsBlockStringSchemaDefinition): boolean {
  if (schema.format === 'html') return true;

  // PRODUCT_EXPANDABLE_DESCRIPTION.description — FE render HTML; schema chưa gắn format:html.
  const title = (schema.title ?? '').toLowerCase();
  if (title.includes('nội dung mô tả')) return true;

  return false;
}

/** Chỉ opt-in rich text: format html hoặc title "Nội dung mô tả". Không heuristic theo key `description`. */
export function isCmsSchemaRichTextStringField(schema: CmsBlockSchemaDefinition): schema is CmsBlockStringSchemaDefinition {
  if (schema.type !== 'string') return false;
  const str = schema as CmsBlockStringSchemaDefinition;
  if (str.enum && str.enum.length > 0) return false;
  return isCmsRichTextStringSchema(str);
}
