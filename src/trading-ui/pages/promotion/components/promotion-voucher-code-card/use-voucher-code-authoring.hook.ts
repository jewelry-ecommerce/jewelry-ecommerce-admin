import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MediaVisibility,
  promotionApi,
  type PromotionDraftStatus,
  type CollectionAuthoringV2,
  type DraftVoucherCodeResponseDto,
  type PromotionAuthoringSchemaDefinition,
  type PromotionAuthoringUiSchema,
  type UpsertDraftVoucherCodeDto,
  type VoucherCodeStatus,
  type VoucherVisibilityDistributionPolicyDto,
} from '../../../../apis';
import { getErrorMessage } from '../../../../common/utils';
import { uploadSingleImage } from '../../../../common/utils/image-upload.utils';
import { isEditablePromotionDraftStatus } from '../../promotion.constant';
import { getAuthoringSaveErrorMessage, validateVisibleValues } from '../promotion-schema-component-config-drawer/schema-component-config-form.utils';
import {
  formatDistributionChannels,
  formatEnumLabel,
  getDistributionChannelOptionsFromAuthoring,
  getVisibilityOptionsFromAuthoring,
  getVisibilityTypeFromItemValues,
  getVisibilityTypesRequiringChannels,
  normalizeItemValuesChannelsByVisibility,
  normalizeVoucherCodeInput,
  withHiddenDistributionChannelsUiSchema,
} from './voucher-code-authoring.utils';

interface UseVoucherCodeAuthoringParams {
  draftId: string;
  schemaId: string;
  draftStatus: PromotionDraftStatus;
  enabled?: boolean;
  onSaved?: (voucherCode: DraftVoucherCodeResponseDto) => void;
  onError?: (message: string) => void;
}

export interface UseVoucherCodeAuthoringResult {
  authoring: CollectionAuthoringV2 | null;
  authoringLoading: boolean;
  voucherCode: DraftVoucherCodeResponseDto | null;
  loading: boolean;
  loadError: string | null;
  itemValues: Record<string, unknown>;
  collectionValues: Record<string, unknown>;
  itemSchema: PromotionAuthoringSchemaDefinition | null;
  collectionSchema: PromotionAuthoringSchemaDefinition | null;
  itemUiSchema: PromotionAuthoringUiSchema | null;
  collectionUiSchema: PromotionAuthoringUiSchema | null;
  validationErrors: Record<string, string>;
  imageError: string | null;
  saving: boolean;
  imageUploading: boolean;
  isEditable: boolean;
  requiresSave: boolean;
  isDirty: boolean;
  canAdd: boolean;
  canRemove: boolean;
  updateItemValues: (nextValues: Record<string, unknown>) => void;
  updateCollectionValues: (nextValues: Record<string, unknown>) => void;
  uploadVoucherImage: (file: File) => Promise<void>;
  rejectVoucherImageFile: (reason: string) => void;
  clearInputImageUrl: () => void;
  reloadVoucherCode: () => void;
  saveVoucherCode: () => Promise<DraftVoucherCodeResponseDto | null>;
  formatVisibilityLabel: (value: string | null | undefined) => string;
  formatChannelsLabel: (channels: readonly string[]) => string;
  channelsRequiredVisibilityTypes: string[];
}

const valuesEqual = (left: Record<string, unknown>, right: Record<string, unknown>): boolean => JSON.stringify(left) === JSON.stringify(right);

const asOptionalIsoDateTime = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return typeof value === 'string' ? value : undefined;
};

const resolveItemValues = (authoring: CollectionAuthoringV2): Record<string, unknown> => {
  if (authoring.items[0]?.values) return { ...authoring.items[0].values };
  return { ...authoring.item.defaultValues };
};

const resolveCollectionValues = (authoring: CollectionAuthoringV2): Record<string, unknown> => ({
  ...authoring.collection.values,
});

