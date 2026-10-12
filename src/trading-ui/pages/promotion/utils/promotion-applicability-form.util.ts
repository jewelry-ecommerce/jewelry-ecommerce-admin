import { PROMOTION_APPLICABILITY_CONFIG_TYPE, PromotionSalesChannel, StoreSelectionMode, type PromotionApplicabilityConfigV1, type PromotionStoreApplicabilityV1 } from '../../../apis';
import { PROMOTION_VALIDATION_MESSAGES } from './promotion-labels.util';

export type PromotionApplicabilityFormValues = {
  channels: PromotionSalesChannel[];
  storeMode: StoreSelectionMode;
  storeCodes: string[];
  storeGroupCodes: string[];
  excludedStoreCodes: string[];
};

export const createDefaultPromotionApplicabilityFormValues = (): PromotionApplicabilityFormValues => ({
  channels: [PromotionSalesChannel.ONLINE],
  storeMode: StoreSelectionMode.ALL,
  storeCodes: [],
  storeGroupCodes: [],
  excludedStoreCodes: [],
});

/**
 * What a promotion means when it carries no applicability component at all —
 * i.e. everything authored before POS existed. The backend applies exactly this
 * fallback at runtime, so the form must show the same thing rather than an
 * empty state that looks unconfigured.
 */
export const LEGACY_APPLICABILITY_FALLBACK_VALUES: PromotionApplicabilityFormValues = createDefaultPromotionApplicabilityFormValues();

export type PromotionApplicabilityFormErrors = Partial<Record<keyof PromotionApplicabilityFormValues, string>>;

/**
 * Store codes are merchant codes, not ids: uppercase, de-duplicated and SORTED.
 * Sorting is not cosmetic — the published snapshot is hashed with array order
 * preserved, so the same selection entered in a different order would otherwise
 * produce a different hash.
 */
const normalizeCodes = (codes: readonly string[]): string[] => [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))].sort();

export const isPosChannelSelected = (values: PromotionApplicabilityFormValues): boolean => values.channels.includes(PromotionSalesChannel.POS);

export const validatePromotionApplicabilityForm = (values: PromotionApplicabilityFormValues): PromotionApplicabilityFormErrors => {
  const errors: PromotionApplicabilityFormErrors = {};

  if (values.channels.length === 0) {
    errors.channels = PROMOTION_VALIDATION_MESSAGES.APPLICABILITY_CHANNEL_REQUIRED;
    return errors;
  }

  // Store scope only exists on the POS side; the rest is ignored when POS is off.
  if (!isPosChannelSelected(values)) return errors;

  if (values.storeMode === StoreSelectionMode.MANUAL && normalizeCodes(values.storeCodes).length === 0) {
    errors.storeCodes = PROMOTION_VALIDATION_MESSAGES.APPLICABILITY_STORE_REQUIRED;
  }
  if (values.storeMode === StoreSelectionMode.GROUP && normalizeCodes(values.storeGroupCodes).length === 0) {
    errors.storeGroupCodes = PROMOTION_VALIDATION_MESSAGES.APPLICABILITY_STORE_GROUP_REQUIRED;
  }

  const selected = new Set(normalizeCodes(values.storeCodes));
  const overlapping = normalizeCodes(values.excludedStoreCodes).find((code) => selected.has(code));
  if (overlapping) {
    errors.excludedStoreCodes = PROMOTION_VALIDATION_MESSAGES.APPLICABILITY_STORE_OVERLAP;
  }

  return errors;
};

const buildStoreScope = (values: PromotionApplicabilityFormValues): PromotionStoreApplicabilityV1 => {
  // Never emit a narrowed store scope on a promotion that does not run at POS —
  // the backend rejects that combination, so drop it here instead of surfacing
  // a validation error the author cannot act on.
  if (!isPosChannelSelected(values)) {
    return { type: StoreSelectionMode.ALL, version: '1.0.0' };
  }

  const excludedStoreCodes = normalizeCodes(values.excludedStoreCodes);

  if (values.storeMode === StoreSelectionMode.MANUAL) {
    return {
      type: StoreSelectionMode.MANUAL,
      version: '1.0.0',
      storeCodes: normalizeCodes(values.storeCodes),
    };
  }
  if (values.storeMode === StoreSelectionMode.GROUP) {
    return {
      type: StoreSelectionMode.GROUP,
      version: '1.0.0',
      storeGroupCodes: normalizeCodes(values.storeGroupCodes),
      ...(excludedStoreCodes.length > 0 ? { excludedStoreCodes } : {}),
    };
  }
  return {
    type: StoreSelectionMode.ALL,
    version: '1.0.0',
    ...(excludedStoreCodes.length > 0 ? { excludedStoreCodes } : {}),
  };
};

export const buildPromotionApplicabilityConfig = (values: PromotionApplicabilityFormValues): PromotionApplicabilityConfigV1 => ({
  type: PROMOTION_APPLICABILITY_CONFIG_TYPE,
  version: '1.0.0',
  channels: [...new Set(values.channels)].sort(),
  stores: buildStoreScope(values),
});

export const mapApplicabilityToFormValues = (config: PromotionApplicabilityConfigV1 | null | undefined): PromotionApplicabilityFormValues => {
  if (!config) return { ...LEGACY_APPLICABILITY_FALLBACK_VALUES };

  const channels = [...config.channels];
  const stores = config.stores;

  // Keep the same key order as createDefaultPromotionApplicabilityFormValues.
  if (stores.type === StoreSelectionMode.MANUAL) {
    return { channels, storeMode: StoreSelectionMode.MANUAL, storeCodes: [...stores.storeCodes], storeGroupCodes: [], excludedStoreCodes: [] };
  }
  if (stores.type === StoreSelectionMode.GROUP) {
    return {
      channels,
      storeMode: StoreSelectionMode.GROUP,
      storeCodes: [],
      storeGroupCodes: [...stores.storeGroupCodes],
      excludedStoreCodes: [...(stores.excludedStoreCodes ?? [])],
    };
  }
  return { channels, storeMode: StoreSelectionMode.ALL, storeCodes: [], storeGroupCodes: [], excludedStoreCodes: [...(stores.excludedStoreCodes ?? [])] };
};

/**
 * Compares what would actually be persisted, so channel/store-code ordering, casing and
 * store fields ignored when POS is off do not make an already-saved form look dirty.
 */
export const arePromotionApplicabilityFormValuesEqual = (left: PromotionApplicabilityFormValues, right: PromotionApplicabilityFormValues): boolean =>
  JSON.stringify(buildPromotionApplicabilityConfig(left)) === JSON.stringify(buildPromotionApplicabilityConfig(right));

export const isPromotionApplicabilityFormSavable = (values: PromotionApplicabilityFormValues): boolean => Object.keys(validatePromotionApplicabilityForm(values)).length === 0;
