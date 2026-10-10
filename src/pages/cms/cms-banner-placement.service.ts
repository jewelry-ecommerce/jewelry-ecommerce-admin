import { BANNER_DEMO_DEFAULTS } from "./cms-banner.constants";
import { bannerApi } from "@/trading-ui/apis/banner/banner.api";
import { PlacementPlatform, PlacementStatus } from "@/trading-ui/apis/banner/banner.enum";
import type { BannerPlacementDraftInput, BannerPlacementDraftResult } from "@/trading-ui/pages/content-display/cms/cms-page.interface";
export async function createCmsBannerPlacement(input: BannerPlacementDraftInput): Promise<BannerPlacementDraftResult> {
  const columns = input.columns ?? BANNER_DEMO_DEFAULTS.columns;
  const rows = input.rows ?? BANNER_DEMO_DEFAULTS.rows;
  const placement = await bannerApi.postPlacement({
    code: input.code?.trim() || undefined,
    name: input.name.trim(),
    displayType: input.displayType,
    platform: PlacementPlatform.ALL,
    status: PlacementStatus.ACTIVE,
    settings: { columns, rows, gap: BANNER_DEMO_DEFAULTS.gap },
  });
  return { placementId: placement.id, placementCode: placement.code, displayType: placement.displayType, columns, rows };
}
