import { beforeEach, expect, test, vi } from 'vitest';
vi.mock('@/common/config/app.config', () => ({ isJavaBackend: () => true, getApiBaseUrl: () => 'http://java.test/api/v1' }));
vi.mock('@/redux/store.redux', () => ({ store: { getState: () => ({ auth: { accessToken: 'local-test-token' } }) } }));
vi.mock('./java-auth-session', () => ({ refreshJavaAdminSession: vi.fn() }));
vi.mock('./java-capability-gaps', () => ({ recordJavaCapabilityGap: vi.fn() }));
import { axiosRequest } from '@/trading-ui/common/config/axios.config';
import { getCampaignOverview, deletePromotionDraft, publishPromotionDraft } from '@/trading-ui/apis/promotion/promotion.api';
import { postNavigation } from '@/trading-ui/apis/cms/navigation.api';
const fetchMock = vi.fn();
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); });
const success = (data: unknown) => new Response(JSON.stringify({ status: 200, data }), { status: 200 });

test('campaign overview and draft delete use wizard routes, never the old basic discounts API', async () => {
  fetchMock.mockResolvedValue(success({ items: [], meta: { total: 0 } }));
  await getCampaignOverview({ page: 2, limit: 20 });
  expect(fetchMock.mock.calls[0][0]).toBe('http://java.test/api/v1/admin/promotions/campaigns?page=2&limit=20');
  fetchMock.mockResolvedValue(success({ success: true }));
  await deletePromotionDraft('8');
  expect(fetchMock.mock.calls[1][0]).toBe('http://java.test/api/v1/admin/promotions/drafts/8');
  expect(fetchMock.mock.calls[1][1].method).toBe('DELETE');
});
test('publish preserves the server lifecycle response and authenticates with Bearer', async () => {
  fetchMock.mockResolvedValue(success({ publishedPromotion: { id: 9, status: 'ACTIVE' } }));
  expect(await publishPromotionDraft('8')).toMatchObject({ publishedPromotion: { id: '9', status: 'ACTIVE' } });
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer local-test-token');
});
test('navigation conflict returns the existing confirmation flow with structured dependencies', async () => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ status: 409, message: 'Conflict',
    errors: [{ code: 'NAVIGATION_BADGE_SCHEDULE_CONFLICT', message: 'Lịch trùng' }],
    dependencies: [{ id: 7, designType: 'TEXT', displayText: 'NEW' }] }), { status: 409 }));
  const result = await postNavigation({ label: 'Sale', type: 'NONE' });
  expect(result).toMatchObject({ success: false, flow: 'navigation_badge_schedule_conflict', conflictingBadges: [{ id: '7' }] });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
test('forbidden and validation failures are not converted into fake successful mutations', async () => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ status: 403, errors: [{ code: 'FORBIDDEN', message: 'Không có quyền' }] }), { status: 403 }));
  await expect(axiosRequest.post('order/order-returns', {})).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN' });
});
test('return approval preserves the data wrapper the current detail component expects', async () => {
  fetchMock.mockResolvedValue(success({ id: 2, status: 'Completed', totalRefundAmount: '100000' }));
  expect(await axiosRequest.put('order/order-returns/2/approve', { note: 'Đã nhận' }))
    .toEqual({ success: true, data: { id: '2', status: 'Completed', totalRefundAmount: '100000' } });
});
test('unsupported online payment is blocked before calling Java', async () => {
  await expect(axiosRequest.post('order/orders/2/check-paid')).rejects.toMatchObject({ status: 501 });
  expect(fetchMock).not.toHaveBeenCalled();
});
