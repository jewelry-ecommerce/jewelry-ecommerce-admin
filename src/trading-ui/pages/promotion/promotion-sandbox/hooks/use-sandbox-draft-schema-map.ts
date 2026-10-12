import useSWR from 'swr';
import { ComponentKind, promotionApi, type PromotionDraftSchemaType } from '../../../../apis';
import { formatBenefitSummary, formatConditionSummary } from '../../components/promotion-schema-component-config-drawer/schema-component-config.utils';

export interface SandboxDraftSchemaDetail {
  readonly schemaId: string;
  readonly name: string;
  readonly schemaType: PromotionDraftSchemaType;
  readonly conditionSummary: string;
  readonly benefitSummary: string;
}

const loadDraftSchemaMap = async (draftId: string): Promise<Map<string, SandboxDraftSchemaDetail>> => {
  const { items: schemas } = await promotionApi.getPromotionDraftSchemas(draftId);
  const entries = await Promise.all(
    schemas.map(async (schema) => {
      const components = await promotionApi.getPromotionDraftSchemaComponents(draftId, schema.id);
      const condition = components.condition ?? components.items.find((item) => item.componentKind === ComponentKind.CONDITION) ?? null;
      const benefit = components.benefit ?? components.items.find((item) => item.componentKind === ComponentKind.BENEFIT) ?? null;
      return [
        schema.id,
        {
          schemaId: schema.id,
          name: schema.name,
          schemaType: schema.schemaType,
          conditionSummary: formatConditionSummary(condition),
          benefitSummary: formatBenefitSummary(benefit),
        },
      ] as const;
    }),
  );
  return new Map(entries);
};

export const useSandboxDraftSchemaMap = (selectedDraftId: string) => {
  const draftId = selectedDraftId.trim();
  const { data, isLoading } = useSWR(draftId ? (['sandbox-draft-schema-map', draftId] as const) : null, ([, id]) => loadDraftSchemaMap(id), { revalidateOnFocus: false });

  return {
    schemaMap: data ?? new Map<string, SandboxDraftSchemaDetail>(),
    schemaMapLoading: isLoading,
  };
};
