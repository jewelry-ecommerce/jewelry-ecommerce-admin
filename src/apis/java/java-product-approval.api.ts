import { backendRequest } from '@/apis/backend-request';
import type { ProductApprovalRequestDto, ProductApprovalReviewRequestDto, ProductMutationResponseDto, QueryAdminProductApprovalDto } from '@/trading-ui/apis/product/product.interface';
const BASE = 'admin/catalog/product-approvals';
export async function javaProductApprovals(query: Partial<QueryAdminProductApprovalDto>) {
  const params = new URLSearchParams({ page: String(query.page ?? 1), take: String(query.isPagination === false ? 100 : query.take ?? 20) });
  if (query.status) params.set('status', query.status); if (query.search) params.set('search', query.search);
  const page = await backendRequest<{ list: ProductApprovalRequestDto[]; total: number; pagination: { currentPage: number; hasNextPage: boolean } }>(BASE + '?' + params);
  while (query.isPagination === false && page.pagination.hasNextPage) {
    params.set('page', String(page.pagination.currentPage + 1));
    const next = await backendRequest<typeof page>(BASE + '?' + params);
    page.list.push(...next.list); page.pagination = next.pagination;
  }
  return { list: page.list.map(row => ({ ...row, id: String(row.id), productId: String(row.productId) })), total: page.total };
}
export async function javaReviewProducts(body: ProductApprovalReviewRequestDto): Promise<void> {
  await backendRequest(BASE + '/review', 'POST', { decision: body.decision, reason: body.reason,
    items: body.items.map(row => ({ productId: Number(row.productUuid), approvalRequestId: Number(row.approvalRequestUuid) })) });
}
export async function javaCancelApproval(id: string) {
  const result = await backendRequest<ProductMutationResponseDto>(BASE + '/' + id + '/cancel', 'POST');
  return { ...result, approval: result.approval ?? undefined, success: true, productStatus: result.status };
}
export function javaSubmitProduct(id: string): Promise<ProductMutationResponseDto> {
  return backendRequest('admin/catalog/products/' + id + '/submit', 'POST');
}
