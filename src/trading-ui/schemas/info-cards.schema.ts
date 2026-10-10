export const INFO_CARDS_SCHEMA = {
  type: 'object',
  properties: {
    header: {
      type: 'object',
      title: 'Tiêu đề khối',
      properties: {
        title: {
          type: 'string',
          title: 'Tiêu đề chính',
          description: 'Ví dụ: STORES & SERVICES',
        },
        subtitle: {
          type: 'string',
          title: 'Văn bản mô tả dưới tiêu đề',
          description: 'Ví dụ: Discover our thoughtfully designed stores...',
        },
      },
      required: ['title'],
    },
    display: {
      type: 'object',
      title: 'Cài đặt hiển thị',
      properties: {
        columns: {
          type: 'number',
          title: 'Số lượng cột trên Desktop (Mặc định 3)',
          default: 3,
          enum: [2, 3, 4],
        },
      },
    },
    items: {
      type: 'array',
      title: 'Danh sách thẻ thông tin (Cards)',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          imageUrl: {
            type: 'string',
            title: 'Đường dẫn hình ảnh minh họa',
          },
          title: {
            type: 'string',
            title: 'Tiêu đề thẻ',
            description: 'Ví dụ: OUR STORES',
          },
          description: {
            type: 'string',
            title: 'Mô tả chi tiết',
            description: 'Ví dụ: Your new favorite space...',
          },
          actionText: {
            type: 'string',
            title: 'Chữ hiển thị ở nút/link hành động',
            description: 'Ví dụ: VISIT OUR STORES',
          },
          actionUrl: {
            type: 'string',
            title: 'Đường dẫn liên kết khi click',
          },
        },
        required: ['imageUrl', 'title', 'actionText', 'actionUrl'],
      },
    },
  },
  required: ['header', 'items'],
};

/* 
Ví dụ Data (Từ Frontend CMS Form truyền xuống lưu vào Config JSON):
{
  "header": {
    "title": "STORES & SERVICES",
    "subtitle": "Discover our thoughtfully designed stores..."
  },
  "display": {
    "columns": 3
  },
  "items": [
    {
      "imageUrl": "https://example.com/store.jpg",
      "title": "OUR STORES",
      "description": "Your new favorite space to shop, stack, and stay a while.",
      "actionText": "VISIT OUR STORES",
      "actionUrl": "/stores"
    },
    {
      "imageUrl": "https://example.com/piercing.jpg",
      "title": "PIERCING STUDIO",
      "description": "Create your dream ear stack with an expert piercer at our stores.",
      "actionText": "BOOK AN APPOINTMENT",
      "actionUrl": "/piercing-studio"
    }
  ]
}
*/
