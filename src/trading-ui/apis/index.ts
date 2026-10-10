import { PRODUCTS, CATEGORIES, COLLECTIONS } from '@/mocks/data/catalog.data';
import { getCmsDemoPages } from '@/apis/cms-demo/cms-demo.api';
import { getDataSourceMode } from '@/common/config/app.config';
import { productApi as backendProductApi } from './product/product.api';
import { categoryApi as backendCategoryApi } from './category/category.api';
import { collectionApi as backendCollectionApi } from './collection/collection.api';
import { CategoryStatus } from './category/category.enum';
import { CollectionStatus } from './collection/collection.enum';
export { CollectionStatus };
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
    if (getDataSourceMode() === "HTTP") {
      const result = await backendProductApi.getAdminProductList({
        page: query.page, take: query.take, search: query.search, isPagination: query.isPagination,
        productIds: Array.isArray(query.productIds) ? query.productIds.join(',') : query.productIds,
      });
      return { list: result.list.map(product => ({
        id: product.id, spuCode: product.spuCode, name: product.name, image: product.image ?? "", imageHover: product.imageHover ?? "",
        variations: (product.variations ?? []).map(variation => ({ id: variation.id })), defaultVariationId: product.defaultVariationId ?? undefined,
      })) };
    }
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
    if (getDataSourceMode() === "HTTP") return backendCategoryApi.getCategoryTree({
      status: Object.values(CategoryStatus).find(status => status === _query.status),
    });
    return CATEGORIES.map(({ id, name, slug }) => ({ id, name, slug, children: [] }));
  },
};
export const collectionApi = {
  async getCollectionList(_query: { page?: number; take?: number; isPagination?: boolean; status?: string }) {
    if (getDataSourceMode() === "HTTP") {
      const result = await backendCollectionApi.getCollectionList({
        page: _query.page, take: _query.take, isPagination: _query.isPagination,
        status: Object.values(CollectionStatus).find(status => status === _query.status),
      });
      return { list: result.list.map(collection => ({ id: collection.id, name: collection.name, slug: collection.slug })) };
    }
    return { list: COLLECTIONS.map(({ id, name, slug }) => ({ id, name, slug })) };
  },
};
export const cmsApi = {
  async getPageList(_query: { page?: number; take?: number; isPagination?: boolean; isActive?: boolean }) {
    return { list: await getCmsDemoPages() };
  },
};
