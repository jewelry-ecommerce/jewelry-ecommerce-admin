import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isJavaBackend } from '@/common/config/app.config';
import { CircularProgress, Stack, Typography } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { LayersThree01, Plus, Upload01 } from '@untitledui/icons';
import useSWR from 'swr';
import { categoryApi, collectionApi, promotionApi, TargetDiscountStateFilter, type PromotionTargetConfigV1, type PromotionTargetSkuItemDto, TargetConfigType } from '../../../../apis';
import { CategoryStatus } from '../../../../apis/category/category.enum';
import { getErrorMessage } from '../../../../common/utils';
import { SelectAllInput, SelectInput } from '../../../../components/form';
import { CustomButton, PermissionIconButton, ButtonIconContentComponent } from '../../../../components/button';
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowJustEnd } from '../../../../components/styled';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { LabelDisplayAddProductDialog } from '../../../content-display/label/label-display/components';
import type { LabelDisplaySelectedProduct } from '../../../content-display/label/label-display/label-display.interface';
import { LABEL_DISPLAY_SKU_IMPORT_SAMPLE_URL } from '../../../content-display/label/label-display/label-display-sku-import.constants';
import { loadProductsFromBadgeSkuImportJob } from '../../../content-display/label/label-display/label-display-sku-import-result.util';
import { ProductSpuImportDialog } from '../../../product/product-spu/components/product-spu-import-dialog.component';
import { ProductSpuTaskManagerDrawer } from '../../../product/product-spu/components/product-spu-task-manager-drawer.component';
import { findCategoryInTree } from '../../../product/product-spu/utils/product-spu-category-tree.utils';
import {
  PROMOTION_TARGET_MODE_LABEL,
  PROMOTION_TARGET_DISCOUNT_FILTER_LABEL,
  PROMOTION_TARGET_DISCOUNT_FILTER_OPTIONS,
  formatPromotionTargetSummary,
  buildPromotionTargetConfig,
  arePromotionTargetFormValuesEqual,
  isPromotionTargetFormSavable,
  normalizeUploadBatchId,
  validatePromotionTargetForm,
  type PromotionTargetFormValues,
} from '../../promotion.constant';
import { promotionListButtonPermission } from '../../promotion-permission.constants';
import { usePromotionSkuImportTaskManager } from '../../hooks/use-promotion-sku-import-task-manager.hook';
import { ReadonlyField } from '../promotion-general/promotion-readonly-field.component';
import { PromotionSkuPickerSection, PromotionSkuProductList, SkuProductThumbnail, getProductScopeKey } from './promotion-selected-sku-list.component';
import {
  TARGET_TYPE_SELECT_OPTIONS,
  flattenCategorySelectOptions,
  mapTargetSkuItemToSelectedProduct,
  mapTargetToFormValues,
  parseSelectAllValues,
  resolveDisplayedSkuProducts,
} from './promotion-target-form.mapper';

