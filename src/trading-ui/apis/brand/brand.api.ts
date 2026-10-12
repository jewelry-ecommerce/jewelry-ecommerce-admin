import { axiosRequest } from '../../common/config';
import { type ResList } from '../../common/constant/api.interface';
import { type Brand } from './brand.entities';
import { type CreateBrandDto, type QueryBrandDto, type UpdateBrandDto } from './brand.interface';

const BRAND_ADMIN_BASE = 'product/admin/brands';

export const getBrandList = async (params: Partial<QueryBrandDto>): Promise<ResList<Brand>> => await axiosRequest.get(BRAND_ADMIN_BASE, { params });

export const getBrandDetail = async (id: string): Promise<Brand> => await axiosRequest.get(`${BRAND_ADMIN_BASE}/${id}`);

export const createBrand = async (body: CreateBrandDto): Promise<Brand> => await axiosRequest.post(BRAND_ADMIN_BASE, body);

export const updateBrand = async (id: string, body: UpdateBrandDto): Promise<Brand> => await axiosRequest.patch(`${BRAND_ADMIN_BASE}/${id}`, body);

export const deleteBrand = async (id: string): Promise<void> => await axiosRequest.delete(`${BRAND_ADMIN_BASE}/${id}`);
