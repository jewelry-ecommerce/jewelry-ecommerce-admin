import { backendRequest } from '@/apis/backend-request';
import type { Banner, Placement, PlacementLayout, PlacementLayoutItem } from '@/trading-ui/apis/banner/banner.entities';
import type { CreateBannerDto, UpdateBannerDto, CreatePlacementDto, UpdatePlacementDto, CreatePlacementLayoutDto, UpdatePlacementLayoutItemDto, QueryPlacementDto } from '@/trading-ui/apis/banner/banner.interface';
import { PlacementDisplayType } from '@/trading-ui/apis/banner/banner.enum';

type WirePlacement = Omit<Placement, 'id' | 'placementLayouts'> & { id: string | number };
type WireBanner = Omit<Banner, 'id' | 'placementLayoutItems'> & { id: string | number };
type WireItem = Omit<PlacementLayoutItem, 'id' | 'layout' | 'banner' | 'placementLayoutId' | 'bannerId'> & {
  id: string | number; layoutId: string | number; bannerId?: string | number; banner?: WireBanner;
};
type WireLayout = Omit<PlacementLayout, 'id' | 'placementId' | 'placement' | 'items' | 'activeFrom' | 'activeTo' | 'revision'> & {
  id: string | number; placementId: string | number; revision?: number; activeFrom?: string; activeTo?: string; items: WireItem[];
};
export const JAVA_BANNER_PATHS = { placements: 'admin/banner/placements', banners: 'admin/banner/banners' } as const;
const layoutPath = (placementId: string, layoutId?: string): string =>
  JAVA_BANNER_PATHS.placements + '/' + encodeURIComponent(placementId) + '/layouts' + (layoutId ? '/' + encodeURIComponent(layoutId) : '');
function placementView(row: WirePlacement): Placement {
  return { ...row, id: String(row.id), displayType: row.displayType === PlacementDisplayType.CAROUSEL ? PlacementDisplayType.SLIDER : row.displayType, placementLayouts: [] };
}
function bannerView(row: WireBanner): Banner { return { ...row, id: String(row.id), placementLayoutItems: [] }; }
export async function javaPlacements(query: Partial<QueryPlacementDto> = {}): Promise<{ list: Placement[]; total: number }> {
  const rows = (await backendRequest<WirePlacement[]>(JAVA_BANNER_PATHS.placements)).map(placementView);
  const list = rows.filter(row => (!query.status || row.status === query.status) && (!query.platform || row.platform === query.platform)
    && (!query.displayType || row.displayType === query.displayType) && (!query.code || row.code.includes(query.code)));
  return { list, total: list.length };
}
async function placementById(id: string): Promise<Placement> {
  const placement = (await javaPlacements()).list.find(row => row.id === id);
  if (!placement) throw new Error('Không tìm thấy vị trí banner.');
  return placement;
}
export async function javaCreatePlacement(data: CreatePlacementDto): Promise<Placement> {
  return placementView(await backendRequest<WirePlacement>(JAVA_BANNER_PATHS.placements, 'POST', data));
}
export async function javaUpdatePlacement(id: string, data: UpdatePlacementDto): Promise<Placement> {
  const current = await placementById(id);
  if (data.code && data.code !== current.code) throw new Error('Java không hỗ trợ đổi mã vị trí banner.');
  return placementView(await backendRequest<WirePlacement>(JAVA_BANNER_PATHS.placements + '/' + id, 'PATCH', data));
}
function layoutView(row: WireLayout, placement: Placement): PlacementLayout {
  const layout: PlacementLayout = { ...row, id: String(row.id), placementId: String(row.placementId), revision: row.revision ?? 0,
    activeFrom: row.activeFrom ? new Date(row.activeFrom) : undefined, activeTo: row.activeTo ? new Date(row.activeTo) : undefined,
    placement, items: [] };
  layout.items = row.items.map(item => {
    if (!item.banner) throw new Error('Layout chứa banner không còn tồn tại. Tải lại cấu hình để kiểm tra.');
    return { ...item, id: String(item.id), placementLayoutId: String(item.layoutId), bannerId: item.bannerId == null ? undefined : String(item.bannerId),
      layout, banner: bannerView(item.banner) };
  });
  return layout;
}
export async function javaBannerLayouts(placementId: string): Promise<PlacementLayout[]> {
  const [placement, rows] = await Promise.all([placementById(placementId), backendRequest<WireLayout[]>(layoutPath(placementId))]);
  return rows.map(row => layoutView(row, placement));
}
export async function javaBannerLayout(placementId: string, layoutId: string): Promise<PlacementLayout> {
  const [placement, row] = await Promise.all([placementById(placementId), backendRequest<WireLayout>(layoutPath(placementId, layoutId))]);
  return layoutView(row, placement);
}
function numericBannerId(id: string): number {
  const value = Number(id);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error('ID banner phải là số nguyên dương.');
  return value;
}
export async function javaSaveBannerLayout(placementId: string, data: CreatePlacementLayoutDto): Promise<PlacementLayout> {
  const placement = await placementById(placementId);
  const body = { ...data, items: data.items.map(item => ({ ...item,
    slotKey: placement.displayType === PlacementDisplayType.SLIDER ? 'main' : item.slotKey,
    bannerId: numericBannerId(item.bannerId) })) };
  return layoutView(await backendRequest<WireLayout>(layoutPath(placementId), 'POST', body), placement);
}
export async function javaUpdateBannerItem(placementId: string, layoutId: string, itemId: string, data: UpdatePlacementLayoutItemDto): Promise<PlacementLayoutItem> {
  const body = { ...data, ...(data.bannerId === undefined ? {} : { bannerId: numericBannerId(data.bannerId) }) };
  await backendRequest(layoutPath(placementId, layoutId) + '/items/' + encodeURIComponent(itemId), 'PATCH', body);
  const item = (await javaBannerLayout(placementId, layoutId)).items.find(row => row.id === itemId);
  if (!item) throw new Error('Không tìm thấy slot sau khi lưu.');
  return item;
}
export async function javaCreateBanner(data: CreateBannerDto): Promise<Banner> {
  return bannerView(await backendRequest<WireBanner>(JAVA_BANNER_PATHS.banners, 'POST', data));
}
export async function javaUpdateBanner(id: string, data: UpdateBannerDto): Promise<Banner> {
  return bannerView(await backendRequest<WireBanner>(JAVA_BANNER_PATHS.banners + '/' + id, 'PATCH', data));
}
