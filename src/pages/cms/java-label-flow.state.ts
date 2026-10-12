import dayjs, { type Dayjs } from "dayjs";
import { BadgeCampaignStatus, BadgeTemplateBadgeType, BadgeRuleType, BadgeChannel, type BadgeFlowDetail, type CreateBadgeFlowDto } from "@/trading-ui/apis/badge";
import type { LabelDisplaySelectedCategory, LabelDisplaySelectedCollection, LabelDisplaySelectedProduct, LabelDisplayPromotionPickItem, LabelDisplayScope } from "@/trading-ui/pages/content-display/label/label-display/label-display.interface";
export interface LabelFlowState { name: string; labelIds: string[]; badgeType: BadgeTemplateBadgeType; status: BadgeCampaignStatus;
  start: Dayjs | null; end: Dayjs | null; scope: LabelDisplayScope; categories: LabelDisplaySelectedCategory[];
  collections: LabelDisplaySelectedCollection[]; products: LabelDisplaySelectedProduct[]; promotions: LabelDisplayPromotionPickItem[] }
export function labelFlowState(flow?: BadgeFlowDetail): LabelFlowState {
  return { name: flow?.name ?? "", labelIds: flow?.rules.flatMap(rule => rule.template ? [rule.template.id] : []) ?? [],
    badgeType: flow?.rules[0]?.template?.badgeType ?? BadgeTemplateBadgeType.CAMPAIGN, status: flow?.status ?? BadgeCampaignStatus.DRAFT,
    start: flow?.activeFrom ? dayjs(flow.activeFrom) : null, end: flow?.activeTo ? dayjs(flow.activeTo) : null,
    scope: ({ CATEGORY: "category", COLLECTION: "collection", MANUAL: "product", PROMOTION: "promotion" } as Record<string, LabelDisplayScope>)[flow?.ruleType ?? ""] ?? "all",
    categories: savedIds(flow, "categoryIds").map(id => ({ id, name: id, imageUrl: "" })),
    collections: savedIds(flow, "collectionIds").map(id => ({ id, name: id, imageUrl: "" })),
    products: savedIds(flow, "skuIds").map(id => ({ productVariantId: id, productId: "", skuCode: "", name: id, imageUrl: "" })),
    promotions: savedIds(flow, "promotionIds").map(id => ({ id, name: id, label: id, source: "PUBLISHED" })) };
}
function savedIds(flow: BadgeFlowDetail | undefined, key: string): string[] {
  const value = flow?.ruleConfig?.[key];
  return Array.isArray(value) ? value.map(String) : [];
}
export function labelFlowPayload(state: LabelFlowState): CreateBadgeFlowDto {
  if (!state.name.trim() || state.labelIds.length !== 1) throw new Error("Nhập tên cấu hình và chọn một nhãn.");
  if (state.start && !state.start.isValid() || state.end && !state.end.isValid()) throw new Error("Thời gian không hợp lệ.");
  if (state.start && state.end && state.end.isBefore(state.start)) throw new Error("Thời gian kết thúc phải sau bắt đầu.");
  const ruleType = state.badgeType === BadgeTemplateBadgeType.OUT_OF_STOCK ? BadgeRuleType.OUT_OF_STOCK :
    ({ all: BadgeRuleType.ALL, category: BadgeRuleType.CATEGORY, collection: BadgeRuleType.COLLECTION,
      product: BadgeRuleType.MANUAL, promotion: BadgeRuleType.PROMOTION } as const)[state.scope];
  const ruleConfig = ruleType === BadgeRuleType.CATEGORY ? { categoryIds: state.categories.map(row => row.id) } :
    ruleType === BadgeRuleType.COLLECTION ? { collectionIds: state.collections.map(row => row.id) } :
    ruleType === BadgeRuleType.MANUAL ? { skuIds: state.products.map(row => row.productVariantId) } :
    ruleType === BadgeRuleType.PROMOTION ? { promotionIds: state.promotions.map(row => row.id) } : {};
  const targets = Object.values(ruleConfig).flat();
  if (![BadgeRuleType.ALL, BadgeRuleType.OUT_OF_STOCK].includes(ruleType) && !targets.length) throw new Error("Chọn ít nhất một đối tượng áp dụng.");
  return { name: state.name.trim(), status: state.status, ruleType, ruleConfig, channel: BadgeChannel.WEB,
    activeFrom: state.start?.toDate(), activeTo: state.end?.toDate(),
    templates: state.labelIds.map(badgeTemplateId => ({ badgeTemplateId, isPinned: false })) };
}
