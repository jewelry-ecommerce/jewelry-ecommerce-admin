import { type BaseEntity } from '../../common/constant/api.interface';
import { type AttributeStatus } from '../attribute/attribute.enum';
import { type ProductApprovalAction, type ProductApprovalStatus, type ProductSkuStatus, type ProductSpuStatus } from './product.enum';

export interface ProductBrandSummary {
  id: string;
  tenantCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdByType?: string | null;
  updatedByType?: string | null;
  deletedByType?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
  deletedById?: string | null;
  name: string;
  code: string;
  image?: string | null;
  status: string;
}

export interface ProductCategorySummary {
  id: string;
  tenantCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdByType?: string | null;
  updatedByType?: string | null;
  deletedByType?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
  deletedById?: string | null;
  name: string;
  logo?: string | null;
  image?: string | null;
  level: number;
  slug: string;
  code: string;
  status: string;
  taxRate: string;
  parentId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
}

export interface ProductSeasonSummary {
  id: string;
  code: string;
  name: string;
}

export interface ProductVariation {
  id: string;
  tenantCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdByType?: string | null;
  updatedByType?: string | null;
  deletedByType?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
  deletedById?: string | null;
  skuCode: string;
  price: string;
  salePrice: string | null;
  compareAtPriceAfterTaxMinor?: number | null;
  sellingPriceAfterTaxMinor?: number | null;
  costPriceAfterTaxMinor?: number | null;
  b2bWholesalePriceAfterTax?: number | null;
  compareAtPriceBeforeTaxMinor?: number | null;
  sellingPriceBeforeTaxMinor?: number | null;
  costPriceBeforeTaxMinor?: number | null;
  b2bWholesalePriceBeforeTax?: number | null;
  slug: string;
  name: string;
  productId: string;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  taxRate?: number | null;
  categoryTaxRate?: number | null;
  productTaxRateOverride?: number | null;
  skuTaxRateOverride?: number | null;
  effectiveTaxRate?: number | null;
  taxSource?: string | null;
  stock: number;
  medias?: ProductVariationMedia[];
  variationAttributeValues?: ProductVariationAttributeValueLink[];
  status: ProductSkuStatus;
  skuKind?: string;
  packagingProfile?: {
    id: string;
    basePriceAfterTax: string;
    includedPriceAfterTax: string;
    isVisible: boolean;
    canBeSold: boolean;
    packagingType: string;
    status: string;
  } | null;
}

export interface ProductVariationAttributeValueLink {
  id: string;
  productVariationId: string;
  attributeValueId: string;
  attributeValue?: {
    id: string;
    attributeId: string;
    value: string;
    code: string;
    image?: string | null;
    attribute?: {
      id: string;
      name: string;
      code: string;
      status: AttributeStatus;
    };
  };
}

export interface ProductVariationMedia {
  id: string;
  productVariationId?: string;
  url: string;
  sortOrder?: number;
}

export interface ProductVariationDetail extends ProductVariation {
  variationAttributeValues?: ProductVariationAttributeValueLink[];
  medias?: ProductVariationMedia[];
}

export interface ProductApprovalSummary {
  hasPending: boolean;
  requestId: string | null;
  action: ProductApprovalAction | null;
  status: ProductApprovalStatus | null;
  submittedAt: string | null;
  submittedBy: string | null;
  rejectedReason: string | null;
}

export interface ProductPendingApprovalDiffItem {
  field: string;
  currentValue: unknown;
  pendingValue: unknown;
}

export interface ProductPendingApprovalDetail {
  id: string;
  actionType: ProductApprovalAction;
  status: ProductApprovalStatus;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
  diff?: ProductPendingApprovalDiffItem[];
  submittedAt?: string | null;
  submittedBy?: string | null;
}

export interface ProductInfoItem {
  title: string;
  description: string;
  sortOrder: number;
}

export interface Product extends BaseEntity {
  tenantCode?: string | null;
  deletedAt?: string | null;
  createdByType?: string | null;
  updatedByType?: string | null;
  deletedByType?: string | null;
  updatedById?: string | null;
  deletedById?: string | null;
  name: string;
  slug: string;
  spuCode: string;
  productKind?: string;
  unitOfMeasure?: string;
  image?: string | null;
  imageHover?: string | null;
  defaultVariationId?: string | null;
  description?: string | null;
  brandId: string | null;
  categoryId: string;
  seasonId?: string | null;
  season?: ProductSeasonSummary | null;
  approval?: ProductApprovalSummary | null;
  hasPendingApproval?: boolean;
  status: ProductSpuStatus;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  variantAttributeOrder?: string[];
  taxRateOverride?: number | null;
  brand?: ProductBrandSummary | null;
  category?: ProductCategorySummary;
  variations?: ProductVariation[];
  skuCount?: number;
  productInfos?: ProductInfoItem[];
  packagingRelations?: ProductSpuPackagingRelation[];
  productMixMatch?: string[];
}

export interface ProductMixMatchItem {
  id: string;
  name: string;
  spuCode: string;
  image?: string | null;
  sellingPriceAfterTaxMinor?: string | null;
}

export interface ProductSpuPackagingRelation {
  id: string;
  productId: string;
  productVariationId?: string | null;
  packagingVariationId: string;
  quantity: number;
  includedPriceAfterTax?: string | null;
  isRequired: boolean;
  isDefault: boolean;
  canCustomerChoose: boolean;
  isVisibleOnProduct: boolean;
  sortOrder: number;
  status: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  scope: 'SPU' | 'VARIATION';
  sourceVariation?: {
    id: string;
    skuCode: string;
    skuKind: string;
    status: string;
    name: string;
  } | null;
  packagingVariation?: {
    id: string;
    productId: string;
    skuCode: string;
    skuKind: string;
    status: string;
    name: string;
    packagingProfile?: {
      id: string;
      basePriceAfterTax: string;
      includedPriceAfterTax: string;
      isVisible: boolean;
      canBeSold: boolean;
      packagingType: string;
      status: string;
    } | null;
  } | null;
}
