import { ContentCopyOutlined, EditOutlined, FlagRounded, MoreHorizRounded, RemoveRedEyeOutlined, SyncOutlined } from '@mui/icons-material';
import { Box, CircularProgress, Link, Stack, Tooltip, Typography } from '@mui/material';
import { PermissionIconButton } from '../../components/button';
import { orderListButtonPermission } from './order-permission.constants';
import type { MouseEvent } from 'react';
import { canShowOrderGhnSyncButton } from '../../common/constant/order/order.constants';
import { ORDER_STATUS_PILL_CONFIG } from '../../common/constant/order/order-status-pill.constant';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { formatDateTime } from '../../common/utils';
import { formatCurrency } from '../../common/utils/number.utils';
import { getOrderGrandTotalAmount, getOrderProductCount, getPrimaryOrderItem } from '../../common/utils/order/order.utils';
import { type DataTableColumn } from '../../components/data-table';
import { StatusPill } from '../../components/status-pill';
import { OrderDataStatusCell } from './components/order-data-status-cell';
import { SHIPPING_CARRIER_OPTIONS } from './create-order/shipping-mock.data';
import { getPaymentMethodDisplay, getShippingMethodLabel } from './order-detail/order-detail.helpers';
import { formatLinkGHN } from './order.constant';
import { type Order, type OrderShippingAddress, type OrderSortField } from './order.types';

const MAX_DISPLAYED_SKUS = 3;

interface OrderTableColumnHandlers {
  onCopyOrderCode: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onViewOrder: (order: Order) => void;
  onMoreActions: (order: Order, event: MouseEvent<HTMLElement>) => void;
  onUpdateOrderShippingAddress: (orderId: string, shippingAddress: OrderShippingAddress) => void;
  onSyncOrderShipment: (order: Order) => void;
  syncingOrderId?: string | null;
  canEditOrder?: boolean;
  canViewOrder?: boolean;
  canOpenMoreActions?: boolean;
}

const getDisplayedSkus = (order: Order): { skus: string[]; remainingCount: number } => {
  const uniqueSkus = Array.from(new Set(order.items.map((item) => item.sku?.trim()).filter((sku): sku is string => Boolean(sku))));

  if (uniqueSkus.length <= MAX_DISPLAYED_SKUS) {
    return { skus: uniqueSkus, remainingCount: uniqueSkus.length - MAX_DISPLAYED_SKUS };
  }

  return {
    skus: uniqueSkus.slice(0, MAX_DISPLAYED_SKUS),
    remainingCount: uniqueSkus.length - MAX_DISPLAYED_SKUS,
  };
};

const PaymentMethodPill = ({ label }: { label: string }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      alignItems: 'flex-start',
      borderRadius: 999,
      color: '#6A7282',
      ...TYPOGRAPHY_STYLES.sm.regular,
    }}
  >
    {label}
  </Box>
);

const getShippingCarrierLabel = (shippingCarrier?: string): string => {
  if (!shippingCarrier) return '—';
  const matched = SHIPPING_CARRIER_OPTIONS.find((option) => option.value === shippingCarrier);
  return matched?.label ?? shippingCarrier;
};

