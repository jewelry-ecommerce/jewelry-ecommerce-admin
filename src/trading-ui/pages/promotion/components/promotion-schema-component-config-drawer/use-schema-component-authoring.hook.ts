import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ComponentKind,
  promotionApi,
  type PromotionDraftBenefitComponentDto,
  type PromotionDraftConditionComponentDto,
  type PromotionDraftSchemaComponentsResponseDto,
  type SingleObjectDefinitionV2,
} from '../../../../apis';
import { getErrorMessage } from '../../../../common/utils';
import type { SchemaComponentDrawerKind, SchemaComponentValidationErrors } from './promotion-schema-component-config-drawer.types';
import { getAuthoringSaveErrorMessage, getInitialAuthoringState, hasNoUserFields, normalizeAuthoringValuesForSave, validateVisibleValues } from './schema-component-config-form.utils';

export interface UseSchemaComponentAuthoringParams {
  open: boolean;
  componentKind: SchemaComponentDrawerKind;
  draftId: string;
  schemaId: string;
  initialComponents?: PromotionDraftSchemaComponentsResponseDto | null;
  onError?: (message: string) => void;
}

export interface UseSchemaComponentAuthoringResult {
  options: SingleObjectDefinitionV2[];
  optionsLoading: boolean;
  optionsError: string | null;
  selectedOptionIndex: number;
  selectedOption: SingleObjectDefinitionV2 | null;
  formValues: Record<string, unknown>;
  validationErrors: SchemaComponentValidationErrors;
  saveError: string | null;
  saving: boolean;
  hasVisibleFields: boolean;
  retryOptions: () => void;
  selectOption: (index: number) => void;
  updateFormValues: (nextValues: Record<string, unknown>) => void;
  save: () => Promise<PromotionDraftConditionComponentDto | PromotionDraftBenefitComponentDto | null>;
}

export const useSchemaComponentAuthoring = ({ open, componentKind, draftId, schemaId, initialComponents, onError }: UseSchemaComponentAuthoringParams): UseSchemaComponentAuthoringResult => {
  const [options, setOptions] = useState<SingleObjectDefinitionV2[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(-1);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<SchemaComponentValidationErrors>({});

  const isConditionMode = componentKind === ComponentKind.CONDITION;

  const notifyError = useCallback(
    (message: string) => {
      onError?.(message);
    },
    [onError],
  );

  const loadOptions = useCallback(async () => {
    if (!draftId || !schemaId) return;

    setOptionsLoading(true);
    setOptionsError(null);
    setSelectedOptionIndex(-1);
    setFormValues({});
    setValidationErrors({});
    setSaveError(null);

    try {
      const response = isConditionMode ? await promotionApi.getConditionConfigOptions(draftId, schemaId) : await promotionApi.getBenefitConfigOptions(draftId, schemaId);
      setOptions(response);
    } catch (error) {
      const message = getErrorMessage(error);
      setOptionsError(message);
      setOptions([]);
      notifyError(message);
    } finally {
      setOptionsLoading(false);
    }
  }, [draftId, isConditionMode, notifyError, schemaId]);

  useEffect(() => {
    if (!open) return;
    void loadOptions();
  }, [loadOptions, open]);

  useEffect(() => {
    if (!open || options.length === 0 || selectedOptionIndex !== -1) return;
    const initialComponent = isConditionMode ? initialComponents?.condition : initialComponents?.benefit;
    const initialState = getInitialAuthoringState(options, initialComponent);
    setSelectedOptionIndex(initialState.selectedOptionIndex);
    setFormValues(initialState.formValues);
  }, [initialComponents, isConditionMode, open, options, selectedOptionIndex]);

  const selectedOption = selectedOptionIndex >= 0 && selectedOptionIndex < options.length ? options[selectedOptionIndex] : null;

  const retryOptions = useCallback(() => {
    void loadOptions();
  }, [loadOptions]);

  const selectOption = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      const initialState = getInitialAuthoringState([option], null);
      setSelectedOptionIndex(index);
      setFormValues(initialState.formValues);
      setValidationErrors({});
      setSaveError(null);
    },
    [options],
  );

  const updateFormValues = useCallback((nextValues: Record<string, unknown>) => {
    setFormValues(nextValues);
    setValidationErrors({});
    setSaveError(null);
  }, []);

  const save = useCallback(async (): Promise<PromotionDraftConditionComponentDto | PromotionDraftBenefitComponentDto | null> => {
    if (!selectedOption) return null;

    const errors = validateVisibleValues(formValues, selectedOption.configSchema);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return null;

    setSaveError(null);
    setSaving(true);
    try {
      const body = {
        configType: selectedOption.configType,
        configVersion: selectedOption.configVersion,
        values: normalizeAuthoringValuesForSave(selectedOption, formValues, { schemaId }),
      };
      const result = isConditionMode ? await promotionApi.upsertSchemaComponentCondition(draftId, schemaId, body) : await promotionApi.upsertSchemaComponentBenefit(draftId, schemaId, body);
      return result;
    } catch (error) {
      const message = getAuthoringSaveErrorMessage(error, 'Không thể lưu cấu hình.');
      setSaveError(message);
      notifyError(message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [draftId, formValues, isConditionMode, notifyError, schemaId, selectedOption]);

  const hasVisibleFields = useMemo(() => (selectedOption ? !hasNoUserFields(selectedOption.configSchema) : false), [selectedOption]);

  return {
    options,
    optionsLoading,
    optionsError,
    selectedOptionIndex,
    selectedOption,
    formValues,
    validationErrors,
    saveError,
    saving,
    hasVisibleFields,
    retryOptions,
    selectOption,
    updateFormValues,
    save,
  };
};
