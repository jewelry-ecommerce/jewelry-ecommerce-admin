import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ComponentKind,
  ConditionAuthoringMode,
  PromotionDraftSchemaType,
  type PromotionDraftStatus,
  VoucherCodeStatus,
  promotionApi,
  type PromotionDraftBenefitComponentDto,
  type PromotionDraftConditionComponentDto,
  type PromotionDraftSchema,
  type PromotionDraftSchemaComponentsResponseDto,
} from '../../../../apis';
import { getErrorMessage } from '../../../../common/utils';
import {
  buildSchemaHeaderCreatePayload,
  buildSchemaHeaderUpdatePayload,
  createSchemaHeaderDraft,
  resolveConditionModeFromSchemaType,
  validateSchemaHeaderDraft,
} from '../promotion-schema-header-drawer';
import type { SchemaHeaderDraft, SchemaHeaderParentWindow } from '../promotion-schema-header-drawer/promotion-schema-header-drawer.types';
import { useSchemaComponentAuthoring, type UseSchemaComponentAuthoringResult } from '../promotion-schema-component-config-drawer/use-schema-component-authoring.hook';
import { useVoucherCodeAuthoring, type UseVoucherCodeAuthoringResult } from '../promotion-voucher-code-card/use-voucher-code-authoring.hook';
import type { SchemaCreationWizardCloseOptions, SchemaCreationWizardReviewData, SchemaCreationWizardSavedSteps, SchemaCreationWizardStepId } from './promotion-schema-creation-wizard.types';

interface UseSchemaCreationWizardParams {
  open: boolean;
  draftId: string;
  draftStatus: PromotionDraftStatus;
  parentWindow?: SchemaHeaderParentWindow | null;
  editSchema?: PromotionDraftSchema | null;
  initialComponents?: PromotionDraftSchemaComponentsResponseDto | null;
  onClose: (options?: SchemaCreationWizardCloseOptions) => void;
  onFinished: (schemaId: string) => Promise<void> | void;
  onError?: (message: string) => void;
}

interface UseSchemaCreationWizardResult {
  activeStepId: SchemaCreationWizardStepId;
  activeStepIndex: number;
  closeConfirmOpen: boolean;
  conditionAuthoring: UseSchemaComponentAuthoringResult;
  benefitAuthoring: UseSchemaComponentAuthoringResult;
  finishError: string | null;
  finishing: boolean;
  goBack: () => void;
  goToStep: (stepId: SchemaCreationWizardStepId) => void;
  openReviewStep: () => Promise<void>;
  headerDraft: SchemaHeaderDraft;
  headerSaveError: string | null;
  headerSaving: boolean;
  headerValidation: ReturnType<typeof validateSchemaHeaderDraft>;
  isVoucherSchema: boolean;
  primaryActionDisabled: boolean;
  primaryActionLabel: string;
  saveAndClose: () => Promise<void>;
  saveAndCloseDisabled: boolean;
  requestClose: () => void;
  reviewData: SchemaCreationWizardReviewData | null;
  reviewError: string | null;
  reviewLoading: boolean;
  savedSteps: SchemaCreationWizardSavedSteps;
  schemaId: string | null;
  schemaTypeLocked: boolean;
  setHeaderDraft: Dispatch<SetStateAction<SchemaHeaderDraft>>;
  setShowHeaderValidation: Dispatch<SetStateAction<boolean>>;
  showHeaderValidation: boolean;
  stepOrder: readonly SchemaCreationWizardStepId[];
  submitCurrentStep: () => Promise<void>;
  voucherAuthoring: UseVoucherCodeAuthoringResult;
  cancelClose: () => void;
  confirmClose: () => void;
}

const createEmptySchemaComponents = (): PromotionDraftSchemaComponentsResponseDto => ({
  condition: null,
  benefit: null,
  items: [],
});

const createSavedSteps = (): SchemaCreationWizardSavedSteps => ({
  header: false,
  voucher: false,
  condition: false,
  benefit: false,
});

const schemaTypeSkipsConditionStep = (schemaType: PromotionDraftSchemaType | ''): boolean => resolveConditionModeFromSchemaType(schemaType) === ConditionAuthoringMode.IMPLICIT_ALWAYS;