export const getOrderTableColumns = ({
  onCopyOrderCode,
  onEditOrder,
  onViewOrder,
  onMoreActions,
  onUpdateOrderShippingAddress,
  onSyncOrderShipment,
  syncingOrderId = null,
  canEditOrder = true,
  canViewOrder = true,
  canOpenMoreActions = true,
}: OrderTableColumnHandlers): Array<DataTableColumn<Order, OrderSortField>> => [
  {
    id: 'orderCode',
    label: 'Mã đơn hàng',
    width: 300,
    sortable: true,
    renderCell: (order) => {
      const showSyncButton = canShowOrderGhnSyncButton(order);
      const isSyncing = syncingOrderId === order.id;

      return (
        <Stack gap={0.5}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Link
              component="button"
              type="button"
              underline="none"
              onClick={() => onViewOrder(order)}
              sx={{
                color: '#155DFC',
                ...TYPOGRAPHY_STYLES.base.bold,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {order.orderCode}
            </Link>
            <Tooltip title="Sao chép mã đơn">
              <PermissionIconButton
                size="small"
                onClick={() => onCopyOrderCode(order)}
                sx={{
                  width: 24,
                  height: 24,
                  color: '#155DFC',
                }}
              >
                <ContentCopyOutlined sx={{ ...TYPOGRAPHY_STYLES.base.regular }} />
              </PermissionIconButton>
            </Tooltip>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#98A2B3' }}>{order.trackingCode || '—'}</Typography>
            {showSyncButton ? (
              <Tooltip title="Đồng bộ vận đơn" placement="top">
                <span>
                  <PermissionIconButton
                    size="small"
                    disabled={isSyncing}
                    onClick={() => onSyncOrderShipment(order)}
                    {...orderListButtonPermission('sync_shipment', 'Đồng bộ vận đơn GHN', 'api_order_shipment_ghn_sync')}
                    sx={{
                      width: 24,
                      height: 24,
                      color: '#155DFC',
                    }}
                  >
                    {isSyncing ? <CircularProgress size={14} /> : <SyncOutlined sx={{ ...TYPOGRAPHY_STYLES.base.regular }} />}
                  </PermissionIconButton>
                </span>
              </Tooltip>
            ) : null}
            {order.isAllowCheck ? (
              <Tooltip title="Đơn hàng tham gia vote" placement="top">
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.25,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: '#EEF2FF',
                    color: '#4338CA',
                    ...TYPOGRAPHY_STYLES.xs.semibold,
                  }}
                >
                  <FlagRounded sx={{ fontSize: 12 }} />
                  Vote
                </Box>
              </Tooltip>
            ) : null}
          </Stack>
        </Stack>
      );
    },
  },
  {
    id: 'shippingMethod',
    label: 'Hình thức giao hàng',
    width: 180,
    renderCell: (order) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{getShippingMethodLabel(order.shippingMethod)}</Typography>,
  },
  {
    id: 'createdAt',
    label: 'Ngày',
    width: 180,
    sortable: true,
    renderCell: (order) => (
      <Stack gap={0.5}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{formatDateTime(order.createdAt)}</Typography>
      </Stack>
    ),
  },
  {
    id: 'source',
    label: 'Nguồn đơn',
    width: 140,
    sortable: true,
    renderCell: (order) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{order.source}</Typography>,
  },
  {
    id: 'warehouseName',
    label: 'Cửa hàng',
    width: 180,
    renderCell: (order) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: order.warehouseName ? '#101828' : '#98A2B3' }}>{order.warehouseName || '—'}</Typography>,
  },
  {
    id: 'customer',
    label: 'Khách hàng',
    width: 210,
    sortable: true,
    renderCell: (order) => (
      <Stack gap={0.5}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.bold, fontWeight: 600, color: '#111827' }}>{order.customer.primaryText}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{order.customer.secondaryText}</Typography>
      </Stack>
    ),
  },
  {
    id: 'product',
    label: 'Sản phẩm',
    width: 330,
    sortable: true,
    renderCell: (order) => {
      const primaryItem = getPrimaryOrderItem(order);
      const { skus, remainingCount } = getDisplayedSkus(order);
      const firstSku = skus[0] ?? '';
      const secondSku = skus[1] ?? '';
      const thirdSku = skus[2] ?? '';

      return primaryItem ? (
        <Stack gap={0.25} sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.regular,
              color: '#6A7282',
              lineHeight: 1.35,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {firstSku}
          </Typography>
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.regular,
              color: '#6A7282',
              lineHeight: 1.35,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {secondSku}
          </Typography>
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.regular,
              color: '#6A7282',
              lineHeight: 1.35,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {thirdSku}
            {remainingCount > 0 ? (
              <Box component="span" sx={{ color: '#9CA3AF', ml: 1 }}>
                • +{remainingCount} sản phẩm
              </Box>
            ) : null}
          </Typography>
        </Stack>
      ) : (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#9CA3AF' }}>—</Typography>
      );
    },
  },
  {
    id: 'quantity',
    label: 'Số lượng',
    width: 140,
    sortable: true,
    align: 'center',
    renderCell: (order) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.bold, fontWeight: 600, color: '#111827' }}>{getOrderProductCount(order)}</Typography>,
  },
  {
    id: 'brand',
    label: 'Brand',
    width: 170,
    sortable: true,
    renderCell: (order) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.bold, fontWeight: 600, color: '#344054', wordBreak: 'break-word' }}>{order.brand}</Typography>,
  },
  {
    id: 'totalAmount',
    label: 'Tổng tiền',
    width: 210,
    sortable: true,
    renderCell: (order) => (
      <Stack gap={0.75}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{formatCurrency(getOrderGrandTotalAmount(order))} đ</Typography>
        <Stack direction="row" spacing={0.75} alignItems="flex-start" useFlexGap flexWrap="wrap">
          <PaymentMethodPill label={getPaymentMethodDisplay(order?.paymentMethod)} />
        </Stack>
      </Stack>
    ),
  },
  {
    id: 'dataStatus',
    label: 'Tình trạng dữ liệu',
    width: 130,
    align: 'center',
    renderCell: (order) => (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <OrderDataStatusCell order={order} onSave={onUpdateOrderShippingAddress} />
      </Box>
    ),
  },
  {
    id: 'shippingCarrier',
    label: 'Đơn vị vận chuyển',
    width: 170,
    renderCell: (order) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{getShippingCarrierLabel(order.shippingCarrier)}</Typography>,
  },
  {
    id: 'status',
    label: 'Trạng thái đơn',
    width: 150,
    renderCell: (order) => <StatusPill status={order.status} config={ORDER_STATUS_PILL_CONFIG} />,
  },
  {
    id: 'shippingTracking',
    label: 'Mã vận đơn',
    width: 170,
    align: 'center',
    renderCell: (order) =>
      order.trackingCode ? (
        <Link
          href={formatLinkGHN(order.trackingCode)}
          target="_blank"
          rel="noreferrer"
          underline="hover"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            color: '#155DFC',
            ...TYPOGRAPHY_STYLES.sm.bold,
          }}
        >
          Link
        </Link>
      ) : (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#98A2B3' }}>Chưa có mã vận đơn</Typography>
      ),
  },
  {
    id: 'actions',
    label: '',
    width: 90,
    align: 'center',
    sticky: 'right',
    renderCell: (order) => (
      <Stack direction="row" gap={0.5} justifyContent="center">
        <span>
          <PermissionIconButton
            size="small"
            disabled={order.status !== 'Pending' || !canEditOrder}
            onClick={canEditOrder ? () => onEditOrder(order) : undefined}
            sx={{
              color: '#475467',
              '&:hover': { backgroundColor: '#EEF2FF', color: '#1D4ED8' },
            }}
          >
            <EditOutlined sx={{ fontSize: 18 }} />
          </PermissionIconButton>
        </span>
        <PermissionIconButton
          size="small"
          disabled={!canViewOrder}
          onClick={canViewOrder ? () => onViewOrder(order) : undefined}
          {...orderListButtonPermission('open_detail', 'Xem chi tiết đơn hàng', 'api_order_detail')}
          sx={{
            color: '#475467',
            '&:hover': { backgroundColor: '#EEF2FF', color: '#1D4ED8' },
          }}
        >
          <RemoveRedEyeOutlined sx={{ fontSize: 18 }} />
        </PermissionIconButton>
        <PermissionIconButton
          size="small"
          disabled={!canOpenMoreActions}
          onClick={canOpenMoreActions ? (e) => onMoreActions(order, e) : undefined}
          sx={{
            color: '#475467',
            '&:hover': { backgroundColor: '#EEF2FF', color: '#1D4ED8' },
          }}
        >
          <MoreHorizRounded sx={{ fontSize: 18 }} />
        </PermissionIconButton>
      </Stack>
    ),
  },
];
