import { ContentCopyOutlined } from '@mui/icons-material';
import { Link, Stack, Tooltip, Typography } from '@mui/material';
import { PermissionIconButton } from '../../components/button';

import { StatusPill } from '../../components/status-pill';
import type { DataTableColumn } from '../../components/data-table';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { formatCurrency } from '../../common/utils/number.utils';
import { formatDateTime } from '../../common/utils';
import { resolveShippingTrackingUrl } from '../order/order.constant';
import type { Shipment, ShipmentSortField } from './shipping.types';
import { SHIPPING_STATUS_PILL_CONFIG } from './shipping.constants';

interface ShipmentTableColumnHandlers {
  canViewOrder: boolean;
  onCopyOrderCode: (shipment: Shipment) => void;
  onCopyTrackingCode: (shipment: Shipment) => void;
  onViewOrder: (shipment: Shipment) => void;
}

const formatMoney = (value: number) => (value ? formatCurrency(value) : '0');

const renderOrderLink = (label: string, shipment: Shipment, canViewOrder: boolean, onViewOrder: (shipment: Shipment) => void) => {
  if (!canViewOrder) {
    return <Typography sx={{ ...TYPOGRAPHY_STYLES.base.bold, color: '#111827' }}>{label}</Typography>;
  }

  return (
    <Link
      component="button"
      type="button"
      underline="none"
      onClick={() => onViewOrder(shipment)}
      sx={{
        color: '#155DFC',
        ...TYPOGRAPHY_STYLES.base.bold,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {label}
    </Link>
  );
};

export const getShipmentTableColumns = ({ canViewOrder, onCopyOrderCode, onCopyTrackingCode, onViewOrder }: ShipmentTableColumnHandlers): Array<DataTableColumn<Shipment, ShipmentSortField>> => [
  {
    id: 'trackingCode',
    label: 'Mã vận đơn',
    width: 200,
    sortable: true,
    renderCell: (shipment) => {
      const trackingCode = shipment.trackingCode?.trim() || '';
      const trackingUrl = resolveShippingTrackingUrl(shipment.trackingCode);

      return (
        <Stack gap={0.5}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {trackingUrl ? (
              <Link
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{
                  color: '#155DFC',
                  ...TYPOGRAPHY_STYLES.base.bold,
                }}
              >
                {trackingCode}
              </Link>
            ) : (
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.bold, color: '#111827' }}>{trackingCode || '—'}</Typography>
            )}{' '}
            {trackingCode ? (
              <Tooltip title="Sao chép mã vận đơn" placement="top">
                <PermissionIconButton
                  size="small"
                  onClick={() => onCopyTrackingCode(shipment)}
                  sx={{
                    width: 24,
                    height: 24,
                    color: '#155DFC',
                  }}
                >
                  <ContentCopyOutlined sx={{ ...TYPOGRAPHY_STYLES.base.regular }} />
                </PermissionIconButton>
              </Tooltip>
            ) : null}
          </Stack>
        </Stack>
      );
    },
  },
  {
    id: 'orderCode',
    label: 'Mã đơn hàng',
    width: 300,
    sortable: true,
    renderCell: (shipment) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {renderOrderLink(shipment.orderCode, shipment, canViewOrder, onViewOrder)}{' '}
        <Tooltip title="Sao chép mã đơn hàng" placement="top">
          <PermissionIconButton
            size="small"
            onClick={() => onCopyOrderCode(shipment)}
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
    ),
  },

  {
    id: 'createdAt',
    label: 'Ngày tạo',
    width: 160,
    sortable: true,
    renderCell: (shipment) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{formatDateTime(shipment.createdAt)}</Typography>,
  },
  {
    id: 'carrier',
    label: 'Đối tác 3PL',
    width: 160,
    renderCell: (shipment) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{shipment.carrierName || '—'}</Typography>,
  },
  {
    id: 'status',
    label: 'Trạng thái',
    width: 160,
    renderCell: (shipment) => <StatusPill status={shipment.status ?? 'ERROR'} config={SHIPPING_STATUS_PILL_CONFIG} />,
  },
  {
    id: 'codAmount',
    label: 'COD',
    width: 130,
    sortable: true,
    align: 'right',
    renderCell: (shipment) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{formatMoney(shipment.codAmount)}</Typography>,
  },
  {
    id: 'estimatedFee',
    label: 'Phí dự kiến',
    width: 200,
    sortable: true,
    align: 'right',
    renderCell: (shipment) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{formatMoney(shipment.estimatedFee)}</Typography>,
  },
  {
    id: 'actualFee',
    label: 'Cước thực tế',
    width: 200,
    sortable: true,
    align: 'right',
    renderCell: (shipment) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{formatMoney(shipment.actualFee)}</Typography>,
  },
  {
    // Chênh lệch cước
    id: 'feeDiff',
    label: 'Chênh lệch cước',
    width: 200,
    sortable: true,
    align: 'right',
    renderCell: (shipment) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{formatMoney(shipment.feeDiff)}</Typography>,
  },
  {
    id: 'warehouseName',
    label: 'Kho',
    width: 160,
    renderCell: (shipment) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{shipment.warehouseName || '—'}</Typography>,
  },
];
