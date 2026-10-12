import { AddRounded } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
import { Edit02, Eye, Trash01 } from '@untitledui/icons';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderType, STYLE } from '@/trading-ui/adapters/library';
import useSWR, { useSWRConfig } from 'swr';
import { preOrderCampaignApi, type PreOrderCampaign, type QueryPreOrderCampaignDto } from '../../../../apis';
// import { OrderTimeFilter } from '../../../../apis/order';
import { PAGE_TAKE_DEFAULT } from '../../../../common/constant/page-take.constant';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDate, getErrorMessage } from '../../../../common/utils';
import { PermissionIconButton } from '../../../../components/button';
import {
  DataTable,
  DataTableContentCard,
  DataTableFilterCard,
  DataTablePagination,
  DataTableStatusTabs,
  DataTableToolbar,
  type DataTableColumn,
  type DataTableToolbarAction,
} from '../../../../components/data-table';
import { DialogConfirmComponent } from '../../../../components/dialog';
import { StackRowAlignCenter } from '../../../../components/styled/stack.style';
import { TagCommonComponent } from '../../../../components/tag';
// import {
//   OrderTimeCustomRangeDialog,
//   buildOrderTimeFilterPayload,
//   createSharedTimeFilterToolbarAction,
//   formatTimeFilterLabel,
//   type SharedTimeRange,
// } from '../../../../components/time-filter/shared-time-filter';
import { WrapperComponent } from '../../../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { useListPageViewAccess } from '../../../../permissions/use-list-page-view-access.hook';
import { getPreOrderCampaignDetailPath, getPreOrderCampaignUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import {
  formatPreOrderCampaignSchedule,
  getPreOrderCampaignStatusLabel,
  PRE_ORDER_CAMPAIGN_PAGE_SIZE_OPTIONS,
  PRE_ORDER_CAMPAIGN_STATUS_TAB_ORDER,
  type PreOrderCampaignStatusTab,
} from '../pre-order-campaign.constants';
import { PRE_ORDER_CAMPAIGN_PAGE_SCOPE, preOrderCampaignButtonPermission } from '../pre-order-campaign-permission.constants';
import { canDeletePreOrderCampaign, canEditPreOrderCampaign } from '../pre-order-campaign.utils';

const PreOrderCampaignListPage = () => {
  const canViewList = useListPageViewAccess(PRE_ORDER_CAMPAIGN_PAGE_SCOPE, { listApiCode: 'api_pre_order_campaign_list' });
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();

  const [screenState, setScreenState] = useState({
    ...PAGE_TAKE_DEFAULT,
    search: '',
    status: 'all' as PreOrderCampaignStatusTab,
  });
  // const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeFilter | null>(null);
  // const [customDateRange, setCustomDateRange] = useState<SharedTimeRange>(null);
  // const [timeRangeDialogOpen, setTimeRangeDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ data?: PreOrderCampaign; toggle: boolean }>({ toggle: false });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // const timeFilterPayload = useMemo(() => buildOrderTimeFilterPayload(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);
  // const selectedTimeLabel = useMemo(() => formatTimeFilterLabel(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);

  const sharedListFilters = useMemo(
    (): Partial<QueryPreOrderCampaignDto> => ({
      ...(screenState.search.trim() ? { search: screenState.search.trim() } : {}),
      // ...timeFilterPayload,
    }),
    [screenState.search],
  );

  const listSwr = useSWR(
    canViewList ? (['pre-order-campaigns', screenState.page, screenState.take, screenState.search, screenState.status] as const) : null,
    () =>
      preOrderCampaignApi.getPreOrderCampaignList({
        page: screenState.page,
        take: screenState.take,
        isPagination: true,
        orderBy: 'updatedAt',
        orderType: OrderType.DESC,
        ...sharedListFilters,
        ...(screenState.status !== 'all' ? { status: screenState.status } : {}),
      }),
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  const rows = listSwr.data?.list ?? [];
  const totalItems = listSwr.data?.total ?? listSwr.data?.pagination?.total ?? 0;
  /** Số lượng theo tab — lấy từ BE `summary` (đã normalize thành `counts`). */
  const statusCounts = listSwr.data?.counts;

  const handleConfirmDelete = useCallback(async () => {
    const id = deleteDialog.data?.id;
    if (!id) return;
    setDeleteLoading(true);
    try {
      await preOrderCampaignApi.deletePreOrderCampaign(id);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Xóa chiến dịch thành công!' });
      setDeleteDialog({ toggle: false });
      await mutate((key) => Array.isArray(key) && key[0] === 'pre-order-campaigns');
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteDialog.data?.id, mutate, showSnackbar]);

  // const handleSelectTimePreset = useCallback((value: OrderTimeFilter) => {
  //   setSelectedTimeOption(value);
  //   setCustomDateRange(null);
  //   setScreenState((prev) => ({ ...prev, page: PAGE_TAKE_DEFAULT.page }));
  // }, []);

  // const handleApplyTimeRange = useCallback((range: NonNullable<SharedTimeRange>) => {
  //   setSelectedTimeOption(OrderTimeFilter.CUSTOM);
  //   setCustomDateRange(range);
  //   setTimeRangeDialogOpen(false);
  //   setScreenState((prev) => ({ ...prev, page: PAGE_TAKE_DEFAULT.page }));
  // }, []);

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      // createSharedTimeFilterToolbarAction({
      //   selectedTimeLabel,
      //   onSelectCustom: () => setTimeRangeDialogOpen(true),
      //   onSelectPreset: handleSelectTimePreset,
      // }),
      {
        key: 'add',
        label: 'Tạo chiến dịch',
        variant: 'contained',
        icon: <AddRounded sx={{ fontSize: 18 }} />,
        onClick: () => void navigate(ROUTE_PATH.PRE_ORDER_CAMPAIGN_CREATE),
        ...preOrderCampaignButtonPermission('create', 'Tạo chiến dịch đặt trước', 'api_pre_order_campaign_create'),
      },
    ],
    [navigate],
  );

  const columns = useMemo<Array<DataTableColumn<PreOrderCampaign>>>(
    () => [
      {
        id: 'name',
        label: 'Tên chiến dịch',
        minWidth: 220,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>{row.name}</Typography>,
      },
      {
        id: 'schedule',
        label: 'Thời gian chạy',
        minWidth: 280,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' }}>{formatPreOrderCampaignSchedule(row.startAt, row.endAt)}</Typography>,
      },
      {
        id: 'expectedAvailableAt',
        label: 'Thời gian mở bán dự kiến',
        minWidth: 180,
        renderCell: (row) => {
          const expectedAt = row.expectedStockAt ?? row.expectedAvailableAt;
          return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' }}>{expectedAt ? formatDate(String(expectedAt)) : '—'}</Typography>;
        },
      },
      {
        id: 'status',
        label: 'Trạng thái',
        width: 140,
        renderCell: (row) => <TagCommonComponent content={getPreOrderCampaignStatusLabel(row.status)} border />,
      },
      {
        id: 'actions',
        label: '',
        width: 132,
        align: 'center',
        sticky: 'right',
        renderCell: (row) => {
          const editBlocked = !canEditPreOrderCampaign(row.status);
          const deleteBlocked = !canDeletePreOrderCampaign(row.status);
          return (
            <StackRowAlignCenter gap={0.5} justifyContent="center">
              <PermissionIconButton
                size="small"
                onClick={() => void navigate(getPreOrderCampaignDetailPath(row.id))}
                {...preOrderCampaignButtonPermission('open_detail', 'Xem chi tiết chiến dịch đặt trước', 'api_pre_order_campaign_detail')}
                sx={{ color: '#374151' }}
              >
                <Eye size={18} />
              </PermissionIconButton>
              <PermissionIconButton
                size="small"
                disabled={editBlocked}
                onClick={() => void navigate(getPreOrderCampaignUpdatePath(row.id))}
                {...preOrderCampaignButtonPermission('edit', 'Chỉnh sửa chiến dịch đặt trước', 'api_pre_order_campaign_update')}
                sx={{ color: '#374151' }}
              >
                <Edit02 size={18} />
              </PermissionIconButton>
              <PermissionIconButton
                size="small"
                disabled={deleteBlocked}
                onClick={() => setDeleteDialog({ data: row, toggle: true })}
                {...preOrderCampaignButtonPermission('delete', 'Xóa chiến dịch đặt trước', 'api_pre_order_campaign_delete')}
                sx={{ color: deleteBlocked ? '#9CA3AF' : '#6B7280' }}
              >
                <Trash01 size={18} />
              </PermissionIconButton>
            </StackRowAlignCenter>
          );
        },
      },
    ],
    [navigate],
  );

  if (!canViewList) return null;

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: 'border-box', minHeight: 0 }}>
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <WrapperComponent
          label="Danh sách chiến dịch đặt hàng trước"
          tabs={
            <DataTableStatusTabs
              tabs={[
                { value: 'all', label: 'Tất cả', ...(statusCounts?.all != null ? { count: statusCounts.all } : {}) },
                ...PRE_ORDER_CAMPAIGN_STATUS_TAB_ORDER.map((status) => ({
                  value: status,
                  label: getPreOrderCampaignStatusLabel(status),
                  ...(statusCounts?.[status] != null ? { count: statusCounts[status] } : {}),
                })),
              ]}
              activeValue={screenState.status}
              onChange={(value) => setScreenState((prev) => ({ ...prev, status: value as PreOrderCampaignStatusTab, page: PAGE_TAKE_DEFAULT.page }))}
            />
          }
        >
          <Stack gap={2} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
            <DataTableFilterCard>
              <DataTableToolbar
                embedded
                searchValue={screenState.search}
                onSearchChange={(search) => setScreenState((prev) => ({ ...prev, search, page: PAGE_TAKE_DEFAULT.page }))}
                searchPlaceholder="Tìm theo tên chiến dịch..."
                actions={toolbarActions}
              />
            </DataTableFilterCard>

            <DataTableContentCard>
              <DataTable
                columns={columns}
                rows={rows}
                getRowId={(row) => row.id}
                containerSx={{ flex: 1, minHeight: 0, height: '100%' }}
                emptyTitle="Chưa có chiến dịch đặt trước nào"
                emptyDescription="Tạo chiến dịch mới hoặc thử đổi bộ lọc tìm kiếm."
              />
            </DataTableContentCard>

            <DataTablePagination
              page={screenState.page}
              pageSize={screenState.take}
              totalItems={totalItems}
              pageSizeOptions={[...PRE_ORDER_CAMPAIGN_PAGE_SIZE_OPTIONS]}
              itemLabel="chiến dịch"
              summaryMode="total"
              onPageChange={(page) => setScreenState((prev) => ({ ...prev, page }))}
              onPageSizeChange={(take) => setScreenState((prev) => ({ ...prev, take, page: PAGE_TAKE_DEFAULT.page }))}
            />
          </Stack>
        </WrapperComponent>
      </Stack>

      {/* <OrderTimeCustomRangeDialog open={timeRangeDialogOpen} initialRange={customDateRange} onClose={() => setTimeRangeDialogOpen(false)} onApply={handleApplyTimeRange} /> */}

      <DialogConfirmComponent
        open={deleteDialog.toggle}
        title="Xóa chiến dịch đặt trước"
        cancelLabel="Hủy"
        confirmLabel="Xác nhận"
        loading={deleteLoading}
        confirmVariant="danger"
        highlight={{
          tone: 'danger',
          title: deleteDialog.data?.name ?? 'Chiến dịch',
          description: 'Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.',
        }}
        onClose={() => setDeleteDialog({ toggle: false })}
        onCancel={() => setDeleteDialog({ toggle: false })}
        onConfirm={() => void handleConfirmDelete()}
      >
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#374151', mt: 1 }}>
          Bạn có chắc chắn muốn xóa cấu hình chiến dịch <strong>{deleteDialog.data?.name}</strong> không?
        </Typography>
      </DialogConfirmComponent>
    </Stack>
  );
};

export default PreOrderCampaignListPage;
