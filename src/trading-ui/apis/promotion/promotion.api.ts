import { axiosRequest } from '../../common/config';
import {isJavaBackend} from '@/common/config/app.config';
import {getJavaCampaignOverview,deleteJavaCampaign} from './promotion-java-overview.adapter';
import { type ResList } from '../../common/constant/api.interface';
import { ComponentKind } from './promotion.enum';
import type { PromotionApplicabilityConfigV1, UpsertPromotionDraftApplicabilityDto } from './promotion.interface';
import {
  type Promotion,
  type PromotionDraft,
  type PromotionDraftBenefitComponentDto,
  type PromotionDraftConditionComponentDto,
  type PromotionDraftSchema,
  type PromotionDraftSchemaComponentsResponseDto,
  type PromotionSkuTarget,
  type SchemaComponentAuthoringUpsertDto,
} from './promotion.entities';
import {
  type CommitPromotionSkuSnapshotDto,
  type CreatePromotionDto,
  type CreatePromotionDraftDto,
  type CreatePromotionDraftSchemaDto,
  type UpdatePromotionDraftSchemaDto,
  type DraftVoucherCodeListResponseDto,
  type DraftVoucherCodeResponseDto,
  type UpsertBenefitConfigDto,
  type UpsertConditionConfigDto,
  type UpsertDraftVoucherCodeDto,
  type PreviewPromotionSkuTargetsDto,
  type PromotionChannelOption,
  type PromotionDraftComponentDto,
  type PromotionDraftComponentsResponseDto,
  type PromotionDraftListResponseDto,
  type ResListPromotionDraft,
  type PromotionDraftSchemasResponseDto,
  type PromotionTargetConfigV1,
  type PromotionSkuTargetPreviewResult,
  type PromotionStackingCandidateDto,
  type QueryPromotionDto,
  type UpsertPromotionDraftAudienceDto,
  type UpsertPromotionDraftTargetDto,
  type UpdatePromotionDto,
  type UpdatePromotionDraftDto,
  type PromotionAudienceConfigV1,
  type PublishPromotionDraftResponseDto,
  type GetCampaignOverviewQueryDto,
  type GetCampaignOverviewResponseDto,
  type PromotionDetailDto,
  type PromotionLifecycleResponseDto,
  type PromotionQuotaStatisticsDto,
  type RuntimeEvaluateRequestDto,
  type RuntimeEvaluateResponseDto,
  type PromotionDraftSimulationResponseDto,
  type PromotionSimulationVoucherDiscoverRequestDto,
  type PromotionSimulationVoucherDiscoverResponseDto,
  type DiscoverPromotionVouchersRequestDto,
  type DiscoverPromotionVouchersResponseDto,
  type ValidatePromotionVoucherCodeRequestDto,
  type ValidatePromotionVoucherCodeResponseDto,
  type PromotionCustomerAudienceItemDto,
} from './promotion.interface';
import {
  AUTHORING_CONTRACT_V2_QUERY,
  parseCollectionAuthoringV2,
  parseSingleObjectDefinitionV2List,
  type CollectionAuthoringV2,
  type SingleObjectDefinitionV2,
} from './promotion-authoring-contract.types';

const PROMOTION_BASE = 'promotion/v1/promotions';
const PROMOTION_DRAFT_BASE = 'promotion/promotion-drafts';
const PROMOTION_VOUCHER_BASE = 'promotion/promotion-vouchers';
const PROMOTION_CUSTOMER_AUDIENCE_BASE = 'promotion/admin/customer-audience';

export const getPromotionDraftList = async (params: Partial<QueryPromotionDto>): Promise<PromotionDraftListResponseDto> =>
  await axiosRequest.get(PROMOTION_DRAFT_BASE, {
    params: {
      ...params,
      limit: params.limit ?? params.take,
    },
  });

export const getPromotionDraftListAsTable = async (params: Partial<QueryPromotionDto>): Promise<ResListPromotionDraft> => {
  const response = await getPromotionDraftList(params);
  return {
    list: response.items,
    total: response.meta.total,
    statusCounts: response.statusCounts,
  };
};

export const getPromotionDraftDetail = async (id: string): Promise<PromotionDraft> => await axiosRequest.get(`${PROMOTION_DRAFT_BASE}/${id}`);

export const createPromotionDraft = async (body: CreatePromotionDraftDto): Promise<PromotionDraft> => await axiosRequest.post(PROMOTION_DRAFT_BASE, body);