export const TargetInlineForm = ({
  promotionId,
  initialTarget,
  initialSkus,
  initialExcludedSkus,
  editable,
  onSaved,
}: {
  promotionId: string;
  initialTarget?: PromotionTargetConfigV1 | null;
  initialSkus?: readonly PromotionTargetSkuItemDto[];
  initialExcludedSkus?: readonly PromotionTargetSkuItemDto[];
  editable: boolean;
  onSaved: () => Promise<void> | void;
}) => {
  const { showSnackbar } = useSnackbar();
  const savedValues = useMemo(() => mapTargetToFormValues(initialTarget), [initialTarget]);
  const [values, setValues] = useState<PromotionTargetFormValues>(() => savedValues);
  const [importedProducts, setImportedProducts] = useState<LabelDisplaySelectedProduct[]>([]);
  const [manualProducts, setManualProducts] = useState<LabelDisplaySelectedProduct[]>([]);
  const [selectedExcludedProducts, setSelectedExcludedProducts] = useState<LabelDisplaySelectedProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [excludedPickerOpen, setExcludedPickerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [appliedImportSuccessCount, setAppliedImportSuccessCount] = useState<number | null>(null);
  const showUploadBatch = Boolean(normalizeUploadBatchId(values.uploadBatchId));
  /** Chỉ poll IE khi đang import / mở dialog — không fetch jobs chỉ vì đã có uploadBatchId. */
  const shouldTrackImportJobs = importOpen || importSubmitting;

  const hydrateUploadBatchId = useMemo(() => {
    if (initialTarget?.type !== TargetConfigType.UPLOAD_FILE) return null;
    return normalizeUploadBatchId(initialTarget.uploadBatchId) || null;
  }, [initialTarget]);

  const shouldHydrateUploadBatchProducts = Boolean(hydrateUploadBatchId) && importedProducts.length === 0;

  const {
    data: hydratedUploadBatchProducts,
    error: hydrateUploadBatchError,
    isLoading: isHydratingUploadBatchProducts,
  } = useSWR(
    shouldHydrateUploadBatchProducts && hydrateUploadBatchId ? (['promotion-target-upload-batch-products', hydrateUploadBatchId] as const) : null,
    () => loadProductsFromBadgeSkuImportJob(hydrateUploadBatchId!),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const hydrateUploadBatchErrorNotifiedRef = useRef<string | null>(null);

  useEffect(() => {
    hydrateUploadBatchErrorNotifiedRef.current = null;
  }, [hydrateUploadBatchId]);

  useEffect(() => {
    if (!hydratedUploadBatchProducts?.length) return;
    setImportedProducts((current) => (current.length > 0 ? current : hydratedUploadBatchProducts));
    setAppliedImportSuccessCount((current) => current ?? hydratedUploadBatchProducts.length);
  }, [hydratedUploadBatchProducts]);

  useEffect(() => {
    if (!hydrateUploadBatchError || !hydrateUploadBatchId) return;
    const message = getErrorMessage(hydrateUploadBatchError) || 'Không tải được danh sách SKU từ lô import.';
    const notifyKey = `${hydrateUploadBatchId}:${message}`;
    if (hydrateUploadBatchErrorNotifiedRef.current === notifyKey) return;
    hydrateUploadBatchErrorNotifiedRef.current = notifyKey;
    showSnackbar({ type: SnackbarType.WARNING, message });
  }, [hydrateUploadBatchError, hydrateUploadBatchId, showSnackbar]);

  const handleSkuImportApplied = useCallback((result: { jobId: string; products: LabelDisplaySelectedProduct[]; successRows: number }) => {
    setShowValidation(false);
    setAppliedImportSuccessCount(result.successRows);
    setImportedProducts(result.products);
    setValues((current) => ({
      ...current,
      uploadBatchId: result.jobId,
    }));
  }, []);

  const {
    topicConfigId,
    taskManagerOpen,
    setTaskManagerOpen,
    openTaskManager,
    importKnownFileNames,
    ieJobsRes,
    taskManagerJobsLoading,
    hasActiveImportJob,
    startSkuImport,
    currentImportJobId,
    applyImportJobToForm,
    applyingJobId,
  } = usePromotionSkuImportTaskManager({
    trackJobs: shouldTrackImportJobs,
    promotionDraftId: promotionId,
    onApplied: handleSkuImportApplied,
  });
  const manualSkuIds = values.targetType === TargetConfigType.MANUAL ? values.skuIds : [];
  const excludedSkuIds = values.excludedSkuIds;
  const shouldLoadCategories = editable || initialTarget?.type === TargetConfigType.CATEGORY;
  const shouldLoadCollections = editable || initialTarget?.type === TargetConfigType.COLLECTION;
  const { data: categoryRes, isLoading: categoryLoading } = useSWR(
    shouldLoadCategories ? ['promotion-detail-target/categories'] : null,
    () => categoryApi.getCategoryTree({ compact: true, status: CategoryStatus.ACTIVE }),
    {
      revalidateOnFocus: false,
    },
  );
  const { data: collectionRes, isLoading: collectionLoading } = useSWR(
    shouldLoadCollections ? ['promotion-detail-target/collections'] : null,
    () => collectionApi.getCollectionList({ isPagination: false }),
    {
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    setValues(savedValues);
    if (!normalizeUploadBatchId(savedValues.uploadBatchId)) {
      setAppliedImportSuccessCount(null);
      setImportedProducts([]);
    }
    setManualProducts((current) => {
      const nextSkuIds = new Set(savedValues.skuIds);
      return current.filter((product) => nextSkuIds.has(product.productVariantId) || nextSkuIds.has(product.skuCode));
    });
    setSelectedExcludedProducts((current) => {
      const nextSkuIds = new Set(savedValues.excludedSkuIds);
      return current.filter((product) => nextSkuIds.has(product.productVariantId) || nextSkuIds.has(product.skuCode));
    });
  }, [savedValues]);

  const isDirty = !arePromotionTargetFormValuesEqual(values, savedValues);
  const canSave = editable && isDirty && isPromotionTargetFormSavable(values) && !saving;

  const enrichedSelectedProducts = useMemo(() => (initialSkus ?? []).map(mapTargetSkuItemToSelectedProduct).filter((item) => Boolean(item.productVariantId)), [initialSkus]);
  const enrichedExcludedProducts = useMemo(() => (initialExcludedSkus ?? []).map(mapTargetSkuItemToSelectedProduct).filter((item) => Boolean(item.productVariantId)), [initialExcludedSkus]);

  const importedProductKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const product of importedProducts) {
      const key = getProductScopeKey(product);
      if (key) keys.add(key);
      if (product.productVariantId) keys.add(product.productVariantId);
      if (product.skuCode) keys.add(product.skuCode);
    }
    return keys;
  }, [importedProducts]);

  const displayedProducts = useMemo(() => {
    return resolveDisplayedSkuProducts(manualSkuIds, manualProducts, enrichedSelectedProducts).filter(
      (product) => !importedProductKeys.has(product.productVariantId) && !importedProductKeys.has(product.skuCode),
    );
  }, [manualSkuIds, manualProducts, enrichedSelectedProducts, importedProductKeys]);

  const displayedExcludedProducts = useMemo(
    () => resolveDisplayedSkuProducts(excludedSkuIds, selectedExcludedProducts, enrichedExcludedProducts),
    [excludedSkuIds, selectedExcludedProducts, enrichedExcludedProducts],
  );
  const categoryOptions = useMemo(() => flattenCategorySelectOptions(categoryRes ?? []), [categoryRes]);
  const collectionOptions = useMemo(() => (collectionRes?.list ?? []).map((item) => ({ value: item.id, label: item.name })), [collectionRes]);
  const targetErrors = validatePromotionTargetForm(values);
  const showErrors = showValidation || (editable && !initialTarget);
  const setField = <K extends keyof PromotionTargetFormValues>(key: K, value: PromotionTargetFormValues[K]) => {
    setShowValidation(false);
    setValues((current) => ({ ...current, [key]: value }));
  };

  const removeManualSku = (skuId: string) => {
    setField(
      'skuIds',
      values.skuIds.filter((id) => id !== skuId),
    );
    setManualProducts((current) => current.filter((product) => product.productVariantId !== skuId && product.skuCode !== skuId));
  };

  const removeExcludedSku = (skuId: string) => {
    setField(
      'excludedSkuIds',
      values.excludedSkuIds.filter((id) => id !== skuId),
    );
    setSelectedExcludedProducts((current) => current.filter((product) => product.productVariantId !== skuId && product.skuCode !== skuId));
  };

  const handleStartSkuImport = useCallback(
    async (file: File) => {
      if (!topicConfigId) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: 'Chưa có cấu hình import (topic-config). Vui lòng thử lại sau.',
        });
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
      } catch (error) {
        showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
      } finally {
        setImportSubmitting(false);
      }
    },
    [openTaskManager, showSnackbar, startSkuImport, topicConfigId],
  );

  const save = async () => {
    if (!editable || saving) return;
    const errors = validatePromotionTargetForm(values);
    if (Object.keys(errors).length > 0) {
      setShowValidation(true);
      showSnackbar({ message: Object.values(errors)[0], type: SnackbarType.ERROR });
      return;
    }
    if (!isDirty) return;
    setSaving(true);
    try {
      await promotionApi.upsertPromotionDraftTarget(promotionId, { config: buildPromotionTargetConfig(values) });
      await onSaved();
      showSnackbar({ message: 'Đã lưu cấu hình sản phẩm áp dụng.', type: SnackbarType.SUCCESS });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setSaving(false);
    }
  };

  if (!editable && initialTarget) {
    let detailText = formatPromotionTargetSummary(initialTarget);

    if (initialTarget.type === TargetConfigType.CATEGORY) {
      const names = initialTarget.categoryIds.map((id) => findCategoryInTree(categoryRes ?? [], id)?.name ?? id);
      detailText = categoryLoading ? 'Đang tải...' : `Danh mục: ${names.join(', ') || '-'}`;
    }

    if (initialTarget.type === TargetConfigType.COLLECTION) {
      const names = initialTarget.collectionIds.map((id) => collectionRes?.list?.find((item) => item.id === id)?.name ?? id);
      detailText = collectionLoading ? 'Đang tải...' : `Bộ sưu tập: ${names.join(', ') || '-'}`;
    }

    return (
      <Stack>
        <ReadonlyField label="Phạm vi sản phẩm" value={PROMOTION_TARGET_MODE_LABEL[initialTarget.type]} />
        {initialTarget.type === TargetConfigType.UPLOAD_FILE ? (
          <Stack gap={1.5}>
            {isHydratingUploadBatchProducts && importedProducts.length === 0 ? (
              <StackRowAlignCenter gap={1}>
                <CircularProgress size={14} />
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Đang tải danh sách SKU import...</Typography>
              </StackRowAlignCenter>
            ) : null}
            {importedProducts.length > 0 ? (
              <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
                {importedProducts.map((product) => (
                  <StackRowAlignCenter key={getProductScopeKey(product)} gap={1.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
                    <SkuProductThumbnail imageUrl={product.imageUrl} name={product.name} />
                    <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
                        {product.name}
                      </Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }} noWrap>
                        Mã biến thể: {product.skuCode}
                      </Typography>
                    </Stack>
                  </StackRowAlignCenter>
                ))}
              </Stack>
            ) : null}
            {!isHydratingUploadBatchProducts && importedProducts.length === 0 && hydrateUploadBatchError ? (
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B54708' }}>Không tải được danh sách SKU từ lô import. Mở Trình quản lý tác vụ để thử lại.</Typography>
            ) : null}
            {displayedProducts.length > 0 ? (
              <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
                {displayedProducts.map((product) => (
                  <StackRowAlignCenter key={getProductScopeKey(product)} gap={1.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
                    <SkuProductThumbnail imageUrl={product.imageUrl} name={product.name} />
                    <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
                        {product.name}
                      </Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }} noWrap>
                        Mã biến thể: {product.skuCode}
                      </Typography>
                    </Stack>
                  </StackRowAlignCenter>
                ))}
              </Stack>
            ) : null}
          </Stack>
        ) : (
          <ReadonlyField label="Chi tiết" value={detailText} />
        )}
        {initialTarget.type === TargetConfigType.MANUAL ? (
          <>
            {displayedProducts.length > 0 ? (
              <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
                {displayedProducts.map((product) => (
                  <StackRowAlignCenter key={getProductScopeKey(product)} gap={1.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
                    <SkuProductThumbnail imageUrl={product.imageUrl} name={product.name} />
                    <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
                        {product.name}
                      </Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }} noWrap>
                        Mã biến thể: {product.skuCode}
                      </Typography>
                    </Stack>
                  </StackRowAlignCenter>
                ))}
              </Stack>
            ) : null}
          </>
        ) : null}
        <Stack gap={1}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#6B7280' }}>Sản phẩm loại trừ</Typography>
          <PromotionSkuProductList products={displayedExcludedProducts} emptyText="-" />
        </Stack>
        <ReadonlyField label="Điều kiện giá sản phẩm" value={PROMOTION_TARGET_DISCOUNT_FILTER_LABEL[initialTarget.lineFilter?.discountState ?? TargetDiscountStateFilter.ANY]} />
      </Stack>
    );
  }

  if (!editable) {
    return (
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>
        Vui lòng chọn sản phẩm áp dụng trước khi tạo hình thức khuyến mãi. Mọi hình thức khuyến mãi trong chương trình sẽ dùng chung phạm vi này.
      </Typography>
    );
  }

  return (
    <Stack gap={2}>
      <SelectInput
        label="Phạm vi sản phẩm"
        placeholder="Chọn phạm vi sản phẩm"
        disabled={!editable}
        value={values.targetType}
        onChange={(event) => {
          const nextType = event.target.value as TargetConfigType;
          setShowValidation(false);
          setValues((current) => ({
            ...current,
            targetType: nextType,
            ...(nextType !== TargetConfigType.MANUAL ? { uploadBatchId: '', skuIds: [] } : {}),
          }));
          if (nextType !== TargetConfigType.MANUAL) {
            setImportedProducts([]);
            setManualProducts([]);
            setAppliedImportSuccessCount(null);
          }
        }}
        options={TARGET_TYPE_SELECT_OPTIONS}
        requiredMark
      />
      {values.targetType === TargetConfigType.CATEGORY ? (
        <SelectAllInput
          label="Danh mục"
          requiredMark
          value={values.categoryIds}
          onChange={(event) => setField('categoryIds', parseSelectAllValues((event.target as EventTarget & { value: unknown }).value))}
          options={categoryOptions}
          placeholder={categoryLoading ? 'Đang tải danh mục...' : 'Chọn một hoặc nhiều danh mục'}
          disabled={!editable || categoryLoading}
          error={showErrors && Boolean(targetErrors.categoryIds)}
          errorMessage={targetErrors.categoryIds}
        />
      ) : null}
      {values.targetType === TargetConfigType.COLLECTION ? (
        <SelectAllInput
          label="Bộ sưu tập"
          requiredMark
          value={values.collectionIds}
          onChange={(event) => setField('collectionIds', parseSelectAllValues((event.target as EventTarget & { value: unknown }).value))}
          options={collectionOptions}
          placeholder={collectionLoading ? 'Đang tải bộ sưu tập...' : 'Chọn một hoặc nhiều bộ sưu tập'}
          disabled={!editable || collectionLoading}
          error={showErrors && Boolean(targetErrors.collectionIds)}
          errorMessage={targetErrors.collectionIds}
        />
      ) : null}
      {values.targetType === TargetConfigType.MANUAL ? (
        <Stack gap={1.5}>
          <StackRowAlignCenterJustBetween>
            <StackRow gap={1}>
              <ButtonIconContentComponent
                icon={<Plus size={20} color="#737373" />}
                content="Thêm biến thể"
                onClick={() => setPickerOpen(true)}
                {...promotionListButtonPermission('edit', 'Thêm biến thể', 'api_promotion_draft_update')}
              />
              <ButtonIconContentComponent
                icon={<Upload01 size={20} color="#737373" />}
                content="Tải lên file"
                disabled={isJavaBackend()}
                onClick={() => setImportOpen(true)}
                {...promotionListButtonPermission('edit', 'Tải lên file', 'api_promotion_draft_update')}
              />
              {hasActiveImportJob || importSubmitting || currentImportJobId || normalizeUploadBatchId(values.uploadBatchId) ? (
                <ButtonIconContentComponent
                  icon={<LayersThree01 size={20} color="#737373" />}
                  content="Trình quản lý tác vụ"
                  onClick={openTaskManager}
                  {...promotionListButtonPermission('edit', 'Trình quản lý tác vụ', 'api_promotion_draft_update')}
                />
              ) : null}
            </StackRow>
            <StackRowAlignCenter gap={0.5}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Đã chọn:</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>
                {showUploadBatch
                  ? appliedImportSuccessCount != null
                    ? `${appliedImportSuccessCount} SKU (file)${values.skuIds.length > 0 ? ` + ${values.skuIds.length} thủ công` : ''}`
                    : 'File import đã áp dụng'
                  : `${values.skuIds.length} biến thể`}
              </Typography>
            </StackRowAlignCenter>
          </StackRowAlignCenterJustBetween>
          {showUploadBatch && isHydratingUploadBatchProducts && importedProducts.length === 0 ? (
            <StackRowAlignCenter gap={1}>
              <CircularProgress size={14} />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Đang tải danh sách SKU import...</Typography>
            </StackRowAlignCenter>
          ) : null}
          {showUploadBatch && importedProducts.length > 0 ? (
            <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
              {importedProducts.map((product) => (
                <StackRowAlignCenter key={getProductScopeKey(product)} gap={1.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
                  <SkuProductThumbnail imageUrl={product.imageUrl} name={product.name} />
                  <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
                      {product.name}
                    </Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }} noWrap>
                      Mã biến thể: {product.skuCode}
                    </Typography>
                  </Stack>
                </StackRowAlignCenter>
              ))}
            </Stack>
          ) : null}
          {showUploadBatch && !isHydratingUploadBatchProducts && importedProducts.length === 0 && hydrateUploadBatchError ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B54708' }}>Không tải được danh sách SKU từ lô import. Mở Trình quản lý tác vụ để thử lại.</Typography>
          ) : null}
          {showErrors && targetErrors.uploadBatchId ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#EF4444' }}>{targetErrors.uploadBatchId}</Typography> : null}
          {values.skuIds.length > 0 && displayedProducts.length > 0 ? (
            <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
              {displayedProducts.map((product) => (
                <StackRowAlignCenter key={getProductScopeKey(product)} gap={1.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
                  <SkuProductThumbnail imageUrl={product.imageUrl} name={product.name} />
                  <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
                      {product.name}
                    </Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }} noWrap>
                      Mã biến thể: {product.skuCode}
                    </Typography>
                  </Stack>
                  <PermissionIconButton
                    size="small"
                    aria-label="Xóa biến thể"
                    onClick={() => removeManualSku(product.productVariantId || product.skuCode)}
                    {...promotionListButtonPermission('edit', 'Xóa biến thể', 'api_promotion_draft_update')}
                    sx={{ color: '#667085', flexShrink: 0, '&:hover': { color: '#F04438', bgcolor: '#FEF2F2' } }}
                  >
                    <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                  </PermissionIconButton>
                </StackRowAlignCenter>
              ))}
            </Stack>
          ) : null}
          {showErrors && targetErrors.skuIds ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#EF4444' }}>{targetErrors.skuIds}</Typography> : null}
        </Stack>
      ) : null}
      {values.targetType && values.targetType !== TargetConfigType.MANUAL ? (
        <PromotionSkuPickerSection
          title="Sản phẩm loại trừ"
          addButtonLabel="Thêm sản phẩm loại trừ"
          onAdd={() => setExcludedPickerOpen(true)}
          selectedCountLabel={`${values.excludedSkuIds.length} biến thể`}
          products={displayedExcludedProducts}
          onRemove={removeExcludedSku}
        />
      ) : null}
      <SelectInput
        label="Điều kiện giá sản phẩm"
        placeholder="Chọn điều kiện giá sản phẩm"
        disabled={!editable}
        requiredMark
        value={values.discountStateFilter}
        onChange={(event) => setField('discountStateFilter', event.target.value as TargetDiscountStateFilter)}
        options={PROMOTION_TARGET_DISCOUNT_FILTER_OPTIONS.filter(option => !isJavaBackend() || option.value === TargetDiscountStateFilter.ANY)}
        error={showErrors && Boolean(targetErrors.discountStateFilter)}
        errorMessage={targetErrors.discountStateFilter}
      />
      <StackRowJustEnd>
        <CustomButton
          fullWidth={false}
          disabled={!canSave}
          onClick={() => void save()}
          sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none', minWidth: 156, '&:hover': { bgcolor: '#1D2939', boxShadow: 'none' } }}
          {...promotionListButtonPermission('edit', 'Lưu cấu hình', 'api_promotion_draft_update')}
        >
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </CustomButton>
      </StackRowJustEnd>
      <LabelDisplayAddProductDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialSelected={manualProducts.length > 0 ? manualProducts : displayedProducts}
        onApply={(products) => {
          const nextManualProducts = products.filter((product) => !importedProductKeys.has(product.productVariantId) && !importedProductKeys.has(product.skuCode));
          setManualProducts(nextManualProducts);
          setField('skuIds', nextManualProducts.map((product) => product.productVariantId).filter(Boolean));
        }}
      />
      <LabelDisplayAddProductDialog
        open={excludedPickerOpen}
        onClose={() => setExcludedPickerOpen(false)}
        initialSelected={selectedExcludedProducts.length > 0 ? selectedExcludedProducts : displayedExcludedProducts}
        useSearch
        categoryIds={values.targetType === TargetConfigType.CATEGORY ? values.categoryIds : undefined}
        collectionIds={values.targetType === TargetConfigType.COLLECTION ? values.collectionIds : undefined}
        onApply={(products) => {
          setSelectedExcludedProducts(products);
          setField('excludedSkuIds', [...new Set(products.map((product) => product.productVariantId).filter(Boolean))]);
        }}
      />
      <ProductSpuImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        submitting={importSubmitting}
        onDownloadTemplate={() => {
          const link = document.createElement('a');
          link.href = LABEL_DISPLAY_SKU_IMPORT_SAMPLE_URL;
          link.download = 'file-mau-import-sku-label.xlsx';
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
        jobs={{ list: ieJobsRes?.list ?? [], total: ieJobsRes?.total ?? ieJobsRes?.list?.length ?? 0 }}
        loading={taskManagerJobsLoading}
        knownFileNames={importKnownFileNames}
        applyImportJobId={currentImportJobId}
        applyingJobId={applyingJobId}
        onApplyImportJob={(jobId) => void applyImportJobToForm(jobId)}
      />
    </Stack>
  );
};
