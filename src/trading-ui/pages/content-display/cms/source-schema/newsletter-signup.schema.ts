import type { CmsBlockSchemaDefinition } from '@/trading-ui/apis/cms/cms-schema-definition.interface';

export const NEWSLETTER_SIGNUP_SCHEMA: CmsBlockSchemaDefinition = {
  type: 'object',
  properties: {
    heading: {
      type: 'string',
      title: 'Tiêu đề khối đăng ký',
      description: 'Ví dụ: Đăng ký nhận tin về bộ sưu tập và ưu đãi độc quyền',
    },
    consentText: {
      type: 'string',
      title: 'Nội dung đồng ý chính sách (checkbox)',
      description: 'Ví dụ: Bằng cách nhấp chọn, bạn đồng ý với Chính sách bảo mật thông tin.',
    },
  },
  required: ['heading', 'consentText'],
};
