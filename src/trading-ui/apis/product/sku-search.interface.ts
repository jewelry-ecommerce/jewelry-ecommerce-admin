import { type ProductUnitOfMeasure } from './product.enum';

export type WmsSkuSearchOrderType = 'ASC' | 'DESC';

export interface WmsSkuSearchQuery {
  orderType: WmsSkuSearchOrderType;
  orderBy: string;
  page?: number;
  take?: number;
  search?: string;
  isPagination?: boolean;
  /** Optional: when provided, calls POST /sku/search */
  skuCodes?: string[];
  productUuid?: string;
  categoryUuid?: string;
  collectionUuid?: string;
  categoryIds?: string[];
  collectionIds?: string[];
  variationStatus?: string;
  skuKind?: string;
  productKind?: string;
  stockStatus?: string;
  minStock?: number;
  maxStock?: number;
}

export interface AdminSkuListQuery extends Omit<WmsSkuSearchQuery, 'skuCodes'> {
  /** When true, scope the SKU list to the promotion draft target. Requires promotionDraftId. */
  filterByPromotionDraftTarget?: boolean;
  /** Promotion draft UUID used when filterByPromotionDraftTarget is true. */
  promotionDraftId?: string;
  /** Tenant code forwarded to promotion service for draft target resolution. */
  promotionTenantCode?: string;
}

export interface WmsSkuSearchProductNested {
  id: string;
  name: string;
  spuCode?: string;
  productKind?: string;
  status?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface WmsSkuSearchCollectionNested {
  id?: string;
  name?: string;
}

export interface WmsSkuSearchAttribute {
  attributeId?: string;
  attributeCode?: string;
  attributeName?: string;
  displayType?: string;
  valueId?: string;
  value?: string;
  valueCode?: string;
  image?: string;
}

/** Media entry shape varies by BE; prefer url/path used for thumbnails */
export interface WmsSkuSearchMediaItem {
  url?: string;
  path?: string;
  image?: string;
}

export interface WmsSkuSearchListItem {
  id: string;
  tenantCode?: string;
  skuCode: string;
  slug?: string;
  skuKind?: string;
  itemType?: 'PRODUCT' | 'PACKAGING' | string;
  name: string;
  status?: string;
  price?: number | string;
  salePrice?: number | string;
  unitPrice?: number | string;
  priceMinor?: number | string;
  salePriceMinor?: number | string;
  sellingPrice?: number | string;
  sellingPriceAfterTaxMinor?: number | string;
  retailPrice?: number | string;
  retailPriceMinor?: number | string;
  basePrice?: number | string;
  basePriceAfterTax?: number | string;
  includedPriceAfterTax?: number | string;
  stock?: number;
  /** Some payloads expose NSX / unit at root level */
  manufacturer?: string;
  unitOfMeasure?: ProductUnitOfMeasure;
  unit?: string;
  product?: WmsSkuSearchProductNested;
  categoryIds?: string[];
  collectionIds?: string[];
  collections?: WmsSkuSearchCollectionNested[];
  image?: string;
  packaging?: {
    price?: number | string;
    salePrice?: number | string;
    unitPrice?: number | string;
    sellingPrice?: number | string;
    sellingPriceAfterTaxMinor?: number | string;
    basePrice?: number | string;
    basePriceAfterTax?: number | string;
    includedPriceAfterTax?: number | string;
    isVisible?: boolean;
    canBeSold?: boolean;
    packagingType?: string;
    status?: string;
  } | null;
  medias?: WmsSkuSearchMediaItem[];
  attributes?: WmsSkuSearchAttribute[];
}

export interface WmsSkuSearchPagination {
  total: number;
  currentPage: number;
  nextPage?: boolean;
  previousPage?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  totalPage?: number;
}

export interface WmsSkuSearchResponse {
  total: number;
  list: WmsSkuSearchListItem[];
  pagination?: WmsSkuSearchPagination;
}
