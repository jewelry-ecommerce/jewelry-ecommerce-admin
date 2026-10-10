import { PRODUCTS, CATEGORIES, COLLECTIONS } from '@/mocks/data/catalog.data';
import { getCmsDemoPages } from '@/apis/cms-demo/cms-demo.api';
export enum CollectionStatus { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE' }
export * from './banner/banner.enum';
export * from './banner/banner.entities';
export * from './banner/banner.interface';
export { bannerApi } from './banner/banner.api';
export { MediaVisibility } from './file/file.enum';
export interface Product {
  id: string; spuCode: string; name: string; image: string; imageHover: string;
  variations: { id: string }[]; defaultVariationId?: string;
}
interface ProductQuery {
  orderType?: string; orderBy?: string; isPagination?: boolean; search?: string;
  productIds?: string | string[]; page?: number; take?: number;
}
export const productApi = {
  async getAdminProductList(query: ProductQuery): Promise<{ list: Product[] }> {
    const search = query.search?.trim().toLowerCase() || '';
    const productIds = typeof query.productIds === 'string' ? query.productIds.split(',') : query.productIds;
    const list = PRODUCTS.filter(product =>
      (!productIds?.length || productIds.includes(product.id)) &&
      (!search || product.name.toLowerCase().includes(search) || product.code.toLowerCase().includes(search))
    ).map(product => ({
      id: product.id, spuCode: product.code, name: product.name,
      image: product.media[0]?.url || '', imageHover: product.media[1]?.url || '',
      defaultVariationId: product.variants[0]?.id,
      variations: product.variants.map(variant => ({ id: variant.id })),
    }));
    return { list };
  },
};
export const categoryApi = {
  async getCategoryTree(_query: { compact?: boolean; status?: string }) {
    return CATEGORIES.map(({ id, name, slug }) => ({ id, name, slug, children: [] }));
  },
};
export const collectionApi = {
  async getCollectionList(_query: { page?: number; take?: number; isPagination?: boolean; status?: string }) {
    return { list: COLLECTIONS.map(({ id, name, slug }) => ({ id, name, slug })) };
  },
};
export const cmsApi = {
  async getPageList(_query: { page?: number; take?: number; isPagination?: boolean; isActive?: boolean }) {
    return { list: await getCmsDemoPages() };
  },
};
