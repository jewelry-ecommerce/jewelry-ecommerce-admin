import {
  PackagingType,
  ProductApprovalAction,
  ProductApprovalStatus,
  ProductKind,
  ProductSkuStatus,
  ProductSpuStatus,
  ProductUnitOfMeasure,
  ProductVariationSkuKind,
} from '../../../apis/product/product.enum';
import * as yup from 'yup';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../common/config/runtime-config';
import { type ProductApprovalSummary } from '../../../apis/product/product.entities';
import { type AppliedAttributeSummary, type ProductSpu, type ProductSpuSectionNavItem, type VariantAttributeDef, type VariantKeyRow } from './product-spu.interface';

export const ProductSpuSidebarKey = {
  GENERAL: 'general',
  VARIANTS: 'variants',
  PACKAGING: 'packaging',
  MARKETING: 'marketing',
  SEO: 'seo',
} as const;

export const isPackagingLikeProductKind = (productKind?: ProductKind | string | null): boolean => productKind === ProductKind.PACKAGING || productKind === ProductKind.SHIPPING_PACKAGING;

export const PRODUCT_KIND_OPTIONS = [
  { value: ProductKind.MERCHANDISE, label: 'Sản phẩm bán lẻ' },


] as const;

export const SHIPPING_PACKAGING_TYPE_OPTIONS = [
  { value: PackagingType.CARTON_BOX, label: 'Hộp carton' },
  { value: PackagingType.BAG, label: 'Túi' },
] as const;

export const PACKAGING_TYPE_OPTIONS = [
  { value: PackagingType.BOX, label: 'Hộp' },
  { value: PackagingType.BAG, label: 'Túi' },
  { value: PackagingType.POUCH, label: 'Túi mềm' },
  { value: PackagingType.CARD, label: 'Thẻ / thiệp' },
  { value: PackagingType.WRAP, label: 'Giấy gói' },
  { value: PackagingType.TUBE, label: 'Hộp ống' },
  { value: PackagingType.OTHER, label: 'Khác' },
] as const;

/** Ảnh placeholder khi sản phẩm / biến thể chưa có ảnh (đồng bộ với danh sách sản phẩm). */
export const PRODUCT_SPU_DEFAULT_IMAGE_SRC = resolveTenantBrandProductDefaultImageSrc();

/** Minimum after-tax price (VND) for merchandise SKU create/update. */
export const MIN_AFTER_TAX_PRICE_VND = 10_000;

const merchandiseAfterTaxPriceSchema = (requiredMessage: string, minMessage: string) =>
  yup
    .number()
    .transform((value, originalValue) => (originalValue === '' || originalValue === null || Number.isNaN(value) ? undefined : value))
    .typeError(requiredMessage)
    .required(requiredMessage)
    .integer('Giá phải là số nguyên')
    .min(MIN_AFTER_TAX_PRICE_VND, minMessage);

/** Giá nhập: optional; empty/null = clear; có giá thì ≥ MIN. */
const optionalMerchandiseAfterTaxPriceSchema = (minMessage: string) =>
  yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) return null;
      if (typeof value === 'number' && Number.isNaN(value)) return null;
      return value;
    })
    .nullable()
    .optional()
    .integer('Giá phải là số nguyên')
    .min(MIN_AFTER_TAX_PRICE_VND, minMessage);

const afterTaxPriceBySkuKindSchema = (requiredMessage: string, minMessage: string) =>
  yup.number().when('skuKind', {
    is: ProductVariationSkuKind.PACKAGING,
    then: (schema) => schema.nullable().optional().min(0),
    otherwise: () => merchandiseAfterTaxPriceSchema(requiredMessage, minMessage),
  });

const optionalAfterTaxPriceBySkuKindSchema = (minMessage: string) =>
  yup.number().when('skuKind', {
    is: ProductVariationSkuKind.PACKAGING,
    then: (schema) => schema.nullable().optional().min(0),
    otherwise: () => optionalMerchandiseAfterTaxPriceSchema(minMessage),
  });

/** Giới hạn dung lượng upload media biến thể (FE). */
export const PRODUCT_SPU_VARIANT_MEDIA_MAX_FILE_BYTES = 5 * 1024 * 1024;

