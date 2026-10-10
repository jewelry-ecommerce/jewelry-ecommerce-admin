import type { PageOptionsDto } from "../../common/constant/api.interface";
import {
  type BannerActionType,
  type BannerActionsLayout,
  type BannerLayout,
  type BannerMediaFit,
  type BannerMediaType,
  type BannerStatus,
  type PlacementDisplayType,
  type PlacementLayoutStatus,
  type PlacementPlatform,
  type PlacementStatus,
  type ProductListBannerActionType,
  type ProductListBannerConditionType,
} from "./banner.enum";

export interface BannerActionDto {
  actionType?: BannerActionType;
  actionTarget?: string;
  ctaText?: string;
  ctaBg?: string;
  ctaColor?: string;
}

export interface CreateBannerDto {
  internalName: string;
  mediaUrl?: string;
  mediaMobileUrl?: string;
  mediaLinkUrl?: string;
  mediaPosterUrl?: string;
  mediaMobilePosterUrl?: string;
  mediaFit?: BannerMediaFit;
  mediaType?: BannerMediaType;
  layout?: BannerLayout;
  title?: string;
  subtitle?: string;
  titleColor?: string;
  actionsLayout?: BannerActionsLayout;
  actions?: BannerActionDto[];
  overlayOpacity?: number;
  status?: BannerStatus;
}

export interface QueryBannerDto extends PageOptionsDto<string> {
  status?: BannerStatus;
  mediaType?: BannerMediaType;
  actionType?: BannerActionType;
  internalName?: string;
}

export type UpdateBannerDto = Partial<CreateBannerDto>;

export interface CreatePlacementDto {
  code?: string;
  name: string;
  platform?: PlacementPlatform;
  displayType: PlacementDisplayType;
  settings?: Record<string, unknown>;
  status?: PlacementStatus;
}

export interface QueryPlacementDto extends PageOptionsDto<string> {
  status?: PlacementStatus;
  platform?: PlacementPlatform;
  displayType?: PlacementDisplayType;
  code?: string;
}

export type UpdatePlacementDto = Partial<CreatePlacementDto>;

export interface CreatePlacementLayoutDto {
  name: string;
  status?: PlacementLayoutStatus;
  activeFrom?: Date;
  activeTo?: Date;
  note?: string;
  items: CreatePlacementLayoutItemDto[];
}

export interface PlacementLayoutDisplayMetadata {
  x: number;
  y: number;
  width: number;
  height: number;
  order?: number;
  slotType?: string;
  childBannerIds?: string[];
}

export interface CreatePlacementLayoutItemDto {
  slotKey: string;
  bannerId: string;
  isActive?: boolean;
  priority?: number;
  displayMetadata?: PlacementLayoutDisplayMetadata;
}

export type UpdatePlacementLayoutItemDto = Partial<CreatePlacementLayoutItemDto>;

export interface ProductListBannerMixMatchSkuDto {
  variationId: string;
  sortOrder?: number;
}

export interface ProductListBannerItemDto {
  id?: string;
  enabled?: boolean;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
  actionType?: ProductListBannerActionType;
  actionUrl?: string;
  openInNewTab?: boolean;
  mixMatchSkus?: ProductListBannerMixMatchSkuDto[];
}

export interface CreateProductListBannerConfigDto {
  conditionType: ProductListBannerConditionType;
  targetId?: string;
  targetSlug: string;
  targetName?: string;
  categoryPathSlugs?: string[];
  isActive?: boolean;
  banners: ProductListBannerItemDto[];
}

export type UpdateProductListBannerConfigDto = Partial<CreateProductListBannerConfigDto>;

export interface QueryProductListBannerConfigDto {
  conditionType?: ProductListBannerConditionType;
}
