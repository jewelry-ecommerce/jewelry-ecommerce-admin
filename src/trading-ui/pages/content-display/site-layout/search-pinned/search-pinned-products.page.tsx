import { Stack, Typography } from '@mui/material';
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { Plus } from '@untitledui/icons';
import { productApi, searchPinnedApi } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { getTenantCodeHeader } from '../../../../common/config';
import { CustomButton } from '../../../../components/button/custom-button';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { WrapperComponent } from '../../../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { SearchPinnedAddProductDialog } from './components/search-pinned-add-product-dialog.component';
import type { LabelDisplaySelectedProduct } from '../../label/label-display/label-display.interface';
import { SEARCH_PINNED_SLOT_COUNT, buildSearchPinnedSwrKey } from './search-pinned.constants';
import { SearchPinnedRowCard, type SearchPinnedRow } from './components/search-pinned-row-card.component';
import { buildRowsFromPins, createRowKey, firstFreePosition, isLandingPin, toIsoEnd, toIsoStart } from './search-pinned.utils';
import { EmptyComponent } from '../../../../components/empty';
import { contentSearchPinnedButtonPermission } from '../../content-permission.constants';
import { ContentSettingsEditToolbar } from '../../components/content-settings-edit-toolbar.component';
import { useContentSettingsViewMode } from '../../hooks/use-content-settings-view-mode.hook';
import { STYLE } from '@/trading-ui/adapters/library';

