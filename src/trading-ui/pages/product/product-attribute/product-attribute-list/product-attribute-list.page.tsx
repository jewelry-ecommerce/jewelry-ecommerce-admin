import { AddRounded } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { DataTable, type DataTableColumn, DataTablePagination, DataTableToolbar, type DataTableToolbarAction } from '../../../../components/data-table';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { TagCommonComponent } from '../../../../components/tag';
import { LABEL_CONTENT_PAGE_SIZE_OPTIONS } from '../../../content-display/label/label-content/label-content.constants';
import { StackRowAlignJustCenter } from '../../../../components/styled';
import { TooltipOnHoverComponent } from '../../../../components/tooltip/tooltip-on-hover.component';
import { getProductAttributeDetailPath, getProductAttributeUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { WrapperComponent } from '../../../../components/wrapper';
import { PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS } from '../product-attribute.constant';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { AttributeStatus } from '../../../../apis/attribute/attribute.enum';
import { DialogConfirmComponent } from '../../../../components/dialog';
import { EmptyComponent } from '../../../../components/empty/empty.component';
import { Edit02, Eye, Trash01 } from '@untitledui/icons';
import type { Attribute } from '../../../../apis/attribute/attribute.entities';
import { attributeApi, type QueryAttributeDto } from '../../../../apis';
import { PAGE_TAKE_DEFAULT } from '../../../../common/constant/page-take.constant';
import { getErrorMessage } from '../../../../common/utils';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { PermissionIconButton } from '../../../../components/button';
import { productAttributesButtonPermission, PRODUCT_ATTRIBUTES_PAGE_SCOPE } from '../../product-permission.constants';
import { useListPageViewAccess } from '../../../../permissions/use-list-page-view-access.hook';

const getAttributeStatusLabelVi = (status?: AttributeStatus): string => {
  if (status === AttributeStatus.ACTIVE) return 'Kích hoạt';
  if (status === AttributeStatus.INACTIVE) return 'Vô hiệu hóa';
  return '';
};

const ProductAttributeListPage = () => {
  // hook
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const canViewList = useListPageViewAccess(PRODUCT_ATTRIBUTES_PAGE_SCOPE, { listApiCode: 'api_attribute_list' });

  // state
  const [screenState, setScreenState] = useState<QueryAttributeDto>({
    ...PAGE_TAKE_DEFAULT,
    search: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<{ data?: Attribute; toggle: boolean }>({
    toggle: false,
  });

  // function
  const { data, isLoading, mutate } = useSWR(
    ['product/admin/attributes', screenState.page, screenState.take, screenState.search],
    () =>
      attributeApi.getAttributeList({
        page: screenState.page,
        take: screenState.take,
        search: screenState.search?.trim() || undefined,
        isPagination: true,
      }),
    { revalidateOnFocus: false },
  );

  const rows = data?.list ?? [];
  const totalItems = data?.total ?? data?.pagination?.total ?? 0;

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        key: 'add',
        label: 'Tạo thuộc tính',
        ...productAttributesButtonPermission('create', 'Tạo thuộc tính', 'api_attribute_create'),
        variant: 'contained',
        icon: <AddRounded sx={{ fontSize: 18 }} />,
        onClick: () => {
          navigate(ROUTE_PATH.PRODUCT_ATTRIBUTE_CREATE);
        },
      },
    ],
    [navigate],
  );

  const columns = useMemo<Array<DataTableColumn<Attribute>>>(
    () => [
      {
        id: 'code',
        label: 'Mã thuộc tính',
        width: 200,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.code}</Typography>,
      },
      {
        id: 'name',
        label: 'Tên thuộc tính',
        width: 200,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.name}</Typography>,
      },
      {
        id: 'status',
        label: 'Trạng thái',
        width: 200,
        renderCell: (row) => <TagCommonComponent content={getAttributeStatusLabelVi(row?.status)} border />,
      },
      {
        id: 'type',
        label: 'Dạng dữ liệu',
        width: 200,
        renderCell: (row) => {
          const label = PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS.find((o) => o.value === row.displayType)?.label ?? row.displayType;
          return <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{label}</Typography>;
        },
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
                onClick={() => navigate(getProductAttributeDetailPath(row.id))}
                {...productAttributesButtonPermission('open_detail', 'Xem chi tiết thuộc tính', 'api_attribute_detail')}
                sx={{ color: '#374151' }}
              >
                <Eye size={18} />
              </PermissionIconButton>
            </TooltipOnHoverComponent>
            <TooltipOnHoverComponent content="Chỉnh sửa">
              <PermissionIconButton
                size="small"
                onClick={() => navigate(getProductAttributeUpdatePath(row.id))}
                {...productAttributesButtonPermission('edit', 'Chỉnh sửa thuộc tính', 'api_attribute_update')}
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
                {...productAttributesButtonPermission('delete', 'Xóa thuộc tính', 'api_attribute_delete')}
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
      <WrapperComponent label="Danh sách thuộc tính">
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
              onSearchChange={(v) => {
                setScreenState((prev) => ({ ...prev, search: v, page: PAGE_TAKE_DEFAULT.page }));
              }}
              searchPlaceholder="Tìm theo Tên thuộc tính, Mã thuộc tính..."
              actions={toolbarActions}
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
                  emptyTitle="Không có label phù hợp"
                  emptyDescription="Thử đổi từ khóa tìm kiếm hoặc bộ lọc."
                />
              </Stack>
              <DataTablePagination
                page={screenState.page}
                pageSize={screenState.take}
                totalItems={totalItems}
                pageSizeOptions={[...LABEL_CONTENT_PAGE_SIZE_OPTIONS]}
                itemLabel="thuộc tính"
                summaryMode="total"
                onPageChange={(p) => setScreenState((prev) => ({ ...prev, page: p }))}
                onPageSizeChange={(n) => {
                  setScreenState((prev) => ({ ...prev, take: n, page: PAGE_TAKE_DEFAULT.page }));
                }}
              />
            </Stack>
          )}
        </Stack>
      </WrapperComponent>
      <DialogConfirmComponent
        open={isDeleteDialogOpen.toggle}
        onClose={() => setIsDeleteDialogOpen({ toggle: false })}
        title="Xác nhận xoá thuộc tính"
        highlight={{
          tone: 'danger',
          title: isDeleteDialogOpen.data ? `Bạn đang xoá thuộc tính ${isDeleteDialogOpen.data.name}` : '',
          description: 'Hành động này không thể hoàn tác.',
        }}
        cancelLabel="Quay lại"
        confirmLabel="Xác nhận Xoá"
        cancelButtonProps={productAttributesButtonPermission('dialog_close', 'Hủy xóa thuộc tính sản phẩm', 'api_attribute_delete')}
        confirmButtonProps={productAttributesButtonPermission('delete', 'Xác nhận xóa thuộc tính sản phẩm', 'api_attribute_delete')}
        loading={deleteLoading}
        onCancel={() => setIsDeleteDialogOpen({ toggle: false })}
        onConfirm={async () => {
          if (!isDeleteDialogOpen.data) return;
          setDeleteLoading(true);
          try {
            await attributeApi.deleteAttribute(isDeleteDialogOpen.data.id);
            await mutate();
            showSnackbar({ message: 'Xóa thuộc tính thành công', type: SnackbarType.SUCCESS });
            setIsDeleteDialogOpen({ toggle: false });
          } catch (error) {
            showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
          } finally {
            setDeleteLoading(false);
          }
        }}
      />
    </Stack>
  );
};

export default ProductAttributeListPage;
