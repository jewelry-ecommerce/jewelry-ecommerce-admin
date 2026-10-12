import { type Pagination } from '../../common/constant/api.interface';
import { type ProductSetStatus } from './product-set.enum';

export interface ProductSetShortDescription {
  title: string;
  content: string;
}

export interface ProductSetItemVariationAttribute {
  attributeId: string;
  attributeName: string;
  valueId: string;
  value: string;
}

export interface ProductSetItemVariation {
  id: string;
  variationId: string;
  skuCode?: string;
  name?: string;
  slug?: string;
  image?: string | null;
  attributes: ProductSetItemVariationAttribute[];
}

export interface ProductSetItemVariationsResponse {
  setItemId: string;
  setId: string;
  productId: string;
  productName?: string;
  quantity: number;
  isRequired: boolean;
  allowedVariations: ProductSetItemVariation[];
}

export interface ProductSetItem {
  id: string;
  setId: string;
  productId: string;
  quantity: number;
  isRequired: boolean;
  isKey: boolean;
  sortOrder: number;
  product?: {
    id: string;
    spuCode?: string;
    name?: string;
    image?: string;
  };
}

export interface ProductSetRow {
  id: string;
  tenantCode: string;
  code: string;
  slug: string;
  name: string;
  images: string[];
  description?: string | null;
  shortDescriptions?: ProductSetShortDescription[] | null;
  note?: string | null;
  status: ProductSetStatus;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSetDetail extends ProductSetRow {
  items: ProductSetItem[];
}

export interface QueryProductSetDto {
  page?: number;
  take?: number;
  search?: string;
  status?: ProductSetStatus;
}

export interface ProductSetListResponseDto {
  total: number;
  list: ProductSetRow[];
  pagination: Pagination;
}
