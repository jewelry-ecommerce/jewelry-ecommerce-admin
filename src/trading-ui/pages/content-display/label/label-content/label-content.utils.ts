import type { SxProps, Theme } from "@mui/material";
import type {
  BadgeCampaign,
  BadgeFlowPositionCounts,
  CreateBadgeTemplateDto,
  UpdateBadgeTemplateDto,
  BadgeTemplate,
} from "@/trading-ui/apis/badge";
import { BadgePosition, BadgeStatus, BadgeTemplateBadgeType, BadgeType } from "@/trading-ui/apis/badge";
import { LABEL_CONTENT_HEATMAP_FOOT_LAYOUT, LABEL_CONTENT_HEATMAP_SLOT_LAYOUTS } from "./label-content.constants";
import { LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR, LABEL_CONTENT_DEFAULT_TEXT_COLOR } from "./label-content.constants";
import type {
  LabelContentAdvancedFilters,
  LabelContentDesignRow,
  LabelContentHeatmapSlot,
  LabelContentHeatmapSlotId,
  LabelContentPositionDialogRow,
  LabelContentTemplateFormValues,
} from "./label-content.interface";

export const countActiveLabelContentAdvancedFilters = (filters: LabelContentAdvancedFilters): number =>
  [Boolean(filters.status), Boolean(filters.type), Boolean(filters.badgeType), Boolean(filters.defaultPosition)].filter(Boolean).length;

const emptyPositionCount = () => ({ running: 0, upcoming: 0 });

export const buildHeatmapSlotsFromPositionCounts = (positionCounts?: BadgeFlowPositionCounts): LabelContentHeatmapSlot[] =>
  LABEL_CONTENT_HEATMAP_SLOT_LAYOUTS.map((layout) => {
    const position = heatmapSlotIdToBadgePosition(layout.id);
    const count = position && positionCounts?.[position] ? positionCounts[position] : emptyPositionCount();
    return { ...layout, ...count };
  });

export const buildHeatmapFootSlotFromPositionCounts = (positionCounts?: BadgeFlowPositionCounts): LabelContentHeatmapSlot => {
  const position = heatmapSlotIdToBadgePosition(LABEL_CONTENT_HEATMAP_FOOT_LAYOUT.id);
  const count = position && positionCounts?.[position] ? positionCounts[position] : emptyPositionCount();
  return { ...LABEL_CONTENT_HEATMAP_FOOT_LAYOUT, ...count };
};

/** Popup mật độ theo vị trí — mỗi rule trong badge-flow có template đúng `defaultPosition`. */
export const badgeFlowsToPositionDialogRows = (flows: BadgeCampaign[], position: BadgePosition): LabelContentPositionDialogRow[] => {
  const rows: LabelContentPositionDialogRow[] = [];

  for (const campaign of flows) {
    for (const rule of campaign.rules ?? []) {
      const template = rule.badgeTemplate;
      if (!template || template.defaultPosition !== position) continue;

      rows.push({
        id: `${campaign.id}-${rule.id}`,
        labelName: template.name,
        badgeTemplate: template,
        displayStatus: campaign.displayStatus,
        activeFrom: campaign.activeFrom ? String(campaign.activeFrom) : undefined,
        activeTo: campaign.activeTo ? String(campaign.activeTo) : undefined,
        typeLabel: badgeTemplateBadgeTypeLabelVi(template.badgeType),
        configName: campaign.name,
        priority: rule.priorityWeight ?? template.defaultPriorityWeight ?? 0,
      });
    }
  }

  return rows.sort((a, b) => b.priority - a.priority);
};

export const resolveLabelTextColors = (v: Pick<LabelContentTemplateFormValues, "backgroundColor" | "textColor">) => ({
  backgroundColor: v.backgroundColor?.trim() || LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR,
  textColor: v.textColor?.trim() || LABEL_CONTENT_DEFAULT_TEXT_COLOR,
});

export const heatmapSlotIdToBadgePosition = (id: LabelContentHeatmapSlotId): BadgePosition | undefined => {
  const map: Record<LabelContentHeatmapSlotId, BadgePosition> = {
    TL: BadgePosition.TOP_LEFT,
    TR: BadgePosition.TOP_RIGHT,
    ML: BadgePosition.CENTER_LEFT,
    MR: BadgePosition.CENTER_RIGHT,
    BL: BadgePosition.BOTTOM_LEFT,
    BC: BadgePosition.BOTTOM_CENTER,
    BR: BadgePosition.BOTTOM_RIGHT,
    BF: BadgePosition.PRICE_LINE,
  };
  return map[id];
};

