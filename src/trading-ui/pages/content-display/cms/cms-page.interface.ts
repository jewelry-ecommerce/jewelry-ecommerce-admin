import type { PlacementDisplayType } from '../../../apis/banner/banner.enum';
export interface BannerPlacementDraftInput {
  code?: string;
  name: string;
  displayType: PlacementDisplayType;
  columns?: number;
  rows?: number;
}

export interface BannerPlacementDraftResult {
  placementId: string;
  placementCode: string;
  displayType: PlacementDisplayType;
  columns: number;
  rows: number;
  layoutId?: string;
  itemCount?: number;
  name?: string;
  /** Snapshot settings hiện tại để merge khi patch (GRID mobile odd layout, …). */
  settings?: Record<string, unknown>;
}
