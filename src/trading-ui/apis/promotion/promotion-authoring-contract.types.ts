import type { PromotionAuthoringSchemaDefinition, PromotionAuthoringUiSchema } from './promotion.entities';

export const AUTHORING_CONTRACT_V2_VERSION = '2.0.0' as const;

export const AUTHORING_EDITOR_TYPE = {
  SINGLE_OBJECT: 'SINGLE_OBJECT',
  COLLECTION: 'COLLECTION',
} as const;

export type AuthoringEditorType = (typeof AUTHORING_EDITOR_TYPE)[keyof typeof AUTHORING_EDITOR_TYPE];

/** Query value for opt-in V2 authoring reads. Never expose a user-controlled raw value. */
export const AUTHORING_CONTRACT_V2_QUERY = { contractV2: 'true' } as const;

export interface SingleObjectDefinitionV2 {
  authoringContractVersion: typeof AUTHORING_CONTRACT_V2_VERSION;
  editorType: typeof AUTHORING_EDITOR_TYPE.SINGLE_OBJECT;
  configType: string;
  configVersion: string;
  configSchema: PromotionAuthoringSchemaDefinition;
  /** Present on condition catalog entries when BE can skip the visible condition step. */
  supportsImplicitAlways?: boolean;
  title?: string;
  description?: string;
  componentKind?: 'CONDITION' | 'BENEFIT';
}

export interface CollectionAuthoringDefinitionV2 {
  schema: PromotionAuthoringSchemaDefinition;
  uiSchema: PromotionAuthoringUiSchema | null;
  values: Record<string, unknown>;
}

export interface CollectionItemDefinitionV2 {
  schema: PromotionAuthoringSchemaDefinition;
  uiSchema: PromotionAuthoringUiSchema | null;
  defaultValues: Record<string, unknown>;
}

export interface CollectionAuthoringItemV2 {
  id: string;
  values: Record<string, unknown>;
  requiresSave: boolean;
}

export interface CollectionAuthoringCapabilitiesV2 {
  minItems: number;
  maxItems: number;
  canAdd: boolean;
  canEdit: boolean;
  canRemove: boolean;
}

export interface CollectionAuthoringV2 {
  authoringContractVersion: typeof AUTHORING_CONTRACT_V2_VERSION;
  editorType: typeof AUTHORING_EDITOR_TYPE.COLLECTION;
  configType: string;
  configVersion: string;
  collection: CollectionAuthoringDefinitionV2;
  item: CollectionItemDefinitionV2;
  items: CollectionAuthoringItemV2[];
  capabilities: CollectionAuthoringCapabilitiesV2;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const isAuthoringSchema = (value: unknown): value is PromotionAuthoringSchemaDefinition => isRecord(value) && typeof value.type === 'string';

const isUiSchema = (value: unknown): value is PromotionAuthoringUiSchema | null => value === null || isRecord(value);

export const isSingleObjectDefinitionV2 = (value: unknown): value is SingleObjectDefinitionV2 => {
  if (!isRecord(value)) return false;
  if (value.authoringContractVersion !== AUTHORING_CONTRACT_V2_VERSION) return false;
  if (value.editorType !== AUTHORING_EDITOR_TYPE.SINGLE_OBJECT) return false;
  if (typeof value.configType !== 'string' || typeof value.configVersion !== 'string') return false;
  if (!isAuthoringSchema(value.configSchema)) return false;
  return true;
};

export const isCollectionAuthoringV2 = (value: unknown): value is CollectionAuthoringV2 => {
  if (!isRecord(value)) return false;
  if (value.authoringContractVersion !== AUTHORING_CONTRACT_V2_VERSION) return false;
  if (value.editorType !== AUTHORING_EDITOR_TYPE.COLLECTION) return false;
  if (typeof value.configType !== 'string' || typeof value.configVersion !== 'string') return false;
  if (!isRecord(value.collection) || !isAuthoringSchema(value.collection.schema) || !isUiSchema(value.collection.uiSchema ?? null) || !isRecord(value.collection.values)) {
    return false;
  }
  if (!isRecord(value.item) || !isAuthoringSchema(value.item.schema) || !isUiSchema(value.item.uiSchema ?? null) || !isRecord(value.item.defaultValues)) {
    return false;
  }
  if (!Array.isArray(value.items)) return false;
  if (!isRecord(value.capabilities)) return false;
  const capabilities = value.capabilities;
  if (
    typeof capabilities.minItems !== 'number' ||
    typeof capabilities.maxItems !== 'number' ||
    typeof capabilities.canAdd !== 'boolean' ||
    typeof capabilities.canEdit !== 'boolean' ||
    typeof capabilities.canRemove !== 'boolean'
  ) {
    return false;
  }
  return value.items.every((item) => isRecord(item) && typeof item.id === 'string' && isRecord(item.values) && typeof item.requiresSave === 'boolean');
};

export const parseSingleObjectDefinitionV2List = (value: unknown): SingleObjectDefinitionV2[] => {
  if (!Array.isArray(value)) {
    throw new Error('Authoring catalog response must be an array.');
  }
  return value.map((entry, index) => {
    if (!isSingleObjectDefinitionV2(entry)) {
      throw new Error(`Authoring catalog entry at index ${index} is not a valid SINGLE_OBJECT V2 definition.`);
    }
    return entry;
  });
};

export const parseCollectionAuthoringV2 = (value: unknown): CollectionAuthoringV2 => {
  if (!isCollectionAuthoringV2(value)) {
    throw new Error('Voucher authoring response is not a valid COLLECTION V2 envelope.');
  }
  return value;
};