export const badgePositionLabelVi = (p: BadgePosition): string => {
  switch (p) {
    case BadgePosition.TOP_LEFT:
      return "1. Trên - Trái";
    case BadgePosition.TOP_RIGHT:
      return "2. Trên - Phải";
    case BadgePosition.CENTER_LEFT:
      return "3. Giữa - Trái";
    case BadgePosition.CENTER_RIGHT:
      return "4. Giữa - Phải";
    case BadgePosition.BOTTOM_LEFT:
      return "5. Dưới - Trái";
    case BadgePosition.BOTTOM_RIGHT:
      return "6. Dưới - Phải";
    case BadgePosition.BOTTOM_CENTER:
      return "7. Dưới cùng - Ngang";
    case BadgePosition.PRICE_LINE:
      return "8. Dòng giá";
    default:
      return String(p);
  }
};

/** Có đủ dữ liệu để hiện panel xem trước (create: sau khi user chỉnh khu vực thiết kế). */
export const hasLabelDesignPreview = (
  v: Pick<LabelContentTemplateFormValues, "type" | "displayText" | "image" | "backgroundColor" | "textColor">,
): boolean => {
  if (v.backgroundColor?.trim() || v.textColor?.trim()) return true;
  if (v.type === BadgeType.IMAGE && v.image?.trim()) return true;
  if (v.type === BadgeType.TEXT && v.displayText?.trim()) return true;
  return false;
};

const PREVIEW_OFFSET = 2;

/** Vị trí badge trên ảnh sản phẩm trong panel xem trước. */
export const badgePositionToImagePreviewSx = (position: BadgePosition | ""): SxProps<Theme> => {
  switch (position) {
    case BadgePosition.TOP_LEFT:
      return { top: PREVIEW_OFFSET, left: PREVIEW_OFFSET };
    case BadgePosition.TOP_RIGHT:
      return { top: PREVIEW_OFFSET, right: PREVIEW_OFFSET };
    case BadgePosition.CENTER_LEFT:
      return { top: "50%", left: PREVIEW_OFFSET, transform: "translateY(-50%)" };
    case BadgePosition.CENTER_RIGHT:
      return { top: "50%", right: PREVIEW_OFFSET, transform: "translateY(-50%)" };
    case BadgePosition.BOTTOM_LEFT:
      return { bottom: PREVIEW_OFFSET, left: PREVIEW_OFFSET };
    case BadgePosition.BOTTOM_CENTER:
      return { left: PREVIEW_OFFSET, right: PREVIEW_OFFSET, bottom: PREVIEW_OFFSET };
    case BadgePosition.BOTTOM_RIGHT:
      return { bottom: PREVIEW_OFFSET, right: PREVIEW_OFFSET };
    case BadgePosition.PRICE_LINE:
      return {};
    default:
      return { top: PREVIEW_OFFSET, left: PREVIEW_OFFSET };
  }
};

export const badgeTemplateBadgeTypeLabelVi = (t: BadgeTemplateBadgeType): string => {
  switch (t) {
    case BadgeTemplateBadgeType.CAMPAIGN:
      return "Campaign";
    case BadgeTemplateBadgeType.BEST_SELLER:
      return "Bán chạy";
    case BadgeTemplateBadgeType.PRICE_DIFF:
      return "Chênh lệch giá";
    case BadgeTemplateBadgeType.OUT_OF_STOCK:
      return "Hết hàng";
    case BadgeTemplateBadgeType.NEW_ARRIVAL:
      return "Mới";
    case BadgeTemplateBadgeType.LOW_STOCK:
      return "Sắp hết";
    case BadgeTemplateBadgeType.PRE_ORDER:
      return "Đặt trước";
    default:
      return String(t);
  }
};

/** Loại Label cho Danh sách Labels (Label Library) — không dùng cho badge-flow thủ công. */
export const LABEL_LIBRARY_BADGE_TYPE_VALUES = [
  BadgeTemplateBadgeType.CAMPAIGN,
  BadgeTemplateBadgeType.OUT_OF_STOCK,
  BadgeTemplateBadgeType.PRE_ORDER,
] as const;

