import React, { type ReactNode, useCallback, useMemo } from 'react';
import { Box, Divider, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { ComponentKind, type PromotionDraftSchema, type PromotionDraftSchemaComponentsResponseDto, type PromotionDraftStatus } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../components/button';
import { DialogConfirmComponent } from '../../../../components/dialog';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { StepperComponent, type StepperComponentItem } from '../../../../components/stepper/stepper.component';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { PROMOTION_SCHEMA_SCOPE_LABEL, PROMOTION_SCHEMA_STATUS_TAG, PROMOTION_SCHEMA_TYPE_LABEL, formatPromotionCostSources } from '../../promotion.constant';
import { promotionListButtonPermission } from '../../promotion-permission.constants';
import { formatBenefitSummary, formatConditionSummary, SchemaComponentAuthoringPanel } from '../promotion-schema-component-config-drawer';
import { SchemaHeaderForm, type SchemaHeaderParentWindow } from '../promotion-schema-header-drawer';
import { VoucherCodeAuthoringPanel } from '../promotion-voucher-code-card';
import { formatVoucherCodeDateTime, getVoucherCodeStatusTag } from '../promotion-voucher-code-card/voucher-code-authoring.utils';
import { StackRowAlignCenterJustBetween, StackRowJustBetween, StackRowAlignCenterJustEnd } from '../../../../components/styled';
import { useSchemaCreationWizard } from './use-schema-creation-wizard.hook';
import type { SchemaCreationWizardCloseOptions, SchemaCreationWizardSavedSteps, SchemaCreationWizardStepId } from './promotion-schema-creation-wizard.types';

interface SchemaCreationWizardProps {
  open: boolean;
  draftId: string;
  draftStatus: PromotionDraftStatus;
  parentWindow?: SchemaHeaderParentWindow | null;
  editSchema?: PromotionDraftSchema | null;
  initialComponents?: PromotionDraftSchemaComponentsResponseDto | null;
  onClose: (options?: SchemaCreationWizardCloseOptions) => void;
  onFinished: (schemaId: string) => Promise<void> | void;
}

const STEP_META: Record<SchemaCreationWizardStepId, { title: string }> = {
  header: {
    title: 'Thông tin chung',
  },
  voucher: {
    title: 'Mã voucher',
  },
  condition: {
    title: 'Điều kiện',
  },
  benefit: {
    title: 'Ưu đãi',
  },
  review: {
    title: 'Kiểm tra',
  },
};

const renderStepOptional = (saved: boolean) => {
  if (!saved) return null;
  return <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#039855', display: 'block', mt: 0.25 }}>Đã lưu</Typography>;
};

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <StackRowJustBetween gap={1}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#667085', minWidth: 140 }}>{label}</Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#101828', textAlign: 'right', overflowWrap: 'anywhere' }}>{value}</Typography>
  </StackRowJustBetween>
);

const ReviewSection = ({ title, actionLabel, iconOnly = false, summary, onEdit }: { title: string; actionLabel: string; iconOnly?: boolean; summary: ReactNode; onEdit: () => void }) => (
  <Stack>
    <StackRowAlignCenterJustBetween gap={1}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>{title}</Typography>
      <Box>
        {iconOnly ? (
          <IconButton size="small" onClick={onEdit} aria-label={actionLabel} sx={{ borderRadius: '6px', border: '1px solid #D0D5DD', color: '#344054' }}>
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        ) : (
          <CustomButton fullWidth={false} variant="outline" onClick={onEdit} sx={{ textTransform: 'none', color: '#344054', borderColor: '#D0D5DD' }}>
            {actionLabel}
          </CustomButton>
        )}
      </Box>
    </StackRowAlignCenterJustBetween>
    {summary}
  </Stack>
);

const ReviewImage = ({ imageUrl }: { imageUrl?: string | null }) => {
  if (!imageUrl) return null;
  return <Box component="img" src={imageUrl} alt="Ảnh voucher" sx={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: '8px', border: '1px solid #EAECF0', bgcolor: '#F9FAFB' }} />;
};

