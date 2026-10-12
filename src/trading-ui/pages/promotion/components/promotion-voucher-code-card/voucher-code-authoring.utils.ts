import { VoucherCodeStatus, type CollectionAuthoringV2, type VoucherDistributionChannel } from '../../../../apis';

export type AuthoringEnumOption = {
  value: string;
  label: string;
};

type JsonSchemaObject = Record<string, unknown>;

const asObject = (value: unknown): JsonSchemaObject | null => (value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as JsonSchemaObject) : null);

const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

export const getEnumOptions = (enumValues?: unknown, enumNames?: unknown): AuthoringEnumOption[] => {
  const values = asStringArray(enumValues);
  const names = asStringArray(enumNames);
  return values.map((value, index) => ({
    value,
    label: names[index] ?? value,
  }));
};

export const getVisibilityDistributionPolicySchema = (itemSchema?: JsonSchemaObject | null): JsonSchemaObject | null => {
  const properties = asObject(itemSchema?.properties);
  return asObject(properties?.visibilityDistributionPolicy);
};

export const getVisibilityTypeSchema = (itemSchema?: JsonSchemaObject | null): JsonSchemaObject | null => {
  const policySchema = getVisibilityDistributionPolicySchema(itemSchema);
  const properties = asObject(policySchema?.properties);
  return asObject(properties?.visibilityType);
};

export const getDistributionChannelsSchema = (itemSchema?: JsonSchemaObject | null): JsonSchemaObject | null => {
  const policySchema = getVisibilityDistributionPolicySchema(itemSchema);
  const properties = asObject(policySchema?.properties);
  return asObject(properties?.distributionChannels);
};

export const getVisibilityOptionsFromAuthoring = (authoring: CollectionAuthoringV2 | null): AuthoringEnumOption[] => {
  const schema = getVisibilityTypeSchema(authoring?.item.schema ?? null);
  return getEnumOptions(schema?.enum, schema?.enumNames);
};

export const getDistributionChannelOptionsFromAuthoring = (authoring: CollectionAuthoringV2 | null): AuthoringEnumOption[] => {
  const channelsSchema = getDistributionChannelsSchema(authoring?.item.schema ?? null);
  const itemsSchema = asObject(channelsSchema?.items);
  return getEnumOptions(itemsSchema?.enum, itemsSchema?.enumNames);
};

/** visibilityType const values that require distributionChannels.minItems >= 1 (from itemSchema allOf). */
export const getVisibilityTypesRequiringChannels = (itemSchema?: JsonSchemaObject | null): string[] => {
  const policySchema = getVisibilityDistributionPolicySchema(itemSchema);
  if (!policySchema || !Array.isArray(policySchema.allOf)) return [];

  const requiredTypes: string[] = [];
  for (const rule of policySchema.allOf) {
    const ruleObject = asObject(rule);
    const ifSchema = asObject(ruleObject?.if);
    const thenSchema = asObject(ruleObject?.then);
    const ifProperties = asObject(ifSchema?.properties);
    const visibilityConstSchema = asObject(ifProperties?.visibilityType);
    const thenProperties = asObject(thenSchema?.properties);
    const channelsThenSchema = asObject(thenProperties?.distributionChannels);
    const minItems = typeof channelsThenSchema?.minItems === 'number' ? channelsThenSchema.minItems : 0;
    const constValue = visibilityConstSchema?.const;
    if (minItems >= 1 && typeof constValue === 'string') {
      requiredTypes.push(constValue);
    }
  }
  return requiredTypes;
};

export const getVisibilityTypeFromItemValues = (itemValues: Record<string, unknown>): string | null => {
  const policy = asObject(itemValues.visibilityDistributionPolicy);
  return typeof policy?.visibilityType === 'string' ? policy.visibilityType : null;
};

