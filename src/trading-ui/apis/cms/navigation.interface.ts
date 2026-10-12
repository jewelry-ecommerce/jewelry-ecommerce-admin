import type { BaseEntity } from '../../common/constant/api.interface';

export const CMS_NAVIGATION_TYPES = ['NONE', 'CATEGORY', 'PAGE', 'LINK'] as const;
export type CmsNavigationType = (typeof CMS_NAVIGATION_TYPES)[number];

export const CMS_NAVIGATION_BADGE_DESIGN_TYPES = ['TEXT', 'IMAGE'] as const;
export type CmsNavigationBadgeDesignType = (typeof CMS_NAVIGATION_BADGE_DESIGN_TYPES)[number];

export type CmsNavigationLayer = 'DRAFT' | 'PUBLISHED';
export type CmsNavigationQueryParams = Record<string, unknown>;

export interface CmsNavigationBadgeStyleConfig {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string | number;
  [key: string]: unknown;
}

export interface CmsNavigationBadge extends BaseEntity {
  navigationId: string;
  designType: CmsNavigationBadgeDesignType;
  displayText?: string | null;
  imageUrl?: string | null;
  styleConfig: CmsNavigationBadgeStyleConfig;
  startTime: string;
  endTime?: string | null;
  layer: CmsNavigationLayer;
}

export interface CmsNavigation extends BaseEntity {
  tenantCode: string;
  parentId?: string | null;
  label: string;
  type: CmsNavigationType;
  targetId?: string | null;
  url?: string | null;
  queryParams?: CmsNavigationQueryParams | null;
  icon?: string | null;
  image?: string | null;
  openInNewTab: boolean;
  sortOrder: number;
  showOnMenuPopup: boolean;
  showOnPlp: boolean;
  isArchived: boolean;
  layer: CmsNavigationLayer;
  badges?: CmsNavigationBadge[];
  children?: CmsNavigation[];
}

export interface CmsNavigationBadgeInput {
  id?: string;
  designType: CmsNavigationBadgeDesignType;
  displayText?: string;
  imageUrl?: string;
  styleConfig?: CmsNavigationBadgeStyleConfig;
  startTime: string;
  endTime?: string | null;
  confirmReplaceSchedule?: boolean;
}

export interface CreateCmsNavigationDto {
  label: string;
  type: CmsNavigationType;
  parentId?: string | null;
  targetId?: string;
  url?: string;
  queryParams?: CmsNavigationQueryParams;
  icon?: string;
  image?: string;
  openInNewTab?: boolean;
  showOnMenuPopup?: boolean;
  showOnPlp?: boolean;
  sortOrder?: number;
  badge?: CmsNavigationBadgeInput;
}

export interface UpdateCmsNavigationDto extends Partial<Omit<CreateCmsNavigationDto, 'badge'>> {
  badge?: CmsNavigationBadgeInput;
  clearBadge?: boolean;
}

export interface CmsNavigationTreeResponse {
  items: CmsNavigation[];
}

export interface CmsNavigationPublishStatusResponse {
  hasPendingPublish: boolean;
}

export interface CmsNavigationPublishResponse extends CmsNavigationPublishStatusResponse {
  success: boolean;
}

export interface CmsNavigationCacheClearResponse {
  success: boolean;
  tenantCode: string;
}

export interface CmsNavigationSortItem {
  id: string;
  sortOrder: number;
}

export interface ReorderCmsNavigationsDto {
  items: CmsNavigationSortItem[];
}

export interface CmsNavigationMutationSuccessResponse {
  success: true;
  id?: string;
}

export interface CmsNavigationArchiveResponse extends CmsNavigationMutationSuccessResponse {
  id: string;
}

export interface CmsNavigationBadgeScheduleConflictItem {
  id: string;
  designType: CmsNavigationBadgeDesignType;
  displayText: string | null;
  startTime: string;
  endTime: string | null;
}

export interface CmsNavigationBadgeScheduleConflictResponse {
  success: false;
  flow: 'navigation_badge_schedule_conflict';
  message: string;
  conflictingBadges: CmsNavigationBadgeScheduleConflictItem[];
}

export type CmsNavigationUpsertResponse = CmsNavigation | CmsNavigationBadgeScheduleConflictResponse;

export const isCmsNavigationBadgeScheduleConflictResponse = (value: unknown): value is CmsNavigationBadgeScheduleConflictResponse => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return record.success === false && record.flow === 'navigation_badge_schedule_conflict';
};