export const updatePromotionDraft = async (id: string, body: UpdatePromotionDraftDto): Promise<PromotionDraft> => await axiosRequest.patch(`${PROMOTION_DRAFT_BASE}/${id}`, body);

export const deletePromotionDraft = async (id: string): Promise<void> => isJavaBackend()?deleteJavaCampaign(id):await axiosRequest.delete(`${PROMOTION_DRAFT_BASE}/${id}`);

export const publishPromotionDraft = async (draftId: string): Promise<PublishPromotionDraftResponseDto> => await axiosRequest.post(`${PROMOTION_DRAFT_BASE}/${draftId}/publish`);

export const getPromotionDraftComponents = async (id: string): Promise<PromotionDraftComponentsResponseDto> => {
  const response = (await axiosRequest.get(`${PROMOTION_DRAFT_BASE}/${id}/components`)) as unknown;
  if (Array.isArray(response)) {
    return {
      items: response,
      target: response.find((component: PromotionDraftComponentDto) => component.componentKind === ComponentKind.TARGET) ?? null,
      audience: response.find((component: PromotionDraftComponentDto) => component.componentKind === ComponentKind.AUDIENCE) ?? null,
      applicability: response.find((component: PromotionDraftComponentDto) => component.componentKind === ComponentKind.APPLICABILITY) ?? null,
    };
  }
  return response as PromotionDraftComponentsResponseDto;
};

export const upsertPromotionDraftTarget = async (id: string, body: UpsertPromotionDraftTargetDto): Promise<PromotionDraftComponentDto<PromotionTargetConfigV1>> =>
  await axiosRequest.put(`${PROMOTION_DRAFT_BASE}/${id}/target`, body);

export const upsertPromotionDraftAudience = async (id: string, body: UpsertPromotionDraftAudienceDto): Promise<PromotionDraftComponentDto<PromotionAudienceConfigV1>> =>
  await axiosRequest.put(`${PROMOTION_DRAFT_BASE}/${id}/audience`, body);

export const upsertPromotionDraftApplicability = async (id: string, body: UpsertPromotionDraftApplicabilityDto): Promise<PromotionDraftComponentDto<PromotionApplicabilityConfigV1>> =>
  await axiosRequest.put(`${PROMOTION_DRAFT_BASE}/${id}/applicability`, body);

export const getPromotionList = async (params: Partial<QueryPromotionDto>): Promise<ResList<Promotion>> => await axiosRequest.get(PROMOTION_BASE, { params });

export const getPromotionDetail = async (id: string): Promise<Promotion> => await axiosRequest.get(`${PROMOTION_BASE}/${id}`);

export const getPromotionChannels = async (): Promise<PromotionChannelOption[]> => await axiosRequest.get(`${PROMOTION_BASE}/channels`);

export const createLegacyPromotionDraft = async (body: CreatePromotionDto): Promise<{ promotion: Promotion; warnings: string[] }> => await axiosRequest.post(PROMOTION_BASE, body);

export const updatePromotion = async (id: string, body: UpdatePromotionDto): Promise<{ promotion: Promotion; warnings: string[] }> => await axiosRequest.patch(`${PROMOTION_BASE}/${id}`, body);

export const publishPromotion = async (id: string): Promise<{ promotion: Promotion; warnings: string[] }> => await axiosRequest.post(`${PROMOTION_BASE}/${id}/publish`);

export const disablePromotion = async (id: string): Promise<{ promotion: Promotion; warnings: string[] }> => await axiosRequest.post(`${PROMOTION_BASE}/${id}/disable`);

export const deletePromotion = async (id: string): Promise<void> => isJavaBackend()?deleteJavaCampaign(id):await axiosRequest.delete(`${PROMOTION_BASE}/${id}`);

export const previewPromotionSkuTargets = async (id: string, body: PreviewPromotionSkuTargetsDto): Promise<PromotionSkuTargetPreviewResult> =>
  await axiosRequest.post(`${PROMOTION_BASE}/${id}/sku-targets/preview`, body);

export const commitPromotionSkuSnapshot = async (id: string, body: CommitPromotionSkuSnapshotDto): Promise<PromotionSkuTarget[]> =>
  await axiosRequest.put(`${PROMOTION_BASE}/${id}/sku-targets/snapshot`, body);

export const getPromotionSkuTargets = async (id: string): Promise<PromotionSkuTarget[]> => await axiosRequest.get(`${PROMOTION_BASE}/${id}/sku-targets`);

