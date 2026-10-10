import { type PageOptionsDto, type Success } from '../../common/constant/api.interface';
import { type Product, type ProductApprovalSummary, type ProductMixMatchItem, type ProductPendingApprovalDetail, type ProductSpuPackagingRelation, type ProductVariationDetail } from './product.entities';
import {
  type AdminProductTimeFilter,
  type PackagingType,
  type ProductApprovalStatus,
  type ProductKind,
  type ProductSkuStatus,
  type ProductSpuStatus,
  type ProductStockStatus,
  type ProductUnitOfMeasure,
  type ProductVariationSkuKind,
} from './product.enum';
import { type OrderType } from '../../adapters/library';

export interface QueryAdminProductDto extends PageOptionsDto<Product> {
  categoryUuid?: string;
  seasonUuid?: string;
  collectionUuid?: string;
  hasPendingApproval?: boolean;
  approvalStatus?: ProductApprovalStatus;
  status?: ProductSpuStatus;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  stockStatus?: ProductStockStatus;
  minPrice?: number;
  maxPrice?: number;
  timeFilter?: AdminProductTimeFilter;
  timeFrom?: string;
  timeTo?: string;
  brandId?: string;
  createdById?: string;
  productKind?: ProductKind;
  productIds?: string;
}

export interface ProductAttributeCreateRequestDto {
  attributeUuid: string;
  valueUuids: string[];
}

export interface ProductInfoFormItem {
  title?: string;
  description: string;
  sortOrder: number;
}

