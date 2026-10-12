import {
  ComponentKind,
  type PromotionApplicabilityConfigV1,
  type PromotionAudienceConfigV1,
  type PromotionDraft,
  type PromotionDraftComponentDto,
  type PromotionDraftComponentsResponseDto,
  type PromotionDraftSchemaComponentsResponseDto,
  type PromotionTargetConfigV1,
} from '../../../apis';
import { getErrorMessage } from '../../../common/utils';
import { isEditablePromotionDraftStatus, type PromotionHeaderDraftState } from '../promotion.constant';

export type HeaderDraftState = PromotionHeaderDraftState;

export const createEmptySchemaComponents = (): PromotionDraftSchemaComponentsResponseDto => ({
  condition: null,
  benefit: null,
  items: [],
});

export const getComponents = (components: PromotionDraftComponentsResponseDto | null) => ({
  target: components?.target ?? (components?.items?.find((component) => component.componentKind === ComponentKind.TARGET) as PromotionDraftComponentDto<PromotionTargetConfigV1> | undefined) ?? null,
  audience:
    components?.audience ?? (components?.items?.find((component) => component.componentKind === ComponentKind.AUDIENCE) as PromotionDraftComponentDto<PromotionAudienceConfigV1> | undefined) ?? null,
  /** Null for promotions authored before applicability existed - the form renders the system default instead. */
  applicability:
    components?.applicability ??
    (components?.items?.find((component) => component.componentKind === ComponentKind.APPLICABILITY) as PromotionDraftComponentDto<PromotionApplicabilityConfigV1> | undefined) ??
    null,
});

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object';

export const getPromotionPublishErrorMessage = (error: unknown): string => {
  if (!isRecord(error)) return getErrorMessage(error);
  const message = typeof error.message === 'string' ? error.message : getErrorMessage(error);
  const code = typeof error.code === 'string' ? error.code : '';
  if (code && message) return `${message} (${code})`;
  return code || message;
};

export const isPromotionDraftEditable = (source: 'draft' | 'published', promotionDraft: PromotionDraft | null): boolean =>
  source === 'draft' && promotionDraft != null && isEditablePromotionDraftStatus(promotionDraft.status);
