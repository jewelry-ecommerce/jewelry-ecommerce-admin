import { getDataSourceMode, isJavaBackend } from "@/common/config/app.config";
import { javaPlacements, javaCreatePlacement, javaUpdatePlacement, javaBannerLayouts, javaBannerLayout, javaSaveBannerLayout, javaUpdateBannerItem, javaCreateBanner, javaUpdateBanner } from "@/apis/java/java-banner.api";
import { backendRequest, toUiEntityIds } from "@/apis/backend-request";
import { javaProductListBanners, javaSaveProductListBanner, JAVA_PRODUCT_LIST_BANNER_PATH } from '@/apis/java/java-product-list-banner.api';
import type { Banner, Placement, PlacementLayout, PlacementLayoutItem } from "./banner.entities";
import type {
  CreateBannerDto,
  CreatePlacementDto,
  CreatePlacementLayoutDto,
  QueryPlacementDto, CreateProductListBannerConfigDto, UpdateProductListBannerConfigDto,
  UpdateBannerDto,
  UpdatePlacementDto,
  UpdatePlacementLayoutItemDto,
} from "./banner.interface";

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
    isJavaBackend() ? javaPlacements(query) : command<{ total: number; list: Placement[] }>("getPlacementList", { query }),
  postPlacement: (data: CreatePlacementDto) => isJavaBackend() ? javaCreatePlacement(data) : command<Placement>("postPlacement", { data }),
  patchPlacement: (id: string, data: UpdatePlacementDto) => isJavaBackend() ? javaUpdatePlacement(id, data) : command<Placement>("patchPlacement", { id, data }),
  deletePlacement: async (id: string) => {
    if (isJavaBackend()) return backendRequest<{ success: boolean }>('admin/banner/placements/' + encodeURIComponent(id), 'DELETE');
    return command<{ success: boolean }>("deletePlacement", { id });
  },
  getPlacementLayoutList: async (placementId: string) => isJavaBackend() ? javaBannerLayouts(placementId) : command<PlacementLayout[]>("getPlacementLayoutList", { placementId }),
  getPlacementLayoutDetail: (placementId: string, layoutId: string) =>
    isJavaBackend() ? javaBannerLayout(placementId, layoutId) : command<PlacementLayout>("getPlacementLayoutDetail", { placementId, layoutId }),
  postPlacementLayout: (placementId: string, data: CreatePlacementLayoutDto) =>
    isJavaBackend() ? javaSaveBannerLayout(placementId, data) : command<PlacementLayout>("postPlacementLayout", { placementId, data }),
  patchPlacementLayoutItem: (placementId: string, layoutId: string, itemId: string, data: UpdatePlacementLayoutItemDto) =>
    isJavaBackend() ? javaUpdateBannerItem(placementId, layoutId, itemId, data) : command<PlacementLayoutItem>("patchPlacementLayoutItem", { placementId, layoutId, itemId, data }),
  postBanner: (data: CreateBannerDto) => isJavaBackend() ? javaCreateBanner(data) : command<Banner>("postBanner", { data }),
  patchBanner: (id: string, data: UpdateBannerDto) => isJavaBackend() ? javaUpdateBanner(id, data) : command<Banner>("patchBanner", { id, data }),
  getProductListBannerConfigs: javaProductListBanners,
  postProductListBannerConfig: (body: CreateProductListBannerConfigDto) => javaSaveProductListBanner(body),
  patchProductListBannerConfig: (id: string, body: UpdateProductListBannerConfigDto) => javaSaveProductListBanner(body, id),
  deleteProductListBannerConfig: async (id: string): Promise<void> => { await backendRequest(JAVA_PRODUCT_LIST_BANNER_PATH + '/' + encodeURIComponent(id), 'DELETE'); },
};