export const PRODUCT_SPU_VARIANT_MEDIA_UPLOAD_HINT = 'Hỗ trợ mọi định dạng ảnh (tối đa 5MB)';

export const PRODUCT_SPU_SIDEBAR_SECTIONS: ReadonlyArray<ProductSpuSectionNavItem> = [
  { key: ProductSpuSidebarKey.GENERAL, label: 'Thông tin chung' },
  { key: ProductSpuSidebarKey.VARIANTS, label: 'Biến thể và tồn kho' },

  { key: ProductSpuSidebarKey.MARKETING, label: 'Marketing & Loyalty' },
  { key: ProductSpuSidebarKey.SEO, label: 'Cấu hình SEO' },
] as const;

export const productCreateRequestDtoSchema = yup
  .object({
    spuCode: yup.string().trim().required('Mã sản phẩm không được để trống'),
    name: yup.string().trim().required('Tên sản phẩm không được để trống'),
    categoryUuid: yup
      .string()
      .trim()
      .when('productKind', {
        is: (value: ProductKind) => isPackagingLikeProductKind(value),
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required('Danh mục không được để trống'),
      }),
    productKind: yup.mixed<ProductKind>().oneOf(Object.values(ProductKind)).default(ProductKind.MERCHANDISE).optional(),
    unitOfMeasure: yup.mixed<ProductUnitOfMeasure>().oneOf(Object.values(ProductUnitOfMeasure), 'Đơn vị tính không hợp lệ').required('Đơn vị tính không được để trống'),
    brandId: yup.string().trim().optional(),
    seasonUuid: yup.string().trim().optional(),
    taxRateOverride: yup.number().min(0).max(100).optional(),
    description: yup.string().trim().optional(),
    weight: yup.number().optional(),
    length: yup.number().optional(),
    width: yup.number().optional(),
    height: yup.number().optional(),
    metaTitle: yup
      .string()
      .trim()
      .when('productKind', {
        is: (value: ProductKind) => isPackagingLikeProductKind(value),
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required('Tiêu đề SEO không được để trống'),
      }),
    metaDescription: yup
      .string()
      .trim()
      .when('productKind', {
        is: (value: ProductKind) => isPackagingLikeProductKind(value),
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required('Mô tả SEO không được để trống'),
      }),
    metaKeywords: yup
      .string()
      .trim()
      .when('productKind', {
        is: (value: ProductKind) => isPackagingLikeProductKind(value),
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required('Từ khóa SEO không được để trống'),
      }),
    attributes: yup
      .array()
      .of(
        yup.object({
          attributeUuid: yup.string().trim().required('Thuộc tính không được để trống'),
          valueUuids: yup.array().of(yup.string().trim().required()).min(1, 'Chọn ít nhất 1 giá trị'),
        }),
      )
      .when('productKind', {
        is: (value: ProductKind) => isPackagingLikeProductKind(value),
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.min(1, 'Vui lòng chọn thuộc tính'),
      }),
    skus: yup
      .array()
      .of(
        yup.object({
          clientKey: yup.string().trim().optional(),
          skuCode: yup.string().trim().required('Mã biến thể không được để trống'),
          status: yup.string().trim().required('Trạng thái không được để trống'),
          skuKind: yup.mixed<ProductVariationSkuKind>().oneOf(Object.values(ProductVariationSkuKind)).optional(),
          compareAtPriceAfterTaxMinor: afterTaxPriceBySkuKindSchema('Giá gạch không được để trống', `Giá gạch phải từ ${MIN_AFTER_TAX_PRICE_VND.toLocaleString('vi-VN')} trở lên`),
          sellingPriceAfterTaxMinor: afterTaxPriceBySkuKindSchema('Giá bán không được để trống', `Giá bán phải từ ${MIN_AFTER_TAX_PRICE_VND.toLocaleString('vi-VN')} trở lên`),
          costPriceAfterTaxMinor: optionalAfterTaxPriceBySkuKindSchema(`Giá nhập sau thuế phải từ ${MIN_AFTER_TAX_PRICE_VND.toLocaleString('vi-VN')} trở lên`),
          b2bWholesalePriceAfterTax: yup.number().optional(),
          taxRateOverride: yup.number().min(0).max(100).nullable().optional(),
          medias: yup.array().of(yup.string().trim().required()).optional(),
          weight: yup.number().optional(),
          length: yup.number().optional(),
          width: yup.number().optional(),
          height: yup.number().optional(),
          packagingBasePriceAfterTax: yup.number().min(0).optional(),
          packagingIncludedPriceAfterTax: yup.number().min(0).optional(),
          packagingIsVisible: yup.boolean().optional(),
          packagingCanBeSold: yup.boolean().optional(),
          packagingType: yup.mixed<PackagingType>().oneOf(Object.values(PackagingType)).optional(),
          attributeValueUuids: yup
            .array()
            .of(yup.string().trim().required())
            .when('skuKind', {
              is: ProductVariationSkuKind.PACKAGING,
              then: (schema) => schema.optional(),
              otherwise: (schema) => schema.min(1, 'Biến thể cần ít nhất 1 giá trị thuộc tính'),
            }),
        }),
      )
      .min(1, 'Phải có ít nhất 1 biến thể'),
    defaultSkuCode: yup.string().trim().optional(),
    productInfos: yup
      .array()
      .of(
        yup.object({
          title: yup.string().trim().optional(),
          description: yup.string().optional(),
          sortOrder: yup.number().min(0).required(),
        }),
      )
      .optional(),
  })
  .required();

