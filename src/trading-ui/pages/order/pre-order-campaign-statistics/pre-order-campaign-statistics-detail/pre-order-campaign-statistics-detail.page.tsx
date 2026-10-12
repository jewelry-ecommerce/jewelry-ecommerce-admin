import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { ChevronRightDouble, HelpCircle, Package, ShoppingCart01, ShoppingCart03 } from '@untitledui/icons';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { preOrderCampaignApi, type PreOrderCampaignStatisticsSkuItem } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDate, formatDateTime } from '../../../../common/utils';
import { DataTable, DataTableContentCard, type DataTableColumn, type DataTableSortDirection } from '../../../../components/data-table';
import { StackRowAlignCenter } from '../../../../components/styled/stack.style';
import { TagCommonComponent } from '../../../../components/tag';
import { TooltipOnHoverComponent } from '../../../../components/tooltip/tooltip-on-hover.component';
import { useListPageViewAccess } from '../../../../permissions/use-list-page-view-access.hook';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import { LabelFormPageHeader } from '../../../content-display/label/components';
import { StatisticsColumnHeader, StatisticsKpiCard, StatisticsProgressBar } from '../components/statistics-shared.component';
import { formatStatisticsNumber, formatStatisticsPercent, getPreOrderCampaignStatusLabel, PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS } from '../pre-order-campaign-statistics.constants';
import { preOrderCampaignStatisticsButtonPermission } from '../pre-order-campaign-statistics-permission.constants';
import { PRE_ORDER_CAMPAIGN_STATISTICS_PAGE_SCOPE } from '../pre-order-campaign-statistics-permission.constants';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../../pages/product/product-spu/product-spu.constant';

