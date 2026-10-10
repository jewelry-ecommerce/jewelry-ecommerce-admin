export const PRODUCT_CAROUSEL_SCHEMA = {
  type: 'object',
  properties: {
    header: {
      type: 'object',
      title: 'Tiêu đề khối',
      properties: {
        title: {
          type: 'string',
          title: 'Tiêu đề chính',
        },
        subtitle: {
          type: 'string',
          title: 'Tiêu đề phụ (Không bắt buộc)',
        },
      },
      required: ['title'],
    },
    seeMore: {
      type: 'object',
      title: 'Nút xem thêm',
      properties: {
        enabled: {
          type: 'boolean',
          title: 'Hiển thị nút xem thêm',
          default: false,
        },
        text: {
          type: 'string',
          title: 'Nội dung nút xem thêm',
          description: 'Ví dụ: Xem thêm',
        },
        url: {
          type: 'string',
          title: 'Đường dẫn nút xem thêm',
          description: 'URL nội bộ (vd. /san-pham) hoặc URL đầy đủ',
        },
      },
    },
    dataSource: {
      type: 'object',
      title: 'Nguồn dữ liệu sản phẩm',
      properties: {
        filterType: {
          type: 'string',
          title: 'Loại điều kiện lọc',
          enum: [
            'CATEGORY',
            'COLLECTION',
            'CAMPAIGN',
            'NEW_ARRIVALS',
            'BEST_SELLERS',
            'MOST_FAVORITED',
            'MANUAL_PRODUCTS',
          ],
          enumNames: [
            'Theo Danh mục (Category)',
            'Theo Bộ sưu tập (Collection)',
            'Theo Chiến dịch (Campaign)',
            'Sản phẩm mới nhất',
            'Sản phẩm bán chạy',
            'Sản phẩm được yêu thích',
            'Chọn sản phẩm',
          ],
          default: 'NEW_ARRIVALS',
        },
        // Các trường này có thể null/empty tùy thuộc vào filterType
        categoryId: {
          type: 'string',
          title: 'Mã danh mục (Nếu lọc theo Danh mục)',
        },
        collectionId: {
          type: 'string',
          title: 'Mã bộ sưu tập (Nếu lọc theo Bộ sưu tập)',
        },
        campaignId: {
          type: 'string',
          title: 'Mã chiến dịch (Nếu lọc theo Chiến dịch)',
        },
        productIds: {
          type: 'array',
          title: 'Danh sách sản phẩm thủ công',
          items: {
            type: 'string',
          },
        },
      },
      required: ['filterType'],
    },
  },
  required: ['header', 'dataSource'],
};

/* 
Ví dụ Data (Từ Frontend CMS Form truyền xuống lưu vào Config JSON):

Trường hợp 1: Lấy sản phẩm theo chiến dịch
{
  "header": {
    "title": "Deal Hot 11.11",
    "subtitle": "Chỉ duy nhất hôm nay"
  },
  "seeMore": {
    "enabled": true,
    "text": "Xem thêm",
    "url": "/san-pham"
  },
  "display": { "limit": 15 },
  "dataSource": {
    "filterType": "CAMPAIGN",
    "campaignId": "camp_sieusale_1111"
  }
}

Trường hợp 2: Lấy sản phẩm mới nhất
{
  "header": {
    "title": "Hàng Mới Về"
  },
  "seeMore": {
    "enabled": false
  },
  "display": { "limit": 8 },
  "dataSource": {
    "filterType": "NEW_ARRIVALS"
  }
}
*/
