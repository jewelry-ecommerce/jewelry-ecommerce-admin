import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import { CustomButton } from '../../../../../components/button';
import { productCollectionButtonPermission } from '../../../product-permission.constants';
import { Plus, XCircle } from '@untitledui/icons';

import { DataTable, DataTablePagination, DataTableToolbar, type DataTableToolbarAction } from '@/components/data-table';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { ROUTE_PATH } from '@/router/route.path';
import type { CollectionDetailHeaderInfo, CollectionDetailRow } from './collection-detail.interface';
import { useCollectionDetailState } from './use-collection-detail-state.hook';
import { SwitchContentElement } from '../../../../../components/switch/switch-content.element';
import { LabelFormPageHeader } from '@/trading-ui/pages/content-display/label/components/label-form-page-header.component';
import { EmptyComponent } from '@/components/empty/empty.component';
import { LoadingComponent } from '../../../../../components/loading/loading.component';
import { DialogConfirmComponent } from '../../../../../components/dialog/dialog-confirm.component';
import { COLLECTION_DETAIL_PAGE_SIZE_OPTIONS } from './collection-detail.constant';
import { buildCollectionProductTableColumns, COLLECTION_PRODUCT_TABLE_MIN_WIDTH } from './utils/collection-product-table-columns.util';
import { CollectionDetailCreatePart } from './parts/collection-detail-create/collection-detail-create.part';

type LocationState = {
  collection?: {
    id: string;
    name: string;
    brandName: string;
    isActive?: boolean;
  };
};

const cardSurfaceSx = {
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  bgcolor: '#FFFFFF',
};

