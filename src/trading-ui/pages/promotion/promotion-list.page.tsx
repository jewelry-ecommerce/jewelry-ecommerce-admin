import React, { useCallback, useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { AddRounded, FilterListRounded } from '@mui/icons-material';
import { Edit02, Eye, Trash01 } from '@untitledui/icons';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { OrderTimeFilter } from '../../apis/order';
import { ROUTE_PATH, getPromotionDetailPath, getPromotionUpdatePath } from '@/trading-ui/router/route.path';
import { promotionApi, type CampaignOverviewItemResponseDto, CampaignAvailableAction } from '../../apis';
import { WrapperComponent } from '../../components/wrapper';
import { DataTable, DataTablePagination, DataTableToolbar, type DataTableColumn, type DataTableToolbarAction } from '../../components/data-table';
import { LoadingComponent } from '../../components/loading/loading.component';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { StackRowAlignJustCenter } from '../../components/styled';
import { TagCommonComponent } from '../../components/tag';
import { TooltipOnHoverComponent } from '../../components/tooltip/tooltip-on-hover.component';
import { getPromotionDraftStatusLabel, getPublishedPromotionStatusLabel, parsePromotionCampaignLifecycleFilter } from './promotion.constant';
import { PromotionSchemaListCell } from './components/promotion-schema-list-cell.component';
import { PromotionSalesChannelListCell } from './components/promotion-sales-channel-list-cell.component';
import { formatDateTime, getErrorMessage } from '../../common/utils';
import { PermissionIconButton } from '../../components/button';
import { DialogConfirmComponent } from '../../components/dialog';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { useListPageViewAccess } from '../../permissions/use-list-page-view-access.hook';
import { PROMOTION_LIST_PAGE_SCOPE, promotionListButtonPermission } from './promotion-permission.constants';
import { STYLE } from '@/trading-ui/adapters/library';
import { emptyPromotionListAdvancedFilters, PromotionListAdvancedFilterDialog, type PromotionListAdvancedFilters } from './components/promotion-list-advanced-filter-dialog.component';
import { OrderTimeCustomRangeDialog, createSharedTimeFilterToolbarAction, formatTimeFilterLabel, type SharedTimeRange } from '../../components/time-filter/shared-time-filter';
import { buildPromotionCampaignTimeParams } from './promotion-list-query.utils';
import { PublishedPromotionStatus, type PromotionDraftStatus } from '../../apis';
import { EmptyComponent } from '../../components/empty';

const parseStatusFilter = parsePromotionCampaignLifecycleFilter;

const getStatusColor = (row: CampaignOverviewItemResponseDto) => {
  if (row.source !== 'PUBLISHED') return 'default';
  if (row.promotionStatus === PublishedPromotionStatus.ACTIVE) return 'success';
  if (row.promotionStatus === PublishedPromotionStatus.PAUSED) return 'warning';
  return 'default';
};

const getCampaignStatusLabel = (row: CampaignOverviewItemResponseDto): string => {
  if (row.source === 'DRAFT' && row.draftStatus) return getPromotionDraftStatusLabel(row.draftStatus);
  if (row.source === 'PUBLISHED' && row.promotionStatus) return getPublishedPromotionStatusLabel(row.promotionStatus);
  return '-';
};

const buildPromotionDetailPath = (promotionId: string, source: 'DRAFT' | 'PUBLISHED'): string => getPromotionDetailPath(promotionId, source === 'PUBLISHED' ? 'published' : 'draft');

const hasCampaignAction = (row: CampaignOverviewItemResponseDto, action: CampaignAvailableAction): boolean => row.availableActions.includes(action);

const PromotionListPage: React.FC = () => {
  const canViewList = useListPageViewAccess(PROMOTION_LIST_PAGE_SCOPE, { listApiCode: 'api_promotion_campaigns_list' });
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [page, setPage] = useState<number>(1);
  const [take, setTake] = useState<number>(10);
  const [searchValue, setSearchValue] = useState<string>('');
  const [filters, setFilters] = useState<PromotionListAdvancedFilters>(emptyPromotionListAdvancedFilters);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeFilter | null>(null);
  const [customDateRange, setCustomDateRange] = useState<SharedTimeRange>(null);
  const [timeRangeDialogOpen, setTimeRangeDialogOpen] = useState(false);

  const [lifecycleLoading, setLifecycleLoading] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<{ data?: CampaignOverviewItemResponseDto; toggle: boolean }>({
    toggle: false,
  });

  const trimmedSearch = searchValue.trim();
  const parsedStatusFilter = parseStatusFilter(filters.status);
  const draftStatus = parsedStatusFilter?.source === 'DRAFT' ? (parsedStatusFilter.status as PromotionDraftStatus) : undefined;
  const promotionStatus = parsedStatusFilter?.source === 'PUBLISHED' ? (parsedStatusFilter.status as PublishedPromotionStatus) : undefined;

  const timeFilterParams = useMemo(() => buildPromotionCampaignTimeParams(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);
  const selectedTimeLabel = useMemo(() => formatTimeFilterLabel(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);

  const handleApplyTimeRange = useCallback((range: SharedTimeRange) => {
    setCustomDateRange(range);
    setSelectedTimeOption(OrderTimeFilter.CUSTOM);
    setPage(1);
  }, []);

  const handleSelectTimePreset = useCallback((value: OrderTimeFilter) => {
    setSelectedTimeOption(value);
    setCustomDateRange(null);
    setPage(1);
  }, []);

  const { data, isLoading, mutate } = useSWR(
    [
      'promotion/promotion-campaigns',
      page,
      take,
      trimmedSearch,
      filters.status,
      filters.schemaType,
      selectedTimeOption,
      customDateRange?.from?.toISOString(),
      customDateRange?.to?.toISOString(),
    ] as const,
    () =>
      promotionApi.getCampaignOverview({
        page,
        limit: take,
        search: trimmedSearch || undefined,
        source: parsedStatusFilter?.source,
        draftStatus,
        promotionStatus,
        schemaType: filters.schemaType || undefined,
        ...timeFilterParams,
      }),
    { revalidateOnFocus: false },
  );

  const campaigns = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const activeFilterCount = Number(Boolean(filters.status)) + Number(Boolean(filters.schemaType)) + Number(Boolean(selectedTimeOption));
  const filterLabel = activeFilterCount > 0 ? `Bộ lọc (${activeFilterCount})` : 'Bộ lọc';

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      createSharedTimeFilterToolbarAction({
        selectedTimeLabel,
        onSelectCustom: () => setTimeRangeDialogOpen(true),
        onSelectPreset: handleSelectTimePreset,
      }),
      {
        key: 'filter',
        label: 'Bộ lọc',
        selectedOptionLabel: filterLabel,
        variant: 'outlined',
        icon: <FilterListRounded sx={{ fontSize: 18 }} />,
        onClick: () => setFilterDialogOpen(true),
      },
      {
        key: 'add',
        label: 'Tạo chương trình',
        variant: 'contained',
        icon: <AddRounded sx={{ fontSize: 18 }} />,
        ...promotionListButtonPermission('create', 'Tạo chương trình', 'api_promotion_draft_create'),
        onClick: () => navigate(ROUTE_PATH.PROMOTION_CREATE),
      },
    ],
    [filterLabel, handleSelectTimePreset, navigate, selectedTimeLabel],
  );

  const columns = useMemo<Array<DataTableColumn<CampaignOverviewItemResponseDto>>>(
    () => [
      {
        id: 'name',
        label: 'Chương trình khuyến mãi',
        minWidth: 320,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.name}</Typography>,
      },
      {
        id: 'schemaTypes',
        label: 'Hình thức khuyến mãi',
        width: 240,
        renderCell: (row) => <PromotionSchemaListCell schemas={row.schemas ?? []} />,
      },
      {
        id: 'salesChannels',
        label: 'Phạm vi áp dụng',
        width: 200,
        renderCell: (row) => <PromotionSalesChannelListCell channels={row.salesChannels ?? []} />,
      },
      {
        id: 'status',
        label: 'Trạng thái',
        width: 180,
        renderCell: (row) => <TagCommonComponent content={getCampaignStatusLabel(row)} color={getStatusColor(row)} border />,
      },
      {
        id: 'schedule',
        label: 'Thời gian áp dụng',
        width: 350,
        renderCell: (row) => (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#475467' }}>
            {formatDateTime(row.startsAt)} - {formatDateTime(row.endsAt)}
          </Typography>
        ),
      },
      {
        id: 'actions',
        label: '',
        width: 140,
        align: 'center',
        sticky: 'right',
        renderCell: (row) => {
          const canEdit = row.source === 'DRAFT' && hasCampaignAction(row, CampaignAvailableAction.EDIT);
          const canDelete = row.source === 'DRAFT' && hasCampaignAction(row, CampaignAvailableAction.DELETE);

          return (
            <StackRowAlignJustCenter sx={{ gap: 1.5 }}>
              <TooltipOnHoverComponent content="Xem chi tiết">
                <PermissionIconButton
                  size="small"
                  onClick={() => navigate(buildPromotionDetailPath(row.id, row.source))}
                  {...promotionListButtonPermission('open_detail', 'Xem chi tiết chương trình', row.source === 'DRAFT' ? 'api_promotion_draft_detail' : 'api_promotion_detail')}
                  sx={{ color: '#374151' }}
                >
                  <Eye size={18} />
                </PermissionIconButton>
              </TooltipOnHoverComponent>
              <TooltipOnHoverComponent content={canEdit ? 'Chỉnh sửa' : 'Không thể chỉnh sửa chương trình đã được áp dụng.'}>
                <PermissionIconButton
                  size="small"
                  disabled={!canEdit}
                  onClick={() => navigate(getPromotionUpdatePath(row.id))}
                  {...promotionListButtonPermission('edit', 'Chỉnh sửa chương trình', 'api_promotion_draft_update')}
                  sx={{ color: '#374151' }}
                >
                  <Edit02 size={18} />
                </PermissionIconButton>
              </TooltipOnHoverComponent>
              <TooltipOnHoverComponent content={canDelete ? 'Xóa' : 'Không thể xóa chương trình đã được áp dụng.'}>
                <PermissionIconButton
                  size="small"
                  disabled={!canDelete}
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsDeleteDialogOpen({ data: row, toggle: true });
                  }}
                  {...promotionListButtonPermission('delete', 'Xóa bản nháp chương trình', 'api_promotion_draft_delete')}
                  sx={{ color: '#374151' }}
                >
                  <Trash01 size={18} />
                </PermissionIconButton>
              </TooltipOnHoverComponent>
            </StackRowAlignJustCenter>
          );
        },
      },
    ],
    [navigate],
  );

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
        <Stack sx={{ flex: 1, minHeight: 0 }}>
          <WrapperComponent label="Danh sách chương trình khuyến mãi">
            <Stack sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
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
                  searchValue={searchValue}
                  onSearchChange={(value) => {
                    setSearchValue(value);
                    setPage(1);
                  }}
                  searchPlaceholder="Tìm theo tên hoặc mã chương trình..."
                  actions={toolbarActions}
                />
              </Box>

              {isLoading ? (
                <LoadingComponent />
              ) : campaigns.length === 0 ? (
                <EmptyComponent />
              ) : (
                <React.Fragment>
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
                      rows={campaigns}
                      columns={columns}
                      getRowId={(row) => row.id}
                      tableMinWidth={1300}
                      containerSx={{ flex: 1, minHeight: 0, height: '100%' }}
                      emptyTitle="Không tìm thấy chương trình khuyến mãi nào phù hợp"
                      emptyDescription="Thử đổi từ khóa tìm kiếm hoặc bộ lọc."
                    />
                  </Stack>
                  <DataTablePagination
                    page={page}
                    pageSize={take}
                    totalItems={total}
                    pageSizeOptions={[10, 20, 50]}
                    itemLabel="chương trình"
                    summaryMode="total"
                    onPageChange={setPage}
                    onPageSizeChange={(nextTake) => {
                      setTake(nextTake);
                      setPage(1);
                    }}
                  />
                </React.Fragment>
              )}
            </Stack>
          </WrapperComponent>
        </Stack>

        <DialogConfirmComponent
          open={isDeleteDialogOpen.toggle}
          onClose={() => setIsDeleteDialogOpen({ toggle: false })}
          title="Xác nhận xoá bản nháp chương trình"
          highlight={{
            tone: 'danger',
            title: isDeleteDialogOpen.data ? `Bạn đang xoá chương trình khuyến mãi ${isDeleteDialogOpen.data.name}` : '',
            description: 'Hành động này không thể hoàn tác.',
          }}
          cancelLabel="Quay lại"
          confirmLabel="Xác nhận Xoá"
          loading={lifecycleLoading}
          onCancel={() => setIsDeleteDialogOpen({ toggle: false })}
          onConfirm={async () => {
            if (!isDeleteDialogOpen.data) return;
            setLifecycleLoading(true);
            try {
              await promotionApi.deletePromotionDraft(isDeleteDialogOpen.data.id);
              await mutate();
              showSnackbar({ message: 'Xóa chương trình khuyến mãi thành công', type: SnackbarType.SUCCESS });
              setIsDeleteDialogOpen({ toggle: false });
            } catch (error) {
              showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
            } finally {
              setLifecycleLoading(false);
            }
          }}
        />

        <PromotionListAdvancedFilterDialog
          open={filterDialogOpen}
          value={filters}
          onClose={() => setFilterDialogOpen(false)}
          onReset={() => {
            setFilters(emptyPromotionListAdvancedFilters);
            setPage(1);
          }}
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            setPage(1);
          }}
        />

        <OrderTimeCustomRangeDialog open={timeRangeDialogOpen} initialRange={customDateRange} onClose={() => setTimeRangeDialogOpen(false)} onApply={handleApplyTimeRange} />
      </Stack>
    </React.Fragment>
  );
};

export default PromotionListPage;