/** Types that do not require channels (e.g. PUBLIC): force distributionChannels = []. */
export const normalizeItemValuesChannelsByVisibility = (itemValues: Record<string, unknown>, typesRequiringChannels: readonly string[]): Record<string, unknown> => {
  if (typesRequiringChannels.length === 0) return itemValues;
  const policy = asObject(itemValues.visibilityDistributionPolicy);
  if (!policy) return itemValues;
  const visibilityType = typeof policy.visibilityType === 'string' ? policy.visibilityType : null;
  if (!visibilityType || typesRequiringChannels.includes(visibilityType)) {
    return itemValues;
  }
  const channels = Array.isArray(policy.distributionChannels) ? policy.distributionChannels : [];
  if (channels.length === 0) return itemValues;
  return {
    ...itemValues,
    visibilityDistributionPolicy: {
      ...policy,
      distributionChannels: [],
    },
  };
};

/** Hide Kênh phân phối in uiSchema when visibilityType does not require channels. */
export const withHiddenDistributionChannelsUiSchema = (
  uiSchema: Record<string, unknown> | null,
  visibilityType: string | null,
  typesRequiringChannels: readonly string[],
): Record<string, unknown> | null => {
  const showChannels = typesRequiringChannels.length === 0 || (visibilityType != null && typesRequiringChannels.includes(visibilityType));
  if (showChannels) return uiSchema;

  const base = uiSchema ?? {};
  const policyUi = asObject(base.visibilityDistributionPolicy) ?? {};
  return {
    ...base,
    visibilityDistributionPolicy: {
      ...policyUi,
      distributionChannels: { widget: 'hidden' },
    },
  };
};

export const normalizeVoucherCodeInput = (value: string): string => value.trim().toUpperCase();

export const validateVoucherCodeInput = (value: string, rules?: { required?: boolean; maxLength?: number; pattern?: string }): string | null => {
  const normalized = normalizeVoucherCodeInput(value);
  const effectiveRules = rules ?? {
    required: true,
    maxLength: 64,
    pattern: '^[A-Z0-9_-]+$',
  };
  const required = effectiveRules.required ?? true;
  if (!normalized) return required ? 'Mã voucher không được để trống.' : null;

  if (effectiveRules.maxLength != null && normalized.length > effectiveRules.maxLength) {
    return `Mã voucher tối đa ${effectiveRules.maxLength} ký tự.`;
  }

  if (effectiveRules.pattern) {
    try {
      if (!new RegExp(effectiveRules.pattern).test(normalized)) {
        return 'Mã voucher chỉ gồm chữ in hoa, số, dấu - hoặc _.';
      }
    } catch {
      return null;
    }
  }
  return null;
};

export const formatEnumLabel = (value: string | null | undefined, options: readonly AuthoringEnumOption[]): string => {
  if (!value) return '-';
  return options.find((option) => option.value === value)?.label ?? value;
};

export const formatDistributionChannels = (channels: readonly VoucherDistributionChannel[] | readonly string[], options: readonly AuthoringEnumOption[] = []): string => {
  if (channels.length === 0) return '-';
  return channels.map((channel) => formatEnumLabel(channel, options)).join(', ');
};

export const isVoucherVisibilityDistributionPolicyReady = (
  policy: { type?: string; version?: string; visibilityType?: string; distributionChannels?: readonly string[] } | null | undefined,
): boolean => {
  if (!policy) return false;
  if (policy.type !== 'VOUCHER_VISIBILITY_DISTRIBUTION_POLICY' || policy.version !== '1.0.0') return false;
  if (policy.visibilityType !== 'PUBLIC' && policy.visibilityType !== 'PRIVATE') return false;
  if (!Array.isArray(policy.distributionChannels)) return false;
  if (policy.visibilityType === 'PRIVATE' && policy.distributionChannels.length === 0) return false;
  return true;
};

export const getVoucherCodeStatusTag = (status: VoucherCodeStatus): { bg: string; color: string; text: string } => {
  if (status === VoucherCodeStatus.ACTIVE) return { bg: '#ECFDF3', color: '#027A48', text: 'Đang kích hoạt' };
  return { bg: '#F2F4F7', color: '#344054', text: 'Vô hiệu' };
};

export const formatVoucherCodeDateTime = (value?: string | null): string => {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleString('vi-VN');
};