const CollectionDetailPage = () => {
  // hook
  const navigate = useNavigate();
  const location = useLocation();
  const { collectionId } = useParams<{ collectionId: string }>();

  // state
  const locationState = (location.state ?? {}) as LocationState;
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [singleDeleteRow, setSingleDeleteRow] = useState<CollectionDetailRow | null>(null);
  const [leaveUnsavedOpen, setLeaveUnsavedOpen] = useState(false);

  // function
  const initialHeader = useMemo<CollectionDetailHeaderInfo | null>(() => {
    const cached = locationState.collection;
    if (cached) {
      return {
        id: cached.id,
        name: cached.name,
        brandName: cached.brandName,
        isActive: cached.isActive ?? true,
      };
    }
    if (!collectionId) return null;
    return { id: collectionId, name: '—', brandName: '—', isActive: true };
  }, [collectionId, locationState.collection]);

  const d = useCollectionDetailState({ initialHeader });

  const goToCollectionList = useCallback(() => {
    navigate(ROUTE_PATH.COLLECTION_LIST);
  }, [navigate]);

  const handleBackFromDetail = useCallback(() => {
    if (d.isDraftDirty) {
      setLeaveUnsavedOpen(true);
      return;
    }
    goToCollectionList();
  }, [d.isDraftDirty, goToCollectionList]);

  const requestDeleteRow = useCallback((row: CollectionDetailRow) => {
    setSingleDeleteRow(row);
  }, []);

  const productTableActions = useMemo(
    () => ({
      onDelete: requestDeleteRow,
    }),
    [requestDeleteRow],
  );

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        key: 'add',
        label: 'Thêm sản phẩm',
        ...productCollectionButtonPermission('edit', 'Thêm sản phẩm vào bộ sưu tập', 'api_collection_update'),
        variant: 'primary',
        icon: <Plus size={18} color="#FFFFFF" />,
        onClick: () => setAddProductOpen(true),
      },
    ],
    [],
  );

  const columns = useMemo(() => buildCollectionProductTableColumns(productTableActions), [productTableActions]);

  const hasSelected = d.selectedRowIds.length > 0;
  const showInitialLoading = d.isLoading && !d.header.id;
  const totalRows = d.filteredRows.length;
  const headerDescription = d.header.description?.trim();
  const existingProductIds = useMemo(() => d.rows.map((row) => row.productId), [d.rows]);

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
        bgcolor: '#F9FAFB',
        gap: 0,
      }}
    >
      <LabelFormPageHeader variant="backOnly" onBack={handleBackFromDetail} />

      <StackRowAlignCenterJustBetween sx={{ px: 3, py: 2, gap: 1.5, backgroundColor: '#FFFFFF' }}>
        <Stack gap={0.5}>
          <StackRowAlignCenter gap={1} sx={{ minWidth: 0 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].semibold, color: '#101828' }}>{d.header.name}</Typography>
          </StackRowAlignCenter>
          {headerDescription ? <Typography sx={{ ...TYPOGRAPHY_STYLES.md.regular, color: '#667085', whiteSpace: 'pre-wrap' }}>{headerDescription}</Typography> : null}
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.regular, color: '#667085' }}>{d.header.brandName}</Typography>
        </Stack>
        <StackRowAlignCenter gap={2} sx={{ flexShrink: 0 }}>
          <SwitchContentElement
            content={d.draftIsActive ? 'Kích hoạt' : 'Ngừng kích hoạt'}
            name="collectionDetailActive"
            value={d.draftIsActive}
            disabled={d.isMutating}
            onChange={(e) => d.setDraftIsActive(Boolean(e?.target?.value))}
          />
          {d.isDraftDirty ? (
            <>
              <CustomButton
                variant="outline"
                fullWidth={false}
                disabled={d.isMutating}
                onClick={d.discardDraft}
                sx={{ borderRadius: 2, padding: '8px 12px', borderColor: '#111827', color: '#111827' }}
              >
                Huỷ
              </CustomButton>
              <CustomButton
                variant="primary"
                fullWidth={false}
                disabled={d.isMutating}
                onClick={() => void d.saveDraft()}
                {...productCollectionButtonPermission('edit', 'Lưu bộ sưu tập', 'api_collection_update')}
                sx={{ borderRadius: 2, padding: '8px 12px', bgcolor: '#111827', color: '#FFFFFF' }}
              >
                Lưu
              </CustomButton>
            </>
          ) : null}
        </StackRowAlignCenter>
      </StackRowAlignCenterJustBetween>

      <Stack sx={{ flex: 1, minHeight: 0, overflow: 'hidden', p: 3, gap: 2 }}>
        <Box sx={{ p: '16px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', borderRadius: '10px' }}>
          <DataTableToolbar embedded searchValue={d.searchValue} onSearchChange={(e) => d.setSearchValue(e)} searchPlaceholder="Tìm theo Tên sản phẩm, Mã sản phẩm..." actions={toolbarActions} />
        </Box>

        {showInitialLoading ? (
          <LoadingComponent />
        ) : d.pagedRows.length === 0 ? (
          <EmptyComponent />
        ) : (
          <Stack sx={{ flex: 1, minHeight: 0, flexDirection: 'column', width: '100%', gap: 2 }}>
            <Box sx={{ ...cardSurfaceSx, px: 2, py: 1.5 }}>
              <StackRowAlignCenter gap={1.5} flexWrap="wrap">
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#344054' }}>{hasSelected ? `Đã chọn: ${d.selectedRowIds.length}` : 'Chọn tất cả'}</Typography>
                <CustomButton
                  variant="primary"
                  fullWidth={false}
                  startIcon={<XCircle size={20} />}
                  disabled={!hasSelected || d.isMutating}
                  onClick={() => setBulkDeleteOpen(true)}
                  {...productCollectionButtonPermission('edit', 'Xóa sản phẩm khỏi bộ sưu tập', 'api_collection_update')}
                  sx={{
                    borderRadius: '10px',
                    bgcolor: '#DC2626',
                    color: '#FFFFFF',
                    boxShadow: 'none',
                    '&:disabled': { bgcolor: '#FECACA', color: '#FFFFFF' },
                  }}
                >
                  Xoá sản phẩm
                </CustomButton>
              </StackRowAlignCenter>
            </Box>

            <Stack
              sx={{
                flex: 1,
                minHeight: 0,
                borderRadius: '10px 10px 0 0',
                border: '1px solid #E5E7EB',
                borderBottom: '1px solid #E5E7EB',
                overflow: 'hidden',
                bgcolor: '#FFFFFF',
              }}
            >
              <DataTable
                rows={d.pagedRows}
                columns={columns}
                getRowId={(r) => r.id}
                selectable
                selectedRowIds={d.selectedRowIds}
                onToggleSelectAll={(checked, rows) => d.setSelectedRowIds(checked ? rows.map((r) => r.id) : [])}
                onToggleSelectRow={(row, checked) => d.setSelectedRowIds((prev) => (checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)))}
                tableMinWidth={COLLECTION_PRODUCT_TABLE_MIN_WIDTH}
                containerSx={{
                  flex: 1,
                  minHeight: 0,
                  height: '100%',
                  '& .MuiTable-root': { width: '100%', minWidth: COLLECTION_PRODUCT_TABLE_MIN_WIDTH },
                }}
                emptyTitle="Không có sản phẩm"
                emptyDescription="Bộ sưu tập chưa có sản phẩm nào."
              />
            </Stack>

            <DataTablePagination
              page={d.page}
              pageSize={d.pageSize}
              totalItems={totalRows}
              pageSizeOptions={[...COLLECTION_DETAIL_PAGE_SIZE_OPTIONS]}
              itemLabel="sản phẩm"
              onPageChange={d.setPage}
              onPageSizeChange={d.setPageSize}
            />
          </Stack>
        )}
      </Stack>

      <CollectionDetailCreatePart open={addProductOpen} existingProductIds={existingProductIds} onClose={() => setAddProductOpen(false)} onConfirmAddProducts={d.stageAddProducts} />

      <DialogConfirmComponent
        open={bulkDeleteOpen}
        loading={d.isMutating}
        onClose={() => (d.isMutating ? undefined : setBulkDeleteOpen(false))}
        title="Xác nhận xoá sản phẩm"
        highlight={{
          tone: 'danger',
          title: `Bạn đang xoá ${d.selectedRowIds.length} sản phẩm khỏi bộ sưu tập`,
          description: 'Hành động này không thể hoàn tác.',
        }}
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận xoá"
        confirmButtonProps={productCollectionButtonPermission('edit', 'Xác nhận xóa sản phẩm khỏi bộ sưu tập', 'api_collection_update')}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={async () => {
          await d.handleDeleteSelected();
          setBulkDeleteOpen(false);
        }}
      />

      <DialogConfirmComponent
        open={Boolean(singleDeleteRow)}
        loading={d.isMutating}
        onClose={() => (d.isMutating ? undefined : setSingleDeleteRow(null))}
        title="Xác nhận xoá sản phẩm"
        highlight={{
          tone: 'danger',
          title: `Bạn đang xoá sản phẩm ${singleDeleteRow?.product.name ?? ''}`,
          description: 'Hành động này không thể hoàn tác.',
        }}
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận xoá"
        confirmButtonProps={productCollectionButtonPermission('edit', 'Xác nhận xóa sản phẩm khỏi bộ sưu tập', 'api_collection_update')}
        onCancel={() => setSingleDeleteRow(null)}
        onConfirm={async () => {
          if (singleDeleteRow) {
            await d.handleDeleteRow(singleDeleteRow);
          }
          setSingleDeleteRow(null);
        }}
      />

      <DialogConfirmComponent
        open={leaveUnsavedOpen}
        loading={d.isMutating}
        onClose={() => (d.isMutating ? undefined : setLeaveUnsavedOpen(false))}
        title="Xác nhận thoát trang"
        highlight={{
          tone: 'info',
          title: 'Bạn có chắc chắn muốn thoát trang này?',
          description: 'Các thay đổi chưa được lưu sẽ bị mất. Bạn có thể lưu thay đổi trước khi thoát.',
        }}
        cancelLabel="Hủy"
        confirmLabel="Lưu"
        confirmVariant="primary"
        confirmButtonProps={productCollectionButtonPermission('edit', 'Lưu bộ sưu tập trước khi thoát', 'api_collection_update')}
        onCancel={() => {
          d.discardDraft();
          setLeaveUnsavedOpen(false);
          goToCollectionList();
        }}
        onConfirm={async () => {
          const ok = await d.saveDraft();
          if (!ok) return;
          setLeaveUnsavedOpen(false);
          goToCollectionList();
        }}
      />
    </Stack>
  );
};

export default CollectionDetailPage;
