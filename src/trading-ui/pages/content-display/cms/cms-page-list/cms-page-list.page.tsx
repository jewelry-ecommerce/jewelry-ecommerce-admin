import { AddRounded, FilterListOutlined } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { DataTable, DataTablePagination, type DataTableColumn, DataTableToolbar, type DataTableToolbarAction } from '../../../../components/data-table';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { PAGE_TAKE_DEFAULT } from '../../../../common/constant/page-take.constant';
import { TagCommonComponent } from '../../../../components/tag';
import { StackRowAlignJustCenter } from '../../../../components/styled';
import { TooltipOnHoverComponent } from '../../../../components/tooltip/tooltip-on-hover.component';
import { getPageDetailPath, getPageUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { WrapperComponent } from '../../../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { DialogConfirmComponent } from '../../../../components/dialog';
import { EmptyComponent } from '../../../../components/empty/empty.component';
import { Edit02, Eye, Trash01 } from '@untitledui/icons';
import { cmsApi, type Page } from '../../../../apis';
import { getErrorMessage } from '../../../../common/utils';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { formatDateTime } from '../../../../common/utils';
import type { CmsPageListQueryState } from '../cms-page.interface';
import { CMS_PAGE_DISPLAY_STATUS_FILTER_OPTIONS, CMS_PAGE_PAGE_SIZE_OPTIONS, getPageDisplayStatusLabelVi } from '../cms-page.constants';
import { useListPageViewAccess } from '../../../../permissions/use-list-page-view-access.hook';
import { CONTENT_CMS_PAGES_PAGE_SCOPE, contentCmsPagesButtonPermission } from '../../content-permission.constants';
import { PermissionIconButton } from '../../../../components/button';

const CmsPageListPage = () => {
  const canViewList = useListPageViewAccess(CONTENT_CMS_PAGES_PAGE_SCOPE, { listApiCode: 'api_cms_page_list' });
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // state
  const [screenState, setScreenState] = useState<CmsPageListQueryState>({
    ...PAGE_TAKE_DEFAULT,
    search: '',
    displayStatus: '',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ data?: Page; toggle: boolean }>({ toggle: false });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // function
  const resolvedDisplayStatus = screenState.displayStatus || undefined;

  const { data, isLoading, mutate } = useSWR(
    ['cms/admin/pages', screenState.page, screenState.take, screenState.search ?? '', resolvedDisplayStatus ?? ''] as const,
    () =>
      cmsApi.getPageList({
        page: screenState.page,
        take: screenState.take,
        search: screenState.search?.trim() || undefined,
        ...(resolvedDisplayStatus ? { displayStatus: resolvedDisplayStatus } : {}),
        isPagination: true,
      }),
    { revalidateOnFocus: false },
  );

  const rows = (data?.list ?? []) as Page[];
  const totalItems = data?.total ?? data?.pagination?.total ?? 0;

  const displayStatusFilterLabel = useMemo(
    () => CMS_PAGE_DISPLAY_STATUS_FILTER_OPTIONS.find((option) => option.value === (screenState.displayStatus ?? ''))?.label ?? 'Tất cả',
    [screenState.displayStatus],
  );

  const handleDisplayStatusFilterChange = useCallback((value: string) => {
    setScreenState((prev) => ({
      ...prev,
      displayStatus: value as CmsPageListQueryState['displayStatus'],
      page: PAGE_TAKE_DEFAULT.page,
    }));
  }, []);

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        key: 'display-status',
        label: 'Trạng thái',
        selectedOptionLabel: `Trạng thái: ${displayStatusFilterLabel}`,
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        options: CMS_PAGE_DISPLAY_STATUS_FILTER_OPTIONS,
        onSelectOption: handleDisplayStatusFilterChange,
        menuMinWidth: 180,
        ...contentCmsPagesButtonPermission('filter_status', 'Lọc trạng thái trang CMS', 'api_cms_page_list'),
      },
      {
        key: 'add',
        label: 'Tạo trang mới',
        variant: 'contained',
        icon: <AddRounded sx={{ fontSize: 18 }} />,
        onClick: () => navigate(ROUTE_PATH.CMS_PAGE_CREATE),
        ...contentCmsPagesButtonPermission('create', 'Tạo trang mới', 'api_cms_page_create'),
      },
    ],
    [displayStatusFilterLabel, handleDisplayStatusFilterChange, navigate],
  );

  const columns = useMemo<DataTableColumn<Page>[]>(
    () => [
      {
        id: 'name',
        label: 'Tên trang',
        minWidth: 200,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.name}</Typography>,
      },
      {
        id: 'slug',
        label: 'Đường dẫn',
        minWidth: 160,
        renderCell: (row) => (
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.regular,
              color: '#155DFC',
              bgcolor: '#EFF6FF',
              borderRadius: '4px',
              padding: '4px 8px',
              width: 'fit-content',
            }}
          >
            /{row.slug}
          </Typography>
        ),
      },
      {
        id: 'locale',
        label: 'Ngôn ngữ',
        width: 110,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.locale}</Typography>,
      },
      {
        id: 'displayStatus',
        label: 'Trạng thái',
        width: 140,
        renderCell: (row) => <TagCommonComponent content={getPageDisplayStatusLabelVi(row.displayStatus)} border />,
      },
      {
        id: 'updatedAt',
        label: 'Cập nhật',
        width: 170,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{formatDateTime(String(row.updatedAt ?? row.createdAt ?? ''))}</Typography>,
      },
      {
        id: 'actions',
        label: '',
        width: 120,
        align: 'center',
        sticky: 'right',
        renderCell: (row) => (
          <StackRowAlignJustCenter sx={{ gap: 1.5 }}>
            <TooltipOnHoverComponent content="Xem chi tiết">
              <PermissionIconButton
                size="small"
                onClick={() => navigate(getPageDetailPath(row.id))}
                {...contentCmsPagesButtonPermission('open_detail', 'Xem chi tiết trang CMS', 'api_cms_page_detail')}
                sx={{ color: '#374151' }}
              >
                <Eye size={18} />
              </PermissionIconButton>
            </TooltipOnHoverComponent>
            <TooltipOnHoverComponent content="Chỉnh sửa">
              <PermissionIconButton
                size="small"
                onClick={() => navigate(getPageUpdatePath(row.id))}
                {...contentCmsPagesButtonPermission('edit', 'Chỉnh sửa trang CMS', 'api_cms_page_update')}
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
                  setDeleteDialog({ data: row, toggle: true });
                }}
                {...contentCmsPagesButtonPermission('delete', 'Xóa trang CMS', 'api_cms_page_delete')}
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

  const handleConfirmDelete = useCallback(async () => {
    const id = deleteDialog.data?.id;
    if (!id) return;
    setDeleteLoading(true);
    try {
      await cmsApi.deletePage(id);
      showSnackbar({ message: 'Đã xóa trang.', type: SnackbarType.SUCCESS });
      setDeleteDialog({ toggle: false });
      await mutate();
    } catch (err) {
      showSnackbar({ message: getErrorMessage(err), type: SnackbarType.ERROR });
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteDialog.data?.id, mutate, showSnackbar]);

  if (!canViewList) return null;

  return (
    <React.Fragment>
      <Stack
        sx={{
          height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
          boxSizing: 'border-box',
          minHeight: 0,
        }}
      >
        <WrapperComponent label="Quản lý trang">
          <Stack sx={{ flex: 1, minHeight: 0, width: '100%' }}>
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
                onSearchChange={(value) => setScreenState((prev) => ({ ...prev, search: value, page: PAGE_TAKE_DEFAULT.page }))}
                searchPlaceholder="Tìm theo tên hoặc đường dẫn..."
                actions={toolbarActions}
              />
            </Box>
            {isLoading && !data ? (
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
                    overflow: 'hidden',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <DataTable columns={columns} rows={rows} getRowId={(row) => row.id} containerSx={{ flex: 1, minHeight: 0, height: '100%' }} />
                </Stack>
                <DataTablePagination
                  page={screenState.page}
                  pageSize={screenState.take}
                  totalItems={totalItems}
                  pageSizeOptions={[...CMS_PAGE_PAGE_SIZE_OPTIONS]}
                  itemLabel="trang"
                  summaryMode="total"
                  onPageChange={(page) => setScreenState((prev) => ({ ...prev, page }))}
                  onPageSizeChange={(take) => setScreenState((prev) => ({ ...prev, take, page: PAGE_TAKE_DEFAULT.page }))}
                />
              </Stack>
            )}
          </Stack>
        </WrapperComponent>
      </Stack>

      <DialogConfirmComponent
        open={deleteDialog.toggle}
        onClose={() => setDeleteDialog({ toggle: false })}
        title="Xóa trang?"
        highlight={{
          tone: 'danger',
          title: deleteDialog.data ? `Trang: ${deleteDialog.data.name}` : '',
          description: 'Trang sẽ bị xóa mềm (có thể khôi phục từ hệ thống nếu được hỗ trợ).',
        }}
        cancelLabel="Quay lại"
        confirmLabel="Xóa"
        onCancel={() => setDeleteDialog({ toggle: false })}
        onConfirm={() => void handleConfirmDelete()}
        loading={deleteLoading}
      />
    </React.Fragment>
  );
};

export default CmsPageListPage;
