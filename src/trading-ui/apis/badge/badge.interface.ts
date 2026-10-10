import { type PageOptionsDto, type ResList } from "@/trading-ui/common/constant/api.interface";
import type { BadgeCampaign } from "@/trading-ui/apis/badge/badge.entities";
import {
  type BadgeCampaignDisplayStatus,
  type BadgeCampaignStatus,
  type BadgeChannel,
  type BadgePosition,
  type BadgeRuleType,
  type BadgeShape,
  type BadgeStatus,
  type BadgeTemplateBadgeType,
  type BadgeType,
} from "@/trading-ui/apis/badge/badge.enum";

/** Shape của `rules[]` trong response GET /admin/badge-flows/:id (đã được service map gọn). */
export interface BadgeFlowRuleView {
  id: string;
  name: string;
  priorityWeight: number;
  isPinned: boolean;
  isActive: boolean;
  template: {
    id: string;
    code: string;
    name: string;
    type: BadgeType;
    badgeType: BadgeTemplateBadgeType;
    defaultPosition?: BadgePosition;
    displayText?: string;
    styleConfig?: Record<string, unknown>;
    icon?: string;
    image?: string;
  } | null;
}

/** Response của GET /admin/badge-flows/:id — kèm `skuImportJob` nếu flow có import file. */
export interface BadgeFlowDetail {
  id: string;
  name: string;
  description?: string;
  status: BadgeCampaignStatus;
  isActive: boolean;
  activeFrom?: string;
  activeTo?: string;
  createdAt?: string;
  updatedAt?: string;
  ruleType?: BadgeRuleType;
  channel?: BadgeChannel;
  ruleConfig?: Record<string, unknown>;
  rules: BadgeFlowRuleView[];
  assignmentCount: number;
  skuImportJob?: unknown;
  isSystemGenerated?: boolean;
  source?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
}

export interface BulkRemoveAssignmentDto {
  productIds: string[];
}

export interface CreateBadgeAssignmentDto {
  productIds: string[];
  priorityWeight?: number;
  channel?: BadgeChannel;
  activeFrom?: Date;
  activeTo?: Date;
  note?: string;
}

export interface QueryBadgeAssignmentDto extends PageOptionsDto<string> {
  isActive?: boolean;
  channel?: BadgeChannel;
  sourceType?: BadgeRuleType;
  productId?: string;
  badgeRuleId?: string;
}

export interface UpdateBadgeAssignmentDto {
  priorityWeight?: number;
  channel?: BadgeChannel;
  activeFrom?: Date;
  activeTo?: Date;
  isActive?: boolean;
  note?: string;
}

export interface CreateBadgeCampaignDto {
  name: string;
  description?: string;
  activeFrom?: Date;
  activeTo?: Date;
  isActive?: boolean;
}

export interface QueryBadgeCampaignDto extends PageOptionsDto<string> {
  isActive?: boolean;
}

export type UpdateBadgeCampaignDto = Partial<CreateBadgeCampaignDto>;

export interface BadgeFlowTemplateItemDto {
  badgeTemplateId: string;
  priorityWeight?: number;
  isPinned?: boolean;
}

export interface CreateBadgeFlowDto {
  name: string;
  description?: string;
  activeFrom?: Date;
  activeTo?: Date;
  status?: BadgeCampaignStatus;
  ruleType: BadgeRuleType;
  ruleConfig?: Record<string, unknown>;
  channel?: BadgeChannel;
  templates: BadgeFlowTemplateItemDto[];
}

/** Response POST /admin/badge-flows khi upload file Excel SKU. */
export interface CreateBadgeFlowWithFileResponse {
  success: boolean;
  message?: string;
  campaignId: string;
  campaignStatus?: BadgeCampaignStatus;
  jobId: string;
  importExportJobId?: string;
}

/** Một SKU vi phạm cap/vị trí khi activate badge-flow. */
export interface BadgeActivateViolationItem {
  skuCode?: string;
  productId?: string;
  productVariantId?: string;
  hasCapViolation?: boolean;
  hasPositionConflict?: boolean;
  conflictingPositions?: string[];
  message?: string;
}

