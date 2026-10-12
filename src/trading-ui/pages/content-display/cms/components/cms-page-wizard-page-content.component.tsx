import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import type { Page } from '../../../../apis';

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { StepperComponent } from '../../../../components/stepper/stepper.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import type { PageButtonPermissionProps } from '../../../../permissions/page-button-permission.utils';
import type { CmsPageFormValues, CmsPageWizardMode } from '../cms-page.interface';
import { CMS_PAGE_WIZARD_CONTENT_MAX_WIDTH } from '../cms-page.constants';
import { useCmsPageWizard } from '../hooks/use-cms-page-wizard.hook';
import { CmsPageWizardHeader } from './cms-page-wizard-header.component';
import { CmsPageWizardStepBasic } from './cms-page-wizard-step-basic.component';

import { CmsPageWizardStepBlocks } from './cms-page-wizard-step-blocks.component';
import { CmsPageWizardStepPublish } from './cms-page-wizard-step-publish.component';
import { CmsPageWizardDialogPreview } from './cms-page-wizard-dialog-preview.component';
import { CmsPageWizardDialogBlockType } from './cms-page-wizard-dialog-block-type.component';
import { CmsPageWizardDialogPlacementBuilder } from './cms-page-wizard-dialog-placement-builder.component';


export interface CmsPageWizardPageContentProps {
  mode: CmsPageWizardMode;
  headerTitle: string;
  wizardSteps: ReadonlyArray<{ id: string; title: string; subtitle: string }>;
  form: UseFormReturn<CmsPageFormValues>;
  pageId?: string;
  pageDetail?: Page;
  pageLoading?: boolean;
  onEdit?: () => void;
  editPermission?: PageButtonPermissionProps;
}

