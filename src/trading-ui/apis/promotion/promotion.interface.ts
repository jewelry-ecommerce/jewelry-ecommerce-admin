/**
 * Promotion API request/response DTOs.
 * Style: interface for DTO shapes, type for unions/aliases; no `readonly` fields
 * (align with product/pre-order modules). Enum values live in promotion.enum.ts
 * and are re-exported here for convenient `apis` imports.
 */
import type { ResList } from '../../common/constant/api.interface';
import type { PromotionDraft, PromotionDraftSchema, RuntimeEvaluateReasonCode } from './promotion.entities';
import {
  AudienceConfigType,
  ComponentKind,
  ConditionRuleType,
  BenefitRuleType,
  AmountComparisonOperator,
  MarkdownDiscountKind,
  DiscountBase,
  BenefitApplicationScope,
  DiscountAllocationTarget,
  DiscountAllocationMethod,
  RoundingMode,
  type PromotionCampaignTimeFilter,
  PromotionDraftSchemaType,
  PromotionDraftStatus,
  PromotionCostSource,
  PromotionSchemaStatus,
  PromotionSchemaType,
  PublishedPromotionStatus,
  PromotionScope,
  SelectionSourceType,
  TargetConfigType,
  TargetDiscountStateFilter,
  PromotionIndexKeyType,
  ConditionAuthoringMode,
  VoucherCodeStatus,
  VoucherDiscountKind,
  VoucherDiscountTarget,
  PromotionSimulationSourceType,
  PromotionSimulationConflictOutcome,
  PromotionSalesChannel,
  StoreSelectionMode,
} from './promotion.enum';

export {
  AudienceConfigType,
  ComponentKind,
  ConditionRuleType,
  BenefitRuleType,
  AmountComparisonOperator,
  MarkdownDiscountKind,
  DiscountBase,
  BenefitApplicationScope,
  DiscountAllocationTarget,
  DiscountAllocationMethod,
  RoundingMode,
  PromotionDraftSchemaType,
  PromotionDraftStatus,
  PromotionCostSource,
  PromotionSchemaStatus,
  PromotionSchemaType,
  PublishedPromotionStatus,
  PromotionScope,
  SelectionSourceType,
  TargetConfigType,
  TargetDiscountStateFilter,
  PromotionIndexKeyType,
  ConditionAuthoringMode,
  VoucherCodeStatus,
  VoucherDiscountKind,
  VoucherDiscountTarget,
  PromotionSimulationSourceType,
  PromotionSimulationConflictOutcome,
  PromotionSalesChannel,
  StoreSelectionMode,
};

