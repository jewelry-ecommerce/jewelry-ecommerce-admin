import { ContentCopyOutlined, MoreHorizRounded, VisibilityOutlined, WarningAmberRounded } from '@mui/icons-material';
import { Avatar, Box, Chip, Link, Stack, Tooltip, Typography } from '@mui/material';
import { PermissionIconButton } from '../../../../components/button';
import { orderRefundsButtonPermission } from '../../../order/order-permission.constants';
import { type IRefundProposalListItem } from '../../../../apis/refund-proposal';
import {
  REFUND_PROPOSAL_SOURCE_LABELS,
  REFUND_PROPOSAL_SOURCE_PILL_SX,
  REFUND_PROPOSAL_STATUS_LABELS,
  REFUND_PROPOSAL_STATUS_PILL_SX,
} from '../../../../common/constant/refund-proposal/refund-proposal.constants';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDate, formatTime } from '../../../../common/utils/date-format.util';
import { formatCurrency, parseAmount } from '../../../../common/utils/number.utils';
import type { DataTableColumn } from '../../../../components/data-table';
import type { RefundProposalSortBy } from '../../../../apis/refund-proposal';
import type { RefundProposalRow } from '../../../../hooks/refund-proposal/use-refund-proposal-list.hook';
import { getRefundProposalOrderCode, getRefundProposalOrderSubText, getRefundProposalPaymentLabel, getRefundProposalSourceType, getRefundProposalStatus } from '../refund-proposal-list.helpers';

const formatRefundAmount = (value: IRefundProposalListItem['totalRefundAmount']) => `${formatCurrency(parseAmount(value))} đ`;

/** Bảng màu logo theo phương thức gốc — không cần asset, dùng Avatar text. */
const PAYMENT_LOGO_THEME: Record<string, { bg: string; color: string; text: string }> = {
  MOMO: { bg: '#A50064', color: '#FFFFFF', text: 'Mo' },
  PAYOO: { bg: '#0EA5E9', color: '#FFFFFF', text: 'P' },
  COD: { bg: '#F3F4F6', color: '#374151', text: 'COD' },
  VNPAY: { bg: '#0F6FFF', color: '#FFFFFF', text: 'VN' },
  QR_CODE: { bg: '#111827', color: '#FFFFFF', text: 'QR' },
};

const getPaymentLogo = (code?: string) => {
  const key = (code || '').toUpperCase();
  return PAYMENT_LOGO_THEME[key] ?? { bg: '#E5E7EB', color: '#374151', text: key.slice(0, 2) || '—' };
};

const PaymentMethodCell = ({ row }: { row: IRefundProposalListItem }) => {
  const code = row.originalPaymentMethod || row.paymentChannel || '';
  const label = getRefundProposalPaymentLabel(row);
  const logo = getPaymentLogo(code);
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Avatar
        variant="rounded"
        sx={{
          width: 24,
          height: 24,
          fontSize: 10,
          fontWeight: 700,
          bgcolor: logo.bg,
          color: logo.color,
          borderRadius: '6px',
        }}
      >
        {logo.text}
      </Avatar>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>{label}</Typography>
    </Stack>
  );
};

