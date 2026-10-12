import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SnackbarType, STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { DataTable, DataTablePagination, type DataTableColumn, DataTableToolbar, type DataTableToolbarAction } from '../../../../../components/data-table';
import { COLLECTION_STATUS_FILTER_ALL, COLLECTION_STATUS_FILTER_OPTIONS, getProductCollectionStatusLabelVi, PRODUCT_COLLECTION_PAGE_SIZE_OPTIONS } from './collection-list.constant.ts';
import type { ProductCollectionRow } from './collection-list.interface';
import { collectionApi, type QueryCollectionDto } from '../../../../../apis/index.ts';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { StackRowAlignJustCenter } from '../../../../../components/styled';
import { TagCommonComponent } from '../../../../../components/tag';
import { TooltipOnHoverComponent } from '../../../../../components/tooltip/tooltip-on-hover.component';
import { WrapperComponent } from '../../../../../components/wrapper/index.ts';
import { getProductCollectionCreatePath, getProductCollectionDetailPath, getProductCollectionEditPath } from '@/trading-ui/router/route.path';
import { Edit02, Eye, Plus, Trash01 } from '@untitledui/icons';
import { EmptyComponent } from '../../../../../components/empty/empty.component.tsx';
import { CollectionStatus } from '../../../../../apis/collection/collection.enum.ts';
import { DialogConfirmComponent } from '../../../../../components/dialog/dialog-confirm.component.tsx';
import { useSnackbar } from '@/hooks/use-snackbar.hook';
import { LoadingComponent } from '../../../../../components/loading/loading.component.tsx';
import { getErrorMessage } from '../../../../../common/utils';
import { PermissionIconButton } from '../../../../../components/button';
import { useListPageViewAccess } from '../../../../../permissions/use-list-page-view-access.hook';
import { PRODUCT_COLLECTION_PAGE_SCOPE, productCollectionButtonPermission } from '../../../product-permission.constants';
import { getCatalogDependencyItems, getCatalogInUseDialogCopy, isCatalogInUseError } from '../../utils/catalog-in-use-error.util';

