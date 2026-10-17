import { backendRequest, toUiEntityIds } from '@/apis/backend-request';
import type { ProductListBannerConfig } from '@/trading-ui/apis/banner/banner.entities';
import type { CreateProductListBannerConfigDto, UpdateProductListBannerConfigDto, QueryProductListBannerConfigDto } from '@/trading-ui/apis/banner/banner.interface';

export const JAVA_PRODUCT_LIST_BANNER_PATH = 'admin/banner/product-list-configs';
export async function javaProductListBanners(query?: QueryProductListBannerConfigDto): Promise<ProductListBannerConfig[]> {
  const params = new URLSearchParams();
  if (query?.conditionType) params.set('conditionType', query.conditionType);
  return toUiEntityIds(await backendRequest(JAVA_PRODUCT_LIST_BANNER_PATH + (params.size ? '?' + params : ''))) as ProductListBannerConfig[];
}
export async function javaSaveProductListBanner(body: CreateProductListBannerConfigDto | UpdateProductListBannerConfigDto, id?: string): Promise<ProductListBannerConfig> {
  const path = JAVA_PRODUCT_LIST_BANNER_PATH + (id ? '/' + encodeURIComponent(id) : '');
  return toUiEntityIds(await backendRequest(path, id ? 'PATCH' : 'POST', body)) as ProductListBannerConfig;
}
