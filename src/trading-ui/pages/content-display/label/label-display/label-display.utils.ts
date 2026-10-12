import {
  BadgeCampaignStatus,
  BadgeChannel,
  BadgePosition,
  BadgeRuleType,
  BadgeStatus,
  BadgeTemplateBadgeType,
  type BadgeFlowDetail,
  type BadgeFlowRuleView,
  type BadgeTemplate,
  type CreateBadgeFlowDto,
  type UpdateBadgeFlowDto,
} from '../../../../apis';
import { getBadgeCampaignStatusLabelVi } from '../label-content/label-content.constants';
import { badgePositionLabelVi, badgeTemplateBadgeTypeLabelVi } from '../label-content/label-content.utils';
import type { LabelDisplayPromotionPickItem, LabelDisplayScope, LabelDisplaySelectedCategory, LabelDisplaySelectedCollection, LabelDisplaySelectedProduct } from './label-display.interface';

const isPositionTakenBySelection = (position: BadgePosition, takenPositions: Set<BadgePosition>): boolean => takenPositions.has(position);

const detailTemplateToSelectItem = (template: NonNullable<BadgeFlowRuleView['template']>): BadgeTemplate => ({
  id: template.id,
  code: template.code,
  name: template.name,
  type: template.type,
  badgeType: template.badgeType,
  displayText: template.displayText,
  image: template.image,
  icon: template.icon,
  defaultPosition: template.defaultPosition,
  styleConfig: (template.styleConfig ?? {}) as BadgeTemplate['styleConfig'],
  defaultPriorityWeight: 0,
  status: BadgeStatus.ACTIVE,
  isSystem: false,
  assignments: [],
  rules: [],
  createdAt: new Date(0),
  updatedAt: new Date(0),
});

/** Gộp template từ detail (có thể INACTIVE) để dropdown vẫn hiện tên đã chọn. */
export const mergeBadgeTemplatesForSelect = (apiTemplates: BadgeTemplate[], detailRules: BadgeFlowRuleView[] | undefined, selectedIds: string[]): BadgeTemplate[] => {
  const byId = new Map(apiTemplates.map((template) => [template.id, template]));

  for (const rule of detailRules ?? []) {
    const template = rule.template;
    if (!template?.id || byId.has(template.id)) continue;
    if (!selectedIds.includes(template.id)) continue;
    byId.set(template.id, detailTemplateToSelectItem(template));
  }

  return [...byId.values()];
};

export const LABEL_DISPLAY_CAMPAIGN_STATUS_OPTIONS = [BadgeCampaignStatus.DRAFT, BadgeCampaignStatus.ACTIVE, BadgeCampaignStatus.INACTIVE].map((value) => ({
  value,
  label: getBadgeCampaignStatusLabelVi(value),
}));

/** Giới hạn nghiệp vụ CAMPAIGN — đồng bộ với badge-service. */
export const LABEL_DISPLAY_MAX_TEMPLATES = 1;
export const LABEL_DISPLAY_OUT_OF_STOCK_MAX_TEMPLATES = 1;
export const LABEL_DISPLAY_DEFAULT_MIN_STOCK = 1;

/** Manual badge-flow only — intentionally excludes PRE_ORDER (OMS sync Phase 2). */
export const LABEL_DISPLAY_BADGE_TYPE_OPTIONS = [BadgeTemplateBadgeType.CAMPAIGN, BadgeTemplateBadgeType.OUT_OF_STOCK].map((value) => ({
  value,
  label: badgeTemplateBadgeTypeLabelVi(value),
}));

export const isOutOfStockLabelDisplayType = (badgeType: BadgeTemplateBadgeType): boolean => badgeType === BadgeTemplateBadgeType.OUT_OF_STOCK;

export const getLabelDisplayMaxTemplates = (badgeType: BadgeTemplateBadgeType): number =>
  isOutOfStockLabelDisplayType(badgeType) ? LABEL_DISPLAY_OUT_OF_STOCK_MAX_TEMPLATES : LABEL_DISPLAY_MAX_TEMPLATES;

const LABEL_DISPLAY_BADGE_POSITION_SORT_ORDER: BadgePosition[] = [
  BadgePosition.TOP_LEFT,
  BadgePosition.TOP_RIGHT,
  BadgePosition.CENTER_LEFT,
  BadgePosition.CENTER_RIGHT,
  BadgePosition.BOTTOM_LEFT,
  BadgePosition.BOTTOM_RIGHT,
  BadgePosition.BOTTOM_CENTER,
  BadgePosition.PRICE_LINE,
];