type SkuSortField = 'orderCount' | 'orderedQuantity' | 'readyQuantity' | 'progressPercent';

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <Stack sx={{ gap: 0.5, minWidth: 0 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#101828' }}>{label}</Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>{value || '-'}</Typography>
  </Stack>
);

const PreOrderCampaignStatisticsDetailPage = () => {
  const canView = useListPageViewAccess(PRE_ORDER_CAMPAIGN_STATISTICS_PAGE_SCOPE, { listApiCode: 'api_pre_order_campaign_statistics_detail' });
  const navigate = useNavigate();
  const { campaignId = '' } = useParams<{ campaignId: string }>();

  const [sortField, setSortField] = useState<SkuSortField>('orderedQuantity');
  const [sortDirection, setSortDirection] = useState<DataTableSortDirection>('desc');

  const detailSwr = useSWR(
    canView && campaignId ? (['pre-order-campaign-statistics-detail', campaignId] as const) : null,
    () => preOrderCampaignApi.getPreOrderCampaignStatisticsDetail(campaignId, { sortOrder: 'DESC' }),
    { revalidateOnFocus: false },
  );

  const detail = detailSwr.data;

  const sortedSkus = useMemo(() => {
    const list = [...(detail?.skus ?? [])];
    const direction = sortDirection === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const left = a[sortField];
      const right = b[sortField];
      const leftNum = left == null || Number.isNaN(left) ? -Infinity : left;
      const rightNum = right == null || Number.isNaN(right) ? -Infinity : right;
      if (leftNum === rightNum) return 0;
      return leftNum > rightNum ? direction : -direction;
    });
    return list;
  }, [detail?.skus, sortDirection, sortField]);

  const handleSortChange = (field: SkuSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection('desc');
  };

  const columns = useMemo<Array<DataTableColumn<PreOrderCampaignStatisticsSkuItem, SkuSortField>>>(
    () => [
      {
        id: 'sku',
        label: 'Mã SKU',
        minWidth: 280,
        renderCell: (row) => (
          <StackRowAlignCenter sx={{ gap: 1.5, minWidth: 0 }}>
            <Box
              component="img"
              src={row.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC}
              alt=""
              sx={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                objectFit: 'cover',
                bgcolor: '#F2F4F7',
                border: '1px solid #E5E7EB',
                flexShrink: 0,
              }}
            />
            <Stack sx={{ minWidth: 0, gap: 0.25 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }} noWrap>
                {row.productName || row.variationName || '-'}
              </Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }} noWrap>
                SKU: {row.skuCode || '-'}
              </Typography>
            </Stack>
          </StackRowAlignCenter>
        ),
      },
      {
        id: 'orderCount',
        label: <StatisticsColumnHeader label="Tổng đơn hàng" tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.skuOrderCount} />,
        minWidth: 145,
        width: 145,
        sortable: true,
        sortField: 'orderCount',
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{formatStatisticsNumber(row.orderCount)}</Typography>,
      },
      {
        id: 'orderedQuantity',
        label: <StatisticsColumnHeader label="SL Đặt mua" tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.orderedQuantity} />,
        minWidth: 130,
        width: 130,
        sortable: true,
        sortField: 'orderedQuantity',
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{formatStatisticsNumber(row.orderedQuantity)}</Typography>,
      },
      {
        id: 'readyQuantity',
        label: <StatisticsColumnHeader label="Sẵn sàng giao" tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.readyQuantity} />,
        minWidth: 145,
        width: 145,
        sortable: true,
        sortField: 'readyQuantity',
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{formatStatisticsNumber(row.readyQuantity)}</Typography>,
      },
      {
        id: 'progressPercent',
        label: <StatisticsColumnHeader label="Tiến độ" tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.progressPercent} />,
        minWidth: 280,
        sortable: true,
        sortField: 'progressPercent',
        renderCell: (row) => <StatisticsProgressBar percent={row.progressPercent} height={8} />,
      },
    ],
    [],
  );

  if (!canView) return null;

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, minHeight: 0, bgcolor: '#F9FAFB', overflow: 'auto', gap: 0 }}>
      <LabelFormPageHeader
        variant="view"
        title={detail?.name || 'Chi tiết thống kê chiến dịch'}
        backLabel="Quay lại danh sách"
        onBack={() => navigate(ROUTE_PATH.PRE_ORDER_CAMPAIGN_STATISTICS)}
        backPermission={preOrderCampaignStatisticsButtonPermission('view', 'Quay lại danh sách thống kê', 'api_pre_order_campaign_statistics_list')}
        actionsStart={detail ? <TagCommonComponent content={detail.statusLabel || getPreOrderCampaignStatusLabel(detail.status)} border /> : null}
      />

      {detailSwr.isLoading && !detail ? (
        <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', py: 8, gap: 0 }}>
          <CircularProgress size={32} />
        </Stack>
      ) : (
        <Stack sx={{ gap: '16px', px: '16px', pt: '16px', pb: '16px' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: '12px' }}>
            <StatisticsKpiCard
              tone="green"
              icon={<Package size={20} color="currentColor" />}
              label="Số mã sản phẩm"
              tooltip="Tổng số lượng SKU được mở bán trong chiến dịch này."
              value={formatStatisticsNumber(detail?.skuCount)}
              unit="sản phẩm"
            />
            <StatisticsKpiCard
              tone="purple"
              icon={<ShoppingCart01 size={20} color="currentColor" />}
              label="Tổng đơn hàng"
              tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.orderCount}
              value={formatStatisticsNumber(detail?.orderCount)}
              unit="đơn hàng"
            />
            <StatisticsKpiCard
              tone="orange"
              icon={<ShoppingCart03 size={20} color="currentColor" />}
              label="SL đặt mua"
              tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.orderedQuantity}
              value={formatStatisticsNumber(detail?.orderedQuantity)}
              unit="sản phẩm"
            />
            <StatisticsKpiCard
              tone="blue"
              icon={<ChevronRightDouble size={20} color="currentColor" />}
              label="Sẵn sàng giao"
              tooltip={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.readyQuantity}
              value={formatStatisticsNumber(detail?.readyQuantity)}
              unit="sản phẩm"
            />
          </Stack>

          <Box sx={{ bgcolor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', p: 2.5 }}>
            <StackRowAlignCenter sx={{ gap: 0.5, mb: 1.5 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: 'rgba(107, 114, 128, 1)' }}>Tiến độ</Typography>
              <TooltipOnHoverComponent content={PRE_ORDER_CAMPAIGN_STATISTICS_TOOLTIPS.progressPercent} placement="top">
                <Box component="span" sx={{ display: 'inline-flex', cursor: 'help', color: '#98A2B3', lineHeight: 0 }}>
                  <HelpCircle size={14} color="currentColor" />
                </Box>
              </TooltipOnHoverComponent>
            </StackRowAlignCenter>
            <StackRowAlignCenter sx={{ gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <StatisticsProgressBar percent={detail?.progressPercent ?? 0} showLabel={false} />
              </Box>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828', minWidth: 48, textAlign: 'right' }}>{formatStatisticsPercent(detail?.progressPercent ?? 0)}</Typography>
            </StackRowAlignCenter>
          </Box>

          <Box sx={{ bgcolor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', p: 2.5 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: 'rgba(107, 114, 128, 1)', mb: 2 }}>Thông tin chung</Typography>
            <Stack sx={{ gap: '16px' }}>
              <InfoField label="Tên chiến dịch" value={detail?.name ?? '-'} />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box sx={{ flex: 1 }}>
                  <InfoField label="Ngày bắt đầu" value={formatDateTime(detail?.startAt) || '-'} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <InfoField label="Ngày kết thúc" value={formatDateTime(detail?.endAt) || '-'} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <InfoField label="Thời gian mở bán dự kiến" value={formatDate(detail?.expectedStockAt) || '-'} />
                </Box>
              </Stack>
            </Stack>
          </Box>

          <DataTableContentCard
            sx={{
              borderRadius: '10px',
              border: '1px solid rgba(229, 231, 235, 1)',
              p: '16px',
              gap: 1.5,
            }}
          >
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: 'rgba(107, 114, 128, 1)' }}>Danh sách biến thể áp dụng đặt trước</Typography>
            <DataTable
              columns={columns}
              rows={sortedSkus}
              getRowId={(row) => row.skuCode}
              emptyTitle="Không có biến thể nào"
              emptyDescription="Chiến dịch chưa có SKU thống kê."
              tableMinWidth={900}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
          </DataTableContentCard>
        </Stack>
      )}
    </Stack>
  );
};

export default PreOrderCampaignStatisticsDetailPage;
