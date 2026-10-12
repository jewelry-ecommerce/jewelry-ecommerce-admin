import { ContentCopyOutlined, MoreHorizRounded, RemoveRedEyeOutlined, SyncOutlined } from '@mui/icons-material';
import { Box, CircularProgress, Link, Stack, Tooltip, Typography } from '@mui/material';
import type { InvoiceDocumentStatus } from '../../../apis/order';
import { PermissionIconButton } from '../../../components/button';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { formatDate } from '../../../common/utils';
import { formatCurrency, maskPhone } from '../../../common/utils/number.utils';
import type { DataTableColumn } from '../../../components/data-table';
import type { InvoiceDocumentRow, InvoiceDocumentSortField } from '../../../hooks/invoice-documents/use-invoice-documents-list.hook';
import { orderInvoiceButtonPermission } from '../../order/order-permission.constants';

const STATUS_META: Record<InvoiceDocumentStatus, { label: string; sx: Record<string, string> }> = {
  WAITING_SIGN: {
    label: 'Chờ ký',
    sx: { color: '#A16207', backgroundColor: '#FEF9C3', border: '1px solid #FDE68A' },
  },
  SIGNED: {
    label: 'Đã ký',
    sx: { color: '#15803D', backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0' },
  },
  FAILED: {
    label: 'Lỗi',
    sx: { color: '#BE123C', backgroundColor: '#FFE4E6', border: '1px solid #FECDD3' },
  },
  CANCELLED: {
    label: 'Đã hủy',
    sx: { color: '#6B7280', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB' },
  },
};

/** Checkbox (52) + tổng width cột — khớp `tableMinWidth` để tránh giãn cột. */
export const INVOICE_DOCUMENTS_TABLE_MIN_WIDTH = 1428;

export const getInvoiceDocumentsListColumns = (handlers: {
  onCopyOrderCode: (value: string) => void;
  onCopyInvoiceCode: (value: string) => void;
  onOpenDetail: (row: InvoiceDocumentRow) => void;
  onSyncInvoice: (row: InvoiceDocumentRow) => void;
  syncingDocumentId?: string | null;
}): Array<DataTableColumn<InvoiceDocumentRow, InvoiceDocumentSortField>> => [
  {
    id: 'stt',
    label: 'STT',
    width: 64,
    align: 'center',
    renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{String(row.stt ?? '').padStart(2, '0')}</Typography>,
  },
  {
    id: 'orderCode',
    label: 'Mã vận đơn',
    width: 260,
    sortable: true,
    renderCell: (row) => {
      const isFailed = row.status === 'FAILED';
      const canSyncReturn = row.documentType === 'RECEIPT' && Boolean(row.orderReturnId);
      const canSyncOrder = row.documentType === 'INVOICE' && Boolean(row.orderId);
      const showSync = isFailed && (canSyncOrder || canSyncReturn);
      const isSyncing = handlers.syncingDocumentId === row.id;

      return (
        <Stack gap={0.25}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#155DFC' }}>{row.orderCode}</Typography>
            <Tooltip title="Sao chép mã vận đơn">
              <PermissionIconButton size="small" onClick={() => handlers.onCopyOrderCode(row.orderCode)} sx={{ color: '#155DFC' }}>
                <ContentCopyOutlined sx={{ fontSize: 16 }} />
              </PermissionIconButton>
            </Tooltip>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {row.orderTrackingCode ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{row.orderTrackingCode}</Typography> : null}
            {showSync ? (
              <Tooltip title="Đồng bộ lại hóa đơn điện tử" placement="top">
                <span>
                  <PermissionIconButton
                    size="small"
                    disabled={isSyncing}
                    onClick={(event) => {
                      event.stopPropagation();
                      handlers.onSyncInvoice(row);
                    }}
                    {...orderInvoiceButtonPermission('sync', 'Đồng bộ lại HĐĐT', ['api_invoice_sync', 'api_invoice_return_sync'])}
                    sx={{ width: 24, height: 24, color: '#155DFC' }}
                  >
                    {isSyncing ? <CircularProgress size={14} /> : <SyncOutlined sx={{ fontSize: 16 }} />}
                  </PermissionIconButton>
                </span>
              </Tooltip>
            ) : null}
          </Stack>
        </Stack>
      );
    },
  },
  {
    id: 'invoiceCode',
    label: 'Thông tin Hóa đơn',
    width: 200,
    sortable: true,
    renderCell: (row) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Link
          component="button"
          type="button"
          underline="none"
          onClick={() => handlers.onOpenDetail(row)}
          sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#155DFC', cursor: 'pointer', textAlign: 'left' }}
        >
          {row.invoiceCode}
        </Link>
        <Tooltip title="Sao chép mã hóa đơn">
          <PermissionIconButton size="small" onClick={() => handlers.onCopyInvoiceCode(row.invoiceCode)} sx={{ color: '#155DFC' }}>
            <ContentCopyOutlined sx={{ fontSize: 16 }} />
          </PermissionIconButton>
        </Tooltip>
      </Stack>
    ),
  },
  {
    id: 'customerName',
    label: 'Khách hàng',
    width: 190,
    sortable: true,
    renderCell: (row) => (
      <Stack spacing={0.25}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>{row.customerName}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{maskPhone(row.customerPhone)}</Typography>
        {row.customerEmail ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#98A2B3' }}>{row.customerEmail}</Typography> : null}
      </Stack>
    ),
  },
  {
    id: 'totalAmount',
    label: 'Tổng thanh toán',
    width: 150,
    sortable: true,
    align: 'left',
    renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>{formatCurrency(row.totalAmount)} đ</Typography>,
  },
  {
    id: 'status',
    label: 'Trạng thái',
    align: 'left',
    width: 120,
    renderCell: (row) => (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1.25,
          py: 0.5,
          borderRadius: 999,
          ...STATUS_META[row.status].sx,
          ...TYPOGRAPHY_STYLES.sm.bold,
        }}
      >
        {STATUS_META[row.status].label}
      </Box>
    ),
  },
  {
    id: 'failedReason',
    label: 'Nguyên nhân lỗi',
    width: 160,
    minWidth: 140,
    renderCell: (row) => (
      <Typography
        sx={{
          ...TYPOGRAPHY_STYLES.sm.regular,
          color: row.failedReason ? '#111827' : '#98A2B3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {row.failedReason || '-'}
      </Typography>
    ),
  },
  {
    id: 'issuedAt',
    label: 'Ngày phát hành',
    align: 'center',
    width: 150,
    sortable: true,
    renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, whiteSpace: 'nowrap' }}>{row.issuedAt ? formatDate(row.issuedAt) : '-'}</Typography>,
  },
  {
    id: 'link',
    label: 'Liên kết',
    width: 80,
    align: 'center',
    renderCell: (row) =>
      row.linkUrl ? (
        <Link href={row.linkUrl} target="_blank" rel="noopener noreferrer" underline="always" sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#155DFC' }}>
          Link
        </Link>
      ) : (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#98A2B3' }}>-</Typography>
      ),
  },
  {
    id: 'actions',
    label: '',
    width: 50,
    align: 'center',
    sticky: 'right',
    renderCell: (row) => (
      <Stack direction="row" spacing={0.5} justifyContent="center">
        <Tooltip title="Xem chi tiết">
          <PermissionIconButton
            size="small"
            onClick={() => handlers.onOpenDetail(row)}
            {...orderInvoiceButtonPermission('open_detail', 'Xem chi tiết chứng từ', 'api_invoice_detail')}
            sx={{ color: '#475467' }}
          >
            <RemoveRedEyeOutlined sx={{ fontSize: 18 }} />
          </PermissionIconButton>
        </Tooltip>
        <PermissionIconButton size="small" sx={{ color: '#475467' }}>
          <MoreHorizRounded sx={{ fontSize: 18 }} />
        </PermissionIconButton>
      </Stack>
    ),
  },
];
