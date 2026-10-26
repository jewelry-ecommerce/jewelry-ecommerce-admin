import { beforeEach, expect, test, vi } from 'vitest';
import type * as BackendModule from '@/apis/backend-request';
const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/apis/backend-request', async importOriginal => ({ ...await importOriginal<typeof BackendModule>(), backendRequest: mocks.request }));
import { javaCreateAdminOrder, javaUpdateAdminOrder, javaDuplicateAdminOrder, javaConfirmAdminPayment, javaOrderCustomersByPhone } from './java-order-advanced.api';
import { BackendHttpError } from '@/apis/backend-request';
import { OrderSource, PaymentMethod } from '@/trading-ui/apis/order/order.enum';
import type { ICreateOrderApiRequest } from '@/trading-ui/apis/order/order.interface';
const order = { id: 9, code: 'DH9', status: 'PENDING', paymentStatus: 'UNPAID', paymentMethod: 'COD', source: 'ADMIN',
  shippingMethod: 'STANDARD', placedAt: '2026-10-17T00:00:00Z', items: [{ id: 4, skuId: 3, skuCode: 'RING-3', name: 'Nhẫn', quantity: 1 }] };
beforeEach(() => { mocks.request.mockReset(); mocks.request.mockResolvedValue(order); });
test('create sends numeric SKU IDs and returns orderId for navigation to the real order detail', async () => {
  const body: ICreateOrderApiRequest = { contextVersion: 2, items: [{ variationId: '3', quantity: 1 }], receiverPhone: '0796406514',
    firstName: 'Khách', provinceCode: 0, provinceName: 'TP HCM', wardCode: 0, wardName: 'Phường 1', addressLine: '123 Đường A', paymentMethod: PaymentMethod.COD, source: OrderSource.MANUAL };
  expect(await javaCreateAdminOrder(body)).toMatchObject({ success: true, orderId: '9', orderCode: 'DH9' });
  expect(mocks.request).toHaveBeenCalledWith('admin/orders', 'POST', expect.objectContaining({ items: [{ variationId: 3, quantity: 1 }] }));
});
test('update and payment confirmation preserve source Manual and SKU snapshot', async () => {
  const changed = await javaUpdateAdminOrder('9', { note: 'Sửa ghi chú' });
  expect(changed.data).toMatchObject({ id: '9', source: OrderSource.MANUAL, items: [expect.objectContaining({ skuCode: 'RING-3' })] });
  await javaConfirmAdminPayment('9', { note: 'Đã thu tiền' });
  expect(mocks.request).toHaveBeenLastCalledWith('admin/orders/9/confirm-payment', 'PUT', { note: 'Đã thu tiền' });
});
test('duplicate sends the actual source ID, not a new create operation with invented metadata', async () => {
  await javaDuplicateAdminOrder({ sourceOrderId: '9', replaceSourceAfterDuplicate: false });
  expect(mocks.request).toHaveBeenCalledWith('admin/orders/duplicate', 'POST', { sourceOrderId: 9, replaceSourceAfterDuplicate: false });
});

test('update does not serialize absent geographic codes as invented zeros', async () => {
  await javaUpdateAdminOrder('9', { provinceCode: 0, wardCode: 0, provinceName: 'TP HCM', wardName: 'Phường 1' });
  const payload = JSON.parse(JSON.stringify(mocks.request.mock.calls[0][2]));
  expect(payload).toEqual({ provinceName: 'TP HCM', wardName: 'Phường 1' });
});
test('missing phone lookup allows guest entry; authorization errors still propagate', async () => {
  mocks.request.mockRejectedValueOnce(new BackendHttpError('NOT_FOUND', 'Không tìm thấy', 404));
  expect(await javaOrderCustomersByPhone('0796406514')).toEqual([]);
  mocks.request.mockRejectedValueOnce(new BackendHttpError('FORBIDDEN', 'Không có quyền', 403));
  await expect(javaOrderCustomersByPhone('0796406514')).rejects.toMatchObject({ status: 403 });
});

test('customer lookup uses orders permission instead of requiring promotion permission', async () => {
  mocks.request.mockResolvedValueOnce({ customerId: 2, phone: '0796406514', fullName: 'Khách' });
  expect(await javaOrderCustomersByPhone('0796406514')).toEqual([{ id: '2', phone: '0796406514', firstName: 'Khách' }]);
  expect(mocks.request).toHaveBeenCalledWith('admin/orders/customer-audience/by-phone?phone=0796406514');
});