const mapAuthoringItemToVoucherCode = (schemaId: string, collectionValues: Record<string, unknown>, item: CollectionAuthoringV2['items'][number]): DraftVoucherCodeResponseDto => {
  const imageUrl = typeof collectionValues.imageUrl === 'string' ? collectionValues.imageUrl : '';
  const code = typeof item.values.code === 'string' ? item.values.code : '';
  const status = item.values.status as VoucherCodeStatus;
  const visibilityDistributionPolicy = (item.values.visibilityDistributionPolicy as VoucherVisibilityDistributionPolicyDto | null | undefined) ?? null;

  return {
    id: item.id,
    tenantCode: '',
    promotionDraftSchemaId: schemaId,
    code,
    normalizedCode: code,
    status,
    imageUrl: imageUrl || null,
    issuanceStartsAt: typeof collectionValues.issuanceStartsAt === 'string' ? collectionValues.issuanceStartsAt : undefined,
    issuanceEndsAt: typeof collectionValues.issuanceEndsAt === 'string' ? collectionValues.issuanceEndsAt : undefined,
    usageStartsAt: typeof collectionValues.usageStartsAt === 'string' ? collectionValues.usageStartsAt : undefined,
    usageEndsAt: typeof collectionValues.usageEndsAt === 'string' ? collectionValues.usageEndsAt : undefined,
    visibilityDistributionPolicy,
    createdAt: '',
    updatedAt: '',
  };
};

const buildUpsertPayload = (itemValues: Record<string, unknown>, collectionValues: Record<string, unknown>, typesRequiringChannels: readonly string[]): UpsertDraftVoucherCodeDto | null => {
  const normalizedItemValues = normalizeItemValuesChannelsByVisibility(itemValues, typesRequiringChannels);
  const rawCode = typeof normalizedItemValues.code === 'string' ? normalizedItemValues.code : '';
  const code = normalizeVoucherCodeInput(rawCode);
  if (!code) return null;

  const imageUrlRaw = collectionValues.imageUrl;
  const imageUrl = typeof imageUrlRaw === 'string' && imageUrlRaw.trim() ? imageUrlRaw.trim() : '';
  const status = normalizedItemValues.status as VoucherCodeStatus | undefined;
  const visibilityDistributionPolicy = normalizedItemValues.visibilityDistributionPolicy as VoucherVisibilityDistributionPolicyDto | null | undefined;

  return {
    code,
    status,
    imageUrl,
    issuanceStartsAt: asOptionalIsoDateTime(collectionValues.issuanceStartsAt),
    issuanceEndsAt: asOptionalIsoDateTime(collectionValues.issuanceEndsAt),
    usageStartsAt: asOptionalIsoDateTime(collectionValues.usageStartsAt),
    usageEndsAt: asOptionalIsoDateTime(collectionValues.usageEndsAt),
    visibilityDistributionPolicy: visibilityDistributionPolicy ?? null,
  };
};