/** Body 400 khi activate badge-flow vi phạm cap/vị trí. */
export interface BadgeActivateViolationError {
  message: string;
  violationCount?: number;
  violations: BadgeActivateViolationItem[];
}

/** Response GET /admin/badge-jobs/:jobId */
export interface BadgeJobResponse {
  id: string;
  campaignId: string;
  status: string;
  importExportJobId?: string;
  resolvedProductFileUrl?: string;
  violationCount?: number;
  hasViolations?: boolean;
  materialized?: boolean;
  errorMessage?: string;
}

export interface BadgeFlowPositionCount {
  /** Campaign ACTIVE — label đang diễn ra trên vị trí này. */
  running: number;
  /** Campaign DRAFT hoặc INACTIVE — label sắp / chưa diễn ra. */
  upcoming: number;
}

/** Mật độ label theo vị trí — từ GET /admin/badge-flows `positionCounts`. */
export type BadgeFlowPositionCounts = Record<BadgePosition, BadgeFlowPositionCount>;

export interface BadgeFlowStatusCounts {
  all: number;
  active: number;
  inactive: number;
  draft: number;
}

export interface ResListBadgeFlow extends ResList<BadgeCampaign> {
  positionCounts: BadgeFlowPositionCounts;
  counts: BadgeFlowStatusCounts;
}

export interface QueryBadgeFlowDto extends PageOptionsDto<string> {
  status?: BadgeCampaignStatus;
  displayStatus?: BadgeCampaignDisplayStatus;
}

export interface UpdateBadgeFlowDto {
  name?: string;
  description?: string;
  activeFrom?: Date;
  activeTo?: Date;
  channel?: BadgeChannel;
  ruleType?: BadgeRuleType;
  ruleConfig?: Record<string, unknown>;
  templates?: BadgeFlowTemplateItemDto[];
}

export interface BatchResolveDto {
  productIds: string[];
}

export interface PreviewResolveDto {
  productId: string;
  channel?: BadgeChannel;
  surface?: string;
  simulatedTime?: string;
}

export interface CreateBadgeRuleDto {
  campaignId?: string;
  badgeTemplateId: string;
  name: string;
  ruleType: BadgeRuleType;
  ruleConfig?: Record<string, unknown>;
  priorityWeight?: number;
  isPinned?: boolean;
  channel?: BadgeChannel;
  isActive?: boolean;
}

export interface QueryBadgeRuleDto extends PageOptionsDto<string> {
  campaignId?: string;
  badgeTemplateId?: string;
  ruleType?: BadgeRuleType;
  isActive?: boolean;
  isSystem?: boolean;
}

export type UpdateBadgeRuleDto = Omit<CreateBadgeRuleDto, "ruleType" | "badgeTemplateId">;

export interface CreateBadgeTemplateDto {
  name: string;
  code: string;
  description?: string;
  type: BadgeType;
  badgeType: BadgeTemplateBadgeType;
  status?: BadgeStatus;
  displayText?: string;
  defaultPosition?: BadgePosition;
  styleConfig?: Record<string, unknown>;
  icon?: string;
  image?: string;
  iconMobile?: string;
  imageMobile?: string;
  assetMeta?: Record<string, unknown>;
  defaultPriorityWeight?: number;
}

export interface QueryBadgeTemplateDto extends PageOptionsDto<string> {
  status?: BadgeStatus;
  type?: BadgeType;
  badgeType?: BadgeTemplateBadgeType;
  forRuleType?: BadgeRuleType;
  defaultPosition?: BadgePosition;
  isSystem?: boolean;
}

export interface BaseStyleConfigDto {
  shape?: BadgeShape;
  borderRadius?: number;
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  paddingX?: number;
  paddingY?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundImage?: string;
}

export interface TextStyleConfigDto extends BaseStyleConfigDto {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: string;
}

export interface MiniBannerStyleConfigDto extends BaseStyleConfigDto {
  textColor: string;
}

export interface UpdateBadgeStatusDto {
  status: BadgeStatus;
}

export interface UpdateBadgeTemplateDto extends Omit<CreateBadgeTemplateDto, "code" | "status" | "displayText" | "image" | "styleConfig"> {
  displayText?: string | null;
  image?: string | null;
  styleConfig?: Record<string, unknown> | null;
}
