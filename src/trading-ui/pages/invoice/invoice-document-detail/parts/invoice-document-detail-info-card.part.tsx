import { Box, Link, Paper, Stack, Typography } from '@mui/material';
import type { IInvoiceDocumentItem } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDate } from '../../../../common/utils';
import { getInvoiceDocumentTypeLabel } from '../invoice-document-detail.helpers';

const cardSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: '12px',
  border: '1px solid #EAECF0',
  bgcolor: '#FFFFFF',
  boxShadow: 'none',
} as const;

const labelSx = { ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 };
const valueSx = { ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' };

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <Box>
    <Typography sx={labelSx}>{label}</Typography>
    <Typography sx={valueSx}>{value?.trim() || '—'}</Typography>
  </Box>
);

interface Props {
  detail: IInvoiceDocumentItem;
  onOpenRelatedOrder?: () => void;
  onOpenRelatedReturn?: () => void;
  onOpenDocumentLink?: () => void;
}

export function InvoiceDocumentDetailInfoCard({ detail, onOpenRelatedOrder, onOpenRelatedReturn, onOpenDocumentLink }: Props) {
  return (
    <Paper sx={cardSx}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828', mb: 2 }}>Thông tin chứng từ</Typography>

      <Stack gap={2}>
        <Box>
          <Typography sx={labelSx}>Mã hóa đơn / chứng từ</Typography>
          <Typography sx={valueSx}>{detail.invoiceCode?.trim() || '—'}</Typography>
        </Box>

        <Box>
          <Typography sx={labelSx}>Mã vận đơn</Typography>
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
            <Typography sx={valueSx}>{detail.orderCode?.trim() || '—'}</Typography>
            {onOpenRelatedOrder ? (
              <Link component="button" type="button" underline="none" onClick={onOpenRelatedOrder} sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#155DFC', cursor: 'pointer' }}>
                Xem đơn hàng liên quan
              </Link>
            ) : null}
          </Stack>
          {detail.orderTrackingCode?.trim() ? <Typography sx={{ mt: 0.5, ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>{detail.orderTrackingCode}</Typography> : null}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            columnGap: 2,
            rowGap: 2,
          }}
        >
          <Field label="Loại chứng từ" value={getInvoiceDocumentTypeLabel(detail.documentType)} />
          <Field label="Ngày phát hành" value={detail.issuedAt ? formatDate(detail.issuedAt) : undefined} />
          <Field label="Mã chứng từ ngoài" value={detail.externalDocId} />
          <Box>
            <Typography sx={labelSx}>Phiếu đổi/trả liên quan</Typography>
            {detail.orderReturnId && onOpenRelatedReturn ? (
              <Link component="button" type="button" underline="none" onClick={onOpenRelatedReturn} sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#155DFC', cursor: 'pointer' }}>
                Xem phiếu đổi/trả
              </Link>
            ) : (
              <Typography sx={valueSx}>—</Typography>
            )}
          </Box>
        </Box>

        {detail.failedReason?.trim() ? <Field label="Nguyên nhân lỗi" value={detail.failedReason} /> : null}

        <Box>
          <Typography sx={labelSx}>Liên kết chứng từ</Typography>
          {detail.linkUrl && onOpenDocumentLink ? (
            <Link component="button" type="button" underline="always" onClick={onOpenDocumentLink} sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#155DFC', cursor: 'pointer' }}>
              Mở liên kết
            </Link>
          ) : (
            <Typography sx={valueSx}>—</Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
