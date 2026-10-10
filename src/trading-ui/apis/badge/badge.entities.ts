import { type BaseEntity } from "@/trading-ui/common/constant/api.interface";
import {
  type BadgeCampaignDisplayStatus,
  type BadgeCampaignStatus,
  type BadgeChannel,
  type BadgePosition,
  type BadgeRuleType,
  type BadgeStatus,
  type BadgeTemplateBadgeType,
  type BadgeType,
} from "@/trading-ui/apis/badge/badge.enum";

export interface BadgeAssignment extends BaseEntity {
  badgeTemplateId: string;
  productId: string;
  badgeRuleId?: string;
  badgeRule?: BadgeRule;
  sourceType: BadgeRuleType;
  position?: BadgePosition;
  dynamicText?: string;
  priorityWeight: number;
  isPinned: boolean;
  activeFrom?: Date;
  activeTo?: Date;
  channel: BadgeChannel;
  isActive: boolean;
  note?: string;
  assignedById?: string;
  assignedByType?: string;
  badgeTemplate: BadgeTemplate;
}

export interface BadgeCampaign extends BaseEntity {
  name: string;
  description?: string;
  activeFrom?: Date;
  activeTo?: Date;
  status: BadgeCampaignStatus;
  isActive: boolean;
  rules: BadgeRule[];
  displayStatus: BadgeCampaignDisplayStatus;
  /** Flow đồng bộ từ OMS Pre-order — CMS chỉ xem. */
  isSystemGenerated?: boolean;
  source?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
}

export interface BadgeRule extends BaseEntity {
  campaignId?: string;
  campaign?: BadgeCampaign;
  badgeTemplateId: string;
  badgeTemplate: BadgeTemplate;
  name: string;
  ruleType: BadgeRuleType;
  ruleConfig: Record<string, unknown>;
  priorityWeight?: number;
  isPinned: boolean;
  channel: BadgeChannel;
  isActive: boolean;
  isSystem: boolean;
  lastEvaluatedAt?: Date;
  lastProductCount?: number;
  assignments: BadgeAssignment[];
}

export interface BadgeTemplate extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  type: BadgeType;
  badgeType: BadgeTemplateBadgeType;
  displayText?: string;
  styleConfig: Record<string, unknown>;
  icon?: string;
  image?: string;
  iconMobile?: string;
  imageMobile?: string;
  assetMeta?: Record<string, unknown>;
  defaultPosition?: BadgePosition;
  defaultPriorityWeight: number;
  status: BadgeStatus;
  isSystem: boolean;
  assignments: BadgeAssignment[];
  rules: BadgeRule[];
}
