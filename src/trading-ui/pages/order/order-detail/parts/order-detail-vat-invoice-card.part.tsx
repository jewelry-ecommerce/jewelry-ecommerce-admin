import { ContentCopyOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import type { IVatInvoiceSnapshot } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { copyTextToClipboard } from '../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { OrderDetailColumn } from './order-detail-row-column.part';

export interface OrderDetailVatInvoiceSectionProps {
  vatInvoice?: IVatInvoiceSnapshot | null;
}

export function isVatInvoiceRequested(vat?: IVatInvoiceSnapshot | null): boolean {
  if (!vat) return false;
  return Boolean(vat.taxCode?.trim() || vat.companyName?.trim() || vat.companyAddress?.trim() || vat.email?.trim());
}

/** Khối "Thông tin xuất VAT" nằm trong thẻ Thông tin khách hàng — chỉ hiện khi đơn có yêu cầu xuất VAT. */
export function OrderDetailVatInvoiceSection({ vatInvoice }: OrderDetailVatInvoiceSectionProps) {
  const { showSnackbar } = useSnackbar();
  const taxCode = vatInvoice?.taxCode?.trim() || '';

  const handleCopyTaxCode = async () => {
    try {
      await copyTextToClipboard(taxCode);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã sao chép mã số thuế.' });
    } catch {
      showSnackbar({ type: SnackbarType.ERROR, message: 'Không thể sao chép mã số thuế.' });
    }
  };

  if (!isVatInvoiceRequested(vatInvoice)) return null;

  return (
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F3F4F6' }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827', mb: 1.5 }}>Thông tin xuất VAT</Typography>
      <Stack gap={1.5}>
        <OrderDetailColumn label="Tên công ty" value={vatInvoice?.companyName?.trim() || '—'} />
        <OrderDetailColumn label="Địa chỉ công ty" value={vatInvoice?.companyAddress?.trim() || '—'} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack gap={0.25}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Mã số thuế</Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{taxCode || '—'}</Typography>
                {taxCode ? (
                  <Tooltip title="Sao chép mã số thuế">
                    <IconButton size="small" onClick={() => void handleCopyTaxCode()} sx={{ p: 0.5, color: '#6B7280', '&:hover': { color: '#111827' } }}>
                      <ContentCopyOutlined sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <OrderDetailColumn label="Email" value={vatInvoice?.email?.trim() || '—'} />
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