const ProductCollectionListPage = () => {
  const canViewList = useListPageViewAccess(PRODUCT_COLLECTION_PAGE_SCOPE, { listApiCode: 'api_collection_list' });
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // state
  const [screenState, setScreenState] = useState<QueryCollectionDto>({
    page: 1,
    take: 20,
    search: '',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<{ data?: ProductCollectionRow; toggle: boolean }>({
    toggle: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [inUseDialog, setInUseDialog] = useState<{
    open: boolean;
    title: string;
    highlightTitle: string;
    description: string;
  }>({ open: false, title: '', highlightTitle: '', description: '' });

  const statusFilterValue = screenState.status ?? COLLECTION_STATUS_FILTER_ALL;

  // function
  const { data, isLoading, mutate } = useSWR(
    ['product/admin/collections', screenState.page, screenState.take, screenState.search, screenState?.brandId, screenState.status],
    () =>
      collectionApi.getCollectionList({
        ...screenState,
        search: screenState.search?.trim() || undefined,
        isPagination: true,
      }),
    { revalidateOnFocus: false },
  );

  const rows = data?.list ?? [];
  const totalItems = data?.total ?? data?.pagination?.total ?? 0;

  const closeDeleteDialog = useCallback(() => {
    if (isDeleting) return;
    setIsDeleteDialogOpen({ data: undefined, toggle: false });
  }, [isDeleting]);

  const onDeleteCollection = useCallback(async () => {
    const id = isDeleteDialogOpen.data?.id;
    if (!id || isDeleting) return;
    setIsDeleting(true);
    try {
      await collectionApi.deleteCollection(id);
      await mutate();
      showSnackbar({ message: 'Xóa bộ sưu tập thành công', type: SnackbarType.SUCCESS });
      setIsDeleteDialogOpen({ data: undefined, toggle: false });
    } catch (error) {
      if (isCatalogInUseError(error)) {
        const copy = getCatalogInUseDialogCopy('COLLECTION', getCatalogDependencyItems(error));
        setIsDeleteDialogOpen({ data: undefined, toggle: false });
        setInUseDialog({ open: true, ...copy });
      } else {
        showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
      }
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleteDialogOpen.data?.id, isDeleting, mutate, showSnackbar]);

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        key: 'add',
        label: 'Tạo bộ sưu tập',
        ...productCollectionButtonPermission('create', 'Tạo bộ sưu tập', 'api_collection_create'),
        variant: 'contained',
        icon: <Plus size={18} />,
        onClick: () => navigate(getProductCollectionCreatePath()),
      },
    ],
    [navigate],
  );

  const columns = useMemo<Array<DataTableColumn<ProductCollectionRow>>>(
    () => [
      {
        id: 'name',
        label: 'Tên bộ sưu tập',
        width: 200,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', fontWeight: 500 }}>{row.name}</Typography>,
      },
      {
        id: 'brandName',
        label: 'Thương hiệu',
        width: 220,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#374151' }}>{row.tenantCode || '-'}</Typography>,
      },
      {
        id: 'description',
        label: 'Mô tả',
        width: 220,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#374151' }}>{row.description || '-'}</Typography>,
      },
      {
        id: 'status',
        label: 'Trạng thái',
        width: 160,
        renderCell: (row) => <TagCommonComponent content={getProductCollectionStatusLabelVi(row.status as CollectionStatus)} border />,
      },
      {
        id: 'actions',
        label: '',
        width: 100,
        align: 'center',
        sticky: 'right',
        renderCell: (row) => (
          <StackRowAlignJustCenter sx={{ gap: 1.5 }}>
            <TooltipOnHoverComponent content="Xem chi tiết">
              <PermissionIconButton
                size="small"
                onClick={() =>
                  navigate(getProductCollectionDetailPath(row.id), {
                    state: {
                      collection: {
                        id: row.id,
                        name: row.name,
                        brandName: row.brand?.name || '',
                        status: row.status === CollectionStatus.ACTIVE,
                      },
                    },
                  })
                }
                {...productCollectionButtonPermission('open_detail', 'Xem chi tiết bộ sưu tập', 'api_collection_detail')}
                sx={{ color: '#374151' }}
              >
                <Eye size={18} />
              </PermissionIconButton>
            </TooltipOnHoverComponent>
            <TooltipOnHoverComponent content="Chỉnh sửa">
              <PermissionIconButton
                size="small"
                onClick={() => navigate(getProductCollectionEditPath(row.id))}
                {...productCollectionButtonPermission('edit', 'Chỉnh sửa bộ sưu tập', 'api_collection_update')}
                sx={{ color: '#374151' }}
              >
                <Edit02 size={18} />
              </PermissionIconButton>
            </TooltipOnHoverComponent>
            <TooltipOnHoverComponent content="Xóa">
              <PermissionIconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsDeleteDialogOpen({ data: row, toggle: true });
                }}
                {...productCollectionButtonPermission('delete', 'Xóa bộ sưu tập', 'api_collection_delete')}
                sx={{ color: '#374151' }}
              >
                <Trash01 size={18} />
              </PermissionIconButton>
            </TooltipOnHoverComponent>
          </StackRowAlignJustCenter>
        ),
      },
    ],
    [navigate],
  );

  if (!canViewList) return null;

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <WrapperComponent label="Bộ sưu tập">
        <Stack sx={{ flex: 1, minHeight: 0, flexDirection: 'column', width: '100%' }}>
          <Box
            sx={{
              p: '16px',
              border: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
              borderRadius: '10px',
            }}
          >
            <DataTableToolbar
              embedded
              searchValue={screenState.search || ''}
              onSearchChange={(v) => setScreenState((prev) => ({ ...prev, search: v, page: 1 }))}
              searchPlaceholder="Tìm theo Tên bộ sưu tập..."
              actions={toolbarActions}
              filterSelect={{
                value: statusFilterValue,
                width: 160,
                options: COLLECTION_STATUS_FILTER_OPTIONS,
                onChange: (value) =>
                  setScreenState((prev) => ({
                    ...prev,
                    status: value === COLLECTION_STATUS_FILTER_ALL ? undefined : (value as CollectionStatus),
                    page: 1,
                  })),
              }}
            />
          </Box>
          {isLoading ? (
            <LoadingComponent />
          ) : rows.length === 0 ? (
            <EmptyComponent />
          ) : (
            <Stack sx={{ flex: 1, minHeight: 0, flexDirection: 'column', width: '100%' }}>
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
                  rows={rows}
                  columns={columns}
                  getRowId={(r) => r.id}
                  containerSx={{ flex: 1, minHeight: 0, height: '100%' }}
                  emptyTitle="Không có bộ sưu tập phù hợp"
                  emptyDescription="Thử đổi từ khóa tìm kiếm hoặc bộ lọc."
                />
              </Stack>

              <DataTablePagination
                page={screenState.page}
                pageSize={screenState.take}
                totalItems={totalItems}
                pageSizeOptions={[...PRODUCT_COLLECTION_PAGE_SIZE_OPTIONS]}
                itemLabel="bộ sưu tập"
                summaryMode="total"
                onPageChange={(p) => setScreenState((prev) => ({ ...prev, page: p }))}
                onPageSizeChange={(n) => {
                  setScreenState((prev) => ({ ...prev, take: n, page: 1 }));
                }}
              />
            </Stack>
          )}
        </Stack>
      </WrapperComponent>

      <DialogConfirmComponent
        open={isDeleteDialogOpen.toggle}
        loading={isDeleting}
        onClose={closeDeleteDialog}
        title="Xác nhận xoá bộ sưu tập"
        highlight={{
          tone: 'danger',
          title: `Bạn đang xoá bộ sưu tập ${isDeleteDialogOpen.data?.name}`,
          description: 'Hành động này không thể hoàn tác.',
        }}
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận Xoá"
        confirmButtonProps={productCollectionButtonPermission('delete', 'Xác nhận xóa bộ sưu tập', 'api_collection_delete')}
        onCancel={closeDeleteDialog}
        onConfirm={onDeleteCollection}
      />
      <DialogConfirmComponent
        open={inUseDialog.open}
        onClose={() => setInUseDialog((prev) => ({ ...prev, open: false }))}
        title={inUseDialog.title}
        highlight={{
          tone: 'warning',
          title: inUseDialog.highlightTitle,
          description: (
            <Box component="span" sx={{ whiteSpace: 'pre-line', display: 'block' }}>
              {inUseDialog.description}
            </Box>
          ),
        }}
        omitActions
        cancelLabel="Đóng"
        confirmLabel="Đóng"
        onCancel={() => setInUseDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={() => setInUseDialog((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
};

export default ProductCollectionListPage;
