import { ContentCopyOutlined, EditOutlined, MoreHorizRounded, RemoveRedEyeOutlined, SyncOutlined } from '@mui/icons-material';
import { Box, CircularProgress, Link, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material';
import { PermissionIconButton } from '../../../../components/button';
import { orderReturnsButtonPermission, ORDER_RETURNS_PAGE_SCOPE } from '../../order-permission.constants';
import { usePermissionContext } from '@/permissions/use-permission-context.hook';
import { type MouseEvent, useState } from 'react';
import { type IOrderReturnListItem, type OrderReturnReason } from '../../../../apis/order';
import { canShowOrderGhnSyncButton } from '../../../../common/constant/order/order.constants';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getStatusPillSx } from '../../../../common/utils';
import { formatDate, formatTime } from '../../../../common/utils/date-format.util';
import { formatCurrency, maskPhone, parseAmount } from '../../../../common/utils/number.utils';
import type { DataTableColumn } from '../../../../components/data-table';
import { type ReturnSortField } from '../../../../hooks/return-exchanges/use-return-exchanges-list.hook';
import { RETURN_TYPE_LABELS, STATUS_LABELS, canReturnExchangeConfirmOrCancelOnList, isReturnExchangeEditableOnList } from '../../../../common/constant/order/order.constants';
import { mapOrderReturnReason } from '../../order.constant';

const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? status;
const getReturnTypeLabel = (type: string): string => RETURN_TYPE_LABELS[type as keyof typeof RETURN_TYPE_LABELS] ?? type ?? '—';
const getReturnReasonLabel = (reason: string): string => mapOrderReturnReason(reason as OrderReturnReason) ?? reason ?? '—';

export const getOrderReturnCreatedByLabel = (row: IOrderReturnListItem): string => {
  const createdBy = row.createdByUser;
  if (createdBy) {
    const displayName = createdBy.displayName?.trim();
    if (displayName) return displayName;
    const fullName = `${createdBy.firstName?.trim() ?? ''} ${createdBy.lastName?.trim() ?? ''}`.trim();
    if (fullName) return fullName;
    const email = createdBy.email?.trim();
    if (email) return email;
  }
  return row.resolvedByName?.trim() || row.resolvedById?.trim() || '';
};

type ReturnExchangeRow = IOrderReturnListItem & { stt: number };

const ReturnExchangeActionCell = ({
  row,
  onOpenDetail,
  onEditReturn,
  onConfirmRequest,
  onCancelRequest,
}: {
  row: ReturnExchangeRow;
  onOpenDetail: (row: ReturnExchangeRow) => void;
  onEditReturn: (row: ReturnExchangeRow) => void;
  onConfirmRequest: (row: ReturnExchangeRow) => void;
  onCancelRequest: (row: ReturnExchangeRow) => void;
}) => {
  const { canAccessAction, hasApiAccess } = usePermissionContext();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const canEditReturn = isReturnExchangeEditableOnList(row.status);
  const canConfirmOrCancelOnList = canReturnExchangeConfirmOrCancelOnList(row.status);
  const canApproveOnList = canConfirmOrCancelOnList && canAccessAction(ORDER_RETURNS_PAGE_SCOPE.menuCode, ORDER_RETURNS_PAGE_SCOPE.tabCode, 'list_approve') && hasApiAccess('api_order_return_approve');
  const canRejectOnList = canConfirmOrCancelOnList && canAccessAction(ORDER_RETURNS_PAGE_SCOPE.menuCode, ORDER_RETURNS_PAGE_SCOPE.tabCode, 'list_reject') && hasApiAccess('api_order_return_reject');
  const hasMoreMenuActions = canApproveOnList || canRejectOnList;

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => setMenuAnchor(null);

  return (
    <>
      <Stack direction="row" gap={0.5} justifyContent="center">
        <Tooltip title={canEditReturn ? 'Chỉnh sửa' : 'Chỉ chỉnh sửa khi trạng thái là Chờ xác nhận hoặc Chờ hàng đổi'}>
          <span>
            <PermissionIconButton
              size="small"
              disabled={!canEditReturn}
              onClick={() => onEditReturn(row)}
              {...orderReturnsButtonPermission('update', 'Chỉnh sửa đổi trả', 'api_order_return_update')}
              sx={{ color: '#475467', '&:hover': { backgroundColor: '#EEF2FF', color: '#1D4ED8' } }}
            >
              <EditOutlined sx={{ fontSize: 18 }} />
            </PermissionIconButton>
          </span>
        </Tooltip>
        <PermissionIconButton
          size="small"
          onClick={() => onOpenDetail(row)}
          {...orderReturnsButtonPermission('open_detail', 'Xem chi tiết đổi trả', 'api_order_return_detail')}
          sx={{ color: '#475467', '&:hover': { backgroundColor: '#EEF2FF', color: '#1D4ED8' } }}
        >
          <RemoveRedEyeOutlined sx={{ fontSize: 18 }} />
        </PermissionIconButton>
        {hasMoreMenuActions ? (
          <PermissionIconButton size="small" onClick={openMenu} sx={{ color: '#475467', '&:hover': { backgroundColor: '#EEF2FF', color: '#1D4ED8' } }}>
            <MoreHorizRounded sx={{ fontSize: 18 }} />
          </PermissionIconButton>
        ) : null}
      </Stack>

      {hasMoreMenuActions ? (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 0.5,
              minWidth: 191,
              border: '1px solid #E5E7EB',
              borderRadius: 2,
              boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
            },
          }}
        >
          {canApproveOnList ? (
            <MenuItem
              onClick={() => {
                onConfirmRequest(row);
                closeMenu();
              }}
              sx={{ fontSize: 13, lineHeight: '19.5px', fontWeight: 400, color: '#111827', p: '6px 10px' }}
            >
              Xác nhận yêu cầu đổi/trả
            </MenuItem>
          ) : null}
          {canRejectOnList ? (
            <MenuItem
              onClick={() => {
                onCancelRequest(row);
                closeMenu();
              }}
              sx={{ fontSize: 13, lineHeight: '19.5px', fontWeight: 400, color: '#EF4444', p: '6px 10px' }}
            >
              Hủy yêu cầu
            </MenuItem>
          ) : null}
        </Menu>
      ) : null}
    </>
  );
};

