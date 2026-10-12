import { beforeEach, expect, test, vi } from 'vitest';
const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/apis/backend-request', () => ({ backendRequest: transport.request }));
import { getCustomerRequestList, getCustomerRequestDetail } from './customer-request.api';
beforeEach(() => transport.request.mockReset());
test('list normalizes number IDs without inventing absent order/product bindings', async () => {
  transport.request.mockResolvedValue({ list: [{ id: 7, productId: 8, productVariantId: 9, orderId: null }], total: 1 });
  const result = await getCustomerRequestList('back-in-stock', { page: 1, take: 20 });
  expect(result.items[0]).toMatchObject({ id: '7', productId: '8', productVariantId: '9', orderId: undefined });
});
test('detail also accepts current Java string IDs and normalizes order ID', async () => {
  transport.request.mockResolvedValue({ id: '7', orderId: 10, productId: null });
  expect(await getCustomerRequestDetail('7')).toMatchObject({ id: '7', orderId: '10', productId: undefined });
  expect(transport.request).toHaveBeenCalledWith('admin/customer-request/7');
});