export interface ProductSkuCreateRequestDto {
  clientKey?: string;
  skuCode: string;
  status: ProductSkuStatus;
  skuKind?: ProductVariationSkuKind;
  compareAtPriceAfterTaxMinor?: number | null;
  sellingPriceAfterTaxMinor?: number;
  costPriceAfterTaxMinor?: number | null;
  b2bWholesalePriceAfterTax?: number;
  taxRateOverride?: number | null;
  attributeValueUuids: string[];
  medias: string[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  packagingBasePriceAfterTax?: number;
  packagingIncludedPriceAfterTax?: number;
  packagingIsVisible?: boolean;
  packagingCanBeSold?: boolean;
  packagingType?: PackagingType;
}

export interface ProductCreateRequestDto {
  spuCode: string;
  name: string;
  productKind?: ProductKind;
  /** Single enum value (EACH, STRAND, …). */
  unitOfMeasure?: ProductUnitOfMeasure;
  categoryUuid?: string;
  brandId?: string | null;
  seasonUuid?: string;
  taxRateOverride?: number | null;
  description?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  attributes: ProductAttributeCreateRequestDto[];
  skus: ProductSkuCreateRequestDto[];
  defaultSkuCode?: string;
  productInfos?: ProductInfoFormItem[];
  packagingRelations?: ProductPackagingRelationUpsertRequestDto[];
  productMixMatch?: string[];
}

export interface ProductSkuUpsertRequestDto extends ProductSkuCreateRequestDto {
  uuid?: string;
}

export interface ProductSkusPatchRequestDto {
  upsert?: ProductSkuUpsertRequestDto[];
  disable?: string[];
  enable?: string[];
}

export interface ProductPatchRequestDto {
  name?: string;
  /** Single enum value (EACH, STRAND, …). */
  unitOfMeasure?: ProductUnitOfMeasure;
  categoryUuid?: string;
  brandId?: string | null;
  seasonUuid?: string | null;
  taxRateOverride?: number | null;
  description?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  defaultVariationUuid?: string;
  attributes?: ProductAttributeCreateRequestDto[];
  variantAttributeOrder?: string[];
  skus?: ProductSkusPatchRequestDto;
  productInfos?: ProductInfoFormItem[];
  packagingRelations?: ProductPackagingRelationUpsertRequestDto[];
  productMixMatch?: string[];
}

export interface ProductPackagingRelationUpsertRequestDto {
  productVariationId?: string | null;
  sourceVariationClientKey?: string | null;
  packagingVariationId: string;
  quantity?: number;
  includedPriceAfterTax?: number | null;
  isRequired?: boolean;
  isDefault?: boolean;
  canCustomerChoose?: boolean;
  isVisibleOnProduct?: boolean;
  sortOrder?: number;
  status?: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface ProductPackagingRelationsPatchRequestDto {
  relations: ProductPackagingRelationUpsertRequestDto[];
}

export interface ProductPackagingRelationsPatchResponseDto {
  productId: string;
  total: number;
  list: ProductSpuPackagingRelation[];
}

export interface ProductSkuMatrixRowEditorFields {
  skuCode: string;
  status: ProductSkuStatus;
  taxRateOverride: string;
  effectiveTaxRate: string;
  taxSource: string;
  costPriceBeforeTaxMinor: string;
  costPriceAfterTaxMinor: string;
  compareAtPriceBeforeTaxMinor: string;
  compareAtPriceAfterTaxMinor: string;
  sellingPriceBeforeTaxMinor: string;
  sellingPriceAfterTaxMinor: string;
  b2bWholesalePriceBeforeTax: string;
  b2bWholesalePriceAfterTax: string;
  medias: string[];
  weight: string;
  length: string;
  width: string;
  height: string;
}

export type ProductSkuMatrixServerPrefill = Partial<
  Pick<
    ProductSkuMatrixRowEditorFields,
    | 'skuCode'
    | 'taxRateOverride'
    | 'effectiveTaxRate'
    | 'taxSource'
    | 'costPriceBeforeTaxMinor'
    | 'costPriceAfterTaxMinor'
    | 'compareAtPriceBeforeTaxMinor'
    | 'compareAtPriceAfterTaxMinor'
    | 'sellingPriceBeforeTaxMinor'
    | 'sellingPriceAfterTaxMinor'
    | 'b2bWholesalePriceBeforeTax'
    | 'b2bWholesalePriceAfterTax'
    | 'weight'
    | 'length'
    | 'width'
    | 'height'
  >
> & {
  status?: ProductSkuStatus;
  categoryTaxRate?: string;
  productTaxRateOverride?: string;
  serverEffectiveTaxRate?: string;
  serverTaxSource?: string;
};

export interface ProductSkuMatrixLeafRowDto {
  rowId: string;
  skuCode: string;
  status: ProductSkuStatus;
  taxRateOverride: string;
  costPriceAfterTaxMinor: string;
  compareAtPriceAfterTaxMinor: string;
  sellingPriceAfterTaxMinor: string;
  b2bWholesalePriceAfterTax: string;
  medias: string[];
  weight: string;
  length: string;
  width: string;
  height: string;
  attributeValueUuids: string[];
  variationUuid?: string;
}

export interface ProductPatchStatusRequestDto {
  status: ProductSpuStatus;
}

export interface SkuMatrixPreviewValueRef {
  valueUuid: string;
}

export interface SkuMatrixPreviewAttributePayload {
  attributeId: string;
  values: SkuMatrixPreviewValueRef[];
}

export interface SkuMatrixPreviewRequestDto {
  attributes: SkuMatrixPreviewAttributePayload[];
}

export interface SkuMatrixPreviewMetaAttribute {
  uuid: string;
  name: string;
  code: string;
}

export interface SkuMatrixPreviewMetaValue {
  uuid: string;
  attributeId: string;
  name: string;
  code: string;
  image?: string | null;
}

export interface SkuMatrixPreviewMatrixNode {
  valueUuid: string;
  children: SkuMatrixPreviewMatrixNode[];
  canonicalKey: string | null;
  variantId?: string | null;
  variantData?: unknown | null;
}

export interface SkuMatrixPreviewResponseDto {
  attributeOrder: string[];
  attributes: Record<string, SkuMatrixPreviewMetaAttribute>;
  values: Record<string, SkuMatrixPreviewMetaValue>;
  matrix: SkuMatrixPreviewMatrixNode[];
}

export interface ProductMutationResponseDto {
  uuid: string;
  status: ProductSpuStatus;
  approval: ProductApprovalSummary;
  hasPendingApproval: boolean;
  approvalRequestUuid?: string;
  message?: string;
}

export interface ProductListCountsDto {
  all: number;
  draft: number;
  unpublished: number;
  published: number;
  discontinued: number;
  archived: number;
  hasPendingApproval: number;
  approvalApproved: number;
  approvalRejected: number;
  approvalCancelled: number;
}

export interface ProductListResponseDto {
  total: number;
  list: Product[];
  pagination?: {
    total: number;
    currentPage: number;
    nextPage: boolean;
    previousPage: boolean;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalPage: number;
  };
  counts: ProductListCountsDto;
}

export type AdminProductDetailDto = Omit<Product, 'brandId' | 'variations' | 'productMixMatch'> & {
  brandId?: string | null;
  variantAttributeOrder?: string[];
  variantMatrix?: SkuMatrixPreviewResponseDto;
  pendingApproval?: ProductPendingApprovalDetail | null;
  variations?: ProductVariationDetail[];
  productMixMatch?: ProductMixMatchItem[];
};

export interface ProductApprovalReviewItemDto {
  productUuid: string;
  approvalRequestUuid: string;
}

export interface ProductApprovalReviewRequestDto {
  items: ProductApprovalReviewItemDto[];
  reason?: string;
  decision?: string;
}

export interface ProductApprovalRequestDto {
  id: string;
  productId: string;
  status: ProductApprovalStatus;
  createdAt?: string;
}

export interface QueryAdminProductApprovalDto extends PageOptionsDto<ProductApprovalRequestDto> {
  status?: ProductApprovalStatus;
  search?: string;
  isPagination?: boolean;
}

export interface ProductApprovalCancelResponseDto extends Success {
  productStatus?: ProductSpuStatus;
  approval?: ProductApprovalSummary;
  hasPendingApproval?: boolean;
}

export interface ProductAuditLogListRequestDto {
  orderBy?: 'createdAt' | 'updatedAt';
  orderType?: OrderType;
  page?: number;
  take?: number;
  search?: string;
  orderTimeFilter?: string;
  startDate?: string;
  endDate?: string;
  entityName?: string;
  entityId?: string;
  operation?: string;
  action?: string;
  sourceType?: string;
}

export interface ProductAuditLogChange {
  field?: string | null;
  oldValue?: string | number | null;
  newValue?: string | number | null;
}

export interface ProductAuditLogActor {
  id?: string | null;
  name?: string | null;
  displayName?: string | null;
  roleName?: string | null;
}

export interface ProductAuditUserSummary {
  id: string;
  displayName?: string | null;
  email?: string | null;
}

export interface ProductAuditLogItem {
  id: string;
  action?: string | null;
  operation?: string | null;
  actionType?: string | null;
  source?: string | null;
  sourceType?: string | null;
  message?: string | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdById?: string | null;
  actor?: ProductAuditLogActor | null;
  changes?: ProductAuditLogChange[] | null;
  diff?: ProductAuditLogChange[] | Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export interface ProductAuditLogListResponse {
  list: ProductAuditLogItem[];
  total: number;
  page?: number;
  take?: number;
  usersById?: Record<string, ProductAuditUserSummary>;
}

export type ProductQuery = Partial<QueryAdminProductDto>;