export const LABEL_LIBRARY_BADGE_TYPE_OPTIONS = LABEL_LIBRARY_BADGE_TYPE_VALUES.map((value) => ({
  value,
  label: badgeTemplateBadgeTypeLabelVi(value),
}));

/** Label hiển thị khi form có thể trả `''` (create chưa chọn loại). */
export const resolveBadgeTemplateBadgeTypeLabelVi = (badgeType: BadgeTemplateBadgeType | ""): string =>
  badgeType ? badgeTemplateBadgeTypeLabelVi(badgeType) : "—";

export const badgeTemplateToTableRow = (t: BadgeTemplate): LabelContentDesignRow => {
  return {
    id: t.id,
    name: t.name,
    badgeType: t.badgeType,
    slotLabel: t.defaultPosition ? badgePositionLabelVi(t.defaultPosition) : "—",
    priority: t.defaultPriorityWeight ?? 0,
    status: t.status,
    updatedAt: typeof t.updatedAt === "string" ? t.updatedAt : new Date(t.updatedAt).toISOString(),
    badgeTemplate: t,
  };
};

const slugCodeFromName = (name: string): string => {
  const normalized = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

  const base = /^[A-Z]/.test(normalized) ? normalized : `LABEL_${normalized}`;
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${base || "LABEL"}_${suffix}`;
};

export const buildCreateBadgeTemplatePayload = (v: LabelContentTemplateFormValues): CreateBadgeTemplateDto => {
  const style: Record<string, string> = {};
  if (v.type === BadgeType.TEXT) {
    Object.assign(style, resolveLabelTextColors(v));
  }
  const defaultPosition = (v.defaultPosition || BadgePosition.TOP_LEFT) as BadgePosition;

  return {
    name: v.name.trim(),
    code: slugCodeFromName(v.name),
    type: v.type,
    badgeType: v.badgeType as BadgeTemplateBadgeType,
    status: (v.status || BadgeStatus.ACTIVE) as BadgeStatus,
    displayText: v.type === BadgeType.TEXT ? v.displayText.trim() || undefined : undefined,
    image: v.type === BadgeType.IMAGE ? v.image.trim() || undefined : undefined,
    defaultPosition,
    styleConfig: Object.keys(style).length ? style : undefined,
  };
};

export const buildUpdateBadgeTemplatePayload = (v: LabelContentTemplateFormValues): UpdateBadgeTemplateDto => {
  const style: Record<string, string> = {};
  if (v.type === BadgeType.TEXT) {
    Object.assign(style, resolveLabelTextColors(v));
  }
  const defaultPosition = (v.defaultPosition || BadgePosition.TOP_LEFT) as BadgePosition;

  return {
    name: v.name.trim(),
    type: v.type,
    badgeType: v.badgeType as BadgeTemplateBadgeType,
    displayText: v.type === BadgeType.TEXT ? v.displayText.trim() || undefined : null,
    image: v.type === BadgeType.IMAGE ? v.image.trim() || undefined : null,
    defaultPosition,
    styleConfig: v.type === BadgeType.TEXT ? (Object.keys(style).length ? style : undefined) : {},
  };
};

export const mapBadgeTemplateToFormValues = (t: BadgeTemplate): LabelContentTemplateFormValues => {
  const sc = (t.styleConfig ?? {}) as Record<string, string>;
  const type: BadgeType.TEXT | BadgeType.IMAGE = t.type === BadgeType.IMAGE ? BadgeType.IMAGE : BadgeType.TEXT;

  return {
    badgeType: t.badgeType,
    name: t.name,
    status: t.status,
    type,
    displayText: t.displayText ?? "",
    image: t.image ?? "",
    backgroundColor:
      typeof sc.backgroundColor === "string" && sc.backgroundColor.trim() ? sc.backgroundColor : LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR,
    textColor: typeof sc.textColor === "string" && sc.textColor.trim() ? sc.textColor : LABEL_CONTENT_DEFAULT_TEXT_COLOR,
    defaultPosition: t.defaultPosition ?? BadgePosition.TOP_LEFT,
  };
};
