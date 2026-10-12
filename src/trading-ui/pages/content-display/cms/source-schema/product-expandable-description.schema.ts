import type { CmsBlockSchemaDefinition } from '@/trading-ui/apis/cms/cms-schema-definition.interface';
export const PRODUCT_EXPANDABLE_DESCRIPTION_SCHEMA: CmsBlockSchemaDefinition = {
  type: 'object',
  required: ['title', 'description'],
  properties: {
    title: {
      type: 'string',
      title: 'Tieu de',
    },
    description: {
      type: 'string',
      title: 'Noi dung mo ta',
    },
    maxCollapsedLines: {
      type: 'number',
      title: 'So dong khi thu gon',
      default: 3,
      minimum: 1,
    },
  },
};
