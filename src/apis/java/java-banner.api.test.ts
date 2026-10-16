import { beforeEach, expect, test, vi } from 'vitest';
const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/apis/backend-request', () => ({ backendRequest: transport.request }));
import { javaCreatePlacement, javaBannerLayouts, javaSaveBannerLayout, javaUpdateBannerItem } from './java-banner.api';
import { PlacementDisplayType, PlacementLayoutStatus } from '@/trading-ui/apis/banner/banner.enum';
const placement = { id: 2, code: 'HOME', name: 'Home', displayType: 'GRID', platform: 'ALL', status: 'ACTIVE', settings: { columns: 2 } };
const layout = { id: 8, placementId: 2, name: 'Live', status: 'ACTIVE', activeFrom: '2026-10-01T00:00:00Z', items: [
  { id: 51, layoutId: 8, slotKey: 'left', bannerId: 9, isActive: true, priority: 1, displayMetadata: { x: 0, y: 0, width: 1, height: 1, slotType: 'GRID' },
    banner: { id: 9, internalName: 'Ring', status: 'ACTIVE' } },
] };
beforeEach(() => { transport.request.mockReset(); });
test.each([PlacementDisplayType.GRID, PlacementDisplayType.SLIDER, PlacementDisplayType.DOUBLE_BANNER])('placement %s is sent without forcing CAROUSEL', async displayType => {
  transport.request.mockResolvedValue({ ...placement, displayType });
  const result = await javaCreatePlacement({ name: 'Home', displayType, settings: { columns: 2 } });
  expect(result.displayType).toBe(displayType);
  expect(transport.request).toHaveBeenCalledWith('admin/banner/placements', 'POST', expect.objectContaining({ displayType }));
});
test('no layouts means an empty list, never synthesized banner bindings', async () => {
  transport.request.mockImplementation(async path => path.endsWith('/layouts') ? [] : [placement]);
  expect(await javaBannerLayouts('2')).toEqual([]);
});
test('layout save persists real numeric banner ID, schedule, priority and metadata', async () => {
  transport.request.mockImplementation(async path => path.endsWith('/layouts') ? layout : [placement]);
  const result = await javaSaveBannerLayout('2', { name: 'Live', status: PlacementLayoutStatus.ACTIVE,
    activeFrom: new Date('2026-10-01T00:00:00Z'), items: [{ slotKey: 'left', bannerId: '9', priority: 1, displayMetadata: layout.items[0].displayMetadata }] });
  expect(result.id).toBe('8'); expect(result.items[0].id).toBe('51');
  expect(result.activeFrom).toBeInstanceOf(Date);
  expect(transport.request).toHaveBeenCalledWith('admin/banner/placements/2/layouts', 'POST', expect.objectContaining({
    items: [expect.objectContaining({ bannerId: 9, slotKey: 'left', displayMetadata: expect.objectContaining({ slotType: 'GRID' }) })],
  }));
});
test('patch updates actual layout/item IDs rather than patching banner assets', async () => {
  transport.request.mockImplementation(async path => path.endsWith('/layouts/8') ? layout : path.endsWith('/placements') ? [placement] : undefined);
  const result = await javaUpdateBannerItem('2', '8', '51', { bannerId: '9', isActive: false });
  expect(transport.request).toHaveBeenCalledWith('admin/banner/placements/2/layouts/8/items/51', 'PATCH', { bannerId: 9, isActive: false });
  expect(result.id).toBe('51');
});
test('UI slide keys normalize to one Java slider slot while preserving order', async () => {
  transport.request.mockImplementation(async path => path.endsWith('/layouts') ? layout : [{ ...placement, displayType: 'SLIDER' }]);
  await javaSaveBannerLayout('2', { name: 'Slides', items: [
    { slotKey: '1', bannerId: '9', displayMetadata: { x: 0, y: 0, width: 1, height: 1, order: 1 } },
    { slotKey: '2', bannerId: '10', displayMetadata: { x: 0, y: 0, width: 1, height: 1, order: 2 } },
  ] });
  expect(transport.request).toHaveBeenCalledWith('admin/banner/placements/2/layouts', 'POST', expect.objectContaining({
    items: [expect.objectContaining({ slotKey: 'main', bannerId: 9 }), expect.objectContaining({ slotKey: 'main', bannerId: 10 })],
  }));
});
