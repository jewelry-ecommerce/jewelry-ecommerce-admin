import type { CmsBlockSchemaDefinition } from '@/trading-ui/apis/cms/cms-schema-definition.interface';

/** Nội dung mô tả trang — title + rich text (CKEditor). */
export const PRODUCT_EXPANDABLE_DESCRIPTION_SCHEMA: CmsBlockSchemaDefinition = {
  type: 'object',
  required: ['title', 'description'],
  properties: {
    title: {
      type: 'string',
      title: 'Tiêu đề',
    },
    description: {
      type: 'string',
      title: 'Nội dung mô tả',
      format: 'richtext',
    },
    maxCollapsedLines: {
      type: 'number',
      title: 'Số dòng khi thu gọn',
      default: 3,
      minimum: 1,
    },
  },
  'x-propertyOrder': ['title', 'description', 'maxCollapsedLines'],
};