export const CmsPageWizardPageContent: React.FC<CmsPageWizardPageContentProps> = ({ mode, headerTitle, wizardSteps, form, pageId, pageDetail, pageLoading, onEdit, editPermission }) => {
  const navigate = useNavigate();
  const viewMode = mode === 'view';
  const [loadingBlockType, setLoadingBlockType] = useState(false);
  const [placementTargetBlockId, setPlacementTargetBlockId] = useState<string | null>(null);
  const { control, handleSubmit, setValue } = form;
  const nameWatch = form.watch('name') ?? '';
  const slugWatch = form.watch('slug') ?? '';
  const localeWatch = form.watch('locale') ?? '';

  const wizard = useCmsPageWizard({
    mode,
    pageId,
    pageDetail,
    handleSubmit,
    onHydrateForm: (values) => form.reset(values),
  });

  const subtitle = nameWatch.trim() || '';
  const placementTargetBlock = wizard.blocks.find((block) => block.clientId === placementTargetBlockId) ?? null;
  const placementTargetCode = typeof placementTargetBlock?.config?.placementCode === 'string' ? placementTargetBlock.config.placementCode : undefined;
  const canJumpSteps = (mode === 'edit' || viewMode) && Boolean(pageDetail);

  const stepperItems = wizardSteps.map((s) => ({
    id: s.id,
    completed: canJumpSteps || (Boolean(wizard.pageId) && wizardSteps.indexOf(s) < wizard.activeStep),
    label: s.title,
    optional: <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3', display: 'block', mt: 0.25 }}>{s.subtitle}</Typography>,
  }));

  if (pageLoading) {
    return <LoadingComponent />;
  }

  return (
    <Stack sx={{ minHeight: '100%', bgcolor: '#F3F4F6' }}>
      <CmsPageWizardHeader
        title={headerTitle}
        subtitle={subtitle}
        onBack={() => navigate(ROUTE_PATH.CMS_PAGE_LIST)}
        showPreviewAction={!viewMode && wizard.activeStep === 2}
        onPreview={() => wizard.setPreviewOpen(true)}
        viewMode={viewMode}
        onEdit={onEdit}
        editPermission={editPermission}
      />

      <Box sx={{ px: { xs: 2, md: 3 }, maxWidth: CMS_PAGE_WIZARD_CONTENT_MAX_WIDTH, mx: 'auto', width: '100%' }}>
        <StepperComponent
          activeStep={wizard.activeStep}
          alternativeLabel
          steps={stepperItems}
          nonLinear={canJumpSteps}
          markOtherStepsCompleted={canJumpSteps}
          onStepClick={canJumpSteps ? wizard.goToStep : undefined}
        />
      </Box>

      <Box
        sx={{
          maxWidth: CMS_PAGE_WIZARD_CONTENT_MAX_WIDTH,
          mx: 'auto',
          width: '100%',
          px: { xs: 2, md: 3 },
          pb: 4,
        }}
      >
        {wizard.activeStep === 0 ? (
          <CmsPageWizardStepBasic
            control={control}
            setValue={setValue}
            onCancel={() => navigate(ROUTE_PATH.CMS_PAGE_LIST)}
            onSave={viewMode ? () => undefined : wizard.onSaveStep0}
            onContinue={viewMode ? () => wizard.setActiveStep(1) : wizard.onContinueStep0}
            loadingSave={wizard.loadingSave}
            loadingContinue={wizard.loadingContinue}
            autoSyncSlugFromName={mode === 'create'}
            cancelLabel={viewMode ? 'Quay lại' : 'Hủy'}
            viewMode={viewMode}
          />
        ) : null}

        {wizard.activeStep === 1 ? (
          <CmsPageWizardStepBlocks
            blocks={wizard.blocks}
            blockCatalog={wizard.blockCatalog}
            blockValidationErrors={wizard.blockValidationErrors}
            hasBlockTypes={wizard.hasBlockTypes}
            sensors={wizard.sensors}
            onDragEnd={wizard.handleDragEnd}
            onAddBlock={wizard.addBlock}
            onOpenCreateBlockType={() => wizard.setCreateBlockTypeOpen(true)}
            onToggleBlock={wizard.toggleBlock}
            onConfigChange={wizard.setBlockConfig}
            onQuickCreatePlacement={(clientId) => setPlacementTargetBlockId(clientId)}
            onRemoveBlock={wizard.removeBlock}
            onBack={() => wizard.setActiveStep(0)}
            onSave={viewMode ? () => undefined : wizard.onSaveStep2}
            onContinue={viewMode ? () => wizard.setActiveStep(2) : wizard.onContinueStep2}
            loadingSave={wizard.loadingSave}
            loadingContinue={wizard.loadingContinue}
            viewMode={viewMode}
          />
        ) : null}

        {wizard.activeStep === 2 ? (
          <CmsPageWizardStepPublish
            name={nameWatch}
            slug={slugWatch}
            locale={localeWatch}
            targetDevice={wizard.targetDevice}
            blocks={wizard.blocks}
            isPublishedVersion={wizard.isPublishedVersion}
            onBack={() => wizard.setActiveStep(1)}
            onSaveDraft={viewMode ? () => undefined : wizard.onSaveDraft}
            onPublish={viewMode ? () => undefined : wizard.onPublish}
            loadingPublish={wizard.loadingPublish}
            viewMode={viewMode}
          />
        ) : null}
      </Box>

      {!viewMode ? (
        <React.Fragment>
          <CmsPageWizardDialogBlockType
            open={wizard.createBlockTypeOpen}
            loading={loadingBlockType}
            onClose={() => wizard.setCreateBlockTypeOpen(false)}
            onSubmit={async (dto) => {
              setLoadingBlockType(true);
              try {
                await wizard.createBlockType(dto);
              } finally {
                setLoadingBlockType(false);
              }
            }}
          />

          <CmsPageWizardDialogPlacementBuilder
            open={Boolean(placementTargetBlockId)}
            onClose={() => setPlacementTargetBlockId(null)}
            initialPlacementCode={placementTargetCode}
            onCreatePlacementDraft={wizard.createBannerPlacementDraft}
            onUsePlacementCode={(placementCode) => {
              if (!placementTargetBlockId) return;
              wizard.mergeBlockConfig(placementTargetBlockId, { placementCode });
              setPlacementTargetBlockId(null);
            }}
          />

          <CmsPageWizardDialogPreview open={wizard.previewOpen} onClose={() => wizard.setPreviewOpen(false)} name={nameWatch} slug={slugWatch} blocks={wizard.blocks} />


        </React.Fragment>
      ) : null}
    </Stack>
  );
};
