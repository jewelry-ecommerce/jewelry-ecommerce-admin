import {
  type BenefitApplicationScope,
  type BenefitRuleType,
  type ComponentKind,
  type ConditionRuleType,
  type CustomerAudienceType,
  type DiscountAllocationMethod,
  type DiscountAllocationTarget,
  type DiscountBase,
  type MarkdownDiscountKind,
  type PromotionDraftSchemaType,
  type PromotionDraftStatus,
  type PromotionCostSource,
  type PromotionSchemaDisplayStatus,
  type PromotionSchemaStatus,
  type PromotionSchemaType,
  type PromotionScope,
  type PromotionStatus,
  type RoundingMode,
  type SelectionSourceType,
  type StackingPolicy,
  type VoucherDiscountKind,
  type VoucherDiscountTarget,
  type AmountComparisonOperator,
} from './promotion.enum';

export interface PromotionDraftSchema {
  id: string;
  tenantCode: string;
  promotionDraftId: string;
  sortOrder: number;
  name: string;
  description?: string | null;
  scope: PromotionScope;
  schemaType: PromotionDraftSchemaType;
  costSources: PromotionCostSource[];
  priority: number;
  status: PromotionSchemaStatus;
  displayStatus?: PromotionSchemaDisplayStatus;
  effectiveStartsAt?: string | null;
  effectiveEndsAt?: string | null;
  schemaStartsAt?: string | null;
  schemaEndsAt?: string | null;
  unpublishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const RUNTIME_EVALUATE_REASON_CODE = {
  CANDIDATE_INDEX_MATCHED: 'CANDIDATE_INDEX_MATCHED',
  CANDIDATE_DEDUPED: 'CANDIDATE_DEDUPED',
  NO_INDEX_MATCH: 'NO_INDEX_MATCH',
  AUDIENCE_ALL_PASSED: 'AUDIENCE_ALL_PASSED',
  AUDIENCE_CUSTOMER_SEGMENT_PASSED: 'AUDIENCE_CUSTOMER_SEGMENT_PASSED',
  AUDIENCE_CUSTOMER_SEGMENT_NO_MATCH: 'AUDIENCE_CUSTOMER_SEGMENT_NO_MATCH',
  AUDIENCE_CUSTOMER_SEGMENT_MISSING_DATA: 'AUDIENCE_CUSTOMER_SEGMENT_MISSING_DATA',
  AUDIENCE_MANUAL_CUSTOMER_PASSED: 'AUDIENCE_MANUAL_CUSTOMER_PASSED',
  AUDIENCE_MANUAL_CUSTOMER_NO_MATCH: 'AUDIENCE_MANUAL_CUSTOMER_NO_MATCH',
  AUDIENCE_MANUAL_CUSTOMER_MISSING_CUSTOMER_ID: 'AUDIENCE_MANUAL_CUSTOMER_MISSING_CUSTOMER_ID',
  AUDIENCE_UPLOAD_FILE_UNSUPPORTED: 'AUDIENCE_UPLOAD_FILE_UNSUPPORTED',
  AUDIENCE_UNSUPPORTED_TYPE: 'AUDIENCE_UNSUPPORTED_TYPE',
  TARGET_ALL_MATCHED: 'TARGET_ALL_MATCHED',
  TARGET_MANUAL_MATCHED: 'TARGET_MANUAL_MATCHED',
  TARGET_MANUAL_NO_MATCH: 'TARGET_MANUAL_NO_MATCH',
  TARGET_CATEGORY_MATCHED: 'TARGET_CATEGORY_MATCHED',
  TARGET_CATEGORY_NO_MATCH: 'TARGET_CATEGORY_NO_MATCH',
  TARGET_COLLECTION_MATCHED: 'TARGET_COLLECTION_MATCHED',
  TARGET_COLLECTION_NO_MATCH: 'TARGET_COLLECTION_NO_MATCH',
  TARGET_UPLOAD_FILE_UNSUPPORTED: 'TARGET_UPLOAD_FILE_UNSUPPORTED',
  TARGET_UNSUPPORTED_TYPE: 'TARGET_UNSUPPORTED_TYPE',
  TARGET_LINE_FILTERED_EXISTING_PROMOTION: 'TARGET_LINE_FILTERED_EXISTING_PROMOTION',
  CONDITION_ALWAYS_PASSED: 'CONDITION_ALWAYS_PASSED',
  CONDITION_UNSUPPORTED_TYPE: 'CONDITION_UNSUPPORTED_TYPE',
  BENEFIT_MARKDOWN_APPLIED: 'BENEFIT_MARKDOWN_APPLIED',
  BENEFIT_MARKDOWN_UNSUPPORTED_SCOPE: 'BENEFIT_MARKDOWN_UNSUPPORTED_SCOPE',
  BENEFIT_MARKDOWN_UNSUPPORTED_DISCOUNT_KIND: 'BENEFIT_MARKDOWN_UNSUPPORTED_DISCOUNT_KIND',
  BENEFIT_FLAT_PRICE_APPLIED: 'BENEFIT_FLAT_PRICE_APPLIED',
  BENEFIT_FLAT_PRICE_UNSUPPORTED_SCOPE: 'BENEFIT_FLAT_PRICE_UNSUPPORTED_SCOPE',
  BENEFIT_UNSUPPORTED_TYPE: 'BENEFIT_UNSUPPORTED_TYPE',
  BENEFIT_NO_DISCOUNT_PRODUCED: 'BENEFIT_NO_DISCOUNT_PRODUCED',
  SNAPSHOT_NOT_FOUND: 'SNAPSHOT_NOT_FOUND',
  LINE_ADJUSTMENT_SELECTED: 'LINE_ADJUSTMENT_SELECTED',
  LINE_ADJUSTMENT_REJECTED_BY_COMPATIBILITY: 'LINE_ADJUSTMENT_REJECTED_BY_COMPATIBILITY',
  UNKNOWN: 'UNKNOWN',
} as const;

export type RuntimeEvaluateReasonCode = (typeof RUNTIME_EVALUATE_REASON_CODE)[keyof typeof RUNTIME_EVALUATE_REASON_CODE];

export interface PromotionDraft {
  id: string;
  tenantCode: string;
  status: PromotionDraftStatus;
  name: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionSchema {
  id: string;
  promotionId: string;
  schemaType: PromotionSchemaType;
  name: string;
  isStackable: boolean;
  stackingPolicy: StackingPolicy;
  benefitJson?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionSkuTarget {
  id: string;
  promotionId: string;
  skuId?: string | null;
  skuCode: string;
  variationId: string;
  productId?: string | null;
  snapshotName?: string | null;
  snapshotImage?: string | null;
  snapshotPrice?: number | null;
  snapshotBrand?: string | null;
  snapshotCategory?: string | null;
  sellableStatusAtCapture?: string | null;
  capturedAt: string;
}

export interface PromotionSelectionSnapshot {
  id: string;
  promotionId: string;
  sourceType: SelectionSourceType;
  sourcePayload?: Record<string, unknown>;
  expandedSkuCount: number;
  capturedAt: string;
}

export interface Promotion {
  id: string;
  tenantCode: string;
  name: string;
  status: PromotionStatus;
  version: number;
  startAt: string;
  endAt: string;
  appliedChannels?: string[];
  customerAudienceType?: CustomerAudienceType;
  disabledAt?: string | null;
  createdById?: string;
  createdByType?: string;
  updatedById?: string;
  updatedByType?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  schemas?: PromotionSchema[];
  skuTargets?: PromotionSkuTarget[];
  selectionSnapshots?: PromotionSelectionSnapshot[];
}

export interface MoneyAmountDto {
  amountMinor: string;
}

export interface TargetSubtotalConditionConfigV1 {
  type: typeof ConditionRuleType.TARGET_SUBTOTAL;
  version: '1.0.0';
  operator: AmountComparisonOperator;
  amountMinor: string;
  subtotalBase: DiscountBase;
}

export interface AlwaysConditionConfigV1 {
  type: typeof ConditionRuleType.ALWAYS;
  version: '1.0.0';
}

export type ConditionConfigV1 = TargetSubtotalConditionConfigV1 | AlwaysConditionConfigV1;

export interface MarkdownBenefitConfigV1 {
  type: typeof BenefitRuleType.MARKDOWN;
  version: '1.0.0';
  discountKind: MarkdownDiscountKind;
  discountValue: number;
  discountBase: DiscountBase;
  applicationScope: BenefitApplicationScope;
  allocationTarget: DiscountAllocationTarget;
  allocationMethod: DiscountAllocationMethod;
  roundingMode: RoundingMode;
  maxDiscountAmount?: MoneyAmountDto | null;
}

export interface FlatPriceBenefitConfigV1 {
  type: typeof BenefitRuleType.FLAT_PRICE;
  version: '1.0.0';
  fixedPriceAmountMinor: number;
  applicationScope: BenefitApplicationScope;
  quotaPolicy?: FlatPriceQuantityQuotaPolicyConfigV1 | null;
}

export type FlatPriceQuantityQuotaPolicyType = 'FLAT_PRICE_QUANTITY_QUOTA';
export type FlatPriceQuantityQuotaPolicyScope = 'PROMOTION';
export type FlatPriceQuantityQuotaIdentityScope = 'CUSTOMER';
export type FlatPriceQuantityQuotaOverflowPolicy = 'ORIGINAL_PRICE';

export interface FlatPriceQuantityQuotaPolicyConfigV1 {
  type: FlatPriceQuantityQuotaPolicyType;
  version: '1.0.0';
  policyScope: FlatPriceQuantityQuotaPolicyScope;
  identityScope: FlatPriceQuantityQuotaIdentityScope;
  overflowPolicy: FlatPriceQuantityQuotaOverflowPolicy;
  perLineLimit: number | null;
  perCustomerLimit: number | null;
}

export interface VoucherBenefitConfigV1 {
  type: typeof BenefitRuleType.VOUCHER;
  version: '1.0.0';
  discountTarget: VoucherDiscountTarget;
  discountKind: VoucherDiscountKind;
  discountValue: number;
  discountBase: DiscountBase;
  applicationScope: BenefitApplicationScope.CART | BenefitApplicationScope.SHIPPING;
  allocationTarget: DiscountAllocationTarget;
  allocationMethod: DiscountAllocationMethod;
  roundingMode: RoundingMode;
  maxDiscountAmount?: MoneyAmountDto | null;
}

export type BenefitConfigV1 = MarkdownBenefitConfigV1 | FlatPriceBenefitConfigV1 | VoucherBenefitConfigV1;

export interface PromotionDraftSchemaComponentBaseDto<TConfig extends ConditionConfigV1 | BenefitConfigV1, TKind extends ComponentKind.CONDITION | ComponentKind.BENEFIT> {
  id: string;
  tenantCode: string;
  promotionDraftSchemaId: string;
  componentKind: TKind;
  sortOrder: number;
  config: TConfig;
  authoringValues?: Record<string, unknown>;
}

export type PromotionDraftConditionComponentDto = PromotionDraftSchemaComponentBaseDto<ConditionConfigV1, ComponentKind.CONDITION>;
export type PromotionDraftBenefitComponentDto = PromotionDraftSchemaComponentBaseDto<BenefitConfigV1, ComponentKind.BENEFIT>;
export type PromotionDraftSchemaComponentDto = PromotionDraftConditionComponentDto | PromotionDraftBenefitComponentDto;

export interface PromotionDraftSchemaComponentsResponseDto {
  condition: PromotionDraftConditionComponentDto | null;
  benefit: PromotionDraftBenefitComponentDto | null;
  items: PromotionDraftSchemaComponentDto[];
}

// --- Dynamic authoring metadata types ---

export type PromotionAuthoringSchemaDefinition =
  | {
      type: 'object';
      title?: string;
      description?: string;
      default?: unknown;
      properties?: Record<string, PromotionAuthoringSchemaDefinition>;
      required?: string[];
      readOnly?: boolean;
      allOf?: unknown[];
    }
  | {
      type: 'string';
      title?: string;
      description?: string;
      default?: unknown;
      format?: 'date-time' | 'uri';
      enum?: string[];
      enumNames?: string[];
      pattern?: string;
      minLength?: number;
      maxLength?: number;
      readOnly?: boolean;
    }
  | {
      type: 'number';
      title?: string;
      description?: string;
      default?: unknown;
      format?: 'currency' | 'percent' | 'integer';
      enum?: number[];
      enumNames?: string[];
      minimum?: number;
      maximum?: number;
      readOnly?: boolean;
    }
  | {
      type: 'boolean';
      title?: string;
      description?: string;
      default?: unknown;
      readOnly?: boolean;
    }
  | {
      type: 'array';
      title?: string;
      description?: string;
      default?: unknown;
      items?: PromotionAuthoringSchemaDefinition;
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      readOnly?: boolean;
    };

export type PromotionAuthoringUiSchema = Record<string, unknown>;

/**
 * Catalog entry for condition/benefit authoring.
 * V2 (`contractV2=true`) returns `authoringContractVersion` + `editorType: SINGLE_OBJECT`
 * and intentionally omits selected `values` / `defaultValues` as persisted state.
 */
export interface PromotionSchemaComponentAuthoringOption {
  authoringContractVersion?: '2.0.0';
  editorType?: 'SINGLE_OBJECT';
  componentKind?: 'CONDITION' | 'BENEFIT';
  configType: string;
  configVersion: string;
  title?: string;
  description?: string;
  configSchema: PromotionAuthoringSchemaDefinition;
  /** Legacy-only; V2 SINGLE_OBJECT catalog must not supply selected values. */
  defaultValues?: Record<string, unknown>;
  supportsImplicitAlways?: boolean;
}

export type AuthoringComponentKind = 'CONDITION' | 'BENEFIT';

export interface SchemaComponentAuthoringUpsertDto {
  configType: string;
  configVersion: string;
  values: Record<string, unknown>;
}