const productSkuUpsertItemSchema = yup.object({
  clientKey: yup.string().trim().optional(),
  uuid: yup.string().trim().optional(),
  skuCode: yup.string().trim().required('Mã biến thể không được để trống'),
  status: yup.string().trim().required('Trạng thái không được để trống'),
  skuKind: yup.mixed<ProductVariationSkuKind>().oneOf(Object.values(ProductVariationSkuKind)).optional(),
  compareAtPriceAfterTaxMinor: afterTaxPriceBySkuKindSchema('Giá gạch không được để trống', `Giá gạch phải từ ${MIN_AFTER_TAX_PRICE_VND.toLocaleString('vi-VN')} trở lên`),
  sellingPriceAfterTaxMinor: afterTaxPriceBySkuKindSchema('Giá bán không được để trống', `Giá bán phải từ ${MIN_AFTER_TAX_PRICE_VND.toLocaleString('vi-VN')} trở lên`),
  costPriceAfterTaxMinor: optionalAfterTaxPriceBySkuKindSchema(`Giá nhập sau thuế phải từ ${MIN_AFTER_TAX_PRICE_VND.toLocaleString('vi-VN')} trở lên`),
  b2bWholesalePriceAfterTax: yup.number().optional(),
  taxRateOverride: yup.number().min(0).max(100).nullable().optional(),
  medias: yup.array().of(yup.string().trim().required()).optional(),
  weight: yup.number().optional(),
  length: yup.number().optional(),
  width: yup.number().optional(),
  height: yup.number().optional(),
  packagingBasePriceAfterTax: yup.number().min(0).optional(),
  packagingIncludedPriceAfterTax: yup.number().min(0).optional(),
  packagingIsVisible: yup.boolean().optional(),
  packagingCanBeSold: yup.boolean().optional(),
  packagingType: yup.mixed<PackagingType>().oneOf(Object.values(PackagingType)).optional(),
  attributeValueUuids: yup
    .array()
    .of(yup.string().trim().required())
    .when('skuKind', {
      is: ProductVariationSkuKind.PACKAGING,
      then: (schema) => schema.optional(),
      otherwise: (schema) => schema.min(1, 'Biến thể cần ít nhất 1 giá trị thuộc tính'),
    }),
});

