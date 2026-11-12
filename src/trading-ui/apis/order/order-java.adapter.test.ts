import { beforeEach, expect, test, vi } from 'vitest';
const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/apis/backend-request', () => ({ backendRequest: transport.request }));
import { getJavaSourceOrderList, getJavaSourceOrderDetail, cancelJavaSourceOrder, changeJavaSourceOrder } from './order-java.adapter';
import { OrderStatus, PaymentStatus } from './order.enum';

test('order date query matches Java LocalDate yyyy-MM-dd rather than ISO timestamp', async () => {
  transport.request.mockImplementation(async (path: string) => path.includes('/counts?') ? { total: 0, byStatus: {} } : { list: [], total: 0 });
  await getJavaSourceOrderList({ page: 1, take: 20, startDate: '2026-10-01T00:00:00+07:00', endDate: '2026-10-11T23:59:59+07:00' });
  const query = new URLSearchParams(transport.request.mock.calls[0][0].split('?')[1]);
  expect(query.get('fromDate')).toMatch(/^2026-10-0[12]$/);
  expect(query.get('toDate')).toMatch(/^2026-10-1[12]$/);
});

const order = { id: 903, code: 'JEW-903', placedAt: '2026-10-11T08:00:00Z', status: 'PENDING',
  paymentStatus: 'UNPAID', paymentMethod: 'COD', grandTotal: 120000,
  items: [{ id: 910, skuId: 12, productId: 9, name: 'Ring', quantity: 1, unitPrice: 120000, lineTotal: 120000 }],
  timeline: [{ status: 'PENDING', occurredAt: '2026-10-11T08:00:00Z' }] };
beforeEach(() => { transport.request.mockReset(); });

test('list preserves numeric backend IDs, order codes and real counts', async () => {
  transport.request.mockImplementation(async (path: string) => {
    if (path.includes('/counts?')) return { total: 2, byStatus: { PENDING: 2 } };
    return { list: [order], total: 2 };
  });
  const result = await getJavaSourceOrderList({ page: 1, take: 20, search: ' JEW ', paymentStatus: PaymentStatus.UNPAID });
  expect(result.list[0]).toMatchObject({ id: '903', orderCode: 'JEW-903', status: OrderStatus.PENDING,
    items: [expect.objectContaining({ id: '910', variationId: '12', productId: '9' })] });
  expect(result.summary).toMatchObject({ ALL: 2, [OrderStatus.PENDING]: 2 });
  const query = new URLSearchParams(transport.request.mock.calls[0][0].split('?')[1]);
  expect(query.get('search')).toBe('JEW');
  expect(query.get('paymentStatus')).toBe('UNPAID');
});

test('v6 sends supported filters and uses one counts endpoint without status or pagination', async () => {
  transport.request.mockImplementation(async (path: string) => path.includes('/counts?') ? { total: 1, byStatus: { PENDING: 1 } }
    : path.includes('?') ? { list: [order], total: 1 } : { ...order, id: 905 });
  await getJavaSourceOrderList({ page: 1, take: 20, orderStatus: OrderStatus.PENDING,
    dateField: 'deliveredAt', skuCode: 'RING', provinceName: 'HCM' });
  await getJavaSourceOrderDetail('905');
  const counts = transport.request.mock.calls.find(([path]) => path.includes('/counts?'));
  const query = new URLSearchParams(counts![0].split('?')[1]);
  expect(query.get('status')).toBeNull(); expect(query.get('page')).toBeNull();
  expect(query.get('skuCode')).toBe('RING'); expect(query.get('dateField')).toBe('deliveredAt');
  expect(transport.request).toHaveBeenCalledTimes(3);
});

test('v6 numeric detail URL does not scan all orders to resolve the code', async () => {
  transport.request.mockImplementation(async (path: string) => path.includes('?')
    ? { list: [{ ...order, id: 904, code: 'JEW-904' }], total: 1 } : { ...order, id: 904, code: 'JEW-904' });
  const result = await getJavaSourceOrderDetail('904');
  expect(result.id).toBe('904');
  expect(transport.request).toHaveBeenLastCalledWith('admin/orders/904');
  expect(transport.request).toHaveBeenCalledTimes(1);
});

test('cancel uses Java code endpoint and POST body rather than numeric ID endpoint', async () => {
  transport.request.mockResolvedValue({ ...order, status: 'CANCELLED' });
  const result = await cancelJavaSourceOrder('JEW-903', 'Customer requested');
  expect(transport.request).toHaveBeenCalledWith('admin/orders/JEW-903/cancel', 'POST', { reason: 'Customer requested' });
  expect(result.data.status).toBe(OrderStatus.CANCELLED);
});

test('Java status action sends CONFIRMED/SHIPPING/DELIVERED to the code endpoint', async () => {
  for (const target of ['CONFIRMED', 'SHIPPING', 'DELIVERED']) {
    transport.request.mockResolvedValueOnce({ ...order, status: target });
    const result = await changeJavaSourceOrder('JEW-903', target);
    expect(transport.request).toHaveBeenLastCalledWith('admin/orders/JEW-903/status', 'PATCH', { status: target });
    expect(result.data.status.toUpperCase()).toBe(target);
  }
});
