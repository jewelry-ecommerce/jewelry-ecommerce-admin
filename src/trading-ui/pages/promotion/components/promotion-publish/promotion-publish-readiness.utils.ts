import {
  ComponentKind,
  PromotionDraftSchemaType,
  PromotionDraftStatus,
  PromotionSchemaStatus,
  VoucherCodeStatus,
  type DraftVoucherCodeResponseDto,
  type PromotionDraft,
  type PromotionDraftComponentsResponseDto,
  type PromotionDraftSchema,
  type PromotionDraftSchemaComponentsResponseDto,
} from '../../../../apis';
import { isVoucherVisibilityDistributionPolicyReady } from '../promotion-voucher-code-card/voucher-code-authoring.utils';

export type PromotionPublishReadinessItemKey = 'target' | 'audience' | 'enabledSchema' | 'schemaComponents' | 'voucherCodes';

export interface PromotionPublishReadinessItem {
  key: PromotionPublishReadinessItemKey;
  label: string;
  complete: boolean;
  reason: string;
}

export interface PromotionPublishReadiness {
  canPublish: boolean;
  statusAllowsPublish: boolean;
  enabledSchemaCount: number;
  incompleteEnabledSchemaNames: string[];
  incompleteEnabledVoucherSchemaNames: string[];
  items: PromotionPublishReadinessItem[];
  reasons: string[];
}

interface PromotionPublishReadinessInput {
  promotion: PromotionDraft;
  components: PromotionDraftComponentsResponseDto | null;
  schemas: readonly PromotionDraftSchema[];
  schemaComponentsBySchemaId: Readonly<Record<string, PromotionDraftSchemaComponentsResponseDto>>;
  voucherCodesBySchemaId: Readonly<Record<string, DraftVoucherCodeResponseDto | null>>;
}

const PUBLISHABLE_DRAFT_STATUSES: readonly PromotionDraftStatus[] = [PromotionDraftStatus.EDITING, PromotionDraftStatus.READY_TO_PUBLISH];

export const isPromotionDraftPublishableStatus = (status: PromotionDraftStatus): boolean => PUBLISHABLE_DRAFT_STATUSES.includes(status);

const countRootComponents = (components: PromotionDraftComponentsResponseDto | null, kind: ComponentKind.TARGET | ComponentKind.AUDIENCE): number => {
  if (components?.items) return components.items.filter((component) => component.componentKind === kind).length;
  if (kind === ComponentKind.TARGET) return components?.target ? 1 : 0;
  return components?.audience ? 1 : 0;
};

const countSchemaComponents = (schemaComponents: PromotionDraftSchemaComponentsResponseDto | undefined, kind: ComponentKind.CONDITION | ComponentKind.BENEFIT): number => {
  if (!schemaComponents) return 0;
  if (schemaComponents.items.length > 0) return schemaComponents.items.filter((component) => component.componentKind === kind).length;
  if (kind === ComponentKind.CONDITION) return schemaComponents.condition ? 1 : 0;
  return schemaComponents.benefit ? 1 : 0;
};

const formatRuleNames = (ruleNames: readonly string[]): string => {
  const visibleNames = ruleNames.slice(0, 3).join(', ');
  const remainingCount = ruleNames.length - 3;
  return remainingCount > 0 ? `${visibleNames} và ${remainingCount} hình thức khuyến mãi khác` : visibleNames;
};

const schemaRequiresCondition = (schemaType: PromotionDraftSchemaType): boolean => ![PromotionDraftSchemaType.MARKDOWN, PromotionDraftSchemaType.FLAT_PRICE].includes(schemaType);

const getIncompleteEnabledSchemaNames = (enabledSchemas: readonly PromotionDraftSchema[], schemaComponentsBySchemaId: Readonly<Record<string, PromotionDraftSchemaComponentsResponseDto>>): string[] =>
  enabledSchemas
    .filter((schema) => {
      const schemaComponents = schemaComponentsBySchemaId[schema.id];
      const conditionCount = countSchemaComponents(schemaComponents, ComponentKind.CONDITION);
      const benefitCount = countSchemaComponents(schemaComponents, ComponentKind.BENEFIT);
      return benefitCount !== 1 || (schemaRequiresCondition(schema.schemaType) && conditionCount !== 1);
    })
    .map((schema) => schema.name);