const SearchPinnedProductsPage = () => {
  const { showSnackbar } = useSnackbar();
  const [rows, setRows] = useState<SearchPinnedRow[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerRowKey, setPickerRowKey] = useState<string | null>(null);
  const [collapseAllSignal, setCollapseAllSignal] = useState<number>(0);
  const rowsSnapshotRef = useRef<SearchPinnedRow[]>([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const tenantCode = getTenantCodeHeader();

  const {
    data: landingPins,
    isLoading,
    mutate,
  } = useSWR(
    buildSearchPinnedSwrKey(tenantCode),
    async () => {
      const res = await searchPinnedApi.getSearchPinnedList();
      return (res.list ?? []).filter(isLandingPin);
    },
    { revalidateOnFocus: false },
  );

  const resetRowsFromServer = useCallback(async () => {
    if (landingPins === undefined) return;
    const next = await buildRowsFromPins(landingPins, (productId) => productApi.getAdminProductDetail(productId));
    rowsSnapshotRef.current = next;
    setRows(next);
    setDirty(false);
  }, [landingPins]);

  const { viewMode, enterEditMode, cancelEditMode, exitEditModeAfterSave } = useContentSettingsViewMode(() => {
    void resetRowsFromServer();
  });

  useEffect(() => {
    if (landingPins === undefined) return;

    let cancelled = false;
    void (async () => {
      const next = await buildRowsFromPins(landingPins, (productId) => productApi.getAdminProductDetail(productId));
      if (!cancelled) {
        rowsSnapshotRef.current = next;
        setRows(next);
        setDirty(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [landingPins]);

  const sortedRows = useMemo(() => [...rows].sort((a, b) => a.position - b.position), [rows]);

  const usedProductIds = useMemo(() => new Set(rows.map((r) => r.product?.productId).filter(Boolean) as string[]), [rows]);

  const pickerRow = rows.find((r) => r.rowKey === pickerRowKey);
  const pickerInitialSelected = pickerRow?.product ? [pickerRow.product] : [];

  const markDirty = () => setDirty(true);

  const updateRow = (rowKey: string, patch: Partial<SearchPinnedRow>) => {
    setRows((prev) => prev.map((row) => (row.rowKey === rowKey ? { ...row, ...patch } : row)));
    markDirty();
  };

  const handleApplyProduct = useCallback(
    (items: LabelDisplaySelectedProduct[]) => {
      if (!pickerRowKey) return;
      const picked = items[0] ?? null;
      const currentRow = rows.find((r) => r.rowKey === pickerRowKey);
      if (picked && usedProductIds.has(picked.productId) && currentRow?.product?.productId !== picked.productId) {
        showSnackbar({ type: SnackbarType.ERROR, message: 'Sản phẩm này đã được chọn ở dòng khác.' });
        return;
      }
      updateRow(pickerRowKey, { product: picked });
      setPickerRowKey(null);
    },
    [pickerRowKey, rows, showSnackbar, usedProductIds],
  );

  const addRow = () => {
    if (rows.length >= SEARCH_PINNED_SLOT_COUNT) {
      showSnackbar({ type: SnackbarType.ERROR, message: `Tối đa ${SEARCH_PINNED_SLOT_COUNT} sản phẩm.` });
      return;
    }
    setRows((prev) => [
      ...prev,
      {
        rowKey: createRowKey(),
        product: null,
        position: firstFreePosition(prev),
        startDate: '',
        endDate: '',
      },
    ]);
    markDirty();
  };

  const removeRow = (rowKey: string) => {
    setRows((prev) => prev.filter((row) => row.rowKey !== rowKey));
    markDirty();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedRows.findIndex((r) => r.rowKey === String(active.id));
    const newIndex = sortedRows.findIndex((r) => r.rowKey === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(sortedRows, oldIndex, newIndex).map((row, index) => ({
      ...row,
      position: index,
    }));

    setRows(reordered);
    markDirty();
  };

  const handlePositionChange = (rowKey: string, nextPosition: number) => {
    setRows((prev) => {
      const next = prev.map((row) => ({ ...row }));
      const index = next.findIndex((row) => row.rowKey === rowKey);
      if (index < 0) return prev;

      const current = next[index];
      const conflictIndex = next.findIndex((row) => row.rowKey !== rowKey && row.position === nextPosition);
      if (conflictIndex >= 0) {
        next[conflictIndex] = { ...next[conflictIndex], position: current.position };
      }
      next[index] = { ...current, position: nextPosition };
      return next;
    });
    markDirty();
  };

  const validateRows = (): string | null => {
    if (rows.some((row) => !row.product)) {
      return 'Vui lòng chọn sản phẩm cho mỗi dòng.';
    }

    if (rows.some((row) => !row.startDate.trim())) {
      return 'Vui lòng nhập ngày bắt đầu cho mỗi dòng.';
    }

    const positions = rows.map((row) => row.position);
    if (new Set(positions).size !== positions.length) {
      return 'Mỗi vị trí chỉ được gán cho một sản phẩm.';
    }

    if (rows.some((row) => row.endDate.trim() && row.startDate > row.endDate)) {
      return 'Ngày bắt đầu không được sau ngày kết thúc.';
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateRows();
    if (validationError) {
      showSnackbar({ type: SnackbarType.ERROR, message: validationError });
      return;
    }

    setSaving(true);
    try {
      const desired = rows
        .filter((row): row is SearchPinnedRow & { product: LabelDisplaySelectedProduct } => Boolean(row.product))
        .map((row) => ({
          pinnedId: row.pinnedId,
          position: row.position,
          product: row.product,
          startDate: toIsoStart(row.startDate),
          endDate: row.endDate.trim() ? toIsoEnd(row.endDate) : null,
        }));

      const serverPins = (await searchPinnedApi.getSearchPinnedList()).list.filter(isLandingPin);
      const desiredPinnedIds = new Set(desired.map((d) => d.pinnedId).filter(Boolean) as string[]);

      for (const pin of serverPins) {
        if (!desiredPinnedIds.has(pin.id)) {
          await searchPinnedApi.deleteSearchPinned(pin.id);
        }
      }

      for (const item of desired) {
        const payload = {
          productId: item.product.productId,
          position: item.position,
          keywordPattern: null as null,
          startDate: item.startDate,
          endDate: item.endDate,
        };

        if (item.pinnedId) {
          await searchPinnedApi.patchSearchPinned(item.pinnedId, payload);
        } else {
          await searchPinnedApi.postSearchPinned(payload);
        }
      }

      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã lưu sản phẩm ô tìm kiếm.' });
      setDirty(false);
      await mutate();
      exitEditModeAfterSave();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)` }}>
        <WrapperComponent label="Sản phẩm ô tìm kiếm">
          <LoadingComponent />
        </WrapperComponent>
      </Stack>
    );
  }

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <WrapperComponent
        label="Sản phẩm ô tìm kiếm"
        sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        nodeLabel={
          <StackRowAlignCenterJustBetween sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E5E7EB' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Tối đa {SEARCH_PINNED_SLOT_COUNT} sản phẩm · chỉnh vị trí, thời gian hiển thị rồi bấm Lưu.</Typography>
            <StackRowAlignCenter gap={1}>
              <CustomButton
                type="button"
                variant="outline"
                fullWidth={false}
                disabled={sortedRows.length === 0}
                onClick={() => setCollapseAllSignal(Date.now())}
                sx={{ px: 1.25, py: 0.5, flexShrink: 0 }}
              >
                Thu gọn tất cả
              </CustomButton>
              <ContentSettingsEditToolbar
                viewMode={viewMode}
                onEnterEdit={enterEditMode}
                onCancelEdit={cancelEditMode}
                editPermission={contentSearchPinnedButtonPermission('search_pinned_edit', 'Chỉnh sửa sản phẩm ghim tìm kiếm', 'api_product_search_pinned_update')}
                cancelPermission={contentSearchPinnedButtonPermission('search_pinned_edit', 'Hủy chỉnh sửa sản phẩm ghim tìm kiếm', 'api_product_search_pinned_update')}
                editActions={
                  <>
                    <CustomButton
                      variant="outline"
                      fullWidth={false}
                      startIcon={<Plus size={16} />}
                      disabled={rows.length >= SEARCH_PINNED_SLOT_COUNT}
                      onClick={addRow}
                      sx={{ textTransform: 'none' }}
                      {...contentSearchPinnedButtonPermission('search_pinned_add', 'Thêm sản phẩm', 'api_product_search_pinned_update')}
                    >
                      Thêm sản phẩm
                    </CustomButton>
                    <CustomButton
                      variant="primary"
                      fullWidth={false}
                      disabled={!dirty}
                      loading={saving}
                      onClick={() => void handleSave()}
                      sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none' }}
                      {...contentSearchPinnedButtonPermission('search_pinned_save', 'Lưu', 'api_product_search_pinned_update')}
                    >
                      {saving ? 'Đang lưu...' : 'Lưu'}
                    </CustomButton>
                  </>
                }
              />
            </StackRowAlignCenter>
          </StackRowAlignCenterJustBetween>
        }
      >
        <Stack sx={{ flex: 1, minHeight: 0, overflow: 'auto', py: 2, gap: 2, width: '100%', px: 0 }}>
          {sortedRows.length === 0 ? <EmptyComponent /> : null}

          {sortedRows.length > 0 ? (
            <DndContext sensors={viewMode ? [] : sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={viewMode ? () => undefined : handleDragEnd}>
              <SortableContext items={sortedRows.map((r) => r.rowKey)} strategy={verticalListSortingStrategy}>
                <Stack gap={2}>
                  {sortedRows.map((row, displayIndex) => (
                    <SearchPinnedRowCard
                      key={row.rowKey}
                      row={row}
                      viewMode={viewMode}
                      displayIndex={displayIndex}
                      collapseAllSignal={collapseAllSignal}
                      onRemove={removeRow}
                      onPickProduct={(rowKey) => setPickerRowKey(rowKey)}
                      onPositionChange={handlePositionChange}
                      onStartDateChange={(rowKey, next) => updateRow(rowKey, { startDate: next })}
                      onEndDateChange={(rowKey, next) => updateRow(rowKey, { endDate: next })}
                    />
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          ) : null}
        </Stack>
      </WrapperComponent>

      <SearchPinnedAddProductDialog open={pickerRowKey !== null} onClose={() => setPickerRowKey(null)} initialSelected={pickerInitialSelected} onApply={handleApplyProduct} />
    </Stack>
  );
};

export default SearchPinnedProductsPage;