const getStepOrder = (schemaType: PromotionDraftSchemaType | '', skipConditionStep: boolean): readonly SchemaCreationWizardStepId[] => {
  if (!schemaType) return ['header'];
  const tail: SchemaCreationWizardStepId[] = skipConditionStep ? ['benefit', 'review'] : ['condition', 'benefit', 'review'];
  return schemaType === PromotionDraftSchemaType.VOUCHER ? ['header', 'voucher', ...tail] : ['header', ...tail];
};

const withConditionComponent = (current: PromotionDraftSchemaComponentsResponseDto, component: PromotionDraftConditionComponentDto): PromotionDraftSchemaComponentsResponseDto => ({
  ...current,
  condition: component,
  items: [...current.items.filter((item) => item.componentKind !== ComponentKind.CONDITION), component],
});

const withBenefitComponent = (current: PromotionDraftSchemaComponentsResponseDto, component: PromotionDraftBenefitComponentDto): PromotionDraftSchemaComponentsResponseDto => ({
  ...current,
  benefit: component,
  items: [...current.items.filter((item) => item.componentKind !== ComponentKind.BENEFIT), component],
});

const resetWizardForCreate = () => ({
  activeStepId: 'header' as SchemaCreationWizardStepId,
  headerDraft: createSchemaHeaderDraft(null),
  savedSteps: createSavedSteps(),
  schemaId: null,
  lockedSchemaType: null,
  savedComponents: createEmptySchemaComponents(),
});

