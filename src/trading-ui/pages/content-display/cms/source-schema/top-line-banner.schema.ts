import type { CmsBlockSchemaDefinition } from '@/trading-ui/apis/cms/cms-schema-definition.interface';

export const TOP_LINE_BANNER_SCHEMA: CmsBlockSchemaDefinition = {
  type: 'object',
  properties: {
    settings: {
      type: 'object',
      title: 'Cài đặt chung',
      properties: {
        isClosable: {
          type: 'boolean',
          title: 'Cho phép người dùng tắt (dấu X)',
          default: true,
        },
        animationType: {
          type: 'string',
          title: 'Kiểu hiển thị',
          enum: ['STATIC', 'MARQUEE', 'FADE'],
          enumNames: ['Đứng im', 'Chạy ngang (Marquee)', 'Lướt mờ (Fade)'],
          default: 'STATIC',
        },
        animationSpeed: {
          type: 'number',
          title: 'Tốc độ chạy (giây)',
          default: 3,
        },
        backgroundColor: {
          type: 'string',
          title: 'Màu nền',
          default: '#000000',
        },
        textColor: {
          type: 'string',
          title: 'Màu chữ',
          default: '#FFFFFF',
        },
      },
    },
    badge: {
      type: 'object',
      title: 'Nhãn (badge)',
      properties: {
        text: { type: 'string', title: 'Nội dung nhãn' },
        textColor: { type: 'string', title: 'Màu chữ nhãn', default: '#FFFFFF' },
        backgroundColor: { type: 'string', title: 'Màu nền nhãn', default: '#000000' },
        actionType: {
          type: 'string',
          title: 'Hành động khi click nhãn',
          enum: ['NONE', 'LINK'],
          default: 'NONE',
        },
        actionUrl: { type: 'string', title: 'Đường dẫn (nếu hành động là LINK)' },
      },
    },
    items: {
      type: 'array',
      title: 'Danh sách nội dung',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          text: { type: 'string', title: 'Nội dung văn bản' },
          actionType: {
            type: 'string',
            title: 'Hành động khi click',
            enum: ['NONE', 'LINK', 'OPEN_MODAL'],
            default: 'NONE',
          },
          actionUrl: { type: 'string', title: 'Đường dẫn (Nếu Hành động là LINK)' },
          trackingId: {
            type: 'string',
            title: 'Mã tracking để thống kê',
          },
        },
        required: ['text'],
      },
    },
  },
};