const getBadgePositionSortIndex = (position?: BadgePosition): number => {
  if (!position) return LABEL_DISPLAY_BADGE_POSITION_SORT_ORDER.length;
  const index = LABEL_DISPLAY_BADGE_POSITION_SORT_ORDER.indexOf(position);
  return index === -1 ? LABEL_DISPLAY_BADGE_POSITION_SORT_ORDER.length : index;
};

const sortLabelTemplatesByPosition = (templates: BadgeTemplate[]): BadgeTemplate[] =>
  [...templates].sort((left, right) => {
    const byPosition = getBadgePositionSortIndex(left.defaultPosition) - getBadgePositionSortIndex(right.defaultPosition);
    if (byPosition !== 0) return byPosition;
    return left.name.localeCompare(right.name, 'vi');
  });

export const buildLabelTemplateSelectOptions = (templates: BadgeTemplate[], selectedIds: string[]) => {
  const takenPositions = new Set<BadgePosition>();
  selectedIds.forEach((id) => {
    const position = templates.find((template) => template.id === id)?.defaultPosition;
    if (position) takenPositions.add(position);
  });

  return sortLabelTemplatesByPosition(templates).map((item) => {
    const positionText = item.defaultPosition ? badgePositionLabelVi(item.defaultPosition) : '—';
    const positionTaken = item.defaultPosition != null && isPositionTakenBySelection(item.defaultPosition, takenPositions) && !selectedIds.includes(item.id);

    return {
      value: item.id,
      label: `${item.name}  (${positionText})`,
      disabled: positionTaken,
    };
  });
};

export interface LabelDisplayFormPayloadInput {
  name: string;
  badgeType: BadgeTemplateBadgeType;
  selectedLabelIds: string[];
  scope: LabelDisplayScope;
  selectedCategories: LabelDisplaySelectedCategory[];
  selectedCollections: LabelDisplaySelectedCollection[];
  selectedPromotions: LabelDisplayPromotionPickItem[];
  selectedProducts: LabelDisplaySelectedProduct[];
  minStock?: number;
  activeFrom?: Date | null;
  activeTo?: Date | null;
}

type ScopeRulePart = Pick<CreateBadgeFlowDto, 'ruleType' | 'ruleConfig'>;

export type BuildScopeRulePartInput = {
  scope: LabelDisplayScope;
  categories: LabelDisplaySelectedCategory[];
  products: LabelDisplaySelectedProduct[];
  collections?: LabelDisplaySelectedCollection[];
  promotions?: LabelDisplayPromotionPickItem[];
};

/**
 * Build `ruleType` + `ruleConfig` theo scope.
 * - all / category / collection / product / promotion
 */
export const buildScopeRulePart = (input: BuildScopeRulePartInput): ScopeRulePart | null => {
  const { scope, categories, products, collections = [], promotions = [] } = input;
  switch (scope) {
    case 'all':
      return { ruleType: BadgeRuleType.ALL };

    case 'category':
      if (categories.length === 0) return null;
      return {
        ruleType: BadgeRuleType.CATEGORY,
        ruleConfig: {
          categories: categories.map((c) => ({
            categoryId: c.id,
            name: c.name,
            imageUrl: c.imageUrl,
          })),
        },
      };

    case 'collection':
      if (collections.length === 0) return null;
      return {
        ruleType: BadgeRuleType.COLLECTION,
        ruleConfig: {
          collectionIds: collections.map((c) => c.id),
          collections: collections.map((c) => ({
            collectionId: c.id,
            name: c.name,
            imageUrl: c.imageUrl,
          })),
        },
      };

    case 'product':
      if (products.length === 0) return null;
      return {
        ruleType: BadgeRuleType.MANUAL,
        ruleConfig: {
          targets: products.map((p) => ({
            skuCode: p.skuCode,
            productId: p.productId,
            productVariantId: p.productVariantId,
            productVariantName: p.name,
            productVariantImageUrl: p.imageUrl,
          })),
        },
      };

    case 'promotion':
      if (promotions.length === 0) return null;
      return {
        ruleType: BadgeRuleType.PROMOTION,
        ruleConfig: {
          promotions: promotions.map((p) => ({
            id: p.id,
            source: p.source,
            name: p.name,
          })),
        },
      };

    default:
      return null;
  }
};

export const buildOutOfStockRulePart = (minStock: number): ScopeRulePart => ({
  ruleType: BadgeRuleType.OUT_OF_STOCK,
  ruleConfig: {
    minStock,
  },
});

export interface LabelDisplayValidationError {
  message: string;
}

