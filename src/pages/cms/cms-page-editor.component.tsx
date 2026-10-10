import { Alert, Box, Stack, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { useState } from "react";
import { useCmsBlockValidation } from "./use-cms-block-validation.hook";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  CmsDemoBlockType,
  CmsDemoStatus,
  type CmsDemoPage,
  type CmsDemoBlock,
  type CmsDemoConfig,
} from "@/apis/cms-demo/cms-demo.interface";
import { CMS_BLOCK_LABELS, newCmsBlock } from "./cms-demo.constants";
import { CmsPageWizardStepBasic } from "./source/cms-page-wizard-step-basic.component";
import { CmsPageWizardStepBlocks } from "./source/cms-page-wizard-step-blocks.component";
import { CmsPageWizardStepPublish } from "./source/cms-page-wizard-step-publish.component";
import { CMS_PAGE_WIZARD_CONTENT_MAX_WIDTH, CMS_PAGE_WIZARD_STEPS, cmsPageFormSchema } from "./source/cms-source-form.constants";
import type { CmsPageFormValues } from "./source/cms-source-form.interface";
import type { CmsPageBlockCatalogItem } from "./source/cms-source-block.interface";
import { CustomButton } from "@/components/button/custom-button.component";
import { CMS_DEMO_CLIENT_URL } from "@/apis/cms-demo/cms-demo.api";
interface Props {
  initial: CmsDemoPage;
  saving: boolean;
  message: string;
  onSave: (page: CmsDemoPage, status: CmsDemoStatus) => Promise<CmsDemoPage | undefined>;
}
function formValues(page: CmsDemoPage): CmsPageFormValues {
  return {
    name: page.name,
    slug: page.slug,
    locale: page.locale || "vi-VN",
    isActive: page.isActive !== false,
    seoTitle: page.seo.title,
    seoDescription: page.seo.description,
    seoKeywords: page.seo.keywords || "",
    canonicalUrl: page.seo.canonicalUrl || "",
    seoImageUrl: page.seo.imageUrl || "",
  };
}
function applyForm(page: CmsDemoPage, values: CmsPageFormValues): CmsDemoPage {
  return {
    ...page,
    name: values.name,
    slug: values.slug,
    locale: values.locale,
    isActive: values.isActive,
    seo: {
      title: values.seoTitle || "",
      description: values.seoDescription || "",
      keywords: values.seoKeywords,
      canonicalUrl: values.canonicalUrl,
      imageUrl: values.seoImageUrl,
    },
  };
}
function useWizard(props: Props) {
  const [page, setPage] = useState(props.initial);
  const [step, setStep] = useState(0);
  const validation = useCmsBlockValidation(page, setStep);
  const form = useForm<CmsPageFormValues>({
    resolver: yupResolver(cmsPageFormSchema),
    defaultValues: formValues(props.initial),
    mode: "onChange",
  });
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const updateBlocks = (blocks: CmsDemoBlock[]) => setPage((current) => ({ ...current, blocks }));
  const save = (status: CmsDemoStatus, nextStep?: number) =>
    form.handleSubmit(async (values) => {
      if ((status === CmsDemoStatus.PUBLISHED || nextStep === 2) && !validation.validate()) return;
      const saved = await props.onSave(applyForm(page, values), status);
      if (saved) {
        setPage(saved);
        if (nextStep !== undefined) setStep(nextStep);
      }
    })();
  function drag(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const from = page.blocks.findIndex((block) => block.id === event.active.id);
    const to = page.blocks.findIndex((block) => block.id === event.over?.id);
    if (from >= 0 && to >= 0) updateBlocks(arrayMove(page.blocks, from, to));
  }
  const patchBlock = (id: string, patch: Partial<CmsDemoBlock>) =>
    updateBlocks(page.blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  return { page, step, setStep, form, sensors, updateBlocks, save, drag, patchBlock, validation };
}
type Wizard = ReturnType<typeof useWizard>;
const catalog: CmsPageBlockCatalogItem[] = Object.values(CmsDemoBlockType).map((code) => ({
  code,
  name: CMS_BLOCK_LABELS[code],
  description: code,
}));
function WizardBlocks({ wizard, saving }: { wizard: Wizard; saving: boolean }) {
  const { page, patchBlock } = wizard;
  return (
    <CmsPageWizardStepBlocks
      blocks={page.blocks.map((block) => ({
        ...block,
        clientId: block.id,
        title: CMS_BLOCK_LABELS[block.blockTypeCode],
        description: block.blockTypeCode,
        isActive: block.isVisible,
      }))}
      blockCatalog={catalog}
      blockValidationErrors={wizard.validation.errors}
      hasBlockTypes
      sensors={wizard.sensors}
      onDragEnd={wizard.drag}
      onAddBlock={(item) => wizard.updateBlocks([...page.blocks, newCmsBlock(item.code, page.blocks.length + 1)])}
      onOpenCreateBlockType={() => undefined}
      onToggleBlock={(id, visible) => patchBlock(id, { isVisible: visible })}
      onConfigChange={(id, config: CmsDemoConfig) => patchBlock(id, { config })}
      onQuickCreatePlacement={() => undefined}
      onRemoveBlock={(id) => wizard.updateBlocks(page.blocks.filter((block) => block.id !== id))}
      onBack={() => wizard.setStep(0)}
      onSave={() => wizard.save(CmsDemoStatus.DRAFT)}
      onContinue={() => wizard.save(CmsDemoStatus.DRAFT, 2)}
      loadingSave={saving}
      loadingContinue={saving}
      viewMode={saving}
    />
  );
}
function WizardStep({ wizard, saving }: { wizard: Wizard; saving: boolean }) {
  if (wizard.step === 0)
    return (
      <CmsPageWizardStepBasic
        control={wizard.form.control}
        setValue={wizard.form.setValue}
        autoSyncSlugFromName={wizard.page.revision === 0}
        onCancel={() => window.history.back()}
        onSave={() => wizard.save(CmsDemoStatus.DRAFT)}
        onContinue={() => wizard.save(CmsDemoStatus.DRAFT, 1)}
        loadingSave={saving}
        loadingContinue={saving}
        viewMode={saving}
      />
    );
  if (wizard.step === 1) return <WizardBlocks wizard={wizard} saving={saving} />;
  return (
    <CmsPageWizardStepPublish
      name={wizard.page.name}
      slug={wizard.page.slug}
      locale={wizard.page.locale || "vi-VN"}
      targetDevice="ALL"
      blocks={wizard.page.blocks.map((block) => ({
        ...block,
        clientId: block.id,
        title: CMS_BLOCK_LABELS[block.blockTypeCode],
        description: "",
        isActive: block.isVisible,
      }))}
      onBack={() => wizard.setStep(1)}
      onSaveDraft={() => wizard.save(CmsDemoStatus.DRAFT)}
      onPublish={() => wizard.save(CmsDemoStatus.PUBLISHED)}
      loadingPublish={saving}
    />
  );
}
export function CmsPageEditor(props: Props) {
  const wizard = useWizard(props);
  return (
    <Stack sx={{ minHeight: "100%", bgcolor: "#F3F4F6", pb: 4 }}>
      <Box sx={{ maxWidth: CMS_PAGE_WIZARD_CONTENT_MAX_WIDTH, mx: "auto", width: "100%", px: { xs: 2, md: 3 } }}>
        <Stepper activeStep={wizard.step} alternativeLabel sx={{ py: 3 }}>
          {CMS_PAGE_WIZARD_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {props.message && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {props.message}
          </Alert>
        )}
        {Object.keys(wizard.form.formState.errors).length > 0 && wizard.step !== 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Kiểm tra thông tin trang ở bước 1.
          </Alert>
        )}
        <WizardStep wizard={wizard} saving={props.saving} />
        {wizard.page.status === CmsDemoStatus.PUBLISHED && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Typography>Trang đã xuất bản: /{wizard.page.slug}</Typography>
            <CustomButton
              variant="outline"
              onClick={() => window.open(`${CMS_DEMO_CLIENT_URL}/${wizard.page.slug}`, "_blank", "noopener,noreferrer")}
            >
              Mở client
            </CustomButton>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
