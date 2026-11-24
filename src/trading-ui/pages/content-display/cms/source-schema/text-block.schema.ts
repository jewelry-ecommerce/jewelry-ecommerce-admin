import type { CmsBlockSchemaDefinition } from '@/trading-ui/apis/cms/cms-schema-definition.interface';

/** Khối Văn Bản — khớp trading-fe CmsTextBlock (title + content HTML). */
export const TEXT_BLOCK_SCHEMA: CmsBlockSchemaDefinition = {
  type: 'object',
  required: ['content'],
  properties: {
    title: {
      type: 'string',
      title: 'Tiêu đề',
    },
    content: {
      type: 'string',
      title: 'Nội dung',
      format: 'richtext',
    },
  },
  'x-propertyOrder': ['title', 'content'],
};