export const useSchemaCreationWizard = ({
  open,
  draftId,
  draftStatus,
  parentWindow,
  editSchema,
  initialComponents,
  onClose,
  onFinished,
  onError,
}: UseSchemaCreationWizardParams): UseSchemaCreationWizardResult => {
  const [activeStepId, setActiveStepId] = useState<SchemaCreationWizardStepId>('header');
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [headerDraft, setHeaderDraft] = useState<SchemaHeaderDraft>(() => createSchemaHeaderDraft(null));
  const [showHeaderValidation, setShowHeaderValidation] = useState(false);
  const [headerSaveError, setHeaderSaveError] = useState<string | null>(null);
  const [headerSaving, setHeaderSaving] = useState(false);
  const [savedSteps, setSavedSteps] = useState<SchemaCreationWizardSavedSteps>(() => createSavedSteps());
  const [schemaId, setSchemaId] = useState<string | null>(null);
  const [lockedSchemaType, setLockedSchemaType] = useState<PromotionDraftSchemaType | null>(null);
  const [savedComponents, setSavedComponents] = useState<PromotionDraftSchemaComponentsResponseDto>(() => createEmptySchemaComponents());
  const [reviewData, setReviewData] = useState<SchemaCreationWizardReviewData | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [savingAndClose, setSavingAndClose] = useState(false);
  const [completed, setCompleted] = useState(false);

  const notifyError = useCallback(
    (message: string) => {
      onError?.(message);
    },
    [onError],
  );

  useEffect(() => {
    if (!open) return;
    setCloseConfirmOpen(false);
    setShowHeaderValidation(false);
    setHeaderSaveError(null);
    setHeaderSaving(false);
    setReviewData(null);
    setReviewLoading(false);
    setReviewError(null);
    setFinishing(false);
    setFinishError(null);
    setSavingAndClose(false);
    setCompleted(false);

    if (editSchema) {
      const components = initialComponents ?? createEmptySchemaComponents();
      const hasSavedBenefit = Boolean(components.benefit);
      setActiveStepId(hasSavedBenefit ? 'review' : 'header');
      setHeaderDraft(createSchemaHeaderDraft(editSchema));
      setSavedSteps({
        header: true,
        voucher: false,
        condition: Boolean(components.condition),
        benefit: hasSavedBenefit,
      });
      setSchemaId(editSchema.id);
      setLockedSchemaType(editSchema.schemaType);
      setSavedComponents(components);
      setReviewData(
        hasSavedBenefit
          ? {
              schema: editSchema,
              components,
              voucherCode: null,
            }
          : null,
      );
      return;
    }

    const createState = resetWizardForCreate();
    setActiveStepId(createState.activeStepId);
    setHeaderDraft(createState.headerDraft);
    setSavedSteps(createState.savedSteps);
    setSchemaId(createState.schemaId);
    setLockedSchemaType(createState.lockedSchemaType);
    setSavedComponents(createState.savedComponents);
  }, [editSchema, initialComponents, open]);

  const effectiveSchemaType = lockedSchemaType ?? headerDraft.schemaType;
  const isVoucherSchema = effectiveSchemaType === PromotionDraftSchemaType.VOUCHER;

  const conditionAuthoring = useSchemaComponentAuthoring({
    open: open && Boolean(schemaId),
    componentKind: ComponentKind.CONDITION,
    draftId,
    schemaId: schemaId ?? '',
    initialComponents: savedComponents,
    onError: notifyError,
  });

  const benefitAuthoring = useSchemaComponentAuthoring({
    open: open && Boolean(schemaId),
    componentKind: ComponentKind.BENEFIT,
    draftId,
    schemaId: schemaId ?? '',
    initialComponents: savedComponents,
    onError: notifyError,
  });

  const supportsImplicitAlways = useMemo(() => conditionAuthoring.options.some((option) => option.supportsImplicitAlways), [conditionAuthoring.options]);

  const hasConditionStep = useMemo(() => {
    if (schemaId && conditionAuthoring.options.length > 0) return !supportsImplicitAlways;
    return !schemaTypeSkipsConditionStep(effectiveSchemaType);
  }, [conditionAuthoring.options.length, effectiveSchemaType, schemaId, supportsImplicitAlways]);

  const stepOrder = useMemo(() => getStepOrder(effectiveSchemaType, !hasConditionStep), [effectiveSchemaType, hasConditionStep]);
  const activeStepIndex = stepOrder.indexOf(activeStepId);
  const headerValidation = useMemo(() => validateSchemaHeaderDraft(headerDraft, parentWindow), [headerDraft, parentWindow]);

  useEffect(() => {
    if (activeStepIndex >= 0) return;
    setActiveStepId('header');
  }, [activeStepIndex]);

  const voucherAuthoring = useVoucherCodeAuthoring({
    draftId,
    schemaId: schemaId ?? '',
    draftStatus,
    enabled: open && Boolean(schemaId) && isVoucherSchema,
    onError: notifyError,
  });

  useEffect(() => {
    if (!isVoucherSchema) return;
    if (!voucherAuthoring.voucherCode) return;
    setSavedSteps((current) => (current.voucher ? current : { ...current, voucher: true }));
  }, [isVoucherSchema, voucherAuthoring.voucherCode]);

  const loadReviewData = useCallback(async (): Promise<boolean> => {
    if (!schemaId) return false;

    setReviewLoading(true);
    setReviewError(null);
    try {
      const [schema, componentsResponse, voucherResponse] = await Promise.all([
        promotionApi.getPromotionDraftSchema(draftId, schemaId),
        promotionApi.getPromotionDraftSchemaComponents(draftId, schemaId),
        isVoucherSchema ? promotionApi.getPromotionDraftVoucherCodes(draftId, schemaId) : Promise.resolve(null),
      ]);

      const voucherCode = voucherResponse ? (voucherResponse.items.find((item) => item.status === VoucherCodeStatus.ACTIVE) ?? voucherResponse.items[0] ?? null) : null;

      setSavedComponents(componentsResponse);
      setReviewData({
        schema,
        components: componentsResponse,
        voucherCode,
      });
      setSavedSteps((current) => ({
        ...current,
        header: true,
        voucher: isVoucherSchema ? Boolean(voucherCode) : false,
        condition: Boolean(componentsResponse.condition),
        benefit: Boolean(componentsResponse.benefit),
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error) || 'Không thể tải dữ liệu kiểm tra.';
      setReviewError(message);
      notifyError(message);
      return false;
    } finally {
      setReviewLoading(false);
    }
  }, [draftId, isVoucherSchema, notifyError, schemaId]);

  useEffect(() => {
    if (!open || activeStepId !== 'review' || !schemaId || !savedSteps.benefit) return;
    if (!isVoucherSchema) return;
    if (reviewData?.voucherCode) return;
    void loadReviewData();
  }, [activeStepId, isVoucherSchema, loadReviewData, open, reviewData?.voucherCode, savedSteps.benefit, schemaId]);

  const goToStep = useCallback((stepId: SchemaCreationWizardStepId) => {
    setActiveStepId(stepId);
    setHeaderSaveError(null);
    setReviewError(null);
    setFinishError(null);
  }, []);

  const openReviewStep = useCallback(async (): Promise<void> => {
    if (!savedSteps.benefit) return;
    if (!reviewData) {
      const loaded = await loadReviewData();
      if (!loaded) return;
    }
    goToStep('review');
  }, [goToStep, loadReviewData, reviewData, savedSteps.benefit]);

  const goBack = useCallback(() => {
    if (activeStepIndex <= 0) return;
    goToStep(stepOrder[activeStepIndex - 1]);
  }, [activeStepIndex, goToStep, stepOrder]);

  const requestClose = useCallback(() => {
    if (headerSaving || reviewLoading || finishing || conditionAuthoring.saving || benefitAuthoring.saving || voucherAuthoring.saving) return;
    if (schemaId && !completed) {
      setCloseConfirmOpen(true);
      return;
    }
    onClose();
  }, [benefitAuthoring.saving, completed, conditionAuthoring.saving, finishing, headerSaving, onClose, reviewLoading, schemaId, voucherAuthoring.saving]);

  const cancelClose = useCallback(() => {
    setCloseConfirmOpen(false);
  }, []);

  const confirmClose = useCallback(() => {
    setCloseConfirmOpen(false);
    onClose(schemaId ? { refreshSchemas: true, schemaId } : undefined);
  }, [onClose, schemaId]);

  const syncImplicitConditionAfterHeader = useCallback(
    async (nextSchemaId: string) => {
      const schemaType = lockedSchemaType ?? headerDraft.schemaType;
      if (resolveConditionModeFromSchemaType(schemaType) !== ConditionAuthoringMode.IMPLICIT_ALWAYS) return;

      try {
        const components = await promotionApi.getPromotionDraftSchemaComponents(draftId, nextSchemaId);
        setSavedComponents(components);
        setSavedSteps((current) => ({ ...current, condition: Boolean(components.condition) }));
      } catch {
        setSavedSteps((current) => ({ ...current, condition: true }));
      }
    },
    [draftId, headerDraft.schemaType, lockedSchemaType],
  );

  const persistHeaderStep = useCallback(async (): Promise<string | null> => {
    if (!headerValidation.isValid) {
      setShowHeaderValidation(true);
      return null;
    }

    setHeaderSaveError(null);
    setHeaderSaving(true);
    try {
      if (schemaId) {
        await promotionApi.updatePromotionDraftSchema(draftId, schemaId, buildSchemaHeaderUpdatePayload(headerDraft));
        await syncImplicitConditionAfterHeader(schemaId);
        return schemaId;
      }

      const createdSchema = await promotionApi.createPromotionDraftSchema(draftId, buildSchemaHeaderCreatePayload(headerDraft));
      setSchemaId(createdSchema.id);
      setLockedSchemaType(createdSchema.schemaType);
      await syncImplicitConditionAfterHeader(createdSchema.id);
      return createdSchema.id;
    } catch (error) {
      const message = getErrorMessage(error) || 'Không thể lưu thông tin chung của hình thức khuyến mãi.';
      setHeaderSaveError(message);
      notifyError(message);
      return null;
    } finally {
      setHeaderSaving(false);
    }
  }, [draftId, headerDraft, headerValidation.isValid, notifyError, schemaId, syncImplicitConditionAfterHeader]);

  const submitHeaderStep = useCallback(async (): Promise<void> => {
    const nextSchemaId = await persistHeaderStep();
    if (!nextSchemaId) return;

    setSavedSteps((current) => ({ ...current, header: true }));
    const nextSchemaType = lockedSchemaType ?? headerDraft.schemaType;
    if (nextSchemaType === PromotionDraftSchemaType.VOUCHER) {
      goToStep('voucher');
      return;
    }
    goToStep(schemaTypeSkipsConditionStep(nextSchemaType) ? 'benefit' : 'condition');
  }, [goToStep, headerDraft.schemaType, lockedSchemaType, persistHeaderStep]);

  const persistVoucherStep = useCallback(async (): Promise<boolean> => {
    const shouldPersistVoucher = voucherAuthoring.isDirty || voucherAuthoring.requiresSave || !voucherAuthoring.voucherCode;
    if (shouldPersistVoucher) {
      const savedVoucherCode = await voucherAuthoring.saveVoucherCode();
      if (!savedVoucherCode) return false;
    } else if (!voucherAuthoring.voucherCode) {
      return false;
    }

    setSavedSteps((current) => ({ ...current, voucher: true }));
    return true;
  }, [voucherAuthoring]);

  const submitVoucherStep = useCallback(async (): Promise<void> => {
    const saved = await persistVoucherStep();
    if (!saved) return;
    goToStep(hasConditionStep ? 'condition' : 'benefit');
  }, [goToStep, hasConditionStep, persistVoucherStep]);

  const persistConditionStep = useCallback(async (): Promise<PromotionDraftConditionComponentDto | null> => {
    const savedCondition = await conditionAuthoring.save();
    if (!savedCondition || savedCondition.componentKind !== ComponentKind.CONDITION) return null;

    setSavedComponents((current) => withConditionComponent(current, savedCondition));
    setSavedSteps((current) => ({ ...current, condition: true }));
    return savedCondition;
  }, [conditionAuthoring]);

  const submitConditionStep = useCallback(async (): Promise<void> => {
    const savedCondition = await persistConditionStep();
    if (!savedCondition) return;
    goToStep('benefit');
  }, [goToStep, persistConditionStep]);

  const persistBenefitStep = useCallback(async (): Promise<PromotionDraftBenefitComponentDto | null> => {
    const savedBenefit = await benefitAuthoring.save();
    if (!savedBenefit || savedBenefit.componentKind !== ComponentKind.BENEFIT) return null;

    setSavedComponents((current) => withBenefitComponent(current, savedBenefit));
    setSavedSteps((current) => ({ ...current, benefit: true }));
    return savedBenefit;
  }, [benefitAuthoring]);

  const submitBenefitStep = useCallback(async (): Promise<void> => {
    const savedBenefit = await persistBenefitStep();
    if (!savedBenefit) return;

    const loaded = await loadReviewData();
    if (!loaded) return;
    goToStep('review');
  }, [goToStep, loadReviewData, persistBenefitStep]);

  const saveAndClose = useCallback(async (): Promise<void> => {
    if (savingAndClose || activeStepId === 'review') return;

    setSavingAndClose(true);
    try {
      let currentSchemaId = schemaId;

      if (activeStepId === 'header') {
        const nextSchemaId = await persistHeaderStep();
        if (!nextSchemaId) return;
        setSavedSteps((current) => ({ ...current, header: true }));
        currentSchemaId = nextSchemaId;
      } else if (activeStepId === 'voucher') {
        if (!currentSchemaId) return;
        const saved = await persistVoucherStep();
        if (!saved) return;
      } else if (activeStepId === 'condition') {
        if (!currentSchemaId) return;
        const saved = await persistConditionStep();
        if (!saved) return;
      } else if (activeStepId === 'benefit') {
        if (!currentSchemaId) return;
        const saved = await persistBenefitStep();
        if (!saved) return;
      }

      if (!currentSchemaId) return;
      onClose({ refreshSchemas: true, schemaId: currentSchemaId });
    } finally {
      setSavingAndClose(false);
    }
  }, [activeStepId, onClose, persistBenefitStep, persistConditionStep, persistHeaderStep, persistVoucherStep, savingAndClose, schemaId]);

  const submitReviewStep = useCallback(async (): Promise<void> => {
    if (!schemaId) return;

    setFinishError(null);
    setFinishing(true);
    try {
      await promotionApi.updatePromotionDraftSchema(draftId, schemaId, buildSchemaHeaderUpdatePayload(headerDraft));
      setCompleted(true);
      await onFinished(schemaId);
    } catch (error) {
      const message = getErrorMessage(error) || 'Không thể hoàn tất cấu hình hình thức khuyến mãi.';
      setFinishError(message);
      notifyError(message);
    } finally {
      setFinishing(false);
    }
  }, [draftId, headerDraft, notifyError, onFinished, schemaId]);

  const submitCurrentStep = useCallback(async () => {
    if (activeStepId === 'header') {
      await submitHeaderStep();
      return;
    }
    if (activeStepId === 'voucher') {
      await submitVoucherStep();
      return;
    }
    if (activeStepId === 'condition') {
      await submitConditionStep();
      return;
    }
    if (activeStepId === 'benefit') {
      await submitBenefitStep();
      return;
    }
    await submitReviewStep();
  }, [activeStepId, submitBenefitStep, submitConditionStep, submitHeaderStep, submitReviewStep, submitVoucherStep]);

  const hasVoucherCodeInput = useMemo(() => {
    const code = voucherAuthoring.itemValues.code;
    return typeof code === 'string' && Boolean(code.trim());
  }, [voucherAuthoring.itemValues.code]);

  const primaryActionDisabled = useMemo(() => {
    if (activeStepId === 'header') return headerSaving;
    if (activeStepId === 'voucher') return voucherAuthoring.loading || voucherAuthoring.saving || voucherAuthoring.imageUploading || (!voucherAuthoring.voucherCode && !hasVoucherCodeInput);
    if (activeStepId === 'condition') return conditionAuthoring.optionsLoading || conditionAuthoring.saving || !conditionAuthoring.selectedOption;
    if (activeStepId === 'benefit') return benefitAuthoring.optionsLoading || benefitAuthoring.saving || !benefitAuthoring.selectedOption;
    return reviewLoading || finishing || !reviewData;
  }, [
    activeStepId,
    benefitAuthoring.optionsLoading,
    benefitAuthoring.saving,
    benefitAuthoring.selectedOption,
    conditionAuthoring.optionsLoading,
    conditionAuthoring.saving,
    conditionAuthoring.selectedOption,
    finishing,
    hasVoucherCodeInput,
    headerSaving,
    reviewData,
    reviewLoading,
    voucherAuthoring.imageUploading,
    voucherAuthoring.loading,
    voucherAuthoring.saving,
    voucherAuthoring.voucherCode,
  ]);

  const primaryActionLabel = activeStepId === 'review' ? 'Xác nhận' : 'Tiếp tục';

  const saveAndCloseDisabled = useMemo(() => {
    if (savingAndClose || reviewLoading || finishing) return true;
    if (activeStepId === 'header') return headerSaving;
    if (activeStepId === 'voucher') {
      return voucherAuthoring.loading || voucherAuthoring.saving || voucherAuthoring.imageUploading || (!voucherAuthoring.voucherCode && !hasVoucherCodeInput);
    }
    if (activeStepId === 'condition') return conditionAuthoring.optionsLoading || conditionAuthoring.saving || !conditionAuthoring.selectedOption;
    if (activeStepId === 'benefit') return benefitAuthoring.optionsLoading || benefitAuthoring.saving || !benefitAuthoring.selectedOption;
    return true;
  }, [
    activeStepId,
    benefitAuthoring.optionsLoading,
    benefitAuthoring.saving,
    benefitAuthoring.selectedOption,
    conditionAuthoring.optionsLoading,
    conditionAuthoring.saving,
    conditionAuthoring.selectedOption,
    finishing,
    hasVoucherCodeInput,
    headerSaving,
    reviewLoading,
    savingAndClose,
    voucherAuthoring.imageUploading,
    voucherAuthoring.loading,
    voucherAuthoring.saving,
    voucherAuthoring.voucherCode,
  ]);

  return {
    activeStepId,
    activeStepIndex,
    benefitAuthoring,
    cancelClose,
    closeConfirmOpen,
    conditionAuthoring,
    confirmClose,
    finishError,
    finishing,
    goBack,
    goToStep,
    openReviewStep,
    headerDraft,
    headerSaveError,
    headerSaving,
    headerValidation,
    isVoucherSchema,
    primaryActionDisabled,
    primaryActionLabel,
    requestClose,
    reviewData,
    reviewError,
    reviewLoading,
    saveAndClose,
    saveAndCloseDisabled,
    savedSteps,
    schemaId,
    schemaTypeLocked: Boolean(schemaId),
    setHeaderDraft,
    setShowHeaderValidation,
    showHeaderValidation,
    stepOrder,
    submitCurrentStep,
    voucherAuthoring,
  };
};
