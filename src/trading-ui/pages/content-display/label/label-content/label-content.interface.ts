import type {
  BadgeCampaignDisplayStatus,
  BadgeTemplate,
  BadgePosition,
  BadgeStatus,
  BadgeTemplateBadgeType,
  BadgeType,
} from "@/trading-ui/apis/badge";

export type LabelContentDesignRowId = string;

export type LabelContentDesignPreview =
  { kind: "image"; src: string } | { kind: "pill"; text: string; variant: "new" | "saleOrigin" | "bestSeller" };

export interface LabelContentDesignRow {
  id: LabelContentDesignRowId;
  name: string;
  badgeType: BadgeTemplateBadgeType;
  slotLabel: string;
  priority: number;
  status: BadgeStatus;
  updatedAt: string;
  badgeTemplate: BadgeTemplate;
}

export type LabelContentHeatmapSlotId = "TL" | "TR" | "ML" | "MR" | "BL" | "BC" | "BR" | "BF";

export interface LabelContentHeatmapSlotLayout {
  id: LabelContentHeatmapSlotId;
  labelVi: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  transform?: string;
}

export interface LabelContentHeatmapSlot extends LabelContentHeatmapSlotLayout {
  running: number;
  upcoming: number;
}

/** Một dòng trong popup chi tiết mật độ theo vị trí (nguồn: badge-flow). */
export interface LabelContentPositionDialogRow {
  id: string;
  labelName: string;
  badgeTemplate: BadgeTemplate;
  displayStatus: BadgeCampaignDisplayStatus;
  activeFrom?: string;
  activeTo?: string;
  typeLabel: string;
  /** Tên cấu hình áp dụng (badge-flow / campaign). */
  configName: string;
  priority: number;
}

/** Bộ lọc nâng cao — map sang `QueryBadgeTemplateDto` (bỏ qua field rỗng). */
export interface LabelContentAdvancedFilters {
  status: "" | BadgeStatus;
  type: "" | BadgeType;
  badgeType: "" | BadgeTemplateBadgeType;
  defaultPosition: "" | BadgePosition;
}

export interface LabelContentTemplateFormValues {
  badgeType: BadgeTemplateBadgeType | "";
  name: string;
  status: BadgeStatus | "";
  type: BadgeType.TEXT | BadgeType.IMAGE;
  displayText: string;
  image: string;
  backgroundColor: string;
  textColor: string;
  defaultPosition: BadgePosition | "";
}