export const getPromotionStackingCandidates = async (id: string, schemaId: string): Promise<PromotionStackingCandidateDto[]> =>
  await axiosRequest.get(`${PROMOTION_BASE}/${id}/schemas/${schemaId}/stacking-candidates`);

export const setPromotionStackLinks = async (id: string, schemaId: string, stackableSchemaIds: string[]) =>
  await axiosRequest.put(`${PROMOTION_BASE}/${id}/schemas/${schemaId}/stack-links`, { stackableSchemaIds });

export const getPromotionDraftSchemas = async (draftId: string): Promise<PromotionDraftSchemasResponseDto> => await axiosRequest.get(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas`);

export const createPromotionDraftSchema = async (draftId: string, body: CreatePromotionDraftSchemaDto): Promise<PromotionDraftSchema> =>
  await axiosRequest.post(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas`, body);

export const getPromotionDraftSchema = async (draftId: string, schemaId: string): Promise<PromotionDraftSchema> => await axiosRequest.get(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}`);

export const updatePromotionDraftSchema = async (draftId: string, schemaId: string, body: UpdatePromotionDraftSchemaDto): Promise<PromotionDraftSchema> =>
  await axiosRequest.patch(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}`, body);

export const deletePromotionDraftSchema = async (draftId: string, schemaId: string): Promise<void> => await axiosRequest.delete(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}`);

export const getPromotionDraftSchemaComponents = async (draftId: string, schemaId: string): Promise<PromotionDraftSchemaComponentsResponseDto> =>
  await axiosRequest.get(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/components`);

export const upsertPromotionDraftSchemaCondition = async (draftId: string, schemaId: string, body: UpsertConditionConfigDto): Promise<PromotionDraftConditionComponentDto> =>
  await axiosRequest.put(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/condition`, body);

export const reorderPromotionDraftSchemas = async (draftId: string, schemaIds: string[]): Promise<void> => await axiosRequest.put(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/order`, { schemaIds });

export const upsertPromotionDraftSchemaBenefit = async (draftId: string, schemaId: string, body: UpsertBenefitConfigDto): Promise<PromotionDraftBenefitComponentDto> =>
  await axiosRequest.put(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/benefit`, body);

export const getConditionConfigOptions = async (draftId: string, schemaId: string): Promise<SingleObjectDefinitionV2[]> => {
  const response = await axiosRequest.get(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/condition-config-options`, {
    params: AUTHORING_CONTRACT_V2_QUERY,
  });
  return parseSingleObjectDefinitionV2List(response);
};

export const getBenefitConfigOptions = async (draftId: string, schemaId: string): Promise<SingleObjectDefinitionV2[]> => {
  const response = await axiosRequest.get(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/benefit-config-options`, {
    params: AUTHORING_CONTRACT_V2_QUERY,
  });
  return parseSingleObjectDefinitionV2List(response);
};

export const upsertSchemaComponentCondition = async (draftId: string, schemaId: string, body: SchemaComponentAuthoringUpsertDto): Promise<PromotionDraftConditionComponentDto> =>
  await axiosRequest.put(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/condition`, body);

export const upsertSchemaComponentBenefit = async (draftId: string, schemaId: string, body: SchemaComponentAuthoringUpsertDto): Promise<PromotionDraftBenefitComponentDto> =>
  await axiosRequest.put(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/benefit`, body);
export const evaluateRuntime = async (body: RuntimeEvaluateRequestDto): Promise<RuntimeEvaluateResponseDto> => await axiosRequest.post('promotion/internal/promotion-runtime/evaluate', body);

export const simulatePromotionDraft = async (draftId: string, body: RuntimeEvaluateRequestDto): Promise<PromotionDraftSimulationResponseDto> =>
  await axiosRequest.post(`${PROMOTION_DRAFT_BASE}/${draftId}/simulate`, body);

export const discoverPromotionDraftSimulationVouchers = async (draftId: string, body: PromotionSimulationVoucherDiscoverRequestDto): Promise<PromotionSimulationVoucherDiscoverResponseDto> =>
  await axiosRequest.post(`${PROMOTION_DRAFT_BASE}/${draftId}/simulation-vouchers/discover`, body);

export const discoverPromotionVouchers = async (body: DiscoverPromotionVouchersRequestDto = {}): Promise<DiscoverPromotionVouchersResponseDto> =>
  await axiosRequest.post(`${PROMOTION_VOUCHER_BASE}/discover`, body);
export const validatePromotionVoucherCode = async (body: ValidatePromotionVoucherCodeRequestDto): Promise<ValidatePromotionVoucherCodeResponseDto> =>
  await axiosRequest.post('promotion/promotion-vouchers/validate-code', body);

// --- Voucher code endpoints ---

export const getVoucherCodeAuthoring = async (draftId: string, schemaId: string): Promise<CollectionAuthoringV2> => {
  const response = await axiosRequest.get(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/voucher-code-authoring`, {
    params: AUTHORING_CONTRACT_V2_QUERY,
  });
  return parseCollectionAuthoringV2(response);
};

