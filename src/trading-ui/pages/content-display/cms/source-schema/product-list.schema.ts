import type { CmsBlockSchemaDefinition } from '@/trading-ui/apis/cms/cms-schema-definition.interface';
const PRODUCT_LIST_PRODUCT_FILTER_TYPE_ENUM = ['ALL_PRODUCTS', 'COLLECTION', 'PROMOTION'];

const PRODUCT_LIST_PRODUCT_FILTER_TYPE_ENUM_NAMES = [
  'Tất cả sản phẩm',
  'Bộ sưu tập',
  'Promotion (tính năng chưa hỗ trợ)',
];

const PRODUCT_LIST_SORT_ENUM = [
  'best_selling',
  'price_asc',
  'price_desc',
  'newest',
  'name',
  'name_desc',
];

const PRODUCT_LIST_SORT_ENUM_NAMES = [
  'Bán chạy nhất',
  'Giá: Thấp - Cao',
  'Giá: Cao - Thấp',
  'Mới nhất',
  'Tên A-Z',
  'Tên Z -> A',
];

export const PRODUCT_LIST_SCHEMA: CmsBlockSchemaDefinition = {
  type: 'object',
  required: ['productDataSource'],
  properties: {
    header: {
      type: 'object',
      title: 'Tiêu đề khối',
      properties: {
        title: {
          type: 'string',
          title: 'Tiêu đề chính (tùy chọn)',
        },
        subtitle: {
          type: 'string',
          title: 'Tiêu đề phụ (tùy chọn)',
        },
      },
      'x-propertyOrder': ['title', 'subtitle'],
    },
    productDataSource: {
      type: 'object',
      title: 'Danh sách sản phẩm hiển thị',
      required: ['filterType'],
      properties: {
        filterType: {
          type: 'string',
          title: 'Nguồn sản phẩm',
          enum: PRODUCT_LIST_PRODUCT_FILTER_TYPE_ENUM,
          enumNames: PRODUCT_LIST_PRODUCT_FILTER_TYPE_ENUM_NAMES,
          default: 'ALL_PRODUCTS',
        },
        sort: {
          type: 'string',
          title: 'Sắp xếp danh sách sản phẩm mặc định',
          enum: PRODUCT_LIST_SORT_ENUM,
          enumNames: PRODUCT_LIST_SORT_ENUM_NAMES,
          default: 'best_selling',
        },
        collectionSlugs: {
          type: 'array',
          title: 'Chọn Bộ sưu tập',
          items: { type: 'string' },
        },
      },
      'x-propertyOrder': ['filterType', 'collectionSlugs', 'sort'],
    },
    dataSource: {
      type: 'object',
      title: 'Banner xen kẽ sản phẩm',
      properties: {
        filterType: {
          type: 'string',
          default: 'CMS_STOREFRONT',
          enum: ['CMS_STOREFRONT'],
        },
        cmsPageId: {
          type: 'string',
          title: 'Chọn cấu hình banner xen kẽ',
        },
        cmsPageSlug: {
          type: 'string',
          title: 'Mã cấu hình banner',
        },
        cmsPageName: {
          type: 'string',
          title: 'Tên cấu hình banner',
        },
      },
      'x-propertyOrder': ['cmsPageId'],
    },
  },
  'x-propertyOrder': ['header', 'productDataSource', 'dataSource'],
};

