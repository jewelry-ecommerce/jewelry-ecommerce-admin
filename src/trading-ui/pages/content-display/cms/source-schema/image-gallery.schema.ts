import type { CmsBlockSchemaDefinition } from '@/trading-ui/apis/cms/cms-schema-definition.interface';
export const IMAGE_GALLERY_SCHEMA: CmsBlockSchemaDefinition = {
  type: 'object',
  properties: {
    header: {
      type: 'object',
      title: 'Tiêu đề khối',
      properties: {
        title: {
          type: 'string',
          title: 'Tiêu đề chính',
          description: 'Ví dụ: TITLE',
        },
        subtitle: {
          type: 'string',
          title: 'Tiêu đề phụ',
          description: 'Ví dụ: SUBTITLE',
        },
      },
      required: ['title'],
    },
    display: {
      type: 'object',
      title: 'Cài đặt hiển thị',
      properties: {
        layoutStyle: {
          type: 'string',
          title: 'Kiểu hiển thị',
          enum: ['GRID', 'CAROUSEL'],
          enumNames: ['Dạng lưới (Grid)', 'Dạng trượt ngang (Carousel)'],
          default: 'CAROUSEL',
        },
      },
    },
    items: {
      type: 'array',
      title: 'Danh sách hình ảnh',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          imageUrl: {
            type: 'string',
            title: 'Đường dẫn hình ảnh',
          },
          label: {
            type: 'string',
            title: 'Văn bản hiển thị trên ảnh',
            description: 'Ví dụ: @POSTHUMAN.LAB',
          },
          actionType: {
            type: 'string',
            title: 'Luồng điều hướng khi click',
            enum: ['LINK_URL', 'MIX_MATCH'],
            enumNames: ['Gắn Link URL', 'Mix & Match'],
            default: 'LINK_URL',
          },
          actionUrl: {
            type: 'string',
            title: 'URL khi click vào ảnh',
          },
          mixMatchSkus: {
            type: 'array',
            title: 'Danh sách variation ID cho Mix & Match (chỉ tham chiếu, không lưu product data)',
            items: {
              type: 'object',
              required: ['variationId'],
              properties: {
                variationId: {
                  type: 'string',
                  title: 'Variation ID',
                },
                sortOrder: {
                  type: 'number',
                  title: 'Thứ tự',
                },
              },
            },
          },
        },
        required: ['imageUrl'],
      },
    },
  },
  required: ['header', 'items'],
};

/* 
Ví dụ Data (Từ Frontend CMS Form truyền xuống lưu vào Config JSON):
{
  "header": {
    "title": "TITLE",
    "subtitle": "SUBTITLE"
  },
  "display": {
    "layoutStyle": "CAROUSEL"
  },
  "items": [
    {
      "imageUrl": "https://example.com/img1.jpg",
      "label": "@POSTHUMAN.LAB",
      "actionUrl": "https://instagram.com/p/123"
    },
    {
      "imageUrl": "https://example.com/img2.jpg",
      "label": "@POSTHUMAN.LAB"
    },
    {
      "imageUrl": "https://example.com/img3.jpg",
      "label": "@POSTHUMAN.LAB"
    },
    {
      "imageUrl": "https://example.com/img4.jpg",
      "label": "@POSTHUMAN.LAB"
    }
  ]
}
*/