export const getRefundProposalListColumns = (handlers: {
  onOpenDetail: (row: RefundProposalRow) => void;
  onOpenOriginalOrder: (row: RefundProposalRow) => void;
  onCopyProposalCode: (code: string) => void;
  onCopyOrderCode: (code: string) => void;
  onOpenMore?: (row: RefundProposalRow, anchor: HTMLElement) => void;
}): Array<DataTableColumn<RefundProposalRow, RefundProposalSortBy>> => [
  {
    id: 'proposalCode',
    label: 'Mã yêu cầu',
    width: 220,
    sortable: true,
    renderCell: (row) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Link component="button" type="button" underline="none" onClick={() => handlers.onOpenDetail(row)} sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#155DFC', cursor: 'pointer' }}>
          {row.proposalCode}
        </Link>
        <Tooltip title="Sao chép mã yêu cầu">
          <PermissionIconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              handlers.onCopyProposalCode(row.proposalCode);
            }}
            sx={{ width: 24, height: 24, color: '#98A2B3' }}
          >
            <ContentCopyOutlined sx={{ fontSize: 14 }} />
          </PermissionIconButton>
        </Tooltip>
      </Stack>
    ),
  },
  {
    id: 'sourceCode',
    label: 'Mã đơn hàng',
    width: 230,
    renderCell: (row) => {
      const orderCode = getRefundProposalOrderCode(row);
      const subText = getRefundProposalOrderSubText(row);
      return (
        <Stack gap={0.25}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {orderCode !== '—' ? (
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
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#98A2B3' }}>{orderCode}</Typography>
            )}
            {orderCode !== '—' ? (
              <Tooltip title="Sao chép mã đơn">
                <PermissionIconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlers.onCopyOrderCode(orderCode);
                  }}
                  sx={{ width: 24, height: 24, color: '#98A2B3' }}
                >
                  <ContentCopyOutlined sx={{ fontSize: 14 }} />
                </PermissionIconButton>
              </Tooltip>
            ) : null}
          </Stack>
          {subText ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{subText}</Typography> : null}
        </Stack>
      );
    },
  },
  {
    id: 'sourceType',
    label: 'Nguồn đơn',
    width: 140,
    renderCell: (row) => {
      const sourceType = getRefundProposalSourceType(row);
      const pill = REFUND_PROPOSAL_SOURCE_PILL_SX[sourceType];
      return (
        <Chip
          label={REFUND_PROPOSAL_SOURCE_LABELS[sourceType] ?? sourceType}
          size="small"
          sx={{
            height: 24,
            borderRadius: '999px',
            ...pill,
            ...TYPOGRAPHY_STYLES.sm.medium,
            '& .MuiChip-label': { px: 1.25 },
          }}
        />
      );
    },
  },
  {
    id: 'totalRefundAmount',
    label: 'Số tiền',
    width: 170,
    align: 'right',
    sortable: true,
    renderCell: (row) => (
      <Stack gap={0.25} alignItems="flex-end">
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>{formatRefundAmount(row.totalRefundAmount)}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{getRefundProposalPaymentLabel(row)}</Typography>
      </Stack>
    ),
  },
  {
    id: 'paymentChannel',
    label: 'Phương thức hoàn tiền',
    width: 200,
    renderCell: (row) => <PaymentMethodCell row={row} />,
  },
  {
    id: 'status',
    label: 'Trạng thái',
    width: 200,
    renderCell: (row) => {
      const status = getRefundProposalStatus(row);
      const pillSx = REFUND_PROPOSAL_STATUS_PILL_SX[status];
      const label = REFUND_PROPOSAL_STATUS_LABELS[status] ?? status;
      return (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Chip
            label={label}
            size="small"
            sx={{
              height: 24,
              borderRadius: '999px',
              ...pillSx,
              ...TYPOGRAPHY_STYLES.sm.medium,
              '& .MuiChip-label': { px: 1.25 },
            }}
          />
          {row.errorMessage ? (
            <Tooltip title={row.errorMessage}>
              <WarningAmberRounded sx={{ fontSize: 16, color: '#DC2626' }} />
            </Tooltip>
          ) : null}
        </Stack>
      );
    },
  },
  {
    id: 'createdAt',
    label: 'Ngày đề xuất',
    width: 150,
    sortable: true,
    renderCell: (row) =>
      row.createdAt ? (
        <Stack gap={0.25}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>{formatDate(row.createdAt)}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{formatTime(row.createdAt)}</Typography>
        </Stack>
      ) : (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>—</Typography>
      ),
  },
  {
    id: 'actions',
    label: '',
    width: 96,
    align: 'center',
    sticky: 'right',
    renderCell: (row) => (
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
        <Tooltip title="Xem chi tiết">
          <PermissionIconButton
            size="small"
            onClick={() => handlers.onOpenDetail(row)}
            {...orderRefundsButtonPermission('open_detail', 'Xem chi tiết hoàn tiền', 'api_refund_proposal_detail')}
            sx={{ width: 32, height: 32, color: '#155DFC' }}
          >
            <VisibilityOutlined sx={{ fontSize: 18 }} />
          </PermissionIconButton>
        </Tooltip>
        {handlers.onOpenMore ? (
          <Tooltip title="Thao tác khác">
            <PermissionIconButton size="small" onClick={(event) => handlers.onOpenMore?.(row, event.currentTarget)} sx={{ width: 32, height: 32, color: '#475467' }}>
              <MoreHorizRounded sx={{ fontSize: 18 }} />
            </PermissionIconButton>
          </Tooltip>
        ) : null}
      </Box>
    ),
  },
];
