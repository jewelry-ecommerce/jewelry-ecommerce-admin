import { type DraftVoucherCodeResponseDto, type PromotionDraftSchema, type PromotionDraftSchemaComponentsResponseDto } from '../../../../apis';

export type SchemaCreationWizardStepId = 'header' | 'voucher' | 'condition' | 'benefit' | 'review';

export interface SchemaCreationWizardCloseOptions {
  refreshSchemas?: boolean;
  schemaId?: string;
}

export interface SchemaCreationWizardReviewData {
  schema: PromotionDraftSchema;
  components: PromotionDraftSchemaComponentsResponseDto;
  voucherCode: DraftVoucherCodeResponseDto | null;
}

export interface SchemaCreationWizardSavedSteps {
  header: boolean;
  voucher: boolean;
  condition: boolean;
  benefit: boolean;
}
