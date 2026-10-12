import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import type { IInvoiceDocumentItem } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatCurrency } from '../../../../common/utils/number.utils';
import { getInvoiceDocumentStatusMeta, getInvoiceDocumentTypeLabel } from '../invoice-document-detail.helpers';

const cardSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: '12px',
  border: '1px solid #EAECF0',
  bgcolor: '#FFFFFF',
  boxShadow: 'none',
} as const;

const rowSx = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 };
const labelSx = { ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' };
const valueSx = { ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' };

interface Props {
  detail: IInvoiceDocumentItem;
}

export function InvoiceDocumentDetailSummaryCard({ detail }: Props) {
  const statusMeta = getInvoiceDocumentStatusMeta(detail.status);

  return (
    <Paper sx={cardSx}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828', mb: 2 }}>Tóm tắt</Typography>

      <Stack gap={1.5}>
        <Box sx={rowSx}>
          <Typography sx={labelSx}>Loại chứng từ</Typography>
          <Typography sx={valueSx}>{getInvoiceDocumentTypeLabel(detail.documentType)}</Typography>
        </Box>

        <Box sx={rowSx}>
          <Typography sx={labelSx}>Trạng thái</Typography>
          <Chip
            label={statusMeta.label}
            size="small"
            sx={{
              height: 24,
              borderRadius: '999px',
              ...statusMeta.sx,
              ...TYPOGRAPHY_STYLES.sm.medium,
              '& .MuiChip-label': { px: 1.25 },
            }}
          />
        </Box>

        <Divider sx={{ borderColor: '#EAECF0', my: 0.5 }} />

        <Box sx={rowSx}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Tổng thanh toán</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#101828' }}>{formatCurrency(detail.totalAmount)} đ</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