export const productUpdateRequestDtoSchema = yup
  .object({
    spuCode: yup.string().trim().required('Mã sản phẩm không được để trống'),
    productKind: yup.mixed<ProductKind>().oneOf(Object.values(ProductKind)).optional(),
    unitOfMeasure: yup.mixed<ProductUnitOfMeasure>().oneOf(Object.values(ProductUnitOfMeasure), 'Đơn vị tính không hợp lệ').required('Đơn vị tính không được để trống'),
    name: yup.string().trim().required('Tên sản phẩm không được để trống'),
    categoryUuid: yup
      .string()
      .trim()
      .when('productKind', {
        is: (value: ProductKind) => isPackagingLikeProductKind(value),
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required('Danh mục không được để trống'),
      }),
    brandId: yup.string().trim().optional(),
    seasonUuid: yup.string().trim().optional(),
    taxRateOverride: yup.number().min(0).max(100).optional(),
    description: yup.string().trim().optional(),
    weight: yup.number().optional(),
    length: yup.number().optional(),
    width: yup.number().optional(),
    height: yup.number().optional(),
    metaTitle: yup.string().trim().optional(),
    metaDescription: yup.string().trim().optional(),
    metaKeywords: yup.string().trim().optional(),
    defaultVariationUuid: yup.string().trim().optional(),
    attributes: yup
      .array()
      .of(
        yup.object({
          attributeUuid: yup.string().trim().required('Thuộc tính không được để trống'),
          valueUuids: yup.array().of(yup.string().trim().required()).min(1, 'Chọn ít nhất 1 giá trị'),
        }),
      )
      .when('productKind', {
        is: (value: ProductKind) => isPackagingLikeProductKind(value),
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.min(1, 'Vui lòng chọn thuộc tính'),
      }),
    variantAttributeOrder: yup.array().of(yup.string().trim()).optional(),
    skus: yup
      .object({
        upsert: yup.array().of(productSkuUpsertItemSchema).min(1, 'Phải có ít nhất 1 biến thể'),
        disable: yup.array().of(yup.string().trim()).optional(),
        enable: yup.array().of(yup.string().trim()).optional(),
      })
      .optional(),
    productInfos: yup
      .array()
      .of(
        yup.object({
          title: yup.string().trim().optional(),
          description: yup.string().optional(),
          sortOrder: yup.number().min(0).required(),
        }),
      )
      .optional(),
  })
  .required();

export const PRODUCT_SPU_APPROVAL_STATUS_TABS = [
  { value: ProductApprovalStatus.PENDING, label: 'Đang chờ duyệt' },
  { value: ProductApprovalStatus.APPROVED, label: 'Đã duyệt' },
  { value: ProductApprovalStatus.REJECTED, label: 'Từ chối duyệt' },
] as const;

export const PRODUCT_SPU_APPROVAL_STATUS_FILTER_OPTIONS = [{ value: '', label: 'Tất cả' }, ...PRODUCT_SPU_APPROVAL_STATUS_TABS.map((status) => ({ value: status.value, label: status.label }))];

export const PRICE_RANGE_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'under_1m', label: 'Dưới 1.000.000d' },
  { value: 'between_1_5m', label: '1.000.000d - 5.000.000đ' },
  { value: 'over_5m', label: 'Trên 5.000.000đ' },
];

export const PRODUCT_SPU_STATUS_FILTER_OPTIONS = [
  { value: ProductSpuStatus.ALL, label: 'Tất cả' },
  { value: ProductSpuStatus.DRAFT, label: 'Bản nháp' },
  { value: ProductSpuStatus.UNPUBLISHED, label: 'Ngừng xuất bản' },
  { value: ProductSpuStatus.PUBLISHED, label: 'Xuất bản' },
  { value: ProductSpuStatus.ARCHIVED, label: 'Lưu trữ' },
];

PRODUCT_SPU_STATUS_FILTER_OPTIONS.splice(4, 0, {
  value: ProductSpuStatus.DISCONTINUED,
  label: 'Ngừng kinh doanh',
});

export const PRODUCT_SPU_EXPORT_TIME_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'TODAY', label: 'Hôm nay' },
  { value: 'YESTERDAY', label: 'Hôm qua' },
  { value: 'LAST_7_DAYS', label: '7 ngày qua' },
  { value: 'LAST_30_DAYS', label: '30 ngày qua' },
  { value: 'THIS_MONTH', label: 'Tháng này' },
  { value: 'LAST_MONTH', label: 'Tháng trước' },
  { value: 'CUSTOM', label: 'Tùy chỉnh khoảng ngày' },
] as const;

