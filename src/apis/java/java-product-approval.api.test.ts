import { beforeEach, expect, test, vi } from 'vitest';
const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/apis/backend-request', () => ({ backendRequest: transport.request }));
import { javaSubmitProduct, javaReviewProducts } from './java-product-approval.api';
beforeEach(() => { vi.clearAllMocks(); });
test('submit uses approval endpoint and never publishes product directly', async () => {
  transport.request.mockResolvedValue({ uuid: '3', status: 'DRAFT', hasPendingApproval: true });
  expect((await javaSubmitProduct('3')).hasPendingApproval).toBe(true);
  expect(transport.request).toHaveBeenCalledWith('admin/catalog/products/3/submit', 'POST');
});
test('review carries numeric product and request IDs and explicit decision', async () => {
  await javaReviewProducts({ items: [{ productUuid: '3', approvalRequestUuid: '8' }], decision: 'REJECT', reason: 'Thiếu ảnh' });
  expect(transport.request).toHaveBeenCalledWith('admin/catalog/product-approvals/review', 'POST',
    { items: [{ productId: 3, approvalRequestId: 8 }], decision: 'REJECT', reason: 'Thiếu ảnh' });
});
