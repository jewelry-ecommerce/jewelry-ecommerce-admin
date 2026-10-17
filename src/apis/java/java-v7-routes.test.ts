import { expect, test } from 'vitest';
import { resolveJavaV7Route, javaV7Body, javaV7Response, toJavaEntityIds } from './java-v7-routes';

const draft = 'promotion/promotion-drafts';
const published = 'promotion/promotions';
const routes = [
  ['GET', 'cms/admin/navigations', 'admin/cms/navigations'],
  ['GET', 'cms/admin/navigations/publish-status', 'admin/cms/navigations/publish-status'],
  ['POST', 'cms/admin/navigations/publish', 'admin/cms/navigations/publish'],
  ['DELETE', 'cms/admin/navigations/cache', 'admin/cms/navigations/cache'],
  ['PATCH', 'cms/admin/navigations/reorder', 'admin/cms/navigations/reorder'],
  ['PATCH', 'cms/admin/navigations/2/archive', 'admin/cms/navigations/2/archive'],
  ['POST', 'product/admin/search-pinned-products', 'admin/catalog/search-pinned-products'],
  ['PATCH', 'product/admin/search-pinned-products/2', 'admin/catalog/search-pinned-products/2'],
  ['DELETE', 'product/admin/search-pinned-products/2', 'admin/catalog/search-pinned-products/2'],
  ['GET', 'promotion/promotion-campaigns', 'admin/promotions/campaigns'],
  ['POST', draft, 'admin/promotions/drafts'],
  ['DELETE', draft + '/3', 'admin/promotions/drafts/3'],
  ['POST', draft + '/3/publish', 'admin/promotions/drafts/3/publish'],
  ['PUT', draft + '/3/target', 'admin/promotions/drafts/3/target'],
  ['PUT', draft + '/3/audience', 'admin/promotions/drafts/3/audience'],
  ['PUT', draft + '/3/applicability', 'admin/promotions/drafts/3/applicability'],
  ['POST', draft + '/3/schemas', 'admin/promotions/drafts/3/schemas'],
  ['PUT', draft + '/3/schemas/order', 'admin/promotions/drafts/3/schemas/order'],
  ['GET', draft + '/3/schemas/4/condition-config-options', 'admin/promotions/drafts/3/schemas/4/condition-config-options'],
  ['PUT', draft + '/3/schemas/4/benefit', 'admin/promotions/drafts/3/schemas/4/benefit'],
  ['PUT', draft + '/3/schemas/4/voucher-codes', 'admin/promotions/drafts/3/schemas/4/voucher-codes'],
  ['POST', draft + '/3/simulate', 'admin/promotions/drafts/3/simulate'],
  ['POST', published + '/4/pause', 'admin/promotions/published/4/pause'],
  ['POST', published + '/4/resume', 'admin/promotions/published/4/resume'],
  ['POST', published + '/4/end', 'admin/promotions/published/4/end'],
  ['POST', published + '/4/schemas/5/unpublish', 'admin/promotions/published/4/schemas/5/unpublish'],
  ['POST', 'promotion/internal/promotion-runtime/evaluate', 'admin/promotions/runtime/evaluate'],
  ['POST', 'promotion/promotion-vouchers/validate-code', 'admin/promotions/vouchers/validate-code'],
  ['POST', 'order/admin/promotion-vouchers/discover', 'admin/orders/promotion-vouchers/discover'],
  ['POST', 'order/orders/pricing-context/quote', 'admin/orders/pricing-context/quote'],
  ['GET', 'order/orders/audit-logs', 'admin/orders/audit-logs'],
  ['POST', 'order/orders/12/notes', 'admin/orders/12/notes'],
  ['POST', 'order/order-returns/list', 'admin/order-returns/list'],
  ['POST', 'order/admin/order-returns/quote', 'admin/order-returns/quote'],
  ['POST', 'order/admin/order-returns/commit', 'admin/order-returns/commit'],
  ['PUT', 'order/order-returns/8/approve', 'admin/order-returns/8/approve'],
  ['PUT', 'order/order-returns/8/reject', 'admin/order-returns/8/reject'],
] as const;
test.each(routes)('%s %s maps to the v7 controller', (method, source, target) => {
  expect(resolveJavaV7Route(source, method)).toBe(target);
});
test.each(['order/orders/2/check-paid', 'order/orders/warehouses', 'shipping/shipments', 'promotion/v1/promotions'])('unsupported route remains blocked: %s', path => {
  expect(resolveJavaV7Route(path, 'POST')).toBeUndefined();
});
test('numeric IDs change only at the Java boundary, never quantities or idempotency keys', () => {
  expect(toJavaEntityIds({ id: '2', skuIds: ['3'], quantity: '5', idempotencyKey: '12345678', pricingEvaluationId: 'PE-1' }))
    .toEqual({ id: 2, skuIds: [3], quantity: '5', idempotencyKey: '12345678', pricingEvaluationId: 'PE-1' });
});
test('unsafe numeric IDs are rejected instead of rounded', () => {
  expect(() => toJavaEntityIds({ id: '9007199254740993' })).toThrow('an toàn');
});
test('clearing pin schedule and scope sends the explicit Java clear flags', () => {
  expect(javaV7Body('product/admin/search-pinned-products/2', { endDate: null, keywordPattern: null }))
    .toMatchObject({ clearEndDate: true, clearKeywordPattern: true });
});
test('NONE navigation clears the old link instead of retaining a clickable URL', () => {
  expect(javaV7Body('cms/admin/navigations/2', { type: 'NONE' })).toEqual({ type: 'NONE', targetId: '', url: '', queryParams: {} });
});
test('return mutation wraps data but list and quote keep their canonical response', () => {
  expect(javaV7Response('order/order-returns/2/approve', 'PUT', { id: '2' })).toEqual({ success: true, data: { id: '2' } });
  expect(javaV7Response('order/admin/order-returns/quote', 'POST', { success: true })).toEqual({ success: true });
});