export const PRODUCT_SPU_EXPORT_ORDER_BY_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'updatedAt', label: 'Ngày cập nhật' },
  { value: 'name', label: 'Tên sản phẩm' },
  { value: 'spuCode', label: 'Mã sản phẩm' },
  { value: 'status', label: 'Trạng thái' },
  { value: 'compareAtPriceAfterTaxMinor', label: 'Giá gạch' },
  { value: 'sellingPriceAfterTaxMinor', label: 'Giá bán' },
];

export const getProductApprovalStatusLabelVi = (approval?: ProductApprovalSummary | null, lifecycleStatus?: ProductSpuStatus): string => {
  if (!approval?.status) {
    return lifecycleStatus === ProductSpuStatus.DRAFT ? 'Chưa gửi duyệt' : 'Không có yêu cầu';
  }

  switch (approval.status) {
    case ProductApprovalStatus.PENDING:
      return approval.action === ProductApprovalAction.UPDATE_PRODUCT ? 'Chờ duyệt cập nhật' : 'Chờ duyệt tạo mới';
    case ProductApprovalStatus.APPROVED:
      return 'Đã duyệt';
    case ProductApprovalStatus.REJECTED:
      return 'Từ chối';
    case ProductApprovalStatus.CANCELLED:
      return 'Đã hủy';
    default:
      return String(approval.status);
  }
};

export const getProductLifecycleStatusLabelVi = (status: ProductSpuStatus): string => {
  if (status === ProductSpuStatus.DISCONTINUED) {
    return 'Ngừng kinh doanh';
  }

  switch (status) {
    case ProductSpuStatus.DRAFT:
      return 'Bản nháp';
    case ProductSpuStatus.UNPUBLISHED:
      return 'Ngừng xuất bản';
    case ProductSpuStatus.PUBLISHED:
      return 'Xuất bản';
    case ProductSpuStatus.ARCHIVED:
      return 'Lưu trữ';
    default:
      return String(status);
  }
};

/** Nhãn hiển thị cột nguồn thuế (giữ nguyên mã logic SKU/PRODUCT/CATEGORY). */
export const mapTaxSourceDisplayLabel = (source?: string | null): string => {
  const raw = String(source ?? '').trim();
  if (raw === 'SKU') return 'Biến thể';
  if (raw === 'PRODUCT') return 'Sản phẩm';
  if (raw === 'CATEGORY') return 'Danh mục';
  return raw;
};

export const getProductSkuStatusLabelVi = (status: ProductSkuStatus): string => {
  switch (status) {
    case ProductSkuStatus.ACTIVE:
      return 'Kích hoạt';
    case ProductSkuStatus.INACTIVE:
      return 'Vô hiệu hóa';
    default:
      return String(status);
  }
};

export const isPendingCreateApproval = (approval?: ProductApprovalSummary | null) =>
  approval?.hasPending && approval.action === ProductApprovalAction.CREATE_PRODUCT && approval.status === ProductApprovalStatus.PENDING;

export const isPendingUpdateApproval = (approval?: ProductApprovalSummary | null) =>
  approval?.hasPending && approval.action === ProductApprovalAction.UPDATE_PRODUCT && approval.status === ProductApprovalStatus.PENDING;

export const hasRejectedCreateApproval = (approval?: ProductApprovalSummary | null, status?: ProductSpuStatus) =>
  status === ProductSpuStatus.DRAFT && approval?.action === ProductApprovalAction.CREATE_PRODUCT && approval.status === ProductApprovalStatus.REJECTED;

export const PRODUCT_SPU_PRICE_RANGE_UNDER_1M = 'under_1m';
export const PRODUCT_SPU_PRICE_RANGE_1_5M = 'between_1_5m';
export const PRODUCT_SPU_PRICE_RANGE_OVER_5M = 'over_5m';

