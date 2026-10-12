import { ContentCopyOutlined } from '@mui/icons-material';
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import type { IVatInvoiceSnapshot } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { copyTextToClipboard } from '../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';

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
  vatInvoice?: IVatInvoiceSnapshot | null;
  isLoadingOrder?: boolean;
}

export function InvoiceDocumentDetailVatCard({ vatInvoice, isLoadingOrder }: Props) {
  const { showSnackbar } = useSnackbar();
  const hasVat = Boolean(vatInvoice?.taxCode?.trim() || vatInvoice?.companyName?.trim() || vatInvoice?.companyAddress?.trim() || vatInvoice?.email?.trim());

  const handleCopyTaxCode = async (taxCode: string) => {
    try {
      await copyTextToClipboard(taxCode);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã sao chép mã số thuế.' });
    } catch {
      showSnackbar({ type: SnackbarType.ERROR, message: 'Không thể sao chép mã số thuế.' });
    }
  };

  return (
    <Paper sx={cardSx}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>Thông tin xuất hóa đơn VAT</Typography>
        {hasVat ? (
          <Chip
            size="small"
            label="Có yêu cầu VAT"
            sx={{
              bgcolor: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        ) : (
          <Chip
            size="small"
            label="Không yêu cầu VAT"
            sx={{
              bgcolor: '#F3F4F6',
              color: '#4B5563',
              border: '1px solid #E5E7EB',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        )}
      </Stack>

      {isLoadingOrder ? (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Đang tải thông tin VAT...</Typography>
      ) : hasVat ? (
        <Stack gap={2}>
          <Field label="Tên công ty" value={vatInvoice?.companyName} />
          <Box>
            <Typography sx={labelSx}>Mã số thuế</Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography sx={valueSx}>{vatInvoice?.taxCode?.trim() || '—'}</Typography>
              {vatInvoice?.taxCode?.trim() ? (
                <Tooltip title="Sao chép mã số thuế">
                  <IconButton size="small" onClick={() => void handleCopyTaxCode(vatInvoice.taxCode!.trim())} sx={{ p: 0.5, color: '#6B7280', '&:hover': { color: '#111827' } }}>
                    <ContentCopyOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Stack>
          </Box>
          <Field label="Địa chỉ công ty" value={vatInvoice?.companyAddress} />
          <Field label="Email nhận hóa đơn" value={vatInvoice?.email} />
        </Stack>
      ) : (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Đơn hàng không yêu cầu xuất hóa đơn VAT.</Typography>
      )}
    </Paper>
  );
}