export const getReturnExchangesListColumns = (handlers: {
  onOpenDetail: (row: ReturnExchangeRow) => void;
  onEditReturn: (row: ReturnExchangeRow) => void;
  onConfirmRequest: (row: ReturnExchangeRow) => void;
  onCancelRequest: (row: ReturnExchangeRow) => void;
  onCopyReturnCode: (code: string) => void;
  onCopyOrderId: (orderId: string) => void;
  onOpenOriginalOrder: (row: ReturnExchangeRow) => void;
  onSyncOrderShipment: (row: ReturnExchangeRow) => void;
  syncingOrderReturnId?: string | null;
}): Array<DataTableColumn<ReturnExchangeRow, ReturnSortField>> => [
  {
    id: 'returnCode',
    label: 'Mã yêu cầu',
    width: 320,
    sortable: true,
    renderCell: (row) => {
      const trackingCode = row.returnPickupTrackingCode?.trim() || '';
      const showSyncButton = canShowOrderGhnSyncButton({ trackingCode });
      const isSyncing = handlers.syncingOrderReturnId === row.id;

      if (!row.returnCode) {
        return <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#98A2B3' }}>—</Typography>;
      }

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Link component="button" type="button" underline="none" onClick={() => handlers.onOpenDetail(row)} sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#155DFC', cursor: 'pointer' }}>
              {row.returnCode}
            </Link>
            <Tooltip title="Sao chép mã yêu cầu">
              <PermissionIconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  handlers.onCopyReturnCode(row.returnCode);
                }}
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
            {row.returnPickupTrackingCode ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{row.returnPickupTrackingCode}</Typography> : null}
            {showSyncButton ? (
              <Tooltip title="Đồng bộ vận đơn" placement="top">
                <span>
                  <PermissionIconButton
                    size="small"
                    disabled={isSyncing}
                    onClick={(event) => {
                      event.stopPropagation();
                      handlers.onSyncOrderShipment(row);
                    }}
                    {...orderReturnsButtonPermission('sync_shipment', 'Đồng bộ vận đơn GHN', 'api_order_shipment_ghn_sync')}
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
          </Stack>
        </Box>
      );
    },
  },
  {
    id: 'orderCode',
    label: 'Mã Đơn gốc',
    width: 300,
    renderCell: (row) => {
      const orderCode = row.originalOrderCode?.trim() || row.orderCode?.trim() || '';
      const trackingCode = row.originalOrderTrackingCode?.trim() || '';
      const originalOrderId = row.originalOrderId?.trim() || row.orderId?.trim() || '';

      if (!orderCode) {
        return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#98A2B3' }}>—</Typography>;
      }

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {originalOrderId ? (
              <Link
                component="button"
                type="button"
                underline="none"
                onClick={(event) => {
                  event.stopPropagation();
                  handlers.onOpenOriginalOrder(row);
                }}
                sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#155DFC', cursor: 'pointer', textAlign: 'left' }}
              >
                {orderCode}
              </Link>
            ) : (
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#155DFC' }}>{orderCode}</Typography>
            )}
            <Tooltip title="Sao chép mã đơn gốc">
              <PermissionIconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  handlers.onCopyOrderId(orderCode);
                }}
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
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{trackingCode || '—'}</Typography>
        </Box>
      );
    },
  },
  {
    id: 'createdAt',
    label: 'Ngày tạo',
    width: 170,
    sortable: true,
    renderCell: (row) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium }}>{formatDate(row.createdAt)}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{formatTime(row.createdAt)}</Typography>
      </Box>
    ),
  },
  {
    id: 'source',
    label: 'Nguồn đơn',
    width: 130,
    renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>{row.source ?? '—'}</Typography>,
  },
  {
    id: 'customer',
    label: 'Khách hàng',
    width: 220,
    renderCell: (row) => {
      const fullName = [row.lastName, row.firstName].filter(Boolean).join(' ').trim() || row.customerName?.trim() || '';
      const receiverPhone = row.receiverPhone || row.customerPhone || '';

      return (
        <Stack gap={0.25}>
          {!fullName && !receiverPhone && <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#111827' }}>—</Typography>}
          {fullName ? <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>{fullName}</Typography> : null}
          {receiverPhone ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{maskPhone(receiverPhone)}</Typography> : null}
        </Stack>
      );
    },
  },

  {
    id: 'product',
    label: 'Sản phẩm',
    width: 280,
    renderCell: (row) => {
      const first = row.returnItems?.[0];
      const second = row.returnItems?.[1];
      const more = Math.max((row.returnItems?.length ?? 0) - 2, 0);
      if (!first) return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#98A2B3' }}>—</Typography>;
      return (
        <Stack gap={0.25}>
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.regular,
              color: '#6A7282',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {first.skuCode}
          </Typography>
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.regular,
              color: '#6A7282',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {second?.skuCode}
            {more > 0 ? (
              <Box component="span" sx={{ ml: 1, color: '#9CA3AF' }}>
                • +{more} sản phẩm
              </Box>
            ) : null}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: 'quantity',
    label: 'Số lượng',
    width: 100,
    align: 'center',
    renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{row.returnItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}</Typography>,
  },
  {
    id: 'type',
    label: 'Loại yêu cầu',
    width: 130,
    renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#111827' }}>{getReturnTypeLabel(row.type)}</Typography>,
  },

  {
    id: 'reason',
    label: 'Lý do',
    width: 150,
    renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold }}>{getReturnReasonLabel(row.reason)}</Typography>,
  },
  // {
  //   id: 'evidence',
  //   label: 'Bằng chứng',
  //   width: 300,
  //   align: 'center',
  //   renderCell: () => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#98A2B3' }}>—</Typography>,
  // },
  {
    id: 'paymentAmount',
    label: 'Tiền thanh toán',
    width: 150,
    align: 'right',
    renderCell: (row) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{formatCurrency(Math.max(parseAmount(row.returnInboundShippingFee), 0))}đ</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6A7282' }}>{formatCurrency(Math.max(parseAmount(row.priceDifference), 0))}đ</Typography>
      </Box>
    ),
  },
  {
    id: 'status',
    label: 'Trạng thái yêu cầu',
    width: 170,
    renderCell: (row) => (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1.25,
          py: 0.5,
          borderRadius: 999,
          ...getStatusPillSx(row.status),
          ...TYPOGRAPHY_STYLES.sm.bold,
        }}
      >
        {getStatusLabel(row.status || '') || '—'}
      </Box>
    ),
  },
  {
    id: 'processor',
    label: 'Nhân viên',
    width: 170,
    renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>{getOrderReturnCreatedByLabel(row) || '—'}</Typography>,
  },
  {
    id: 'trackingCode',
    label: 'Vận đơn thu hồi',
    width: 170,
    renderCell: (row) =>
      row.returnPickupTrackingCode ? (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#155DFC', textDecoration: 'underline' }}>{row.returnPickupTrackingCode}</Typography>
      ) : (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#98A2B3' }}>—</Typography>
      ),
  },
  {
    id: 'newOrderCode',
    label: 'Mã vận đơn mới',
    width: 170,
    renderCell: (row) =>
      row.exchangeShipmentTrackingCode ? (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#155DFC', textDecoration: 'underline' }}>{row.exchangeShipmentTrackingCode}</Typography>
      ) : (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#98A2B3' }}>—</Typography>
      ),
  },
  {
    id: 'actions',
    label: '',
    width: 110,
    align: 'center',
    sticky: 'right',
    renderCell: (row) => (
      <ReturnExchangeActionCell
        row={row}
        onOpenDetail={handlers.onOpenDetail}
        onEditReturn={handlers.onEditReturn}
        onConfirmRequest={handlers.onConfirmRequest}
        onCancelRequest={handlers.onCancelRequest}
      />
    ),
  },
];
