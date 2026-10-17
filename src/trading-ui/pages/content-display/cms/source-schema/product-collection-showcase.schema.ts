import type { CmsBlockSchemaDefinition } from '@/trading-ui/apis/cms/cms-schema-definition.interface';
export const PRODUCT_COLLECTION_SHOWCASE_SCHEMA: CmsBlockSchemaDefinition = {
  type: 'object',
  required: ['header', 'items'],
  properties: {
    header: {
      type: 'object',
      title: 'Tiêu đề khối',
      required: ['title'],
      properties: {
        title: {
          type: 'string',
          title: 'Tiêu đề chính',
        },
        subtitle: {
          type: 'string',
          title: 'Tiêu đề phụ',
        },
      },
      'x-propertyOrder': ['title', 'subtitle'],
    },
    items: {
      type: 'array',
      title: 'Danh sách thẻ collection',
      minItems: 1,
      maxItems: 3,
      items: {
        type: 'object',
        required: ['title', 'imageUrl'],
        properties: {
          title: {
            type: 'string',
            title: 'Tiêu đề thẻ',
          },
          imageUrl: {
            type: 'string',
            title: 'Đường dẫn hình ảnh',
          },
          actionUrl: {
            type: 'string',
            title: 'Đường dẫn khi click',
          },
        },
        'x-propertyOrder': ['title', 'imageUrl', 'actionUrl'],
      },
    },
  },
  'x-propertyOrder': ['header', 'items'],
};

