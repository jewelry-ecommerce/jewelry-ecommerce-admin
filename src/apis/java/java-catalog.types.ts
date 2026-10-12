
import type { ProductSpuStatus } from '@/trading-ui/apis/product/product.enum';
export interface JavaPage<T> { total: number; list: T[]; pagination: { currentPage: number; hasNextPage: boolean; hasPreviousPage: boolean; totalPage: number } }
export interface JavaCategory { id: number; parentId: number | null; name: string; slug: string; description?: string; imageUrl?: string; sortOrder: number; createdDate?: string; updatedDate?: string }
export interface JavaCollection { id: number; name: string; slug: string; description?: string; heroImageUrl?: string; status: string; createdDate?: string; updatedDate?: string }
export interface JavaAttribute { id: number; name: string; code: string; type: string; options: string[] }
export interface JavaBinding { id: number; name: string; code: string; value: string; type: string }
export interface JavaSku { id: number | string; skuCode: string; name: string; status: string; listPrice: number; salePrice: number | null; availableStock: number; isDefault: boolean; weightGram?: number; attributeBindings: JavaBinding[] }
export interface JavaMedia { id: number | string; skuId: number | string | null; url: string; sortOrder: number; type: string }
export interface JavaProduct { id: number | string; code: string; name: string; slug: string; status: ProductSpuStatus; categoryId: number; categoryName: string; categorySlug: string; description?: string; shortDescription?: string; material?: string; occasion?: string; thumbnailUrl?: string; skus: JavaSku[]; media: JavaMedia[]; createdAt: string; updatedAt: string; collections: JavaCollection[] }
export const JAVA_CATALOG_PATH = 'admin/catalog';
export const JAVA_PAGE_POLICY = { firstPage: 1, take: 100 } as const;
export function optionKey(attributeId: number | string, value: string): string { return String(attributeId) + '~' + encodeURIComponent(value); }
export function decodeOption(key: string): { attributeId: number; value: string } {
  const separator = key.indexOf('~');
  const attributeId = Number(key.slice(0, separator));
  if (separator < 1 || !Number.isSafeInteger(attributeId) || attributeId < 1) throw new Error('Giá trị thuộc tính Java không hợp lệ.');
  return { attributeId, value: decodeURIComponent(key.slice(separator + 1)) };
}
