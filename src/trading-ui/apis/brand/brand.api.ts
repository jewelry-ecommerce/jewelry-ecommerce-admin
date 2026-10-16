import { axiosRequest } from '../../common/config';
import { isJavaBackend } from '@/common/config/app.config';
import { javaBrands, javaBrand, javaSaveBrand, javaDeleteBrand } from '@/apis/java/java-brand-season.api';
import { type ResList } from '../../common/constant/api.interface';
import { type Brand } from './brand.entities';
import { type CreateBrandDto, type QueryBrandDto, type UpdateBrandDto } from './brand.interface';

const BRAND_ADMIN_BASE = 'product/admin/brands';

export const getBrandList = async (params: Partial<QueryBrandDto>): Promise<ResList<Brand>> => isJavaBackend() ? javaBrands(params) : await axiosRequest.get(BRAND_ADMIN_BASE, { params });

export const getBrandDetail = async (id: string): Promise<Brand> => isJavaBackend() ? javaBrand(id) : await axiosRequest.get(`${BRAND_ADMIN_BASE}/${id}`);

export const createBrand = async (body: CreateBrandDto): Promise<Brand> => isJavaBackend() ? javaSaveBrand(body) : await axiosRequest.post(BRAND_ADMIN_BASE, body);

export const updateBrand = async (id: string, body: UpdateBrandDto): Promise<Brand> => isJavaBackend() ? javaSaveBrand(body, id) : await axiosRequest.patch(`${BRAND_ADMIN_BASE}/${id}`, body);

export const deleteBrand = async (id: string): Promise<void> => isJavaBackend() ? javaDeleteBrand(id) : await axiosRequest.delete(`${BRAND_ADMIN_BASE}/${id}`);
