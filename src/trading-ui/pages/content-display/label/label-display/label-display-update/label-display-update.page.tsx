import { Stack } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { badgeApi, BadgeCampaignStatus, BadgeStatus, BadgeTemplateBadgeType, type BadgeActivateViolationError, type BadgeTemplate, type UpdateBadgeFlowDto } from '../../../../../apis';
import { getErrorMessage } from '../../../../../common/utils';
import { useSnackbar, SnackbarType } from '@/hooks/use-snackbar.hook';
import { getLabelDisplayDetailPath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { LabelFormPageHeader } from '../../components';
import { LabelActivateViolationDialog } from '../../components/label-activate-violation-dialog.component';
import { contentLabelDisplayButtonPermission } from '../../../content-permission.constants';
import { LabelDisplayFormView } from '../components/label-display-form-view.component';
import type { LabelDisplayPromotionPickItem, LabelDisplayScope, LabelDisplaySelectedCategory, LabelDisplaySelectedCollection, LabelDisplaySelectedProduct } from '../label-display.interface';
import {
  buildOutOfStockRulePart,
  buildLabelTemplateSelectOptions,
  mergeBadgeTemplatesForSelect,
  buildScopeRulePart,
  buildUpdateBadgeFlowPayload,
  getLabelDisplayMaxTemplates,
  isOutOfStockLabelDisplayType,
  LABEL_DISPLAY_DEFAULT_MIN_STOCK,
  mapDetailToScopeState,
  type LabelDisplayFormPayloadInput,
  validateLabelDisplayForm,
} from '../label-display.utils';
import { LABEL_DISPLAY_BADGE_FLOW_REFERENCE_TYPE, LABEL_DISPLAY_SKU_IMPORT_SAMPLE_URL } from '../label-display-sku-import.constants';
import { useLabelDisplaySkuImportTaskManager } from '../use-label-display-sku-import-task-manager.hook';
import { ProductSpuImportDialog } from '../../../../product/product-spu/components/product-spu-import-dialog.component';
import { ProductSpuTaskManagerDrawer } from '../../../../product/product-spu/components/product-spu-task-manager-drawer.component';

const pickDisplayComparable = (input: LabelDisplayFormPayloadInput) => ({
  name: input.name.trim(),
  activeFrom: input.activeFrom?.toISOString() ?? null,
  activeTo: input.activeTo?.toISOString() ?? null,
  badgeType: input.badgeType,
  minStock: isOutOfStockLabelDisplayType(input.badgeType) ? input.minStock : null,
  selectedLabelIds: [...input.selectedLabelIds].sort(),
  scope: isOutOfStockLabelDisplayType(input.badgeType) ? 'all' : input.scope,
  categoryIds: !isOutOfStockLabelDisplayType(input.badgeType) && input.scope === 'category' ? input.selectedCategories.map((c) => c.id).sort() : [],
  collectionIds: !isOutOfStockLabelDisplayType(input.badgeType) && input.scope === 'collection' ? input.selectedCollections.map((c) => c.id).sort() : [],
  promotionKeys: !isOutOfStockLabelDisplayType(input.badgeType) && input.scope === 'promotion' ? input.selectedPromotions.map((p) => `${p.source}:${p.id}`).sort() : [],
  productVariantIds: !isOutOfStockLabelDisplayType(input.badgeType) && input.scope === 'product' ? input.selectedProducts.map((p) => p.productVariantId).sort() : [],
});

/** PATCH chỉ field khác so với lúc load — tránh gửi full payload. */
const buildPartialUpdatePayload = (
  initial: ReturnType<typeof pickDisplayComparable>,
  formInput: LabelDisplayFormPayloadInput,
  rulePart: Parameters<typeof buildUpdateBadgeFlowPayload>[1],
): UpdateBadgeFlowDto => {
  const full = buildUpdateBadgeFlowPayload(formInput, rulePart);
  const current = pickDisplayComparable(formInput);
  const partial: UpdateBadgeFlowDto = {};

  if (current.name !== initial.name) partial.name = full.name;
  if (current.activeFrom !== initial.activeFrom) partial.activeFrom = full.activeFrom;
  if (current.activeTo !== initial.activeTo) partial.activeTo = full.activeTo;
  if (JSON.stringify(current.selectedLabelIds) !== JSON.stringify(initial.selectedLabelIds)) {
    partial.templates = full.templates;
  }
  if (
    current.badgeType !== initial.badgeType ||
    current.minStock !== initial.minStock ||
    current.scope !== initial.scope ||
    JSON.stringify(current.categoryIds) !== JSON.stringify(initial.categoryIds) ||
    JSON.stringify(current.collectionIds) !== JSON.stringify(initial.collectionIds) ||
    JSON.stringify(current.promotionKeys) !== JSON.stringify(initial.promotionKeys) ||
    JSON.stringify(current.productVariantIds) !== JSON.stringify(initial.productVariantIds)
  ) {
    partial.ruleType = rulePart.ruleType;
    partial.ruleConfig = full.ruleConfig ?? {};
  }

  return partial;
};

const LabelDisplayUpdatePage = () => {
  const { displayId = '' } = useParams<{ displayId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const goList = () => {
    void navigate(ROUTE_PATH.LABEL_DISPLAY_LIST);
  };

  useEffect(() => {
    if (!displayId) goList();
  }, [displayId]);

  const [submitting, setSubmitting] = useState(false);
  const [violationDialog, setViolationDialog] = useState<{
    open: boolean;
    message: string;
    violationCount: number;
    violations: BadgeActivateViolationError['violations'];
  }>({ open: false, message: '', violationCount: 0, violations: [] });

  const [campaignName, setCampaignName] = useState('');
  const [selectedBadgeType, setSelectedBadgeType] = useState<BadgeTemplateBadgeType>(BadgeTemplateBadgeType.CAMPAIGN);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [minStock, setMinStock] = useState<number | undefined>(LABEL_DISPLAY_DEFAULT_MIN_STOCK);
  const [activeFrom, setActiveFrom] = useState<Dayjs | null>(null);
  const [activeTo, setActiveTo] = useState<Dayjs | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<BadgeCampaignStatus>(BadgeCampaignStatus.DRAFT);
  const [initialSnapshot, setInitialSnapshot] = useState<{
    info: ReturnType<typeof pickDisplayComparable>;
    status: BadgeCampaignStatus;
  } | null>(null);

  const [scopeAll, setScopeAll] = useState(true);
  const [scopePromotion, setScopePromotion] = useState(false);
  const [scopeCategory, setScopeCategory] = useState(false);
  const [scopeCollection, setScopeCollection] = useState(false);
  const [scopeProduct, setScopeProduct] = useState(false);

  const [selectedPromotions, setSelectedPromotions] = useState<LabelDisplayPromotionPickItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<LabelDisplaySelectedCategory[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<LabelDisplaySelectedCollection[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<LabelDisplaySelectedProduct[]>([]);

  const [importOpen, setImportOpen] = useState(false);
  const [importSubmitting, setImportSubmitting] = useState(false);

  const jobReference = useMemo(
    () =>
      displayId
        ? {
            referenceType: LABEL_DISPLAY_BADGE_FLOW_REFERENCE_TYPE,
            referenceId: displayId,
          }
        : null,
    [displayId],
  );

  const {
    taskManagerOpen,
    setTaskManagerOpen,
    openTaskManager,
    mergeImportKnownFileNames,
    importKnownFileNames,
    ieJobsRes,
    taskManagerJobsLoading,
    startSkuImport,
    currentImportJobId,
    applyImportJobToForm,
    applyingJobId,
  } = useLabelDisplaySkuImportTaskManager({
    selectedProducts,
    onProductsChange: setSelectedProducts,
    jobReference,
  });

  const detailSwr = useSWR(displayId ? (['badge-flow-detail', displayId] as const) : null, () => badgeApi.getDetailBadgeFlow(displayId), {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    refreshInterval: (data) => {
      const status = (data?.skuImportJob as { status?: string } | undefined)?.status;
      return status === 'PROCESSING' || status === 'PENDING' ? 2500 : 0;
    },
  });

  const detail = detailSwr.data;
  const skuImportJobStatus = (detail?.skuImportJob as { status?: string } | undefined)?.status;
  const isSkuImportProcessing = skuImportJobStatus === 'PROCESSING' || skuImportJobStatus === 'PENDING';
  const isActiveCampaign = detail?.status === BadgeCampaignStatus.ACTIVE;
  const inputsDisabled = isActiveCampaign;
  const isOutOfStock = isOutOfStockLabelDisplayType(selectedBadgeType);
  const canImportSkuExcel = scopeProduct && !isOutOfStock && !inputsDisabled;

  useEffect(() => {
    if (!detail?.isSystemGenerated || !displayId) return;
    showSnackbar({
      message: 'Cấu hình được đồng bộ từ Pre-order Campaign, không thể chỉnh sửa thủ công.',
      type: SnackbarType.ERROR,
    });
    void navigate(getLabelDisplayDetailPath(displayId), { replace: true });
  }, [detail?.isSystemGenerated, displayId, navigate, showSnackbar]);

  useEffect(() => {
    const state = location.state as {
      openTaskManager?: boolean;
      importKnownFileNames?: Record<string, string>;
    } | null;
    if (!state?.openTaskManager) return;
    openTaskManager();
    if (state.importKnownFileNames) mergeImportKnownFileNames(state.importKnownFileNames);
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, mergeImportKnownFileNames, openTaskManager]);

  const badgeTemplatesSwr = useSWR(
    ['badge-templates', 'label-display', 'select-options', selectedBadgeType] as const,
    () =>
      badgeApi.getListBadgeTemplate({
        isPagination: false,
        status: BadgeStatus.ACTIVE,
        badgeType: selectedBadgeType,
      }),
    { revalidateOnFocus: false },
  );

  const allTemplates = useMemo<BadgeTemplate[]>(
    () => mergeBadgeTemplatesForSelect(badgeTemplatesSwr.data?.list ?? [], detail?.rules, selectedLabelIds),
    [badgeTemplatesSwr.data, detail?.rules, selectedLabelIds],
  );
  const selectedTemplates = useMemo(() => selectedLabelIds.map((id) => allTemplates.find((t) => t.id === id)).filter((t): t is BadgeTemplate => !!t), [allTemplates, selectedLabelIds]);

  const labelSelectOptions = useMemo(() => buildLabelTemplateSelectOptions(allTemplates, selectedLabelIds), [allTemplates, selectedLabelIds]);

  // Đồng bộ form mỗi khi detail (SWR) thay đổi — tránh giữ state cũ sau khi quay lại từ list.
  useEffect(() => {
    if (!detail) return;

    setCampaignName(detail.name ?? '');
    setActiveFrom(detail.activeFrom ? dayjs(detail.activeFrom) : null);
    setActiveTo(detail.activeTo ? dayjs(detail.activeTo) : null);
    const status = detail.status ?? BadgeCampaignStatus.DRAFT;
    setCampaignStatus(status);
    setSelectedLabelIds((detail.rules ?? []).map((r) => r.template?.id).filter((id): id is string => !!id));

    const { scope, badgeType, minStock: detailMinStock, categories, collections, promotions, products } = mapDetailToScopeState(detail);
    setSelectedBadgeType(badgeType);
    setMinStock(detailMinStock ?? LABEL_DISPLAY_DEFAULT_MIN_STOCK);
    setScopeAll(scope === 'all');
    setScopePromotion(scope === 'promotion');
    setScopeCategory(scope === 'category');
    setScopeCollection(scope === 'collection');
    setScopeProduct(scope === 'product');
    setSelectedCategories(categories);
    setSelectedCollections(collections);
    setSelectedPromotions(promotions);
    setSelectedProducts(products);

    setInitialSnapshot({
      status,
      info: pickDisplayComparable({
        name: detail.name ?? '',
        badgeType,
        selectedLabelIds: (detail.rules ?? []).map((r) => r.template?.id).filter((id): id is string => !!id),
        scope,
        selectedCategories: categories,
        selectedCollections: collections,
        selectedPromotions: promotions,
        selectedProducts: products,
        minStock: detailMinStock,
        activeFrom: detail.activeFrom ? dayjs(detail.activeFrom).toDate() : null,
        activeTo: detail.activeTo ? dayjs(detail.activeTo).toDate() : null,
      }),
    });
  }, [detail, displayId]);

  const clearOtherScopes = (except: LabelDisplayScope) => {
    if (except !== 'all') setScopeAll(false);
    if (except !== 'promotion') {
      setScopePromotion(false);
      setSelectedPromotions([]);
    }
    if (except !== 'category') {
      setScopeCategory(false);
      setSelectedCategories([]);
    }
    if (except !== 'collection') {
      setScopeCollection(false);
      setSelectedCollections([]);
    }
    if (except !== 'product') {
      setScopeProduct(false);
      setSelectedProducts([]);
    }
  };

  const handleToggleAll = (checked: boolean) => {
    setScopeAll(checked);
    if (checked) clearOtherScopes('all');
  };

  const handleToggleOther = (key: 'promotion' | 'category' | 'collection' | 'product', checked: boolean) => {
    if (key === 'promotion') {
      setScopePromotion(checked);
      if (!checked) setSelectedPromotions([]);
      if (checked) clearOtherScopes('promotion');
    }
    if (key === 'category') {
      setScopeCategory(checked);
      if (!checked) setSelectedCategories([]);
      if (checked) clearOtherScopes('category');
    }
    if (key === 'collection') {
      setScopeCollection(checked);
      if (!checked) setSelectedCollections([]);
      if (checked) clearOtherScopes('collection');
    }
    if (key === 'product') {
      setScopeProduct(checked);
      if (!checked) setSelectedProducts([]);
      if (checked) clearOtherScopes('product');
    }
  };

  const handleChangeBadgeType = (next: BadgeTemplateBadgeType) => {
    if (next === selectedBadgeType) return;
    setSelectedBadgeType(next);
    setSelectedLabelIds([]);
    setImportOpen(false);
    if (isOutOfStockLabelDisplayType(next)) {
      setMinStock((current) => current ?? LABEL_DISPLAY_DEFAULT_MIN_STOCK);
    }
  };

  const maxLabelTemplates = getLabelDisplayMaxTemplates(selectedBadgeType);

  const handleChangeLabels = (next: string[]) => {
    if (next.length > maxLabelTemplates) {
      showSnackbar({
        message: `Chỉ được chọn tối đa ${maxLabelTemplates} Label${maxLabelTemplates > 1 ? 's' : ''}.`,
        type: SnackbarType.WARNING,
      });
      return;
    }
    setSelectedLabelIds(next);
  };

  const resolveScope = (): LabelDisplayScope => {
    if (scopeAll) return 'all';
    if (scopePromotion) return 'promotion';
    if (scopeCategory) return 'category';
    if (scopeCollection) return 'collection';
    if (scopeProduct) return 'product';
    return 'all';
  };

  const buildFormInput = (scope: LabelDisplayScope): LabelDisplayFormPayloadInput => ({
    name: campaignName,
    badgeType: selectedBadgeType,
    selectedLabelIds,
    scope,
    selectedCategories,
    selectedCollections,
    selectedPromotions,
    selectedProducts,
    minStock,
    activeFrom: activeFrom?.toDate() ?? null,
    activeTo: activeTo?.toDate() ?? null,
  });

  const handleStartSkuImport = async (file: File) => {
    const formInput = buildFormInput('product');
    const validationError = validateLabelDisplayForm(formInput, { allowEmptyProducts: true });
    if (validationError) {
      showSnackbar({ message: validationError.message, type: SnackbarType.ERROR });
      return;
    }

    setImportSubmitting(true);
    try {
      await startSkuImport(file);
      setImportOpen(false);
      openTaskManager();
      showSnackbar({
        type: SnackbarType.SUCCESS,
        message: 'Đã gửi file import. Theo dõi tiến trình trong Trình quản lý tác vụ.',
      });
    } catch (err) {
      showSnackbar({ message: getErrorMessage(err), type: SnackbarType.ERROR });
    } finally {
      setImportSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!initialSnapshot) return;

    const scope = resolveScope();
    const formInput = buildFormInput(scope);

    const validationError = validateLabelDisplayForm(formInput, { skipActiveFromNowCheck: true });
    if (validationError) {
      showSnackbar({ message: validationError.message, type: SnackbarType.ERROR });
      return;
    }

    const rulePart = isOutOfStock
      ? buildOutOfStockRulePart(minStock ?? LABEL_DISPLAY_DEFAULT_MIN_STOCK)
      : buildScopeRulePart({
          scope,
          categories: selectedCategories,
          products: selectedProducts,
          collections: selectedCollections,
          promotions: selectedPromotions,
        });
    if (!rulePart) {
      showSnackbar({ message: 'Vui lòng chọn phạm vi áp dụng hợp lệ.', type: SnackbarType.ERROR });
      return;
    }

    const currentComparable = pickDisplayComparable(formInput);
    const infoChanged = JSON.stringify(currentComparable) !== JSON.stringify(initialSnapshot.info);
    const statusChanged = campaignStatus !== initialSnapshot.status;
    const onlyActiveToChanged =
      isActiveCampaign &&
      infoChanged &&
      currentComparable.name === initialSnapshot.info.name &&
      currentComparable.activeFrom === initialSnapshot.info.activeFrom &&
      currentComparable.badgeType === initialSnapshot.info.badgeType &&
      currentComparable.minStock === initialSnapshot.info.minStock &&
      JSON.stringify(currentComparable.selectedLabelIds) === JSON.stringify(initialSnapshot.info.selectedLabelIds) &&
      currentComparable.scope === initialSnapshot.info.scope &&
      JSON.stringify(currentComparable.categoryIds) === JSON.stringify(initialSnapshot.info.categoryIds) &&
      JSON.stringify(currentComparable.collectionIds) === JSON.stringify(initialSnapshot.info.collectionIds) &&
      JSON.stringify(currentComparable.promotionKeys) === JSON.stringify(initialSnapshot.info.promotionKeys) &&
      JSON.stringify(currentComparable.productVariantIds) === JSON.stringify(initialSnapshot.info.productVariantIds) &&
      currentComparable.activeTo !== initialSnapshot.info.activeTo;

    if (isActiveCampaign && infoChanged && !onlyActiveToChanged) {
      showSnackbar({
        message: 'Cấu hình đang kích hoạt chỉ được sửa thời gian kết thúc.',
        type: SnackbarType.ERROR,
      });
      return;
    }

    if (!infoChanged && !statusChanged) {
      showSnackbar({ message: 'Không có thay đổi.', type: SnackbarType.SUCCESS });
      return;
    }

    setSubmitting(true);
    try {
      if (onlyActiveToChanged) {
        await badgeApi.patchBadgeFlow(displayId, { activeTo: formInput.activeTo ?? undefined });
      } else if (infoChanged) {
        await badgeApi.patchBadgeFlow(displayId, buildPartialUpdatePayload(initialSnapshot.info, formInput, rulePart));
      }
      if (statusChanged && campaignStatus === BadgeCampaignStatus.ACTIVE) {
        await badgeApi.patchBadgeFlowActivate(displayId);
      } else if (statusChanged && campaignStatus === BadgeCampaignStatus.INACTIVE) {
        await badgeApi.patchBadgeFlowDeactivate(displayId);
      }

      await detailSwr.mutate();
      showSnackbar({ message: 'Cập nhật cấu hình thành công.', type: SnackbarType.SUCCESS });
      goList();
    } catch (err) {
      const violationError = err as BadgeActivateViolationError;
      if (Array.isArray(violationError.violations) && violationError.violations.length > 0) {
        setViolationDialog({
          open: true,
          message: violationError.message || getErrorMessage(err),
          violationCount: violationError.violationCount ?? violationError.violations.length,
          violations: violationError.violations,
        });
      } else {
        showSnackbar({ message: getErrorMessage(err), type: SnackbarType.ERROR });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Stack sx={{ height: '100%', minHeight: 0, flex: 1, gap: 0 }}>
          <LabelFormPageHeader
            title="Cập nhật cấu hình Labels"
            onBack={goList}
            onCancel={goList}
            onSave={() => void handleSave()}
            loading={submitting}
            disabled={submitting || detailSwr.isLoading}
            buttonPermission={contentLabelDisplayButtonPermission}
          />

          <LabelDisplayFormView
            campaignName={campaignName}
            onCampaignNameChange={setCampaignName}
            activeFrom={activeFrom}
            onActiveFromChange={setActiveFrom}
            activeTo={activeTo}
            onActiveToChange={setActiveTo}
            campaignStatus={campaignStatus}
            onCampaignStatusChange={setCampaignStatus}
            selectedBadgeType={selectedBadgeType}
            onBadgeTypeChange={handleChangeBadgeType}
            selectedLabelIds={selectedLabelIds}
            onLabelsChange={handleChangeLabels}
            labelSelectOptions={labelSelectOptions}
            selectedTemplates={selectedTemplates}
            maxLabelTemplates={maxLabelTemplates}
            isOutOfStock={isOutOfStock}
            inputsDisabled={inputsDisabled}
            scopeAll={scopeAll}
            scopePromotion={scopePromotion}
            scopeCategory={scopeCategory}
            scopeCollection={scopeCollection}
            scopeProduct={scopeProduct}
            onToggleAll={handleToggleAll}
            onTogglePromotion={(checked) => handleToggleOther('promotion', checked)}
            onToggleCategory={(checked) => handleToggleOther('category', checked)}
            onToggleCollection={(checked) => handleToggleOther('collection', checked)}
            onToggleProduct={(checked) => handleToggleOther('product', checked)}
            selectedPromotions={selectedPromotions}
            onPromotionsChange={setSelectedPromotions}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            selectedCollections={selectedCollections}
            onCollectionsChange={setSelectedCollections}
            selectedProducts={selectedProducts}
            onProductsChange={setSelectedProducts}
            onImportExcel={canImportSkuExcel ? () => setImportOpen(true) : undefined}
            showTaskManagerButton={canImportSkuExcel}
            onOpenTaskManager={openTaskManager}
            isSkuImportProcessing={isSkuImportProcessing}
          />
        </Stack>
      </Stack>

      <ProductSpuImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        submitting={importSubmitting}
        onDownloadTemplate={() => {
          const link = document.createElement('a');
          link.href = LABEL_DISPLAY_SKU_IMPORT_SAMPLE_URL;
          link.download = 'Import_SKU_Template.xlsx';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã kích hoạt tải file mẫu.' });
        }}
        onStartImport={handleStartSkuImport}
      />

      <ProductSpuTaskManagerDrawer
        open={taskManagerOpen}
        onClose={() => setTaskManagerOpen(false)}
        jobs={ieJobsRes ?? { list: [], total: 0 }}
        loading={taskManagerJobsLoading}
        knownFileNames={importKnownFileNames}
        applyImportJobId={currentImportJobId}
        onApplyImportJob={(jobId) => void applyImportJobToForm(jobId)}
        applyingJobId={applyingJobId}
      />

      <LabelActivateViolationDialog
        open={violationDialog.open}
        message={violationDialog.message}
        violationCount={violationDialog.violationCount}
        violations={violationDialog.violations}
        onClose={() => setViolationDialog((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
};

export default LabelDisplayUpdatePage;
