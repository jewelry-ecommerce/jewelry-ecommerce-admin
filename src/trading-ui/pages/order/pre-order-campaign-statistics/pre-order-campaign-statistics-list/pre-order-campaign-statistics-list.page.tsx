import { FilterListOutlined } from '@mui/icons-material';
import { LinearProgress, Stack, Typography } from '@mui/material';
import { Eye } from '@untitledui/icons';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderType, STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { preOrderCampaignApi, type PreOrderCampaignStatisticsListItem } from '../../../../apis';
import { PAGE_TAKE_DEFAULT } from '../../../../common/constant/page-take.constant';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { PermissionIconButton } from '../../../../components/button';
import { DataTable, DataTableContentCard, DataTableFilterCard, DataTablePagination, DataTableToolbar, type DataTableColumn, type DataTableToolbarAction } from '../../../../components/data-table';
import { TagCommonComponent } from '../../../../components/tag';
import { WrapperComponent } from '../../../../components/wrapper';
import { useListPageViewAccess } from '../../../../permissions/use-list-page-view-access.hook';
import { getPreOrderCampaignStatisticsDetailPath } from '@/trading-ui/router/route.path';
import { formatPreOrderCampaignSchedule } from '../../pre-order-campaign/pre-order-campaign.constants';
import { StatisticsColumnHeader, StatisticsProgressBar } from '../components/statistics-shared.component';
import {
  formatStatisticsNumber,
  getPreOrderCampaignStatusLabel,
  PRE_ORDER_CAMPAIGN_STATISTICS_DEFAULT_STATUSES,
  PRE_ORDER_CAMPAIGN_STATISTICS_PAGE_SIZE_OPTIONS,
  PRE_ORDER_CAMPAIGN_STATISTICS_STATUS_FILTER_OPTIONS,
  PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS,
  type PreOrderCampaignStatisticsStatusFilter,
} from '../pre-order-campaign-statistics.constants';
import { PRE_ORDER_CAMPAIGN_STATISTICS_PAGE_SCOPE, preOrderCampaignStatisticsButtonPermission } from '../pre-order-campaign-statistics-permission.constants';

