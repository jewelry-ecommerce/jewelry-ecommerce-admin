import type { CmsBlockSchemaDefinition } from '@/trading-ui/apis/cms/cms-schema-definition.interface';
export const PRODUCT_CATEGORY_NAV_SCHEMA: CmsBlockSchemaDefinition = {
  type: 'object',
  properties: {
    display: {
      type: 'object',
      title: 'Cai dat hien thi',
      properties: {
        limit: {
          type: 'number',
          title: 'So danh muc toi da (0 = khong gioi han)',
          default: 0,
          minimum: 0,
        },
      },
    },
  },
};

