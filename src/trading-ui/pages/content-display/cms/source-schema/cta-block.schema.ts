import type { CmsBlockSchemaDefinition } from '@/trading-ui/apis/cms/cms-schema-definition.interface';

const colorField = (title: string, defaultColor: string): CmsBlockSchemaDefinition => ({
  type: 'string',
  title,
  default: defaultColor,
});

export const CTA_BLOCK_SCHEMA: CmsBlockSchemaDefinition = {
  type: 'object',
  properties: {
    title: { type: 'string', title: 'Tiêu đề' },
    titleColor: colorField('Màu chữ tiêu đề', '#0A0A0A'),
    description: {
      type: 'string',
      title: 'Mô tả trên nút',
      format: 'textarea',
    },
    descriptionColor: colorField('Màu chữ mô tả', '#0A0A0A'),
    buttons: {
      type: 'array',
      title: 'Danh sách nút bấm',
      maxItems: 3,
      items: {
        type: 'object',
        title: 'Nút bấm',
        properties: {
          label: { type: 'string', title: 'Nhãn nút' },
          url: { type: 'string', title: 'Đường dẫn đích' },
          textColor: colorField('Màu chữ nút', '#FFFFFF'),
          backgroundColor: colorField('Màu nền nút', '#0A0A0A'),
          borderColor: colorField('Màu viền nút', '#0A0A0A'),
          target: {
            type: 'string',
            title: 'Mở đường dẫn',
            enum: ['_self', '_blank'],
            enumNames: ['Cùng tab', 'Tab mới'],
            default: '_self',
          },
        },
      },
    },
    bottomText: {
      type: 'string',
      title: 'Nội dung dưới nút',
      format: 'textarea',
    },
    bottomTextColor: colorField('Màu chữ nội dung dưới nút', '#0A0A0A'),
    background: {
      type: 'object',
      title: 'Nền toàn khối',
      properties: {
        color: colorField('Màu nền', '#FFFFFF'),
        borderColor: colorField('Màu viền', 'transparent'),
        borderRadius: { type: 'number', title: 'Bo góc (px)', minimum: 0, default: 40 },
      },
    },
    alignment: {
      type: 'string',
      title: 'Căn lề',
      enum: ['LEFT', 'CENTER', 'RIGHT'],
      enumNames: ['Trái', 'Giữa', 'Phải'],
      default: 'CENTER',
    },
  },
};