const buildApprovalSummary = (status: ProductApprovalStatus | null, action: ProductApprovalAction | null): ProductApprovalSummary | null =>
  status
    ? {
        hasPending: status === ProductApprovalStatus.PENDING,
        requestId: `${action ?? 'approval'}-mock`,
        action,
        status,
        submittedAt: null,
        submittedBy: null,
        rejectedReason: status === ProductApprovalStatus.REJECTED ? 'Cần bổ sung dữ liệu' : null,
      }
    : null;

export const MOCK_PRODUCT_SPU_ROWS: ProductSpu[] = [
  {
    id: '1',
    name: 'San pham 1',
    code: 'SPU1',
    approval: buildApprovalSummary(ProductApprovalStatus.APPROVED, ProductApprovalAction.CREATE_PRODUCT),
    status: ProductSpuStatus.PUBLISHED,
    brand: 'Thuong hieu 1',
    category: 'Danh muc 1',
    image: 'https://dev.trading.sevago.local/upload/Sp1.1.jpg',
  },
  {
    id: '2',
    name: 'San pham 2',
    code: 'SPU2',
    approval: buildApprovalSummary(ProductApprovalStatus.PENDING, ProductApprovalAction.CREATE_PRODUCT),
    status: ProductSpuStatus.DRAFT,
    brand: 'Thuong hieu 2',
    category: 'Danh muc 2',
    image: 'https://dev.trading.sevago.local/upload/Sp1.1.jpg',
  },
  {
    id: '3',
    name: 'San pham 3',
    code: 'SPU3',
    approval: buildApprovalSummary(ProductApprovalStatus.REJECTED, ProductApprovalAction.CREATE_PRODUCT),
    status: ProductSpuStatus.DRAFT,
    brand: 'Thuong hieu 3',
    category: 'Danh muc 3',
    image: 'https://dev.trading.sevago.local/upload/Sp1.1.jpg',
  },
  {
    id: '4',
    name: 'San pham 4',
    code: 'SPU4',
    approval: buildApprovalSummary(ProductApprovalStatus.PENDING, ProductApprovalAction.UPDATE_PRODUCT),
    status: ProductSpuStatus.UNPUBLISHED,
    brand: 'Thuong hieu 4',
    category: 'Danh muc 4',
    image: 'https://dev.trading.sevago.local/upload/Sp1.1.jpg',
  },
];

export const DEMO_SPU_VARIANT_ATTRIBUTES: VariantAttributeDef[] = [
  { code: 'MATERIAL', label: 'Chất liệu' },
  { code: 'TYPE', label: 'Loại da' },
  { code: 'SIZE', label: 'Kích thước' },
];

export const DEMO_SPU_VARIANT_KEY_ROWS: VariantKeyRow[] = [{ key: ['MATERIAL:GOLD_14K', 'TYPE:RED', 'SIZE:33'] }, { key: ['MATERIAL:SILVER', 'RED', '36'] }];

export const DEMO_APPLIED_ATTRIBUTE_SUMMARIES: ReadonlyArray<AppliedAttributeSummary> = [
  { attributeId: 'MATERIAL', label: 'Chat lieu', valuesText: 'Vang 14K, Bac' },
  { attributeId: 'TYPE', label: 'Loai da', valuesText: 'Da do, Da xanh' },
  { attributeId: 'SIZE', label: 'Kich thuoc', valuesText: '33, 34' },
];

export const DEMO_ATTRIBUTE_TREE_OPTIONS: { group: string; value: string; label: string }[] = [
  { group: 'Chat lieu', value: 'MATERIAL', label: 'Chat lieu' },
  { group: 'Chat lieu', value: 'MATERIAL:GOLD_14K', label: 'Vang 14K' },
  { group: 'Chat lieu', value: 'MATERIAL:SILVER', label: 'Bac' },
  { group: 'Loai da', value: 'TYPE', label: 'Loai da' },
  { group: 'Loai da', value: 'TYPE:RED', label: 'Da do' },
  { group: 'Loai da', value: 'TYPE:BLUE', label: 'Da xanh' },
  { group: 'Kich thuoc', value: 'SIZE', label: 'Kich thuoc' },
  { group: 'Kich thuoc', value: 'SIZE:33', label: '33' },
  { group: 'Kich thuoc', value: 'SIZE:34', label: '34' },
];
