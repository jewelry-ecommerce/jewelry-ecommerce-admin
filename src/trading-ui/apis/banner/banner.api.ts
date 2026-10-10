import { getDataSourceMode } from "@/common/config/app.config";
import { backendRequest, toUiEntityIds } from "@/apis/backend-request";
import type { Banner, Placement, PlacementLayout, PlacementLayoutItem } from "./banner.entities";
import type {
  CreateBannerDto,
  CreatePlacementDto,
  CreatePlacementLayoutDto,
  QueryPlacementDto,
  UpdateBannerDto,
  UpdatePlacementDto,
  UpdatePlacementLayoutItemDto,
} from "./banner.interface";
import type { ProductListBannerConditionType } from "./banner.enum";
const COMMAND_URL = "/api/demo-cms/banner";
async function command<TResult>(operation: string, parameters: Record<string, unknown>): Promise<TResult> {
  if (getDataSourceMode() === "HTTP") {
    const result = await backendRequest("admin/banner/command", "POST", { operation, ...parameters });
    return toUiEntityIds(result) as TResult;
  }
  const response = await fetch(COMMAND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, ...parameters }),
  });
  if (!response.ok) {
    const error: { message?: string } = await response.json();
    throw new Error(error.message || "Không thể lưu/đọc banner mock.");
  }
  return response.json();
}
export const bannerApi = {
  getPlacementList: (query: Partial<QueryPlacementDto> = {}) =>
    command<{ total: number; list: Placement[] }>("getPlacementList", { query }),
  postPlacement: (data: CreatePlacementDto) => command<Placement>("postPlacement", { data }),
  patchPlacement: (id: string, data: UpdatePlacementDto) => command<Placement>("patchPlacement", { id, data }),
  deletePlacement: (id: string) => command<{ success: boolean }>("deletePlacement", { id }),
  getPlacementLayoutList: (placementId: string) => command<PlacementLayout[]>("getPlacementLayoutList", { placementId }),
  getPlacementLayoutDetail: (placementId: string, layoutId: string) =>
    command<PlacementLayout>("getPlacementLayoutDetail", { placementId, layoutId }),
  postPlacementLayout: (placementId: string, data: CreatePlacementLayoutDto) =>
    command<PlacementLayout>("postPlacementLayout", { placementId, data }),
  patchPlacementLayoutItem: (placementId: string, layoutId: string, itemId: string, data: UpdatePlacementLayoutItemDto) =>
    command<PlacementLayoutItem>("patchPlacementLayoutItem", { placementId, layoutId, itemId, data }),
  postBanner: (data: CreateBannerDto) => command<Banner>("postBanner", { data }),
  patchBanner: (id: string, data: UpdateBannerDto) => command<Banner>("patchBanner", { id, data }),
  getProductListBannerConfigs: async (_query: {
    conditionType: ProductListBannerConditionType;
  }): Promise<{ id: string; isActive: boolean; targetSlug: string; targetName: string }[]> => [],
};