/** Validate form trước khi build payload. Trả về lỗi đầu tiên (nếu có). */
export const validateLabelDisplayForm = (input: LabelDisplayFormPayloadInput, options?: { allowEmptyProducts?: boolean; skipActiveFromNowCheck?: boolean }): LabelDisplayValidationError | null => {
  const name = input.name.trim();
  if (!name) return { message: 'Vui lòng nhập tên cấu hình.' };
  if (name.length > 100) return { message: 'Tên cấu hình tối đa 100 ký tự.' };

  if (input.selectedLabelIds.length === 0) {
    return { message: 'Vui lòng chọn ít nhất 1 Label.' };
  }
  const maxTemplates = getLabelDisplayMaxTemplates(input.badgeType);
  if (input.selectedLabelIds.length > maxTemplates) {
    return { message: `Chỉ được chọn tối đa ${maxTemplates} Label${maxTemplates > 1 ? 's' : ''}.` };
  }

  if (!input.activeFrom) {
    return { message: 'Vui lòng chọn thời gian bắt đầu.' };
  }
  if (input.activeTo && input.activeTo <= input.activeFrom) {
    return { message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' };
  }

  if (isOutOfStockLabelDisplayType(input.badgeType)) {
    if (!Number.isInteger(input.minStock) || (input.minStock ?? -1) < 0) {
      return { message: 'Vui lòng nhập minStock là số nguyên không âm (cho phép 0).' };
    }
    return null;
  }

  if (input.scope === 'promotion' && input.selectedPromotions.length === 0) {
    return { message: 'Vui lòng chọn ít nhất 1 Promotion.' };
  }
  if (input.scope === 'category' && input.selectedCategories.length === 0) {
    return { message: 'Vui lòng chọn ít nhất 1 danh mục.' };
  }
  if (input.scope === 'collection' && input.selectedCollections.length === 0) {
    return { message: 'Vui lòng chọn ít nhất 1 bộ sưu tập.' };
  }
  if (!options?.allowEmptyProducts && input.scope === 'product' && input.selectedProducts.length === 0) {
    return { message: 'Vui lòng chọn ít nhất 1 sản phẩm.' };
  }

  return null;
};

/**
 * Build payload đầy đủ cho POST /admin/badge-flows.
 * - channel hard-code ALL, status hard-code DRAFT.
 * - templates: chỉ gửi badgeTemplateId, bỏ priorityWeight / isPinned.
 */
export const buildCreateBadgeFlowPayload = (input: LabelDisplayFormPayloadInput, rulePart: ScopeRulePart): CreateBadgeFlowDto => ({
  name: input.name.trim(),
  channel: BadgeChannel.ALL,
  status: BadgeCampaignStatus.DRAFT,
  activeFrom: input.activeFrom ?? undefined,
  activeTo: input.activeTo ?? undefined,
  templates: input.selectedLabelIds.map((id) => ({ badgeTemplateId: id })),
  ...rulePart,
});

/** Payload POST badge-flows kèm file Excel — ruleConfig rỗng, SKU từ file. */
export const buildCreateBadgeFlowImportPayload = (input: LabelDisplayFormPayloadInput): CreateBadgeFlowDto => ({
  name: input.name.trim(),
  channel: BadgeChannel.ALL,
  status: BadgeCampaignStatus.DRAFT,
  activeFrom: input.activeFrom ?? undefined,
  activeTo: input.activeTo ?? undefined,
  ruleType: BadgeRuleType.MANUAL,
  ruleConfig: {},
  templates: input.selectedLabelIds.map((id) => ({ badgeTemplateId: id })),
});

/** Payload PATCH badge-flows kèm file Excel — MANUAL, ruleConfig rỗng. */
export const buildUpdateBadgeFlowImportPayload = (input: LabelDisplayFormPayloadInput): UpdateBadgeFlowDto => ({
  name: input.name.trim(),
  channel: BadgeChannel.ALL,
  activeFrom: input.activeFrom ?? undefined,
  activeTo: input.activeTo ?? undefined,
  templates: input.selectedLabelIds.map((id) => ({ badgeTemplateId: id })),
  ruleConfig: {},
});

/** Build payload cho PATCH /admin/badge-flows/:id. */
export const buildUpdateBadgeFlowPayload = (input: LabelDisplayFormPayloadInput, rulePart: ScopeRulePart): UpdateBadgeFlowDto => ({
  name: input.name.trim(),
  channel: BadgeChannel.ALL,
  activeFrom: input.activeFrom ?? undefined,
  activeTo: input.activeTo ?? undefined,
  templates: input.selectedLabelIds.map((id) => ({ badgeTemplateId: id })),
  ruleType: rulePart.ruleType,
  ruleConfig: rulePart.ruleConfig ?? {},
});

/** Map API detail → state scope panel (dùng chung detail + update hydrate). */
export type LabelDisplayDetailScopeState = {
  scope: LabelDisplayScope;
  badgeType: BadgeTemplateBadgeType;
  minStock?: number;
  categories: LabelDisplaySelectedCategory[];
  collections: LabelDisplaySelectedCollection[];
  promotions: LabelDisplayPromotionPickItem[];
  products: LabelDisplaySelectedProduct[];
};

export const mapDetailToScopeState = (detail: BadgeFlowDetail): LabelDisplayDetailScopeState => {
  const categories: LabelDisplaySelectedCategory[] = [];
  const collections: LabelDisplaySelectedCollection[] = [];
  const promotions: LabelDisplayPromotionPickItem[] = [];
  const products: LabelDisplaySelectedProduct[] = [];
  let scope: LabelDisplayScope = 'all';
  const currentTemplateBadgeType = detail.rules.find((rule) => rule.template?.badgeType)?.template?.badgeType;
  let badgeType =
    currentTemplateBadgeType === BadgeTemplateBadgeType.OUT_OF_STOCK
      ? BadgeTemplateBadgeType.OUT_OF_STOCK
      : currentTemplateBadgeType === BadgeTemplateBadgeType.PRE_ORDER
        ? BadgeTemplateBadgeType.PRE_ORDER
        : BadgeTemplateBadgeType.CAMPAIGN;
  let minStock: number | undefined;

  const cfg = detail.ruleConfig ?? {};

  switch (detail.ruleType) {
    case BadgeRuleType.ALL:
      scope = 'all';
      break;
    case BadgeRuleType.CATEGORY: {
      scope = 'category';
      const stored = Array.isArray(cfg.categories) ? (cfg.categories as Array<Record<string, string>>) : [];
      if (stored.length > 0) {
        stored.forEach((c) => {
          const id = c.categoryId ?? '';
          if (!id) return;
          categories.push({ id, name: c.name ?? id, imageUrl: c.imageUrl ?? '' });
        });
      } else {
        const ids = Array.isArray(cfg.categoryIds) ? (cfg.categoryIds as string[]) : [];
        ids.forEach((id) => {
          categories.push({ id, name: id, imageUrl: '' });
        });
      }
      break;
    }
    case BadgeRuleType.COLLECTION: {
      scope = 'collection';
      const stored = Array.isArray(cfg.collections) ? (cfg.collections as Array<Record<string, string>>) : [];
      if (stored.length > 0) {
        stored.forEach((c) => {
          const id = c.collectionId ?? '';
          if (!id) return;
          collections.push({ id, name: c.name ?? id, imageUrl: c.imageUrl ?? '' });
        });
      } else {
        const ids = Array.isArray(cfg.collectionIds) ? (cfg.collectionIds as string[]) : [];
        ids.forEach((id) => {
          collections.push({ id, name: id, imageUrl: '' });
        });
      }
      break;
    }
    case BadgeRuleType.PROMOTION: {
      scope = 'promotion';
      const stored = Array.isArray(cfg.promotions) ? (cfg.promotions as Array<Record<string, string>>) : [];
      stored.forEach((p) => {
        const id = p.id ?? '';
        const source = p.source === 'DRAFT' || p.source === 'PUBLISHED' ? p.source : null;
        if (!id || !source) return;
        const name = p.name ?? id;
        promotions.push({ id, source, name, label: name });
      });
      break;
    }
    case BadgeRuleType.OUT_OF_STOCK: {
      badgeType = BadgeTemplateBadgeType.OUT_OF_STOCK;
      const parsedMinStock = Number(cfg.minStock ?? LABEL_DISPLAY_DEFAULT_MIN_STOCK);
      minStock = Number.isInteger(parsedMinStock) && parsedMinStock >= 0 ? parsedMinStock : LABEL_DISPLAY_DEFAULT_MIN_STOCK;
      scope = 'all';
      break;
    }
    case BadgeRuleType.MANUAL: {
      scope = 'product';
      const targets = Array.isArray(cfg.targets) ? (cfg.targets as Array<Record<string, string>>) : [];
      targets.forEach((t) => {
        const productVariantId = t.productVariantId ?? '';
        if (!productVariantId) return;
        products.push({
          productVariantId,
          productId: t.productId ?? '',
          skuCode: t.skuCode ?? '',
          name: t.productVariantName ?? t.skuCode ?? '',
          imageUrl: t.productVariantImageUrl ?? '',
        });
      });
      break;
    }
    default:
      scope = 'all';
  }

  return { scope, badgeType, minStock, categories, collections, promotions, products };
};