export interface QueryPromotionDto {
  page?: number;
  take?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface CreatePromotionDraftDto {
  name: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
}

export type UpdatePromotionDraftDto = Partial<CreatePromotionDraftDto>;

export interface PromotionDraftListMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type PromotionDraftStatusCounts = Record<PromotionDraftStatus, number>;

export interface PromotionDraftListResponseDto {
  items: PromotionDraft[];
  meta: PromotionDraftListMetaDto;
  statusCounts: PromotionDraftStatusCounts;
}

export interface ResListPromotionDraft extends ResList<PromotionDraft> {
  statusCounts: PromotionDraftStatusCounts;
}

export interface PublishedPromotionDto {
  id: string;
  tenantCode: string;
  name: string;
  description?: string | null;
  status: PublishedPromotionStatus;
  startsAt: string;
  endsAt: string;
  publishedAt: string;
}

export enum CampaignAvailableAction {
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  PUBLISH = 'PUBLISH',
  VIEW = 'VIEW',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  END = 'END',
}

export interface CampaignSchemaSummaryResponseDto {
  name: string;
  schemaType: PromotionDraftSchemaType;
  benefitSummary: string;
}

export interface CampaignOverviewItemResponseDto {
  id: string;
  source: 'DRAFT' | 'PUBLISHED';
  name: string;
  description?: string | null;
  draftStatus?: PromotionDraftStatus;
  promotionStatus?: PublishedPromotionStatus;
  startsAt: string;
  endsAt: string;
  createdAt?: string;
  availableActions: CampaignAvailableAction[];
  schemas: CampaignSchemaSummaryResponseDto[];
  salesChannels: PromotionSalesChannel[];
}

export interface CampaignOverviewMetaDto {
  total: number;
  page: number;
  limit: number;
  draftCount: number;
  publishedCount: number;
  sourceCounts?: Record<'DRAFT' | 'PUBLISHED', number>;
  statusCounts?: {
    draft: Record<PromotionDraftStatus, number>;
    published: Record<PublishedPromotionStatus, number>;
  };
}

export interface GetCampaignOverviewResponseDto {
  items: CampaignOverviewItemResponseDto[];
  meta: CampaignOverviewMetaDto;
}

export interface GetCampaignOverviewQueryDto {
  page?: number;
  limit?: number;
  includeArchived?: boolean;
  search?: string;
  source?: 'DRAFT' | 'PUBLISHED';
  draftStatus?: PromotionDraftStatus;
  promotionStatus?: PublishedPromotionStatus;
  schemaType?: PromotionDraftSchemaType;
  timeFilter?: PromotionCampaignTimeFilter;
  timeFrom?: string;
  timeTo?: string;
}

export interface PromotionLifecycleResponseDto {
  id: string;
  status: PublishedPromotionStatus;
  updatedAt: string;
}

export interface PromotionDetailDto {
  id: string;
  tenantCode: string;
  name: string;
  description?: string | null;
  status: PublishedPromotionStatus;
  startsAt: string;
  endsAt: string;
  publishedAt: string;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /promotions/{id}/quota-statistics — one row per schema that has usage quota. */
export interface PromotionQuotaStatisticDto {
  schemaId: string;
  schemaName: string;
  schemaType: PromotionSchemaType;
  quotaPolicyId: string;
  total: number;
  committed: number;
  held: number;
  available: number;
}

export interface PromotionQuotaStatisticsDto {
  promotionId: string;
  quotaStatistics: PromotionQuotaStatisticDto[];
}

export interface PromotionDraftPublishComponentCountsDto {
  components: number;
  schemas: number;
  schemaComponents: number;
}

export interface PublishPromotionDraftResponseDto {
  publishedPromotion: PublishedPromotionDto;
  snapshotId: string;
  snapshotPayloadHash: string;
  componentCounts: PromotionDraftPublishComponentCountsDto;
}

export interface TargetLineFilterConfigV1 {
  discountState: TargetDiscountStateFilter;
}

/** Optional SKU exclusions shared by every target selection mode (BE: `excludedSkuIds`). */
export type PromotionTargetExcludedSkuConfig = {
  excludedSkuIds?: string[];
};

export type PromotionTargetConfigV1 =
  | (PromotionTargetExcludedSkuConfig & {
      type: TargetConfigType.ALL;
      version: '1.0.0';
      lineFilter?: TargetLineFilterConfigV1;
    })
  | (PromotionTargetExcludedSkuConfig & {
      type: TargetConfigType.CATEGORY;
      version: '1.0.0';
      categoryIds: string[];
      lineFilter?: TargetLineFilterConfigV1;
    })
  | (PromotionTargetExcludedSkuConfig & {
      type: TargetConfigType.COLLECTION;
      version: '1.0.0';
      collectionIds: string[];
      lineFilter?: TargetLineFilterConfigV1;
    })
  | (PromotionTargetExcludedSkuConfig & {
      type: TargetConfigType.UPLOAD_FILE;
      version: '1.0.0';
      uploadBatchId: string;
      skuIds?: string[];
      lineFilter?: TargetLineFilterConfigV1;
    })
  | (PromotionTargetExcludedSkuConfig & {
      type: TargetConfigType.MANUAL;
      version: '1.0.0';
      skuIds: string[];
      lineFilter?: TargetLineFilterConfigV1;
    });

export type PromotionAudienceConfigV1 =
  | {
      type: AudienceConfigType.ALL;
      version: '1.0.0';
    }
  | {
      type: AudienceConfigType.CUSTOMER_SEGMENT;
      version: '1.0.0';
      segmentIds: string[];
    }
  | {
      type: AudienceConfigType.MANUAL_CUSTOMER;
      version: '1.0.0';
      customerIds: string[];
    }
  | {
      type: AudienceConfigType.UPLOAD_FILE;
      version: '1.0.0';
      uploadBatchId: string;
      customerIds?: string[];
    };

export interface PromotionDraftComponentDto<
  TConfig = PromotionTargetConfigV1 | PromotionAudienceConfigV1 | PromotionApplicabilityConfigV1,
  TKind extends ComponentKind.TARGET | ComponentKind.AUDIENCE | ComponentKind.APPLICABILITY = ComponentKind.TARGET | ComponentKind.AUDIENCE | ComponentKind.APPLICABILITY,
> {
  id: string;
  tenantCode: string;
  promotionDraftId: string;
  componentKind: TKind;
  sortOrder: number;
  config: TConfig;
  /** Display-only sibling for MANUAL_CUSTOMER — enriched by promotion-service. */
  customers?: PromotionCustomerAudienceItemDto[];
  /** Display-only sibling for TARGET selected skuIds — enriched by promotion-service via PIM bulk. */
  skus?: PromotionTargetSkuItemDto[];
  /** Display-only sibling for TARGET excludedSkuIds — enriched by promotion-service via PIM bulk. */
  excludedSkus?: PromotionTargetSkuItemDto[];
}

export type PromotionDraftTargetComponentDto = PromotionDraftComponentDto<PromotionTargetConfigV1, ComponentKind.TARGET>;
export type PromotionDraftAudienceComponentDto = PromotionDraftComponentDto<PromotionAudienceConfigV1, ComponentKind.AUDIENCE>;

export interface PromotionDraftComponentsResponseDto {
  target?: PromotionDraftTargetComponentDto | null;
  audience?: PromotionDraftAudienceComponentDto | null;
  /**
   * Null for a promotion authored before applicability existed. Do NOT read that
   * as "no restriction" - fall back to applicabilityDefault.
   */
  applicability?: PromotionDraftApplicabilityComponentDto | null;
  applicabilityDefault?: PromotionApplicabilityConfigV1;
  items?: Array<PromotionDraftTargetComponentDto | PromotionDraftAudienceComponentDto | PromotionDraftApplicabilityComponentDto>;
}

export const PROMOTION_APPLICABILITY_CONFIG_TYPE = 'CHANNEL_STORE_APPLICABILITY';

export interface PromotionStoreApplicabilityAllV1 {
  type: StoreSelectionMode.ALL;
  version: '1.0.0';
  excludedStoreCodes?: string[];
}

export interface PromotionStoreApplicabilityManualV1 {
  type: StoreSelectionMode.MANUAL;
  version: '1.0.0';
  storeCodes: string[];
}

export interface PromotionStoreApplicabilityGroupV1 {
  type: StoreSelectionMode.GROUP;
  version: '1.0.0';
  storeGroupCodes: string[];
  excludedStoreCodes?: string[];
}

export type PromotionStoreApplicabilityV1 = PromotionStoreApplicabilityAllV1 | PromotionStoreApplicabilityManualV1 | PromotionStoreApplicabilityGroupV1;

/** Where the promotion may be sold: sales channel plus store scope. */
export interface PromotionApplicabilityConfigV1 {
  type: typeof PROMOTION_APPLICABILITY_CONFIG_TYPE;
  version: '1.0.0';
  channels: PromotionSalesChannel[];
  stores: PromotionStoreApplicabilityV1;
}

export interface UpsertPromotionDraftApplicabilityDto {
  config: PromotionApplicabilityConfigV1;
}

export type PromotionDraftApplicabilityComponentDto = PromotionDraftComponentDto<PromotionApplicabilityConfigV1>;

export interface UpsertPromotionDraftTargetDto {
  config: PromotionTargetConfigV1;
}

export interface UpsertPromotionDraftAudienceDto {
  config: PromotionAudienceConfigV1;
}

export interface PromotionSchemaInputDto {
  schemaType?: PromotionSchemaType;
  name: string;
  isStackable?: boolean;
  benefitJson?: {
    discountPercent?: number;
    discountAmount?: number;
    flatPrice?: number;
    [key: string]: unknown;
  };
}

export interface CreatePromotionDto {
  name: string;
  startAt: string;
  endAt: string;
  appliedChannels?: string[];
  schemas?: PromotionSchemaInputDto[];
}
export type UpdatePromotionDto = Partial<CreatePromotionDto>;

export interface PromotionSkuTargetInputDto {
  skuId?: string;
  skuCode: string;
  variationId: string;
  productId?: string;
  snapshotName?: string;
  snapshotImage?: string;
  snapshotPrice?: number;
  snapshotBrand?: string;
  snapshotCategory?: string;
  sellableStatusAtCapture?: string;
}

export interface PreviewPromotionSkuTargetsDto {
  sourceType: SelectionSourceType;
  sourcePayload?: Record<string, unknown>;
  categoryIds?: string[];
  collectionIds?: string[];
  brandIds?: string[];
  brandCodes?: string[];
  variationIds?: string[];
  skuCodes?: string[];
  page?: number;
  take?: number;
}

export interface CommitPromotionSkuSnapshotDto extends PreviewPromotionSkuTargetsDto {
  skuTargets: PromotionSkuTargetInputDto[];
}

export interface PromotionSkuTargetPreviewResult {
  total: number;
  page: number;
  take: number;
  list: PromotionSkuTargetInputDto[];
  warnings: string[];
}

export interface PromotionChannelOption {
  code: string;
  name: string;
}

export interface PromotionStackingCandidateDto {
  promotionId: string;
  promotionName: string;
  schemaId: string;
  schemaName: string;
  schemaType: string;
  allowed: boolean;
  reason: string;
}

export interface PromotionDraftSchemasResponseDto {
  items: PromotionDraftSchema[];
}

export interface CreatePromotionDraftSchemaDto {
  name: string;
  description?: string | null;
  schemaType: PromotionDraftSchemaType;
  scope?: PromotionScope;
  costSources: PromotionCostSource[];
  status?: PromotionSchemaStatus;
  conditionMode?: ConditionAuthoringMode;
  schemaStartsAt?: string | null;
  schemaEndsAt?: string | null;
}

export interface UpdatePromotionDraftSchemaDto {
  name?: string;
  description?: string | null;
  costSources?: PromotionCostSource[];
  status?: PromotionSchemaStatus;
  conditionMode?: ConditionAuthoringMode;
  schemaStartsAt?: string | null;
  schemaEndsAt?: string | null;
}

// --- Voucher code DTOs ---

export type VoucherVisibilityType = 'PUBLIC' | 'PRIVATE';

export type VoucherDistributionChannel = 'ZNS' | 'EMAIL' | 'OTHER';

export interface VoucherVisibilityDistributionPolicyDto {
  type: 'VOUCHER_VISIBILITY_DISTRIBUTION_POLICY';
  version: '1.0.0';
  visibilityType: VoucherVisibilityType;
  distributionChannels: VoucherDistributionChannel[];
}

export interface UpsertDraftVoucherCodeDto {
  code: string;
  status?: VoucherCodeStatus;
  imageUrl?: string | null;
  issuanceStartsAt?: string | null;
  issuanceEndsAt?: string | null;
  usageStartsAt?: string | null;
  usageEndsAt?: string | null;
  visibilityDistributionPolicy?: VoucherVisibilityDistributionPolicyDto | null;
}

export interface DraftVoucherCodeResponseDto {
  id: string;
  tenantCode: string;
  promotionDraftSchemaId: string;
  code: string;
  normalizedCode: string;
  codeMask?: string | null;
  status: VoucherCodeStatus;
  imageUrl?: string | null;
  issuanceStartsAt?: string;
  issuanceEndsAt?: string;
  usageStartsAt?: string;
  usageEndsAt?: string;
  visibilityDistributionPolicy?: VoucherVisibilityDistributionPolicyDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface DraftVoucherCodeListResponseDto {
  items: DraftVoucherCodeResponseDto[];
}

export interface VoucherCodeAuthoringItemDto {
  id: string;
  requiresSave?: boolean;
  values: {
    code: string;
    status: VoucherCodeStatus;
    visibilityDistributionPolicy: VoucherVisibilityDistributionPolicyDto;
  };
}

export interface VoucherCodeAuthoringCapabilitiesDto {
  maxItems: number;
  canAdd: boolean;
  canEdit: boolean;
}

export interface VoucherCodeAuthoringCollectionDto {
  configType: string;
  configVersion: string;
  collectionSchema?: Record<string, unknown>;
  collectionUiSchema?: Record<string, unknown>;
  collectionValues?: {
    imageUrl?: string;
  };
  itemSchema?: Record<string, unknown>;
  uiSchema?: Record<string, unknown>;
  defaultValues?: {
    code: string;
    status: VoucherCodeStatus;
    visibilityDistributionPolicy: VoucherVisibilityDistributionPolicyDto;
  };
  items: VoucherCodeAuthoringItemDto[];
  capabilities: VoucherCodeAuthoringCapabilitiesDto;
}

export interface ReorderPromotionDraftSchemasDto {
  schemaIds: string[];
}

export interface UpsertConditionConfigDto {
  configType: string;
  configVersion: string;
  values: Record<string, unknown>;
}

export interface UpsertBenefitConfigDto {
  configType: string;
  configVersion: string;
  values: Record<string, unknown>;
}

// --- Runtime evaluate types ---

export interface PromotionVoucherCheckoutCustomerContext {
  customerId?: string | null;
  segmentIds?: string[];
}

export interface PromotionVoucherCheckoutCartContext {
  cartId?: string | null;
  checkoutSessionId?: string | null;
  evaluatedAt?: string | null;
}

export interface PromotionVoucherCheckoutContext {
  evaluatedAt?: string | null;
  customer?: PromotionVoucherCheckoutCustomerContext | null;
  cart?: PromotionVoucherCheckoutCartContext | null;
  lines?: RuntimeEvaluateLineDto[];
  couponCodes?: string[];
}

export interface DiscoverPromotionVouchersRequestDto {
  checkoutContext?: PromotionVoucherCheckoutContext | null;
}

/** Body POST order/orders/promotion-vouchers/discover */
export interface DiscoverOrderPromotionVoucherItemDto {
  variationId: string;
  quantity: number;
  unitPriceMinor: string;
}

export interface DiscoverOrderPromotionVouchersRequestDto {
  items: DiscoverOrderPromotionVoucherItemDto[];
  customerId?: string | null;
  couponCodes?: string[];
}

export interface PromotionVoucherDiscoverSectionDto {
  groupType: string;
  groupKey: string;
  title: string;
  subtitle: string | null;
  items: PromotionVoucherCardDto[];
}

export interface DiscoverPromotionVouchersResponseDto {
  sections: PromotionVoucherDiscoverSectionDto[];
}

export interface ValidatePromotionVoucherCodeRequestDto {
  code: string;
  checkoutContext?: PromotionVoucherCheckoutContext | null;
}

export interface PromotionVoucherCardDto {
  voucherCodeId: string;
  promotionId: string;
  promotionSchemaId: string;
  promotionName: string;
  schemaType: PromotionSchemaType;
  code: string;
  codeMask: string | null;
  image: string | null;
  status: VoucherCodeStatus;
  title: string;
  subtitle: string;
  conditionSummary: string;
  benefitSummary: string;
  startsAt: string;
  endsAt: string;
  disabled: boolean;
  disabledMessage?: string | null;
  reasonCodes?: string[];
  /** Staging order create still reads this legacy field. */
  disabledReason?: string | null;
}

export interface ValidatePromotionVoucherCodeResponseDto {
  reasonCode: string;
  reasonCodes?: string[];
  message: string;
  valid: boolean;
  card: PromotionVoucherCardDto | null;
}

export interface RuntimeEvaluateLineDto {
  lineId: string;
  skuId: string;
  quantity: number;
  unitPriceMinor: string;
  lineSubtotalMinor: string;
  categoryIds: string[];
  collectionIds: string[];
  hasExistingPromotion?: boolean;
  hasExistingDiscount?: boolean;
}

export interface RuntimeEvaluateRequestDto {
  scopes: PromotionScope[];
  evaluatedAt: string;
  customer: {
    customerId?: string | null;
    segmentIds?: string[];
  };
  cart: {
    cartId?: string | null;
    currency?: 'VND' | null;
  };
  lines: RuntimeEvaluateLineDto[];
  couponCodes?: string[];
}

export interface CandidateLookupKeyDto {
  keyType: PromotionIndexKeyType;
  keyValue: string;
  lineId?: string | null;
}

export interface CandidateResultResponseDto {
  promotionId: string;
  promotionSchemaId: string;
  promotionSnapshotId: string;
  promotionName?: string;
  promotionSchemaName?: string;
  scope: PromotionScope;
  schemaType: PromotionSchemaType;
  priority: number;
  startsAt: string;
  endsAt: string;
  matchedKeys: CandidateLookupKeyDto[];
  reasonCode: RuntimeEvaluateReasonCode;
}

export interface RuntimeEvaluateExplainDto {
  totalLookupKeys: number;
  matchedCandidateCount: number;
  dedupedCandidateCount: number;
  evaluatedCandidateCount: number;
  applicableCandidateCount: number;
  rejectedCandidateCount: number;
  totalDiscountAmountMinor: string;
  reasonCodes: RuntimeEvaluateReasonCode[];
}

export interface AudienceEvaluationDetailDto {
  passed: boolean;
  reasonCode: RuntimeEvaluateReasonCode;
}

export interface TargetEvaluationDetailDto {
  eligibleLineIds: string[];
  reasonCodes: RuntimeEvaluateReasonCode[];
}

export interface LineAdjustmentResultDto {
  lineId: string;
  skuId: string;
  quantity: number;
  unitPriceMinor: string;
  lineSubtotalMinor: string;
  discountAmountMinor: string;
  effectiveLineSubtotalMinor: string;
  benefitType: ComponentKind;
  reasonCodes: RuntimeEvaluateReasonCode[];
}

export interface SchemaEvaluationResultDto {
  promotionSchemaId: string;
  promotionSchemaName?: string;
  scope: PromotionScope;
  schemaType: PromotionSchemaType;
  priority: number;
  conditionPassed: boolean;
  conditionReasonCode: RuntimeEvaluateReasonCode;
  benefitPassed: boolean;
  benefitReasonCodes: RuntimeEvaluateReasonCode[];
  lineAdjustments: LineAdjustmentResultDto[];
  totalDiscountAmountMinor: string;
}

export interface RuntimeCandidateEvaluationResultDto {
  promotionId: string;
  promotionSchemaId: string;
  promotionSnapshotId: string;
  promotionName?: string;
  promotionSchemaName?: string;
  scope: PromotionScope;
  schemaType: PromotionSchemaType;
  status: 'APPLICABLE' | 'REJECTED';
  reasonCodes: RuntimeEvaluateReasonCode[];
  matchedKeys: CandidateLookupKeyDto[];
  audience: AudienceEvaluationDetailDto;
  target: TargetEvaluationDetailDto;
  schemas: SchemaEvaluationResultDto[];
  totalDiscountAmountMinor: string;
}

export interface SelectedLineAdjustmentDto {
  promotionId: string;
  promotionSchemaId: string;
  promotionSnapshotId: string;
  promotionName?: string;
  promotionSchemaName?: string;
  lineId: string;
  skuId: string;
  scope: PromotionScope;
  schemaType: PromotionSchemaType;
  discountAmountMinor: string;
  effectiveLineSubtotalMinor: string;
  reasonCodes: RuntimeEvaluateReasonCode[];
}

export interface RejectedLineAdjustmentDto {
  promotionId: string;
  promotionSchemaId: string;
  promotionSnapshotId: string;
  promotionName?: string;
  promotionSchemaName?: string;
  lineId: string;
  skuId: string;
  scope: PromotionScope;
  schemaType: PromotionSchemaType;
  discountAmountMinor: string;
  reasonCodes: RuntimeEvaluateReasonCode[];
}

export interface RuntimeSelectionResultDto {
  selectedLineAdjustments: SelectedLineAdjustmentDto[];
  rejectedLineAdjustments: RejectedLineAdjustmentDto[];
  totalSelectedDiscountAmountMinor: string;
  selectedAdjustmentCount: number;
  rejectedAdjustmentCount: number;
}

export interface RuntimeEvaluateResponseDto {
  tenantCode: string;
  evaluatedAt: string;
  candidates: CandidateResultResponseDto[];
  evaluations: RuntimeCandidateEvaluationResultDto[];
  selection: RuntimeSelectionResultDto;
  explain: RuntimeEvaluateExplainDto;
}
export interface PromotionSimulationCandidateSourceDto {
  sourceType: PromotionSimulationSourceType;
  sourceDraftId: string | null;
  draftSchemaId: string | null;
  promotionId: string;
  promotionSchemaId: string;
  promotionSnapshotId: string;
  scope: PromotionScope;
  schemaType: PromotionSchemaType;
}

export interface PromotionSimulationAdjustmentReferenceDto {
  sourceType: PromotionSimulationSourceType;
  sourceDraftId: string | null;
  promotionId: string;
  promotionSchemaId: string;
  promotionSnapshotId: string;
  lineId: string;
  scope: PromotionScope;
  schemaType: PromotionSchemaType;
  discountAmountMinor: string;
  reasonCodes: RuntimeEvaluateReasonCode[];
}

export interface PromotionSimulationConflictEntryDto {
  outcome: PromotionSimulationConflictOutcome;
  winnerSource: PromotionSimulationSourceType | null;
  loserSource: PromotionSimulationSourceType | null;
  winner: PromotionSimulationAdjustmentReferenceDto | null;
  loser: PromotionSimulationAdjustmentReferenceDto | null;
  affectedLineIds: string[];
  winnerDiscountAmountMinor: string;
  loserDiscountAmountMinor: string;
  reasonCodes: string[];
}

export interface PromotionDraftSimulationMetadataDto {
  correlationId: string;
  persisted: false;
  sourceDraftId: string;
  baselineTotalSelectedDiscountAmountMinor: string;
  projectedTotalSelectedDiscountAmountMinor: string;
  discountDeltaMinor: string;
  baselineSelectedReferences: PromotionSimulationAdjustmentReferenceDto[];
  candidateSources: PromotionSimulationCandidateSourceDto[];
  conflicts: PromotionSimulationConflictEntryDto[];
}

export interface PromotionDraftSimulationResponseDto extends RuntimeEvaluateResponseDto {
  promotionEvaluationId: string;
  simulation: PromotionDraftSimulationMetadataDto;
}

export interface PromotionSimulationVoucherDiscoverRequestDto {
  evaluatedAt: string;
}

export interface PromotionSimulationVoucherItemDto {
  sourceType: PromotionSimulationSourceType;
  sourceDraftId: string | null;
  voucherCodeId: string;
  promotionId: string;
  promotionSchemaId: string;
  promotionName: string;
  schemaType: PromotionSchemaType;
  code: string;
  codeMask: string | null;
  image: string | null;
  status: VoucherCodeStatus;
  title: string;
  subtitle: string;
  conditionSummary: string;
  benefitSummary: string;
  startsAt: string;
  endsAt: string;
  disabled: boolean;
  disabledMessage: string | null;
}

export interface PromotionSimulationVoucherSectionDto {
  groupType: string;
  groupKey: string;
  title: string;
  subtitle: string | null;
  items: PromotionSimulationVoucherItemDto[];
}

export interface PromotionSimulationVoucherDiscoverResponseDto {
  sections: PromotionSimulationVoucherSectionDto[];
}

/** Display DTO MANUAL_CUSTOMER — customerId = IAM userId. */
export interface PromotionCustomerAudienceItemDto {
  customerId: string;
  userId: string;
  memberId: string;
  phone: string;
  fullName?: string | null;
  status?: string | null;
  memberCode?: string | null;
}

/** Display-only TARGET SKU item — enriched by promotion-service; not stored in config. */
export interface PromotionTargetSkuItemDto {
  id: string;
  skuCode: string;
  name: string;
  productId?: string | null;
  productName?: string | null;
  imageUrl?: string | null;
  status?: string | null;
}