export const getPromotionDraftVoucherCodes = async (draftId: string, schemaId: string): Promise<DraftVoucherCodeListResponseDto> =>
  await axiosRequest.get(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/voucher-codes`);

export const upsertPromotionDraftVoucherCode = async (draftId: string, schemaId: string, body: UpsertDraftVoucherCodeDto): Promise<DraftVoucherCodeResponseDto> =>
  await axiosRequest.put(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/voucher-codes`, body);

export const deletePromotionDraftVoucherCode = async (draftId: string, schemaId: string, voucherCodeId: string): Promise<void> =>
  await axiosRequest.delete(`${PROMOTION_DRAFT_BASE}/${draftId}/schemas/${schemaId}/voucher-codes/${voucherCodeId}`);

// --- Campaign Overview & Published Lifecycle APIs ---

const CAMPAIGN_OVERVIEW_BASE = 'promotion/promotion-campaigns';
const PUBLISHED_PROMOTION_BASE = 'promotion/promotions';

export const getCampaignOverview = async (params: GetCampaignOverviewQueryDto): Promise<GetCampaignOverviewResponseDto> => isJavaBackend()?getJavaCampaignOverview(params):await axiosRequest.get(CAMPAIGN_OVERVIEW_BASE, { params });

export const getPublishedPromotionDetail = async (id: string): Promise<PromotionDetailDto> => await axiosRequest.get(`${PUBLISHED_PROMOTION_BASE}/${id}`);

export const getPublishedPromotionQuotaStatistics = async (id: string): Promise<PromotionQuotaStatisticsDto> => await axiosRequest.get(`${PUBLISHED_PROMOTION_BASE}/${id}/quota-statistics`);

export const getPublishedPromotionComponents = async (id: string): Promise<PromotionDraftComponentsResponseDto> => await axiosRequest.get(`${PUBLISHED_PROMOTION_BASE}/${id}/components`);

export const getPublishedPromotionSchemas = async (id: string): Promise<PromotionDraftSchemasResponseDto> => await axiosRequest.get(`${PUBLISHED_PROMOTION_BASE}/${id}/schemas`);

export const getPublishedPromotionSchemaComponents = async (promotionId: string, schemaId: string): Promise<PromotionDraftSchemaComponentsResponseDto> =>
  await axiosRequest.get(`${PUBLISHED_PROMOTION_BASE}/${promotionId}/schemas/${schemaId}/components`);

export const getPublishedPromotionVoucherCodes = async (promotionId: string, schemaId: string): Promise<DraftVoucherCodeListResponseDto> =>
  await axiosRequest.get(`${PUBLISHED_PROMOTION_BASE}/${promotionId}/schemas/${schemaId}/voucher-codes`);

export const pausePublishedPromotion = async (id: string): Promise<PromotionLifecycleResponseDto> => await axiosRequest.post(`${PUBLISHED_PROMOTION_BASE}/${id}/pause`);

export const resumePublishedPromotion = async (id: string): Promise<PromotionLifecycleResponseDto> => await axiosRequest.post(`${PUBLISHED_PROMOTION_BASE}/${id}/resume`);

export const endPublishedPromotion = async (id: string): Promise<PromotionLifecycleResponseDto> => await axiosRequest.post(`${PUBLISHED_PROMOTION_BASE}/${id}/end`);

export const unpublishPublishedPromotionSchema = async (promotionId: string, schemaId: string): Promise<PromotionDraftSchema> =>
  await axiosRequest.post(`${PUBLISHED_PROMOTION_BASE}/${promotionId}/schemas/${schemaId}/unpublish`);

export const getPromotionCustomerAudienceByPhone = async (phone: string): Promise<PromotionCustomerAudienceItemDto> =>
  await axiosRequest.get(`${PROMOTION_CUSTOMER_AUDIENCE_BASE}/by-phone`, { params: { phone } });
