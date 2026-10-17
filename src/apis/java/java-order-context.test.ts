import { expect, test, vi } from 'vitest';
vi.mock('@/common/config/app.config', () => ({ isJavaBackend: () => true }));
import { buildAdminOrderV2Context, getAdminOrderApiErrorCode, isAdminOrderResultUncertain } from '@/trading-ui/common/utils/order/admin-order-v2.util';
import { getOrderReturnQuoteDisplay } from '@/trading-ui/pages/order/returns-exchanges/order-return-quote-display.util';
import type { CartLine } from '@/trading-ui/pages/order/create-order/create-order.interface';

const cartLines: CartLine[] = [{ key: 'line-3', productId: '2', productName: 'Nhẫn', quantity: 2,
  variation: { id: '3', skuCode: 'R3', salePrice: 100000, stockQuantity: 5 } }];
const context = { cartLines, receiverPhone: '0796406514', firstName: 'Khách', provinceCode: '' as const,
  provinceName: 'TP HCM', wardCode: '' as const, wardName: 'Phường 1', addressLine: '123 Đường A', couponCodes: [] };

test('Java quote accepts real address names without invented GHN codes', () => {
  const result = buildAdminOrderV2Context(context);
  expect(result).toMatchObject({ provinceName: 'TP HCM', wardName: 'Phường 1', items: [{ variationId: '3', quantity: 2 }] });
  expect(result).not.toHaveProperty('wardCode');
  expect(result).not.toHaveProperty('provinceCode');
});

test('Java quote requires province and ward names, not just an address line', () => {
  expect(buildAdminOrderV2Context({ ...context, provinceName: '' })).toBeNull();
  expect(buildAdminOrderV2Context({ ...context, wardName: '' })).toBeNull();
});

test('uncertain writes retain idempotency while definite validation errors can be corrected', () => {
  expect(isAdminOrderResultUncertain({ code: 'IDEMPOTENCY_KEY_REUSED', status: 409 })).toBe(true);
  expect(isAdminOrderResultUncertain({ code: 'SERVER_ERROR', status: 503 })).toBe(true);
  expect(isAdminOrderResultUncertain({ code: 'VALIDATION', status: 422 })).toBe(false);
  expect(getAdminOrderApiErrorCode({ code: 'ORDER_PRICING_CHANGED' })).toBe('ORDER_PRICING_CHANGED');
});

test('missing return quote never invents a financial amount', () => {
  expect(getOrderReturnQuoteDisplay(null, false, false)).toMatchObject({ returnAmount: '—', compensation: '—', refund: '—', pickupCod: '—' });
});
