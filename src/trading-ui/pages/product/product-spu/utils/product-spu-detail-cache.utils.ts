import { mutate as globalMutate } from 'swr';
import { productApi, type AdminProductDetailDto } from '../../../../apis';

export const buildProductSpuDetailSwrKey = (spuId: string) => ['product/admin/products', 'detail', spuId] as const;

export const revalidateProductSpuDetail = async (spuId: string) => globalMutate(buildProductSpuDetailSwrKey(spuId), () => productApi.getAdminProductDetail(spuId), { revalidate: false });

export const buildProductSpuDetailHydrationKey = (spuId: string, detail: AdminProductDetailDto): string =>
  `${spuId}:${detail.updatedAt ?? ''}:${detail.hasPendingApproval ? 1 : 0}:${detail.pendingApproval?.id ?? ''}`;