const isVoucherCodeReadyForPublish = (voucherCode: DraftVoucherCodeResponseDto | null | undefined): boolean => {
  if (!voucherCode || voucherCode.status !== VoucherCodeStatus.ACTIVE) return false;
  return isVoucherVisibilityDistributionPolicyReady(voucherCode.visibilityDistributionPolicy);
};

const getIncompleteEnabledVoucherSchemaNames = (enabledSchemas: readonly PromotionDraftSchema[], voucherCodesBySchemaId: Readonly<Record<string, DraftVoucherCodeResponseDto | null>>): string[] =>
  enabledSchemas
    .filter((schema) => schema.schemaType === PromotionDraftSchemaType.VOUCHER)
    .filter((schema) => !isVoucherCodeReadyForPublish(voucherCodesBySchemaId[schema.id]))
    .map((schema) => schema.name);

const buildReadinessReasons = (statusAllowsPublish: boolean, items: readonly PromotionPublishReadinessItem[]): string[] => {
  const itemReasons = items.filter((item) => !item.complete).map((item) => item.reason);
  if (statusAllowsPublish) return itemReasons;
  return ['Trạng thái nháp hiện tại không cho phép phát hành.', ...itemReasons];
};

export const getPromotionPublishReadiness = ({ promotion, components, schemas, schemaComponentsBySchemaId, voucherCodesBySchemaId }: PromotionPublishReadinessInput): PromotionPublishReadiness => {
  const targetCount = countRootComponents(components, ComponentKind.TARGET);
  const audienceCount = countRootComponents(components, ComponentKind.AUDIENCE);
  const enabledSchemas = schemas.filter((schema) => schema.status === PromotionSchemaStatus.ENABLED);
  const enabledVoucherSchemas = enabledSchemas.filter((schema) => schema.schemaType === PromotionDraftSchemaType.VOUCHER);
  const incompleteNames = getIncompleteEnabledSchemaNames(enabledSchemas, schemaComponentsBySchemaId);
  const incompleteVoucherNames = getIncompleteEnabledVoucherSchemaNames(enabledSchemas, voucherCodesBySchemaId);
  const statusAllowsPublish = isPromotionDraftPublishableStatus(promotion.status);

  const items: PromotionPublishReadinessItem[] = [
    {
      key: 'target',
      label: 'Đã cấu hình sản phẩm áp dụng',
      complete: targetCount === 1,
      reason: 'Cần cấu hình đúng một nhóm sản phẩm áp dụng.',
    },
    {
      key: 'audience',
      label: 'Đã cấu hình đối tượng khách hàng',
      complete: audienceCount === 1,
      reason: 'Cần cấu hình đúng một nhóm đối tượng khách hàng.',
    },
    {
      key: 'enabledSchema',
      label: 'Có ít nhất một hình thức khuyến mãi đang bật',
      complete: enabledSchemas.length > 0,
      reason: 'Cần bật ít nhất một hình thức khuyến mãi.',
    },
    {
      key: 'schemaComponents',
      label: 'Mỗi hình thức khuyến mãi đang bật có đủ điều kiện và quyền lợi',
      complete: enabledSchemas.length > 0 && incompleteNames.length === 0,
      reason:
        enabledSchemas.length === 0 ? 'Cần bật hình thức khuyến mãi trước khi kiểm tra điều kiện và quyền lợi.' : `Cần cấu hình đủ điều kiện và quyền lợi cho: ${formatRuleNames(incompleteNames)}.`,
    },
    {
      key: 'voucherCodes',
      label: 'Mỗi hình thức khuyến mãi dạng mã giảm giá đang bật có mã voucher hoạt động',
      complete: enabledVoucherSchemas.length === 0 || incompleteVoucherNames.length === 0,
      reason:
        incompleteVoucherNames.length > 0 ? `Voucher thiếu chính sách hiển thị/phân phối cho: ${formatRuleNames(incompleteVoucherNames)}.` : 'Cần mã voucher active kèm chính sách hiển thị/phân phối.',
    },
  ];

  const reasons = buildReadinessReasons(statusAllowsPublish, items);
  const canPublish = promotion.status === PromotionDraftStatus.READY_TO_PUBLISH;
  return {
    canPublish,
    statusAllowsPublish,
    enabledSchemaCount: enabledSchemas.length,
    incompleteEnabledSchemaNames: incompleteNames,
    incompleteEnabledVoucherSchemaNames: incompleteVoucherNames,
    items,
    reasons,
  };
};