const PreOrderCampaignStatisticsListPage = () => {
  const canViewList = useListPageViewAccess(PRE_ORDER_CAMPAIGN_STATISTICS_PAGE_SCOPE, { listApiCode: 'api_pre_order_campaign_statistics_list' });
  const navigate = useNavigate();

  const [screenState, setScreenState] = useState({
    ...PAGE_TAKE_DEFAULT,
    search: '',
    status: 'all' as PreOrderCampaignStatisticsStatusFilter,
  });

  const listSwr = useSWR(
    canViewList ? (['pre-order-campaign-statistics', screenState.page, screenState.take, screenState.search, screenState.status] as const) : null,
    () =>
      preOrderCampaignApi.getPreOrderCampaignStatisticsList({
        page: screenState.page,
        take: screenState.take,
        isPagination: true,
        orderBy: 'updatedAt' as never,
        orderType: OrderType.DESC,
        sortOrder: 'DESC',
        ...(screenState.search.trim() ? { search: screenState.search.trim() } : {}),
        ...(screenState.status === 'all' ? { statuses: PRE_ORDER_CAMPAIGN_STATISTICS_DEFAULT_STATUSES } : { status: screenState.status }),
      }),
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  const rows = listSwr.data?.list ?? [];
  const totalItems = listSwr.data?.total ?? listSwr.data?.pagination?.total ?? 0;

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        key: 'status-filter',
        label: 'Trạng thái',
        icon: <FilterListOutlined sx={{ fontSize: 18 }} />,
        selectedOptionLabel: screenState.status === 'all' ? undefined : getPreOrderCampaignStatusLabel(screenState.status),
        options: PRE_ORDER_CAMPAIGN_STATISTICS_STATUS_FILTER_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
        onSelectOption: (value) => setScreenState((prev) => ({ ...prev, status: value as PreOrderCampaignStatisticsStatusFilter, page: PAGE_TAKE_DEFAULT.page })),
        ...preOrderCampaignStatisticsButtonPermission('filter', 'Lọc thống kê chiến dịch đặt trước', 'api_pre_order_campaign_statistics_list'),
      },
    ],
    [screenState.status],
  );

  const columns = useMemo<Array<DataTableColumn<PreOrderCampaignStatisticsListItem>>>(
    () => [
      {
        id: 'name',
        label: 'Tên chiến dịch',
        minWidth: 220,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>{row.name || '-'}</Typography>,
      },
      {
        id: 'skuCount',
        label: 'Số mã SP',
        minWidth: 100,
        width: 100,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{formatStatisticsNumber(row.skuCount)}</Typography>,
      },
      {
        id: 'orderCount',
        label: <StatisticsColumnHeader label="Tổng đơn hàng" tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.orderCount} />,
        minWidth: 145,
        width: 145,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{formatStatisticsNumber(row.orderCount)}</Typography>,
      },
      {
        id: 'orderedQuantity',
        label: <StatisticsColumnHeader label="SL Đặt mua" tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.orderedQuantity} />,
        minWidth: 130,
        width: 130,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{formatStatisticsNumber(row.orderedQuantity)}</Typography>,
      },
      {
        id: 'readyQuantity',
        label: <StatisticsColumnHeader label="Sẵn sàng giao" tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.readyQuantity} />,
        minWidth: 145,
        width: 145,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{formatStatisticsNumber(row.readyQuantity)}</Typography>,
      },
      {
        id: 'progressPercent',
        label: <StatisticsColumnHeader label="Tiến độ" tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.progressPercent} />,
        minWidth: 280,
        width: 280,
        renderCell: (row) => <StatisticsProgressBar percent={row.progressPercent} height={8} />,
      },
      {
        id: 'status',
        label: 'Trạng thái',
        minWidth: 140,
        width: 140,
        renderCell: (row) => <TagCommonComponent content={row.statusLabel || getPreOrderCampaignStatusLabel(row.status)} border />,
      },
      {
        id: 'schedule',
        label: 'Thời gian chạy',
        minWidth: 240,
        width: 240,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054', whiteSpace: 'nowrap' }}>{formatPreOrderCampaignSchedule(row.startAt, row.endAt)}</Typography>,
      },
      {
        id: 'actions',
        label: '',
        width: 64,
        minWidth: 64,
        sticky: 'right',
        align: 'center',
        renderCell: (row) => (
          <PermissionIconButton
            size="small"
            aria-label="Xem chi tiết"
            onClick={() => navigate(getPreOrderCampaignStatisticsDetailPath(row.id))}
            {...preOrderCampaignStatisticsButtonPermission('open_detail', 'Xem chi tiết thống kê chiến dịch đặt trước', 'api_pre_order_campaign_statistics_detail')}
            sx={{ color: '#374151' }}
          >
            <Eye size={18} />
          </PermissionIconButton>
        ),
      },
    ],
    [navigate],
  );

  if (!canViewList) return null;

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, minHeight: 0, boxSizing: 'border-box' }}>
      <WrapperComponent label="Thống kê chiến dịch">
        <Stack sx={{ gap: 2, height: '100%', minHeight: 0, minWidth: 0 }}>
          <DataTableFilterCard>
            <DataTableToolbar
              embedded
              searchValue={screenState.search}
              searchPlaceholder="Tìm theo tên chiến dịch..."
              onSearchChange={(value) => setScreenState((prev) => ({ ...prev, search: value, page: PAGE_TAKE_DEFAULT.page }))}
              actions={toolbarActions}
            />
          </DataTableFilterCard>

          <DataTableContentCard sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {(listSwr.isLoading || listSwr.isValidating) && <LinearProgress />}
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(row) => row.id}
              emptyTitle="Không có chiến dịch nào"
              emptyDescription="Thử đổi bộ lọc tìm kiếm hoặc trạng thái."
              tableMinWidth={1600}
              containerSx={{ flex: 1, minHeight: 0, minWidth: 0, height: '100%', overflow: 'auto' }}
            />
            <DataTablePagination
              page={screenState.page}
              pageSize={screenState.take}
              totalItems={totalItems}
              pageSizeOptions={[...PRE_ORDER_CAMPAIGN_STATISTICS_PAGE_SIZE_OPTIONS]}
              itemLabel="chiến dịch"
              summaryMode="total"
              onPageChange={(page) => setScreenState((prev) => ({ ...prev, page }))}
              onPageSizeChange={(take) => setScreenState((prev) => ({ ...prev, take, page: PAGE_TAKE_DEFAULT.page }))}
            />
          </DataTableContentCard>
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};

export default PreOrderCampaignStatisticsListPage;
