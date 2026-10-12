import { Box, Stack, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { badgeApi, BadgeStatus, BadgeTemplateBadgeType, importExportApi, type BadgeTemplate } from '../../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../../common/utils';
import { SelectAllInput, SelectInput, TextInput } from '../../../../../components/form';
import { formLabelSx } from '../../../../../components/form/form-field.styles';
import { StackRow } from '../../../../../components/styled/stack.style';
import { useSnackbar, SnackbarType } from '@/hooks/use-snackbar.hook';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import { ProductSpuImportDialog } from '../../../../product/product-spu/components/product-spu-import-dialog.component';
import { ProductSpuTaskManagerDrawer } from '../../../../product/product-spu/components/product-spu-task-manager-drawer.component';
import { LABEL_DISPLAY_BADGE_FLOW_REFERENCE_TYPE, LABEL_DISPLAY_CREATE_SESSION_REFERENCE_TYPE, LABEL_DISPLAY_SKU_IMPORT_SAMPLE_URL } from '../label-display-sku-import.constants';
import { useLabelDisplaySkuImportTaskManager } from '../use-label-display-sku-import-task-manager.hook';
import { LabelDesignPreviewCell, LabelFormPageHeader } from '../../components';
import { contentLabelDisplayButtonPermission } from '../../../content-permission.constants';
import { badgePositionLabelVi, badgeTemplateBadgeTypeLabelVi } from '../../label-content/label-content.utils';
import { LabelDisplayScopePanel } from '../components';
import type { LabelDisplayPromotionPickItem, LabelDisplayScope, LabelDisplaySelectedCategory, LabelDisplaySelectedCollection, LabelDisplaySelectedProduct } from '../label-display.interface';
import {
  buildOutOfStockRulePart,
  buildCreateBadgeFlowPayload,
  buildLabelTemplateSelectOptions,
  buildScopeRulePart,
  getLabelDisplayMaxTemplates,
  isOutOfStockLabelDisplayType,
  LABEL_DISPLAY_BADGE_TYPE_OPTIONS,
  LABEL_DISPLAY_DEFAULT_MIN_STOCK,
  validateLabelDisplayForm,
} from '../label-display.utils';

const LabelDisplayCreatePage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  /** Stable id cho phiên tạo — dùng state lazy init (không đọc ref lúc render). */
  const [importSessionId] = useState(() => globalThis.crypto?.randomUUID?.() ?? String(Date.now())); // thêm globalThis.crypto để fix lỗi check https vs http

  const goList = () => {
    void navigate(ROUTE_PATH.LABEL_DISPLAY_LIST);
  };

  const [submitting, setSubmitting] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [selectedBadgeType, setSelectedBadgeType] = useState<BadgeTemplateBadgeType>(BadgeTemplateBadgeType.CAMPAIGN);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [minStock, setMinStock] = useState<number | undefined>(LABEL_DISPLAY_DEFAULT_MIN_STOCK);
  const [activeFrom, setActiveFrom] = useState<Dayjs | null>(null);
  const [activeTo, setActiveTo] = useState<Dayjs | null>(null);

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

  const isOutOfStock = isOutOfStockLabelDisplayType(selectedBadgeType);

  const skuImportTaskManager = useLabelDisplaySkuImportTaskManager({
    selectedProducts,
    onProductsChange: setSelectedProducts,
    jobReference: {
      referenceType: LABEL_DISPLAY_CREATE_SESSION_REFERENCE_TYPE,
      referenceId: importSessionId,
    },
  });

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

  const allTemplates = useMemo<BadgeTemplate[]>(() => badgeTemplatesSwr.data?.list ?? [], [badgeTemplatesSwr.data]);
  const selectedTemplates = useMemo(() => selectedLabelIds.map((id) => allTemplates.find((t) => t.id === id)).filter((t): t is BadgeTemplate => !!t), [allTemplates, selectedLabelIds]);

  const labelSelectOptions = useMemo(() => buildLabelTemplateSelectOptions(allTemplates, selectedLabelIds), [allTemplates, selectedLabelIds]);

  const buildFormInput = (scope: LabelDisplayScope) => ({
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

  const handleStartSkuImport = async (file: File) => {
    const formInput = buildFormInput('product');
    const validationError = validateLabelDisplayForm(formInput, { allowEmptyProducts: true });
    if (validationError) {
      showSnackbar({ message: validationError.message, type: SnackbarType.ERROR });
      return;
    }

    setImportSubmitting(true);
    try {
      await skuImportTaskManager.startSkuImport(file);
      setImportOpen(false);
      skuImportTaskManager.openTaskManager();
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
    const scope = resolveScope();
    const formInput = buildFormInput(scope);

    const validationError = validateLabelDisplayForm(formInput);
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

    setSubmitting(true);
    try {
      const created = (await badgeApi.postBadgeFlow(buildCreateBadgeFlowPayload(formInput, rulePart))) as {
        campaignId?: string;
      };
      const createdBadgeFlowId = created?.campaignId?.trim();
      let transferFailed = false;
      if (createdBadgeFlowId && skuImportTaskManager.sessionHadImports) {
        try {
          await importExportApi.transferImportJobsReference({
            fromReferenceType: LABEL_DISPLAY_CREATE_SESSION_REFERENCE_TYPE,
            fromReferenceId: importSessionId,
            toReferenceType: LABEL_DISPLAY_BADGE_FLOW_REFERENCE_TYPE,
            toReferenceId: createdBadgeFlowId,
          });
        } catch (transferErr) {
          transferFailed = true;
          console.warn('Label Display: transfer import job reference failed', transferErr);
        }
      }
      showSnackbar({
        message: transferFailed ? 'Tạo cấu hình thành công. Chưa gắn được lịch sử import vào badge-flow (có thể thử lại sau).' : 'Tạo cấu hình thành công.',
        type: transferFailed ? SnackbarType.WARNING : SnackbarType.SUCCESS,
      });
      goList();
    } catch (err) {
      showSnackbar({ message: getErrorMessage(err), type: SnackbarType.ERROR });
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
            title="Tạo cấu hình Labels"
            onBack={goList}
            onCancel={goList}
            onSave={() => void handleSave()}
            loading={submitting}
            disabled={submitting}
            buttonPermission={contentLabelDisplayButtonPermission}
          />

          <StackRow sx={{ flex: 1, minHeight: 0, alignItems: 'stretch', p: 3, gap: 3 }}>
            <Stack sx={{ flex: { xs: '1 1 auto', md: '1 1 0%' }, minWidth: 0, minHeight: 0, gap: 2 }}>
              <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', bgcolor: '#FFF', p: 2, gap: 2 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Thông tin campaign</Typography>
                <TextInput
                  label="Tên campaign"
                  name="campaignName"
                  value={campaignName}
                  requiredMark
                  placeholder="Nhập tên cấu hình"
                  onChange={(e) => setCampaignName(e.target.value)}
                  fullWidth
                  size="small"
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={formLabelSx}>
                      Thời gian bắt đầu
                      <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                        *
                      </Box>
                    </Typography>
                    <DateTimePicker
                      value={activeFrom}
                      onChange={setActiveFrom}
                      format="DD/MM/YYYY HH:mm"
                      slotProps={{
                        textField: { fullWidth: true, size: 'small', placeholder: 'dd/mm/yyyy hh:mm' },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={formLabelSx}>Thời gian kết thúc</Typography>
                    <DateTimePicker
                      value={activeTo}
                      onChange={setActiveTo}
                      format="DD/MM/YYYY HH:mm"
                      minDateTime={activeFrom ?? undefined}
                      slotProps={{
                        textField: { fullWidth: true, size: 'small', placeholder: 'dd/mm/yyyy hh:mm' },
                      }}
                    />
                  </Box>
                </Stack>
              </Stack>

              <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', bgcolor: '#FFF', p: 2, gap: 2 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Label được áp dụng</Typography>
                <SelectInput
                  label="Loại Label"
                  name="badgeType"
                  value={selectedBadgeType}
                  requiredMark
                  placeholder="Chọn loại label"
                  options={LABEL_DISPLAY_BADGE_TYPE_OPTIONS}
                  onChange={(e) => handleChangeBadgeType(e.target.value as BadgeTemplateBadgeType)}
                  fullWidth
                  size="small"
                />
                <SelectAllInput
                  label={`Chọn Label (tối đa ${maxLabelTemplates})`}
                  name="labelIds"
                  value={selectedLabelIds}
                  requiredMark
                  placeholder="Vui lòng chọn label"
                  options={labelSelectOptions}
                  onChange={(e) => {
                    const raw = (e.target as EventTarget & { value: unknown }).value;
                    const next = Array.isArray(raw) ? raw.map(String) : [];
                    handleChangeLabels(next);
                  }}
                />

                {selectedTemplates.length > 0 ? (
                  <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: 1, p: 1.5, gap: 1 }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr) minmax(0,0.9fr)',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#6B7280' }}>Nhãn dán</Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#6B7280' }}>Loại nhãn</Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#6B7280' }}>Vị trí</Typography>
                    </Box>
                    {selectedTemplates.map((tpl) => (
                      <Box
                        key={tpl.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr) minmax(0,0.9fr)',
                          gap: 1,
                          alignItems: 'center',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <LabelDesignPreviewCell badgeTemplate={tpl} />
                        </Box>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#374151' }}>{badgeTemplateBadgeTypeLabelVi(tpl.badgeType)}</Typography>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#374151' }}>{tpl.defaultPosition ? badgePositionLabelVi(tpl.defaultPosition) : '—'}</Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            </Stack>

            {!isOutOfStock ? (
              <Stack sx={{ flex: { xs: '1 1 auto', md: '1 1 0%' }, minWidth: 0, minHeight: 0 }}>
                <LabelDisplayScopePanel
                  scopeAll={scopeAll}
                  scopePromotion={scopePromotion}
                  scopeCategory={scopeCategory}
                  scopeCollection={scopeCollection}
                  scopeProduct={scopeProduct}
                  onToggleAll={handleToggleAll}
                  onTogglePromotion={(c) => handleToggleOther('promotion', c)}
                  onToggleCategory={(c) => handleToggleOther('category', c)}
                  onToggleCollection={(c) => handleToggleOther('collection', c)}
                  onToggleProduct={(c) => handleToggleOther('product', c)}
                  selectedPromotions={selectedPromotions}
                  onPromotionsChange={setSelectedPromotions}
                  selectedCategories={selectedCategories}
                  onCategoriesChange={setSelectedCategories}
                  selectedCollections={selectedCollections}
                  onCollectionsChange={setSelectedCollections}
                  selectedProducts={selectedProducts}
                  onProductsChange={setSelectedProducts}
                  onImportExcel={scopeProduct ? () => setImportOpen(true) : undefined}
                  showTaskManagerButton={scopeProduct && !isOutOfStock}
                  onOpenTaskManager={skuImportTaskManager.openTaskManager}
                />
              </Stack>
            ) : null}
          </StackRow>
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
        open={skuImportTaskManager.taskManagerOpen}
        onClose={() => skuImportTaskManager.setTaskManagerOpen(false)}
        jobs={skuImportTaskManager.ieJobsRes ?? { list: [], total: 0 }}
        loading={skuImportTaskManager.taskManagerJobsLoading}
        knownFileNames={skuImportTaskManager.importKnownFileNames}
        applyImportJobId={skuImportTaskManager.currentImportJobId}
        onApplyImportJob={(jobId) => void skuImportTaskManager.applyImportJobToForm(jobId)}
        applyingJobId={skuImportTaskManager.applyingJobId}
      />
    </Stack>
  );
};

export default LabelDisplayCreatePage;
