import * as yup from 'yup';
import { isoToStoredDateTime, parseStoredDateTime } from '../../../common/utils/date-format.util';
import { PROMOTION_VALIDATION_MESSAGES } from './promotion-labels.util';

export type PromotionHeaderFormValues = {
  name: string;
  description: string;
  startsAtDate: string;
  endsAtDate: string;
};

export type PromotionHeaderDraftState = PromotionHeaderFormValues;

const isEndDateAfterStart = function (this: yup.TestContext, endsAtDate: string | undefined): boolean {
  const { startsAtDate } = this.parent as PromotionHeaderFormValues;
  if (!startsAtDate || !endsAtDate) return true;
  const start = parseStoredDateTime(startsAtDate);
  const end = parseStoredDateTime(endsAtDate);
  if (!start || !end) return true;
  return end.isAfter(start);
};

export const promotionHeaderFormSchema = yup
  .object({
    name: yup.string().trim().required(PROMOTION_VALIDATION_MESSAGES.NAME_REQUIRED),
    description: yup.string().default(''),
    startsAtDate: yup.string().required(PROMOTION_VALIDATION_MESSAGES.START_DATE_REQUIRED),
    endsAtDate: yup.string().required(PROMOTION_VALIDATION_MESSAGES.END_DATE_REQUIRED).test('end-after-start', PROMOTION_VALIDATION_MESSAGES.END_DATE_AFTER_START, isEndDateAfterStart),
  })
  .required();

export const createDefaultPromotionHeaderFormValues = (): PromotionHeaderFormValues => ({
  name: '',
  description: '',
  startsAtDate: '',
  endsAtDate: '',
});

export const mapPromotionToHeaderDraft = (promotion: { name: string; description?: string | null; startsAt: string; endsAt: string }): PromotionHeaderDraftState => ({
  name: promotion.name,
  description: promotion.description ?? '',
  startsAtDate: isoToStoredDateTime(promotion.startsAt),
  endsAtDate: isoToStoredDateTime(promotion.endsAt),
});

export const isPromotionHeaderDraftDirty = (draft: PromotionHeaderDraftState, saved: PromotionHeaderDraftState): boolean => JSON.stringify(draft) !== JSON.stringify(saved);

export const isPromotionHeaderDraftValid = (draft: PromotionHeaderDraftState): boolean => {
  if (!draft.name.trim() || !draft.startsAtDate || !draft.endsAtDate) return false;
  const start = parseStoredDateTime(draft.startsAtDate);
  const end = parseStoredDateTime(draft.endsAtDate);
  if (!start || !end) return false;
  return end.isAfter(start);
};
