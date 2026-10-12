// code này được thêm vởi quân phạm
import { useCallback } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import { QRCodeComponent } from '../../../../common/libs/qr-barcode';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

import { copyTextToClipboard, getCopyFailureMessage } from '../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import type { CreatedOrderPaymentLink } from '../../../../hooks/use-order-draft-form-page.hook';

interface CreateOrderPaymentLinkDialogPartProps {
  paymentLink: CreatedOrderPaymentLink | null;
  onClose: () => void;
}

export const CreateOrderPaymentLinkDialogPart = ({ paymentLink, onClose }: CreateOrderPaymentLinkDialogPartProps) => {
  const { showSnackbar } = useSnackbar();
  const paymentUrl = paymentLink?.paymentUrl ?? '';

  const handleCopyLink = useCallback(async () => {
    const copied = await copyTextToClipboard(paymentUrl);
    showSnackbar({
      type: copied ? SnackbarType.SUCCESS : SnackbarType.WARNING,
      message: copied ? 'Đã sao chép link thanh toán.' : getCopyFailureMessage(),
    });
  }, [paymentUrl, showSnackbar]);

  const handleOpenPayment = useCallback(() => {
    if (!paymentUrl) return;
    window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  }, [paymentUrl]);

  return (
    <Dialog open={Boolean(paymentLink)} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 2, overflow: 'hidden' } } }}>
      <DialogTitle sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E5E7EB', fontWeight: 700 }}>Link thanh toán Payoo</DialogTitle>
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: 232,
              height: 232,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              bgcolor: '#FFFFFF',
            }}
          >
            {paymentUrl ? <QRCodeComponent value={paymentUrl} size={210} errorCorrectionLevel="M" /> : null}
          </Box>

          <Stack spacing={0.75} sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#344054' }}>Đơn hàng {paymentLink?.orderCode ?? ''}</Typography>
            <TextField
              fullWidth
              value={paymentUrl}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <PermissionIconButton edge="end" onClick={() => void handleCopyLink()} aria-label="Sao chép link thanh toán">
                      <ContentCopyRounded sx={{ fontSize: 18 }} />
                    </PermissionIconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#F9FAFB',
                },
                '& .MuiInputBase-input': {
                  fontSize: 14,
                  color: '#475467',
                },
              }}
            />
            {paymentLink?.paymentLinkExpiresAt ? (
              <Typography sx={{ fontSize: 12, color: '#667085' }}>Link hết hạn: {new Date(paymentLink.paymentLinkExpiresAt).toLocaleString('vi-VN')}</Typography>
            ) : null}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E5E7EB', gap: 1, flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
        <CustomButton fullWidth={false} variant="outline" startIcon={<OpenInNewRounded />} onClick={handleOpenPayment}>
          Mở Payoo
        </CustomButton>
        <CustomButton fullWidth={false} onClick={onClose}>
          Xong
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
// code này được thêm vởi quân phạm
