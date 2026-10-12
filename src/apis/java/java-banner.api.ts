import { backendRequest } from "@/apis/backend-request";
import type { Banner, Placement, PlacementLayout, PlacementLayoutItem } from "@/trading-ui/apis/banner/banner.entities";
import type { CreateBannerDto, UpdateBannerDto, CreatePlacementDto, UpdatePlacementDto, CreatePlacementLayoutDto, UpdatePlacementLayoutItemDto } from "@/trading-ui/apis/banner/banner.interface";
import { PlacementDisplayType, PlacementPlatform, PlacementStatus, PlacementLayoutStatus } from "@/trading-ui/apis/banner/banner.enum";
type JavaPlacement = { id: string; code: string; name: string; displayType: string };
type JavaBanner = Omit<Banner, "placementLayoutItems"> & { placementCode?: string; sortOrder: number };
const PATHS = { placements: "admin/banner/placements", banners: "admin/banner/banners", take: 100 };
function placementView(row: JavaPlacement): Placement {
  return { ...row, id: String(row.id), displayType: row.displayType === "CAROUSEL" ? PlacementDisplayType.SLIDER : PlacementDisplayType.GRID,
    platform: PlacementPlatform.ALL, status: PlacementStatus.ACTIVE, placementLayouts: [] };
}
function bannerView(row: JavaBanner): Banner { return { ...row, id: String(row.id), placementLayoutItems: [] }; }
export async function javaPlacements(): Promise<{ list: Placement[]; total: number }> {
  const rows = await backendRequest<JavaPlacement[]>(PATHS.placements);
  return { list: rows.map(placementView), total: rows.length };
}
async function placementById(id: string): Promise<Placement> {
  const result = await javaPlacements(), placement = result.list.find(row => row.id === id);
  if (!placement) throw new Error("Không tìm thấy vị trí banner.");
  if (placement.displayType !== PlacementDisplayType.SLIDER) throw new Error("Java chưa lưu layout lưới/hai khung. Vị trí này chưa thể chỉnh bằng builder.");
  return placement;
}
export async function javaCreatePlacement(data: CreatePlacementDto): Promise<Placement> {
  if (data.displayType !== PlacementDisplayType.SLIDER && data.displayType !== PlacementDisplayType.CAROUSEL)
    throw new Error("Java hiện chỉ lưu được banner trượt ngang, chưa có layout lưới/hai khung.");
  if (!data.code?.trim()) throw new Error("Nhập mã vị trí banner.");
  return placementView(await backendRequest<JavaPlacement>(PATHS.placements, "POST",
    { code: data.code.trim(), name: data.name, displayType: "CAROUSEL" }));
}
export async function javaUpdatePlacement(id: string, data: UpdatePlacementDto): Promise<Placement> {
  const current = await placementById(id);
  if (data.code && data.code !== current.code) throw new Error("Java không hỗ trợ đổi mã vị trí banner.");
  if (data.displayType && ![PlacementDisplayType.SLIDER, PlacementDisplayType.CAROUSEL].includes(data.displayType))
    throw new Error("Java chưa hỗ trợ lưu layout này.");
  return placementView(await backendRequest<JavaPlacement>(PATHS.placements + "/" + id, "PATCH", { name: data.name, displayType: "CAROUSEL" }));
}
async function bannersFor(code: string): Promise<JavaBanner[]> {
  const rows: JavaBanner[] = []; let page = 1;
  while (true) {
    const result = await backendRequest<{ list: JavaBanner[]; pagination: { hasNextPage: boolean } }>(PATHS.banners + "?page=" + page + "&take=" + PATHS.take);
    rows.push(...result.list.filter(row => row.placementCode === code));
    if (!result.pagination.hasNextPage) return rows.sort((left, right) => left.sortOrder - right.sortOrder);
    page += 1;
  }
}
export async function javaBannerLayout(placementId: string): Promise<PlacementLayout> {
  const placement = await placementById(placementId), banners = await bannersFor(placement.code);
  // Java stores binding + sortOrder, not layouts. This is a view of those bindings, never a local persistence layer.
  const layout: PlacementLayout = { id: placement.id, placementId, name: placement.name, revision: 0,
    status: PlacementLayoutStatus.ACTIVE, placement, items: [] };
  layout.items = banners.map((banner, index) => ({ id: String(banner.id), placementLayoutId: layout.id, slotKey: String(index),
    bannerId: String(banner.id), isActive: banner.status === "ACTIVE", priority: banners.length - index,
    displayMetadata: { x: 0, y: 0, width: 1, height: 1, order: index + 1 }, layout, banner: bannerView(banner) }));
  return layout;
}
export async function javaSaveBannerLayout(placementId: string, data: CreatePlacementLayoutDto): Promise<PlacementLayout> {
  const placement = await placementById(placementId);
  if (data.activeFrom || data.activeTo || (data.status && data.status !== PlacementLayoutStatus.ACTIVE))
    throw new Error("Java chưa hỗ trợ lịch/layout banner.");
  const ids = new Set(data.items.map(row => row.bannerId));
  const existing = await bannersFor(placement.code);
  for (const banner of existing) if (!ids.has(String(banner.id)))
    await backendRequest(PATHS.banners + "/" + banner.id, "PATCH", { placementCode: "" });
  for (const [index, row] of data.items.entries()) await backendRequest(PATHS.banners + "/" + row.bannerId, "PATCH",
    { placementCode: placement.code, sortOrder: index, status: row.isActive === false ? "DRAFT" : "ACTIVE" });
  return javaBannerLayout(placementId);
}
export async function javaUpdateBannerItem(placementId: string, itemId: string, data: UpdatePlacementLayoutItemDto): Promise<PlacementLayoutItem> {
  const placement = await placementById(placementId);
  await backendRequest(PATHS.banners + "/" + (data.bannerId ?? itemId), "PATCH", { placementCode: placement.code,
    sortOrder: data.displayMetadata?.order, status: data.isActive === false ? "DRAFT" : "ACTIVE" });
  const layout = await javaBannerLayout(placementId), item = layout.items.find(row => row.id === (data.bannerId ?? itemId));
  if (!item) throw new Error("Không tìm thấy banner sau khi lưu.");
  return item;
}
export async function javaCreateBanner(data: CreateBannerDto): Promise<Banner> {
  return bannerView(await backendRequest<JavaBanner>(PATHS.banners, "POST", data));
}
export async function javaUpdateBanner(id: string, data: UpdateBannerDto): Promise<Banner> {
  return bannerView(await backendRequest<JavaBanner>(PATHS.banners + "/" + id, "PATCH", data));
}
