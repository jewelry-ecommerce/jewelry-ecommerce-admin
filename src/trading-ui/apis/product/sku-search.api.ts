import { axiosRequest } from '../../common/config';
import { WMS_API_BASE } from '../../common/constant/ware-house/api-base-response.interface';
import type { AdminSkuListQuery, WmsSkuSearchQuery, WmsSkuSearchResponse } from './sku-search.interface';

const WMS_SKU_SEARCH_PATH = `${WMS_API_BASE}product/skus/search`;
const ADMIN_SKU_LIST_PATH = 'product/admin/skus';
const ADMIN_SKU_SEARCH_PATH = 'product/admin/skus/search';

/** Warehouse / internal flows — proxied through WMS backend which calls PIM internally */
export const searchSkus = async (body: WmsSkuSearchQuery): Promise<WmsSkuSearchResponse> => {
  return (await axiosRequest.post(WMS_SKU_SEARCH_PATH, body)) as WmsSkuSearchResponse;
};

/** Admin product screens (PIM) */
export const getAdminSkus = async (params: AdminSkuListQuery): Promise<WmsSkuSearchResponse> => {
  return (await axiosRequest.get(ADMIN_SKU_LIST_PATH, { params })) as WmsSkuSearchResponse;
};

export const searchAdminSkus = async (body: WmsSkuSearchQuery): Promise<WmsSkuSearchResponse> => {
  return (await axiosRequest.post(ADMIN_SKU_SEARCH_PATH, body)) as WmsSkuSearchResponse;
};
