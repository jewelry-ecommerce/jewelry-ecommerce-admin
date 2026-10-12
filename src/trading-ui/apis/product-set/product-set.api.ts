import { axiosRequest } from '../../common/config';
import { type ProductSetDetail, type ProductSetItemVariationsResponse, type ProductSetListResponseDto, type QueryProductSetDto } from './product-set.interface';

const PRODUCT_SET_ADMIN_BASE = 'product/admin/product-sets';

export const getAdminProductSetList = async (params: Partial<QueryProductSetDto>): Promise<ProductSetListResponseDto> => await axiosRequest.get(PRODUCT_SET_ADMIN_BASE, { params });

export const getAdminProductSetDetail = async (idOrCodeOrSlug: string): Promise<ProductSetDetail> => await axiosRequest.get(`${PRODUCT_SET_ADMIN_BASE}/${idOrCodeOrSlug}`);

export const getAdminProductSetItemVariations = async (setId: string, itemId: string): Promise<ProductSetItemVariationsResponse> =>
  await axiosRequest.get(`${PRODUCT_SET_ADMIN_BASE}/${setId}/items/${itemId}/variations`);

export const deleteAdminProductSet = async (id: string): Promise<void> => await axiosRequest.delete(`${PRODUCT_SET_ADMIN_BASE}/${id}`);
