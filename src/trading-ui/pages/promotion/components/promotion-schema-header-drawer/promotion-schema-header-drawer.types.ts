import type { PromotionDraftSchemaType, PromotionSchemaStatus, PromotionCostSource, PromotionScope } from '../../../../apis/promotion/promotion.enum';

export interface SchemaHeaderDraft {
  name: string;
  description: string;
  schemaType: PromotionDraftSchemaType | '';
  scope: PromotionScope;
  costSources: PromotionCostSource[];
  status: PromotionSchemaStatus;
  schemaStartsAt: string;
  schemaEndsAt: string;
}

export interface SchemaHeaderValidation {
  errors: Partial<Record<keyof SchemaHeaderDraft, string>>;
  isValid: boolean;
}

/** Parent promotion draft window used to constrain schema date fields. */
export interface SchemaHeaderParentWindow {
  startsAt?: string | null;
  endsAt?: string | null;
}
