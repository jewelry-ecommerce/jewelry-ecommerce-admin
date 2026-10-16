import { axiosRequest } from '../../common/config';
import { isJavaBackend } from '@/common/config/app.config';
import { javaProductApprovals, javaReviewProducts, javaCancelApproval, javaSubmitProduct } from '@/apis/java/java-product-approval.api';
import { type ResList } from '../../common/constant/api.interface';
import { type ProductVariation } from './product.entities';
import {
  type AdminProductDetailDto,
  type ProductListResponseDto,
  type ProductMutationResponseDto,
  type ProductCreateRequestDto,
  type ProductPatchRequestDto,
  type ProductPatchStatusRequestDto,
  type ProductApprovalRequestDto,
  type ProductApprovalReviewRequestDto,
  type QueryAdminProductApprovalDto,
  type QueryAdminProductDto,
  type SkuMatrixPreviewRequestDto,
  type SkuMatrixPreviewResponseDto,
  type ProductApprovalCancelResponseDto,
  type ProductPackagingRelationsPatchRequestDto,
  type ProductPackagingRelationsPatchResponseDto,
  type ProductAuditLogListRequestDto,
} from './product.interface';

export const getAdminProductList = async (params: Partial<QueryAdminProductDto>): Promise<ProductListResponseDto> => await axiosRequest.get(`product/admin/products`, { params });

export const getAdminProductDetail = async (uuid: string): Promise<AdminProductDetailDto> => await axiosRequest.get(`product/admin/products/${uuid}`);

export const getAdminVariationListByProduct = async (productId: string): Promise<ResList<ProductVariation>> => await axiosRequest.get(`product/admin/products/${productId}/variants`);

export const postAdminProduct = async (body: ProductCreateRequestDto): Promise<ProductMutationResponseDto> => await axiosRequest.post(`product/admin/products`, body);

export const patchAdminProduct = async (id: string, body: ProductPatchRequestDto): Promise<ProductMutationResponseDto> => await axiosRequest.patch(`product/admin/products/${id}`, body);

export const patchAdminProductPackagingRelations = async (id: string, body: ProductPackagingRelationsPatchRequestDto): Promise<ProductPackagingRelationsPatchResponseDto> =>
  await axiosRequest.patch(`product/admin/products/${id}/packaging-relations`, body);

export const postSkuMatrixPreview = async (body: SkuMatrixPreviewRequestDto): Promise<SkuMatrixPreviewResponseDto> => await axiosRequest.post(`product/admin/products/sku-matrix/preview`, body);

export const getAdminProductApprovalList = async (params: Partial<QueryAdminProductApprovalDto>): Promise<ResList<ProductApprovalRequestDto>> =>
  isJavaBackend() ? javaProductApprovals(params) : await axiosRequest.get(`product/admin/product-approvals`, { params });

export const postAdminProductApprovalReview = async (body: ProductApprovalReviewRequestDto): Promise<void> => isJavaBackend() ? javaReviewProducts(body) : await axiosRequest.post(`product/admin/product-approvals/review`, body);

export const postAdminProductApprovalCancel = async (id: string): Promise<ProductApprovalCancelResponseDto> => isJavaBackend() ? javaCancelApproval(id) : await axiosRequest.post(`product/admin/product-approvals/${id}/cancel`);

export const postAdminProductSubmit = async (id: string): Promise<ProductMutationResponseDto> => isJavaBackend() ? javaSubmitProduct(id) : await axiosRequest.post(`product/admin/products/${id}/submit`);

export const patchAdminProductStatus = async (id: string, body: ProductPatchStatusRequestDto): Promise<ProductMutationResponseDto> =>
  await axiosRequest.patch(`product/admin/products/${id}/status`, body);

export const deleteAdminProduct = async (id: string): Promise<void> => await axiosRequest.delete(`product/admin/products/${id}`);

export const getProductAuditLogs = async (params: ProductAuditLogListRequestDto): Promise<unknown> => await axiosRequest.get(`product/admin/audit-logs`, { params });