export const useVoucherCodeAuthoring = ({ draftId, schemaId, draftStatus, enabled = true, onSaved, onError }: UseVoucherCodeAuthoringParams): UseVoucherCodeAuthoringResult => {
  const [authoring, setAuthoring] = useState<CollectionAuthoringV2 | null>(null);
  const [authoringLoading, setAuthoringLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState<DraftVoucherCodeResponseDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [itemValues, setItemValues] = useState<Record<string, unknown>>({});
  const [collectionValues, setCollectionValues] = useState<Record<string, unknown>>({});
  const [hydratedItemValues, setHydratedItemValues] = useState<Record<string, unknown>>({});
  const [hydratedCollectionValues, setHydratedCollectionValues] = useState<Record<string, unknown>>({});
  const [requiresSave, setRequiresSave] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const itemSchema = useMemo(() => authoring?.item.schema ?? null, [authoring]);
  const collectionSchema = useMemo(() => authoring?.collection.schema ?? null, [authoring]);
  const collectionUiSchema = useMemo(() => authoring?.collection.uiSchema ?? null, [authoring]);
  const visibilityOptions = useMemo(() => getVisibilityOptionsFromAuthoring(authoring), [authoring]);
  const distributionChannelOptions = useMemo(() => getDistributionChannelOptionsFromAuthoring(authoring), [authoring]);
  const channelsRequiredVisibilityTypes = useMemo(() => getVisibilityTypesRequiringChannels(authoring?.item.schema ?? null), [authoring]);
  const itemUiSchema = useMemo(() => {
    const base = authoring?.item.uiSchema ?? null;
    return withHiddenDistributionChannelsUiSchema(base, getVisibilityTypeFromItemValues(itemValues), channelsRequiredVisibilityTypes) as PromotionAuthoringUiSchema | null;
  }, [authoring?.item.uiSchema, channelsRequiredVisibilityTypes, itemValues]);

  const isEditable = isEditablePromotionDraftStatus(draftStatus) && (authoring?.capabilities.canEdit ?? true);
  const canAdd = authoring?.capabilities.canAdd ?? false;
  const canRemove = authoring?.capabilities.canRemove ?? false;
  const isDirty = useMemo(
    () => !valuesEqual(itemValues, hydratedItemValues) || !valuesEqual(collectionValues, hydratedCollectionValues),
    [collectionValues, hydratedCollectionValues, hydratedItemValues, itemValues],
  );

  const notifyError = useCallback(
    (message: string) => {
      onError?.(message);
    },
    [onError],
  );

  const hydrateFromAuthoring = useCallback(
    (result: CollectionAuthoringV2) => {
      const typesRequiringChannels = getVisibilityTypesRequiringChannels(result.item.schema);
      const nextItemValues = normalizeItemValuesChannelsByVisibility(resolveItemValues(result), typesRequiringChannels);
      const nextCollectionValues = resolveCollectionValues(result);

      setAuthoring(result);
      setItemValues(nextItemValues);
      setCollectionValues(nextCollectionValues);
      setHydratedItemValues(nextItemValues);
      setHydratedCollectionValues(nextCollectionValues);
      setRequiresSave(Boolean(result.items[0]?.requiresSave));
      setValidationErrors({});
      setImageError(null);

      if (result.items[0]) {
        setVoucherCode(mapAuthoringItemToVoucherCode(schemaId, nextCollectionValues, result.items[0]));
        return;
      }
      setVoucherCode(null);
    },
    [schemaId],
  );

  const reloadVoucherCode = useCallback(async () => {
    if (!enabled) return;
    setAuthoringLoading(true);
    setLoadError(null);
    setImageError(null);
    try {
      const result = await promotionApi.getVoucherCodeAuthoring(draftId, schemaId);
      hydrateFromAuthoring(result);
    } catch (error) {
      const message = getErrorMessage(error);
      setLoadError(message);
      notifyError(message);
      setAuthoring(null);
      setVoucherCode(null);
      setItemValues({});
      setCollectionValues({});
      setHydratedItemValues({});
      setHydratedCollectionValues({});
      setRequiresSave(false);
    } finally {
      setAuthoringLoading(false);
    }
  }, [draftId, enabled, hydrateFromAuthoring, notifyError, schemaId]);

  useEffect(() => {
    if (!enabled) return;
    void reloadVoucherCode();
  }, [enabled, reloadVoucherCode]);

  const updateItemValues = useCallback(
    (nextValues: Record<string, unknown>) => {
      const normalized = normalizeItemValuesChannelsByVisibility(nextValues, channelsRequiredVisibilityTypes);
      setItemValues(normalized);
      setValidationErrors({});
    },
    [channelsRequiredVisibilityTypes],
  );

  const updateCollectionValues = useCallback((nextValues: Record<string, unknown>) => {
    setCollectionValues(nextValues);
    setImageError(null);
  }, []);

  const clearInputImageUrl = useCallback(() => {
    setCollectionValues((current) => ({ ...current, imageUrl: '' }));
    setImageError(null);
  }, []);

  const rejectVoucherImageFile = useCallback(
    (reason: string) => {
      setImageError(reason);
      notifyError(reason);
    },
    [notifyError],
  );

  const uploadVoucherImage = useCallback(
    async (file: File): Promise<void> => {
      setImageUploading(true);
      setImageError(null);
      try {
        const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
        const publicUrl = asset.publicUrl?.trim();
        if (!publicUrl) {
          const message = 'Không lấy được URL công khai của ảnh voucher.';
          setImageError(message);
          notifyError(message);
          return;
        }
        setCollectionValues((current) => ({ ...current, imageUrl: publicUrl }));
      } catch (error) {
        const message = getErrorMessage(error) || 'Không thể upload ảnh voucher.';
        setImageError(message);
        notifyError(message);
      } finally {
        setImageUploading(false);
      }
    },
    [notifyError],
  );

  const saveVoucherCode = useCallback(async (): Promise<DraftVoucherCodeResponseDto | null> => {
    const normalizedItemValues = normalizeItemValuesChannelsByVisibility(
      {
        ...itemValues,
        code: typeof itemValues.code === 'string' ? normalizeVoucherCodeInput(itemValues.code) : itemValues.code,
      },
      channelsRequiredVisibilityTypes,
    );

    if (itemSchema) {
      const errors = validateVisibleValues(normalizedItemValues, itemSchema);
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) return null;
    }

    if (collectionSchema) {
      const collectionErrors = validateVisibleValues(collectionValues, collectionSchema);
      if (Object.keys(collectionErrors).length > 0) {
        setValidationErrors((current) => ({ ...current, ...collectionErrors }));
        return null;
      }
    }

    const payload = buildUpsertPayload(normalizedItemValues, collectionValues, channelsRequiredVisibilityTypes);
    if (!payload) {
      setValidationErrors({ code: 'Mã voucher không được để trống.' });
      return null;
    }

    setSaving(true);
    try {
      const response = await promotionApi.upsertPromotionDraftVoucherCode(draftId, schemaId, payload);
      setVoucherCode(response);
      const nextItemValues = normalizeItemValuesChannelsByVisibility(
        {
          code: response.code,
          status: response.status,
          visibilityDistributionPolicy: response.visibilityDistributionPolicy ?? normalizedItemValues.visibilityDistributionPolicy,
        },
        channelsRequiredVisibilityTypes,
      );
      const nextCollectionValues: Record<string, unknown> = {
        imageUrl: response.imageUrl ?? '',
        issuanceStartsAt: response.issuanceStartsAt ?? collectionValues.issuanceStartsAt ?? '',
        issuanceEndsAt: response.issuanceEndsAt ?? collectionValues.issuanceEndsAt ?? '',
        usageStartsAt: response.usageStartsAt ?? collectionValues.usageStartsAt ?? '',
        usageEndsAt: response.usageEndsAt ?? collectionValues.usageEndsAt ?? '',
      };
      setItemValues(nextItemValues);
      setCollectionValues(nextCollectionValues);
      setHydratedItemValues(nextItemValues);
      setHydratedCollectionValues(nextCollectionValues);
      setRequiresSave(false);
      setValidationErrors({});
      onSaved?.(response);
      return response;
    } catch (error) {
      const message = getAuthoringSaveErrorMessage(error, 'Không thể lưu mã voucher.');
      const detailField = (error as { detail?: { field?: string } } | null)?.detail?.field;

      if (typeof detailField === 'string' && detailField) {
        setValidationErrors({ [detailField]: message });
      } else {
        setValidationErrors({ code: message });
      }
      notifyError(message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [channelsRequiredVisibilityTypes, collectionSchema, collectionValues, draftId, itemSchema, itemValues, notifyError, onSaved, schemaId]);

  const formatVisibilityLabel = useCallback((value: string | null | undefined) => formatEnumLabel(value, visibilityOptions), [visibilityOptions]);

  const formatChannelsLabel = useCallback((channels: readonly string[]) => formatDistributionChannels(channels as never, distributionChannelOptions), [distributionChannelOptions]);

  return {
    authoring,
    authoringLoading,
    voucherCode,
    loading: authoringLoading,
    loadError,
    itemValues,
    collectionValues,
    itemSchema,
    collectionSchema,
    itemUiSchema,
    collectionUiSchema,
    validationErrors,
    imageError,
    saving,
    imageUploading,
    isEditable,
    requiresSave,
    isDirty,
    canAdd,
    canRemove,
    updateItemValues,
    updateCollectionValues,
    uploadVoucherImage,
    rejectVoucherImageFile,
    clearInputImageUrl,
    reloadVoucherCode,
    saveVoucherCode,
    formatVisibilityLabel,
    formatChannelsLabel,
    channelsRequiredVisibilityTypes,
  };
};
