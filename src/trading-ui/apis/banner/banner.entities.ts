import type { BaseEntity } from "../../common/constant/api.interface";
import type { BannerActionDto, PlacementLayoutDisplayMetadata, ProductListBannerItemDto } from "./banner.interface";
import {
  type BannerActionsLayout,
  type BannerLayout,
  type BannerMediaFit,
  type BannerMediaType,
  type BannerStatus,
  type PlacementDisplayType,
  type PlacementLayoutStatus,
  type PlacementPlatform,
  type PlacementStatus,
  type ProductListBannerConditionType,
} from "./banner.enum";

export interface Banner extends Omit<BaseEntity, "createdAt" | "updatedAt"> {
  internalName: string;
  mediaUrl?: string;
  mediaMobileUrl?: string;
  mediaLinkUrl?: string;
  mediaPosterUrl?: string;
  mediaMobilePosterUrl?: string;
  mediaFit: BannerMediaFit;
  mediaType: BannerMediaType;
  layout: BannerLayout;
  title?: string;
  subtitle?: string;
  titleColor?: string;
  actionsLayout: BannerActionsLayout;
  actions?: BannerActionDto[];
  overlayOpacity: number;
  status: BannerStatus;
  placementLayoutItems: PlacementLayoutItem[];
}

export interface Placement extends Omit<BaseEntity, "createdAt" | "updatedAt"> {
  code: string;
  name: string;
  platform: PlacementPlatform;
  displayType: PlacementDisplayType;
  settings?: Record<string, unknown>;
  status: PlacementStatus;
  placementLayouts: PlacementLayout[];
}

export interface PlacementLayout extends Omit<BaseEntity, "createdAt" | "updatedAt"> {
  placementId: string;
  name: string;
  revision: number;
  status: PlacementLayoutStatus;
  activeFrom?: Date;
  activeTo?: Date;
  note?: string;
  placement: Placement;
  items: PlacementLayoutItem[];
}

export interface PlacementLayoutItem extends Omit<BaseEntity, "createdAt" | "updatedAt"> {
  placementLayoutId: string;
  slotKey: string;
  bannerId?: string;
  isActive: boolean;
  priority: number;
  displayMetadata?: PlacementLayoutDisplayMetadata;
  layout: PlacementLayout;
  banner: Banner;
}

export interface ProductListBannerConfig extends BaseEntity {
  conditionType: ProductListBannerConditionType;
  targetId?: string;
  targetSlug: string;
  targetName?: string;
  categoryPathSlugs?: string[];
  isActive: boolean;
  banners: ProductListBannerItemDto[];
}