const formatSchemaWindow = (startsAt?: string | null, endsAt?: string | null): string => {
  if (!startsAt && !endsAt) return 'Kế thừa thời gian chương trình';
  const startLabel = startsAt ? new Date(startsAt).toLocaleString('vi-VN') : 'Mở đầu theo chương trình';
  const endLabel = endsAt ? new Date(endsAt).toLocaleString('vi-VN') : 'Kết thúc theo chương trình';
  return `${startLabel} - ${endLabel}`;
};

const isWizardStepCompleted = (stepId: SchemaCreationWizardStepId, savedSteps: SchemaCreationWizardSavedSteps): boolean => {
  if (stepId === 'header') return savedSteps.header;
  if (stepId === 'voucher') return savedSteps.voucher;
  if (stepId === 'condition') return savedSteps.condition;
  if (stepId === 'benefit' || stepId === 'review') return savedSteps.benefit;
  return false;
};

export const SchemaCreationWizard = ({ open, draftId, draftStatus, parentWindow, editSchema, initialComponents, onClose, onFinished }: SchemaCreationWizardProps) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSnackbar } = useSnackbar();

  const notifyError = useCallback(
    (message: string) => {
      showSnackbar({ type: SnackbarType.ERROR, message });
    },
    [showSnackbar],
  );

  const wizard = useSchemaCreationWizard({
    open,
    draftId,
    draftStatus,
    parentWindow,
    editSchema,
    initialComponents,
    onClose,
    onFinished,
    onError: notifyError,
  });

  const stepperItems = useMemo<readonly StepperComponentItem[]>(
    () =>
      wizard.stepOrder.map((stepId) => {
        const saved = isWizardStepCompleted(stepId, wizard.savedSteps);

        return {
          id: stepId,
          label: STEP_META[stepId].title,
          optional: renderStepOptional(saved),
          completed: saved,
        };
      }),
    [wizard.savedSteps, wizard.stepOrder],
  );

  const stepMeta = STEP_META[wizard.activeStepId];
  const hasConditionStep = wizard.stepOrder.includes('condition');
  const handleStepClick = (stepIndex: number) => {
    const stepId = wizard.stepOrder[stepIndex];
    if (!stepId) return;
    if (stepId === 'review') {
      if (wizard.savedSteps.benefit) void wizard.openReviewStep();
      return;
    }
    if (stepIndex < wizard.activeStepIndex || stepId === 'header') {
      wizard.goToStep(stepId);
      return;
    }
    const canOpenSavedStep = (stepId === 'voucher' && wizard.savedSteps.voucher) || (stepId === 'condition' && wizard.savedSteps.condition) || (stepId === 'benefit' && wizard.savedSteps.benefit);
    if (canOpenSavedStep) wizard.goToStep(stepId);
  };

  return (
    <React.Fragment>
      <DrawerComponent
        open={open}
        onClose={wizard.requestClose}
        title={editSchema ? PROMOTION_SCHEMA_TYPE_LABEL[editSchema.schemaType] : 'Thêm hình thức khuyến mãi'}
        subtitle="Cấu hình thông tin hình thức khuyến mãi. Điều kiện và quyền lợi cấu hình ở bước sau."
        width={{ xs: '100%', sm: 760 }}
        footer={
          <StackRowAlignCenterJustEnd sx={{ gap: 1.5 }}>
            {wizard.activeStepId !== 'review' ? (
              <CustomButton
                variant="outline"
                fullWidth={false}
                disabled={wizard.saveAndCloseDisabled}
                onClick={() => void wizard.saveAndClose()}
                sx={{ textTransform: 'none', color: '#344054', borderColor: '#D0D5DD', minWidth: 112 }}
              >
                Lưu
              </CustomButton>
            ) : null}
            <CustomButton
              fullWidth={false}
              disabled={wizard.primaryActionDisabled}
              onClick={() => void wizard.submitCurrentStep()}
              sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none', minWidth: 220, '&:hover': { bgcolor: '#1D2939', boxShadow: 'none' } }}
              {...promotionListButtonPermission('edit', wizard.primaryActionLabel, 'api_promotion_draft_update')}
            >
              {wizard.primaryActionLabel}
            </CustomButton>
          </StackRowAlignCenterJustEnd>
        }
      >
        <Stack sx={{ minHeight: '100%', bgcolor: '#FFFFFF' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #EAECF0', bgcolor: '#FCFCFD' }}>
            <StepperComponent
              activeStep={wizard.activeStepIndex}
              orientation={isSmallScreen ? 'vertical' : 'horizontal'}
              alternativeLabel={!isSmallScreen}
              steps={stepperItems}
              nonLinear
              onStepClick={handleStepClick}
            />
          </Box>
          <Stack sx={{ px: 2 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>{stepMeta.title}</Typography>
            {wizard.activeStepId === 'header' ? (
              <React.Fragment>
                <Box sx={{ border: '1px solid #EAECF0', borderRadius: '12px', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
                  <SchemaHeaderForm
                    draft={wizard.headerDraft}
                    validation={wizard.headerValidation}
                    showValidation={wizard.showHeaderValidation}
                    schemaTypeDisabled={wizard.schemaTypeLocked}
                    parentWindow={parentWindow}
                    onDraftChange={(patch) => {
                      wizard.setHeaderDraft((current) => ({ ...current, ...patch }));
                      wizard.setShowHeaderValidation(false);
                    }}
                  />
                </Box>
                {wizard.headerSaveError ? (
                  <Box sx={{ border: '1px solid #FECDD3', bgcolor: '#FEF2F2', borderRadius: '12px', px: 1.5, py: 1.25 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B42318' }}>{wizard.headerSaveError}</Typography>
                  </Box>
                ) : null}
              </React.Fragment>
            ) : null}

            {wizard.activeStepId === 'voucher' ? (
              <VoucherCodeAuthoringPanel
                authoring={wizard.voucherAuthoring.authoring}
                voucherCode={wizard.voucherAuthoring.voucherCode}
                itemValues={wizard.voucherAuthoring.itemValues}
                collectionValues={wizard.voucherAuthoring.collectionValues}
                itemUiSchema={wizard.voucherAuthoring.itemUiSchema}
                collectionUiSchema={wizard.voucherAuthoring.collectionUiSchema}
                validationErrors={wizard.voucherAuthoring.validationErrors}
                imageError={wizard.voucherAuthoring.imageError}
                loading={wizard.voucherAuthoring.loading}
                loadError={wizard.voucherAuthoring.loadError}
                saving={wizard.voucherAuthoring.saving}
                imageUploading={wizard.voucherAuthoring.imageUploading}
                isEditable={wizard.voucherAuthoring.isEditable}
                canAdd={wizard.voucherAuthoring.canAdd}
                canRemove={wizard.voucherAuthoring.canRemove}
                onItemValuesChange={wizard.voucherAuthoring.updateItemValues}
                onCollectionValuesChange={wizard.voucherAuthoring.updateCollectionValues}
                onPickImage={wizard.voucherAuthoring.uploadVoucherImage}
                onImageFileReject={wizard.voucherAuthoring.rejectVoucherImageFile}
                onClearImage={wizard.voucherAuthoring.clearInputImageUrl}
                onRetryLoad={() => void wizard.voucherAuthoring.reloadVoucherCode()}
              />
            ) : null}

            {wizard.activeStepId === 'condition' ? (
              <Box sx={{ border: '1px solid #EAECF0', borderRadius: '12px', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
                <SchemaComponentAuthoringPanel
                  componentKind={ComponentKind.CONDITION}
                  options={wizard.conditionAuthoring.options}
                  optionsLoading={wizard.conditionAuthoring.optionsLoading}
                  optionsError={wizard.conditionAuthoring.optionsError}
                  selectedOptionIndex={wizard.conditionAuthoring.selectedOptionIndex}
                  selectedOption={wizard.conditionAuthoring.selectedOption}
                  formValues={wizard.conditionAuthoring.formValues}
                  validationErrors={wizard.conditionAuthoring.validationErrors}
                  saveError={wizard.conditionAuthoring.saveError}
                  onSelectOption={wizard.conditionAuthoring.selectOption}
                  onFormValuesChange={wizard.conditionAuthoring.updateFormValues}
                  onRetryOptions={wizard.conditionAuthoring.retryOptions}
                />
              </Box>
            ) : null}

            {wizard.activeStepId === 'benefit' ? (
              <Box sx={{ border: '1px solid #EAECF0', borderRadius: '12px', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
                <SchemaComponentAuthoringPanel
                  componentKind={ComponentKind.BENEFIT}
                  options={wizard.benefitAuthoring.options}
                  optionsLoading={wizard.benefitAuthoring.optionsLoading}
                  optionsError={wizard.benefitAuthoring.optionsError}
                  selectedOptionIndex={wizard.benefitAuthoring.selectedOptionIndex}
                  selectedOption={wizard.benefitAuthoring.selectedOption}
                  formValues={wizard.benefitAuthoring.formValues}
                  validationErrors={wizard.benefitAuthoring.validationErrors}
                  saveError={wizard.benefitAuthoring.saveError}
                  onSelectOption={wizard.benefitAuthoring.selectOption}
                  onFormValuesChange={wizard.benefitAuthoring.updateFormValues}
                  onRetryOptions={wizard.benefitAuthoring.retryOptions}
                />
              </Box>
            ) : null}

            {wizard.activeStepId === 'review' && wizard.reviewData ? (
              <Box sx={{ border: '1px solid #EAECF0', borderRadius: '12px', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                <Stack sx={{ p: 3 }}>
                  <ReviewSection
                    title="Thông tin chung"
                    actionLabel="Sửa thông tin chung"
                    onEdit={() => wizard.goToStep('header')}
                    summary={
                      <Stack>
                        <ReviewRow label="Tên hình thức KM" value={wizard.reviewData.schema.name} />
                        <ReviewRow label="Mô tả" value={wizard.reviewData.schema.description || '-'} />
                        <ReviewRow label="Loại ưu đãi" value={PROMOTION_SCHEMA_TYPE_LABEL[wizard.reviewData.schema.schemaType] ?? wizard.reviewData.schema.schemaType} />
                        <ReviewRow label="Nguồn chi phí" value={formatPromotionCostSources(wizard.reviewData.schema.costSources ?? wizard.headerDraft.costSources)} />
                        <ReviewRow label="Phạm vi" value={PROMOTION_SCHEMA_SCOPE_LABEL[wizard.reviewData.schema.scope] ?? wizard.reviewData.schema.scope} />
                        <ReviewRow label="Hiệu lực" value={formatSchemaWindow(wizard.reviewData.schema.schemaStartsAt, wizard.reviewData.schema.schemaEndsAt)} />
                        <StackRowJustBetween gap={1}>
                          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#667085', minWidth: 140 }}>Trạng thái dự kiến</Typography>
                          <Box>
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.5,
                                borderRadius: '6px',
                                fontSize: 12,
                                fontWeight: 600,
                                bgcolor: PROMOTION_SCHEMA_STATUS_TAG[wizard.headerDraft.status].bg,
                                color: PROMOTION_SCHEMA_STATUS_TAG[wizard.headerDraft.status].color,
                              }}
                            >
                              {PROMOTION_SCHEMA_STATUS_TAG[wizard.headerDraft.status].text}
                            </Box>
                          </Box>
                        </StackRowJustBetween>
                      </Stack>
                    }
                  />

                  {wizard.isVoucherSchema ? (
                    <>
                      <Divider />
                      <ReviewSection
                        title="Mã voucher"
                        actionLabel="Sửa mã voucher"
                        onEdit={() => wizard.goToStep('voucher')}
                        summary={
                          wizard.reviewData.voucherCode ? (
                            <Stack>
                              <ReviewImage imageUrl={wizard.reviewData.voucherCode.imageUrl} />
                              <ReviewRow label="Mã voucher" value={wizard.reviewData.voucherCode.code} />
                              <ReviewRow
                                label="Hiển thị"
                                value={
                                  wizard.reviewData.voucherCode.visibilityDistributionPolicy
                                    ? wizard.voucherAuthoring.formatVisibilityLabel(wizard.reviewData.voucherCode.visibilityDistributionPolicy.visibilityType)
                                    : '-'
                                }
                              />
                              {wizard.reviewData.voucherCode.visibilityDistributionPolicy?.visibilityType &&
                              wizard.voucherAuthoring.channelsRequiredVisibilityTypes.includes(wizard.reviewData.voucherCode.visibilityDistributionPolicy.visibilityType) ? (
                                <ReviewRow
                                  label="Kênh phân phối"
                                  value={wizard.voucherAuthoring.formatChannelsLabel(wizard.reviewData.voucherCode.visibilityDistributionPolicy.distributionChannels)}
                                />
                              ) : null}
                              <ReviewRow label="Trạng thái" value={getVoucherCodeStatusTag(wizard.reviewData.voucherCode.status).text} />
                              <ReviewRow label="Cập nhật" value={formatVoucherCodeDateTime(wizard.reviewData.voucherCode.updatedAt)} />
                              <ReviewRow
                                label="Thời gian phát hành"
                                value={`${formatVoucherCodeDateTime(wizard.reviewData.voucherCode.issuanceStartsAt)} - ${formatVoucherCodeDateTime(wizard.reviewData.voucherCode.issuanceEndsAt)}`}
                              />
                              <ReviewRow
                                label="Thời gian sử dụng"
                                value={`${formatVoucherCodeDateTime(wizard.reviewData.voucherCode.usageStartsAt)} - ${formatVoucherCodeDateTime(wizard.reviewData.voucherCode.usageEndsAt)}`}
                              />
                            </Stack>
                          ) : (
                            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B42318' }}>Chưa có mã voucher cho hình thức khuyến mãi này.</Typography>
                          )
                        }
                      />
                    </>
                  ) : null}

                  {hasConditionStep ? (
                    <>
                      <Divider />
                      <ReviewSection
                        title="Điều kiện"
                        actionLabel="Sửa điều kiện"
                        onEdit={() => wizard.goToStep('condition')}
                        summary={<Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>{formatConditionSummary(wizard.reviewData.components.condition)}</Typography>}
                      />
                    </>
                  ) : null}

                  <Divider />
                  <ReviewSection
                    title="Ưu đãi"
                    actionLabel="Sửa ưu đãi"
                    onEdit={() => wizard.goToStep('benefit')}
                    summary={<Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>{formatBenefitSummary(wizard.reviewData.components.benefit)}</Typography>}
                  />
                </Stack>
              </Box>
            ) : null}

            {wizard.reviewError || wizard.finishError ? (
              <Box sx={{ border: '1px solid #FECDD3', bgcolor: '#FEF2F2', borderRadius: '12px', px: 1.5, py: 1.25 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B42318' }}>{wizard.finishError ?? wizard.reviewError}</Typography>
              </Box>
            ) : null}
          </Stack>
        </Stack>
      </DrawerComponent>

      <DialogConfirmComponent
        open={wizard.closeConfirmOpen}
        onClose={wizard.cancelClose}
        title="Đóng trình hướng dẫn tạo hình thức khuyến mãi"
        highlight={{
          tone: 'info',
          title: 'Hình thức khuyến mãi đã được lưu ở trạng thái vô hiệu',
          description: 'Nếu đóng bây giờ, hệ thống sẽ không tự động bật hình thức khuyến mãi hoặc xóa dữ liệu đã lưu. Bạn vẫn có thể hoàn thiện sau trong màn chi tiết chương trình.',
        }}
        cancelLabel="Quay lại"
        confirmLabel="Đóng và giữ bản nháp"
        confirmVariant="primary"
        onCancel={wizard.cancelClose}
        onConfirm={wizard.confirmClose}
      />
    </React.Fragment>
  );
};
