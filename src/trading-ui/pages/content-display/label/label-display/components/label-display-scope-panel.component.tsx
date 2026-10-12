import { Box, FormControlLabel, Radio, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { CloseRounded as IconElement } from '@mui/icons-material';
import { LayersThree01, Plus, Upload01 } from '@untitledui/icons';
import { categoryApi } from '../../../../../apis/category/category.api';
import { collectionApi } from '../../../../../apis/collection/collection.api';
import { promotionApi } from '@/apis/java/java-label-picker.api';
import { CategoryStatus } from '../../../../../apis/category/category.enum';
import { CollectionStatus } from '../../../../../apis/collection/collection.enum';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../../../common/config/runtime-config';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { ButtonIconContentComponent } from '../../../../../components/button';
import { PermissionIconButton } from '../../../../../components/button/permission-icon-button';
import { contentLabelDisplayButtonPermission } from '../../../content-permission.constants';
import { SelectAllInput, SelectAttributeTreeInput } from '../../../../../components/form';
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../components/styled/stack.style';
import { buildCategoryTreeSelectOptions, findCategoryInTree, getCategoryTreeValuesFromUuid } from '../../../../product/product-spu/utils/product-spu-category-tree.utils';
import { getPromotionDraftStatusLabel, getPublishedPromotionStatusLabel } from '@/apis/java/java-label-picker.api';
import type { LabelDisplayPromotionPickItem, LabelDisplayPromotionSource, LabelDisplaySelectedCategory, LabelDisplaySelectedCollection, LabelDisplaySelectedProduct } from '../label-display.interface';
import { LabelDisplayAddProductDialog } from './label-display-add-product-dialog.component';

const UUID_LIKE_PATTERN = /^[1-9][0-9]*$/;
const PROMOTION_PAGE_SIZE = 20;

const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

export interface LabelDisplayScopePanelProps {
  scopeAll: boolean;
  scopePromotion: boolean;
  scopeCategory: boolean;
  scopeCollection: boolean;
  scopeProduct: boolean;
  formDisabled?: boolean;
  viewMode?: boolean;
  onToggleAll: (checked: boolean) => void;
  onTogglePromotion: (checked: boolean) => void;
  onToggleCategory: (checked: boolean) => void;
  onToggleCollection: (checked: boolean) => void;
  onToggleProduct: (checked: boolean) => void;
  selectedPromotions: LabelDisplayPromotionPickItem[];
  onPromotionsChange: (value: LabelDisplayPromotionPickItem[]) => void;
  selectedCategories: LabelDisplaySelectedCategory[];
  onCategoriesChange: (rows: LabelDisplaySelectedCategory[]) => void;
  selectedCollections: LabelDisplaySelectedCollection[];
  onCollectionsChange: (rows: LabelDisplaySelectedCollection[]) => void;
  selectedProducts: LabelDisplaySelectedProduct[];
  onProductsChange: (rows: LabelDisplaySelectedProduct[]) => void;
  onImportExcel?: () => void;
  showTaskManagerButton?: boolean;
  onOpenTaskManager?: () => void;
}

const mapCampaignToPickItem = (item: { id: string; source: 'DRAFT' | 'PUBLISHED'; name: string; draftStatus?: string; promotionStatus?: string }): LabelDisplayPromotionPickItem | null => {
  const id = String(item.id ?? '').trim();
  if (!UUID_LIKE_PATTERN.test(id)) return null;
  const source = item.source as LabelDisplayPromotionSource;
  if (source === 'DRAFT') {
    const status = item.draftStatus;
    if (status !== 'EDITING' && status !== 'READY_TO_PUBLISH') return null;
    const statusLabel = getPromotionDraftStatusLabel(status as never);
    return { id, source, name: item.name, label: `${item.name} (${statusLabel})`, statusLabel };
  }
  if (source === 'PUBLISHED') {
    const status = item.promotionStatus;
    if (status !== 'SCHEDULED' && status !== 'ACTIVE' && status !== 'PUBLISHED') return null;
    const statusLabel = getPublishedPromotionStatusLabel(status);
    return { id, source, name: item.name, label: `${item.name} (${statusLabel})`, statusLabel };
  }
  return null;
};

const usePromotionPicker = (enabled: boolean) => {
  const { data, size, setSize, isValidating } = useSWRInfinite(
    (pageIndex) => (enabled ? (['label-display-promotions-picker', pageIndex + 1] as const) : null),
    ([, page]) => promotionApi.getCampaignOverview({ includeArchived: false, page, limit: PROMOTION_PAGE_SIZE }),
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const promotions =
    data
      ?.flatMap((page) => page.items ?? [])
      .map(mapCampaignToPickItem)
      .filter((item): item is LabelDisplayPromotionPickItem => item != null) ?? [];
  const lastPage = data?.at(-1);
  const hasMore = lastPage?.items?.length === PROMOTION_PAGE_SIZE;
  const isLoadingMore = isValidating && (data?.length ?? 0) < size;
  const loadMore = () => {
    if (hasMore && !isLoadingMore) setSize(size + 1);
  };

  return { promotions, hasMore, isLoadingMore, loadMore };
};

export const LabelDisplayScopePanel = ({
  scopeAll,
  scopePromotion,
  scopeCategory,
  scopeCollection,
  scopeProduct,
  formDisabled = false,
  viewMode = false,
  onToggleAll,
  onTogglePromotion,
  onToggleCategory,
  onToggleCollection,
  onToggleProduct,
  selectedPromotions,
  onPromotionsChange,
  selectedCategories,
  onCategoriesChange,
  selectedCollections,
  onCollectionsChange,
  selectedProducts,
  onProductsChange,
  onImportExcel,
  showTaskManagerButton = false,
  onOpenTaskManager,
}: LabelDisplayScopePanelProps) => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryTreeRequested, setCategoryTreeRequested] = useState(selectedCategories.length > 0);
  const panelDisabled = formDisabled || viewMode;

  const shouldFetchCategoryTree = scopeCategory && (categoryTreeRequested || selectedCategories.length > 0);

  const { data: categoryTree } = useSWR(
    shouldFetchCategoryTree ? (['label-display-category-tree'] as const) : null,
    () => categoryApi.getCategoryTree({ compact: true, status: CategoryStatus.ACTIVE }),
    { revalidateOnFocus: false },
  );

  const collectionsSwr = useSWR(scopeCollection ? (['label-display-collections'] as const) : null, () => collectionApi.getCollectionList({ isPagination: false, status: CollectionStatus.ACTIVE }), {
    revalidateOnFocus: false,
  });

  const promotionPicker = usePromotionPicker(scopePromotion);

  const categoryTreeOptions = useMemo(() => buildCategoryTreeSelectOptions(categoryTree ?? []), [categoryTree]);
  const categoryTreeValue = useMemo(() => selectedCategories.flatMap((category) => getCategoryTreeValuesFromUuid(category.id, categoryTreeOptions)), [categoryTreeOptions, selectedCategories]);

  const collectionOptions = useMemo(
    () => (collectionsSwr.data?.list ?? []).map((item) => ({ value: String(item.id ?? '').trim(), label: item.name, imageUrl: item.image ?? '' })).filter((item) => UUID_LIKE_PATTERN.test(item.value)),
    [collectionsSwr.data?.list],
  );

  const promotionOptions = useMemo(() => {
    const fromApi = promotionPicker.promotions;
    const byKey = new Map(fromApi.map((p) => [`${p.source}:${p.id}`, p]));
    for (const selected of selectedPromotions) {
      const key = `${selected.source}:${selected.id}`;
      if (!byKey.has(key)) byKey.set(key, selected);
    }
    return [...byKey.values()].map((p) => ({ value: `${p.source}:${p.id}`, label: p.label }));
  }, [promotionPicker.promotions, selectedPromotions]);

  const handleCategoryTreeChange = useCallback(
    (values: readonly string[]) => {
      const rows: LabelDisplaySelectedCategory[] = [];
      for (const valuePath of values) {
        const categoryId = valuePath.split(':').filter(Boolean).at(-1) ?? '';
        const category = findCategoryInTree(categoryTree ?? [], categoryId);
        if (!category) continue;
        rows.push({
          id: category.id,
          name: category.name,
          imageUrl: category.image ?? category.logo ?? '',
        });
      }
      onCategoriesChange(rows);
    },
    [categoryTree, onCategoriesChange],
  );

  const handleCollectionsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = (e.target as EventTarget & { value: unknown }).value;
      const ids = Array.isArray(raw) ? raw.map(String).filter((id) => UUID_LIKE_PATTERN.test(id)) : [];
      const byId = new Map(collectionOptions.map((o) => [o.value, o]));
      onCollectionsChange(
        ids.map((id) => {
          const opt = byId.get(id);
          const prev = selectedCollections.find((c) => c.id === id);
          return {
            id,
            name: opt?.label ?? prev?.name ?? id,
            imageUrl: opt?.imageUrl ?? prev?.imageUrl ?? '',
          };
        }),
      );
    },
    [collectionOptions, onCollectionsChange, selectedCollections],
  );

  const handlePromotionsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = (e.target as EventTarget & { value: unknown }).value;
      const keys = Array.isArray(raw) ? raw.map(String) : [];
      const byKey = new Map(promotionPicker.promotions.map((p) => [`${p.source}:${p.id}`, p]));
      for (const selected of selectedPromotions) {
        byKey.set(`${selected.source}:${selected.id}`, selected);
      }
      onPromotionsChange(keys.map((key) => byKey.get(key)).filter((p): p is LabelDisplayPromotionPickItem => !!p));
    },
    [onPromotionsChange, promotionPicker.promotions, selectedPromotions],
  );

  const removeProduct = useCallback(
    (productVariantId: string) => {
      onProductsChange(selectedProducts.filter((p) => p.productVariantId !== productVariantId));
    },
    [onProductsChange, selectedProducts],
  );

  return (
    <React.Fragment>
      <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', bgcolor: '#FFF', p: 2, gap: 1.5, height: '100%' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Phạm vi áp dụng</Typography>

        <FormControlLabel
          control={<Radio checked={scopeAll} disabled={panelDisabled} onChange={(_, c) => onToggleAll(c)} size="small" />}
          label={<Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' }}>Tất cả sản phẩm</Typography>}
        />

        <FormControlLabel
          control={<Radio checked={scopePromotion} disabled={panelDisabled} onChange={(_, c) => onTogglePromotion(c)} size="small" />}
          label={<Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' }}>Theo Promotion</Typography>}
        />
        {scopePromotion ? (
          <SelectAllInput
            name="promotions"
            label="Promotion"
            placeholder="Chọn promotion..."
            searchable
            searchPlaceholder="Tìm promotion..."
            options={promotionOptions}
            hasMore={promotionPicker.hasMore}
            isLoadingMore={promotionPicker.isLoadingMore}
            onLoadMore={promotionPicker.loadMore}
            value={selectedPromotions.map((p) => `${p.source}:${p.id}`)}
            disabled={panelDisabled}
            onChange={handlePromotionsChange}
          />
        ) : null}

        <FormControlLabel
          control={<Radio checked={scopeCategory} disabled={panelDisabled} onChange={(_, c) => onToggleCategory(c)} size="small" />}
          label={<Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' }}>Theo danh mục</Typography>}
        />
        {scopeCategory ? (
          <SelectAttributeTreeInput
            label="Danh mục sản phẩm áp dụng"
            independentParentSelection
            placeholder="Chọn danh mục"
            options={categoryTreeOptions}
            value={categoryTreeValue}
            onChange={handleCategoryTreeChange}
            onOpen={() => setCategoryTreeRequested(true)}
            disabled={panelDisabled}
          />
        ) : null}

        <FormControlLabel
          control={<Radio checked={scopeCollection} disabled={panelDisabled} onChange={(_, c) => onToggleCollection(c)} size="small" />}
          label={<Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' }}>Theo Bộ sưu tập</Typography>}
        />
        {scopeCollection ? (
          <SelectAllInput
            name="collections"
            label="Bộ sưu tập"
            placeholder="Chọn bộ sưu tập..."
            searchable
            searchPlaceholder="Tìm bộ sưu tập..."
            options={collectionOptions.map((o) => ({ value: o.value, label: o.label }))}
            value={selectedCollections.map((c) => c.id)}
            disabled={panelDisabled}
            onChange={handleCollectionsChange}
          />
        ) : null}

        <FormControlLabel
          control={<Radio checked={scopeProduct} disabled={panelDisabled} onChange={(_, c) => onToggleProduct(c)} size="small" />}
          label={<Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' }}>Theo biến thể sản phẩm</Typography>}
        />
        {scopeProduct ? (
          <Stack spacing={1.5}>
            <StackRowAlignCenterJustBetween>
              {!panelDisabled ? (
                <StackRow gap={1}>
                  <ButtonIconContentComponent
                    icon={<Plus size={20} color="#737373" />}
                    content="Thêm biến thể"
                    onClick={() => setProductDialogOpen(true)}
                    {...contentLabelDisplayButtonPermission('label_display_add_product', 'Thêm biến thể', 'api_cms_page_update')}
                  />
                  <ButtonIconContentComponent
                    icon={<Upload01 size={20} color="#737373" />}
                    content="Import Excel"
                    disabled={!onImportExcel}
                    onClick={onImportExcel}
                    {...contentLabelDisplayButtonPermission('label_display_import_excel', 'Import Excel', 'api_cms_page_update')}
                  />
                  {showTaskManagerButton ? (
                    <ButtonIconContentComponent
                      icon={<LayersThree01 size={20} color="#737373" />}
                      content="Trình quản lý tác vụ"
                      onClick={onOpenTaskManager}
                      {...contentLabelDisplayButtonPermission('label_display_task_manager', 'Trình quản lý tác vụ', 'api_cms_page_update')}
                    />
                  ) : null}
                </StackRow>
              ) : (
                <Box />
              )}
              <StackRowAlignCenter gap={0.5}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Đã chọn:</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#111827' }}>{selectedProducts.length} biến thể</Typography>
              </StackRowAlignCenter>
            </StackRowAlignCenterJustBetween>
            {selectedProducts.length > 0 ? (
              <Stack sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {selectedProducts.map((p) => (
                  <StackRowAlignCenter key={p.productVariantId} sx={{ justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                    <StackRowAlignCenter gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
                      {!panelDisabled ? (
                        <PermissionIconButton
                          size="small"
                          onClick={() => removeProduct(p.productVariantId)}
                          aria-label="Xóa"
                          {...contentLabelDisplayButtonPermission('label_display_remove_product', 'Xóa sản phẩm', 'api_cms_page_update')}
                          sx={{ color: '#475467' }}
                        >
                          <IconElement fontSize="small" />
                        </PermissionIconButton>
                      ) : null}
                      <Box
                        component="img"
                        src={p.imageUrl || productDefaultImageSrc}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.src = productDefaultImageSrc;
                        }}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          objectFit: 'contain',
                          flexShrink: 0,
                          bgcolor: '#F3F4F6',
                        }}
                      />
                      <Stack sx={{ minWidth: 0, gap: 0.25 }}>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }} noWrap>
                          {p.name}
                        </Typography>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }} noWrap>
                          Mã biến thể: {p.skuCode}
                        </Typography>
                      </Stack>
                    </StackRowAlignCenter>
                  </StackRowAlignCenter>
                ))}
              </Stack>
            ) : null}
          </Stack>
        ) : null}
      </Stack>

      {!viewMode ? <LabelDisplayAddProductDialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} initialSelected={selectedProducts} onApply={onProductsChange} /> : null}
    </React.Fragment>
  );
};
