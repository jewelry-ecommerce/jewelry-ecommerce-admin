import { beforeEach, expect, test, vi } from 'vitest';
const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/apis/backend-request', () => ({ backendRequest: transport.request, toUiEntityIds: (value: unknown) => value,
  BackendHttpError: class extends Error { constructor(readonly code: string, message: string, readonly status: number) { super(message); } } }));
import { BackendHttpError } from '@/apis/backend-request';
import { javaHeaders, javaMutateHeader, javaFooter, javaMutateLogo } from './java-site-layout.api';
beforeEach(() => { transport.request.mockReset(); });
test('Java page IDs normalize without a fake tenant and lists can load all pages', async () => {
  transport.request.mockResolvedValueOnce({ list: [{ id: 1, bannerName: 'A' }], total: 2, pagination: { currentPage: 1, hasNextPage: true } })
    .mockResolvedValueOnce({ list: [{ id: 2, bannerName: 'B' }], total: 2, pagination: { currentPage: 2, hasNextPage: false } });
  const result = await javaHeaders({ isPagination: false });
  expect(result.list.map(row => row.id)).toEqual(['1', '2']);
  expect(result.list[0].tenantCode).toBeUndefined();
  expect(transport.request.mock.calls[1][0]).toContain('page=2');
});
test('409 schedule conflict uses existing confirm flow and never replaces headers silently', async () => {
  transport.request.mockRejectedValueOnce(new BackendHttpError('HEADER_SCHEDULE_CONFLICT', 'Trùng lịch A', 409));
  expect(await javaMutateHeader('', 'POST', { status: 'ACTIVE' })).toMatchObject({ success: false, flow: 'header_schedule_conflict', message: 'Trùng lịch A' });
  expect(transport.request).toHaveBeenCalledTimes(1);
});
test('unconfigured footer does not invent a persisted numeric ID', async () => {
  transport.request.mockResolvedValue({ id: null, socialLinks: [], menuColumns: [] });
  expect(await javaFooter()).toMatchObject({ id: '', socialLinks: [], menuColumns: [] });
});
test('logo mutation wraps Java result for the existing form', async () => {
  transport.request.mockResolvedValue({ id: 8, logoUrl: '/uploads/logo.png' });
  expect(await javaMutateLogo('/8/status', 'PATCH', { status: 'ACTIVE' })).toMatchObject({ success: true, id: '8', data: { id: '8' } });
});
