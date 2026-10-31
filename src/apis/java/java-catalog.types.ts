
import type { ProductSpuStatus } from '@/trading-ui/apis/product/product.enum';
import type { ProductCreateRequestDto } from '@/trading-ui/apis/product/product.interface';
import type { Product } from '@/trading-ui/apis/product/product.entities';
export interface JavaProductExtras extends Pick<ProductCreateRequestDto,'unitOfMeasure'|'taxRateOverride'|'length'|'width'|'height'|'metaTitle'|'metaDescription'|'metaKeywords'> {
  brandId?:number|null;brandName?:string;brandCode?:string;brandImage?:string;seasonId?:number|null;seasonName?:string;
  approval?:Product['approval'];hasPendingApproval?:boolean;
  weightGram?:number;productInfos?:{id:number|string;title:string;description:string;sortOrder:number}[];
  productMixMatch?:{id:number|string;name:string;code?:string}[];
}
export interface JavaSkuExtras {costPrice?:number; b2bWholesalePrice?:number;taxRateOverride?:number;length?:number;width?:number;height?:number}
export interface JavaPage<T> { total: number; list: T[]; pagination: { currentPage: number; hasNextPage: boolean; hasPreviousPage: boolean; totalPage: number } }
export interface JavaCategory { id: number; parentId: number | null; name: string; slug: string; code: string; status: 'ACTIVE' | 'INACTIVE'; level: number; directAttributeIds: number[]; inheritedAttributeIds: number[]; effectiveAttributeIds: number[]; description?: string; imageUrl?: string; sortOrder: number; createdDate?: string; updatedDate?: string }
export interface JavaCollection { id: number; name: string; slug: string; description?: string; heroImageUrl?: string; status: string; createdDate?: string; updatedDate?: string }
export interface JavaAttributeValue { id: number; code: string; value: string; imageUrl?: string | null }
export interface JavaAttribute { id: number; name: string; code: string; type: string; options: string[]; status: 'ACTIVE' | 'INACTIVE'; displayType: 'TEXT' | 'IMAGE'; values: JavaAttributeValue[] }
export interface JavaBinding { id: number; name: string; code: string; value: string; type: string }
export interface JavaSku extends JavaSkuExtras { id: number | string; skuCode: string; name: string; status: string; listPrice: number; salePrice: number | null; availableStock: number; isDefault: boolean; weightGram?: number; attributeBindings: JavaBinding[] }
export interface JavaMedia { id: number | string; skuId: number | string | null; url: string; sortOrder: number; type: string }
export interface JavaProduct extends JavaProductExtras { id: number | string; code: string; name: string; slug: string; status: ProductSpuStatus; categoryId: number; categoryName: string; categorySlug: string; description?: string; shortDescription?: string; material?: string; occasion?: string; thumbnailUrl?: string; skus: JavaSku[]; media: JavaMedia[]; createdAt: string; updatedAt: string; collections: JavaCollection[] }
export const JAVA_CATALOG_PATH = 'admin/catalog';
export const JAVA_PAGE_POLICY = { firstPage: 1, take: 100 } as const;
export function optionKey(attributeId: number | string, value: string): string { return String(attributeId) + '~' + encodeURIComponent(value); }
export function decodeOption(key: string): { attributeId: number; value: string } {
  const separator = key.indexOf('~');
  const attributeId = Number(key.slice(0, separator));
  if (separator < 1 || !Number.isSafeInteger(attributeId) || attributeId < 1) throw new Error('Giá trị thuộc tính không hợp lệ.');
  return { attributeId, value: decodeURIComponent(key.slice(separator + 1)) };
}
