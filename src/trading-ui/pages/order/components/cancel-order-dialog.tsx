import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { CustomButton, PermissionIconButton } from '../../../components/button';

export interface CancelOrderDialogProps {
  open: boolean;
  orderCode: string;
  showWarehouseWarning?: boolean;
  submitting?: boolean;
  /** Override tiêu đề dialog. Default: "Xác nhận hủy đơn hàng". */
  title?: string;
  /** Override mô tả phía dưới mã đơn. Default: "Hành động này không thể hoàn tác. Vui lòng nhập lý do hủy đơn.". */
  description?: string;
  /** Override label nút primary. Default: "Xác nhận hủy đơn". */
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (payload: { reason: string }) => void;
}

const alertBoxSx = {
  display: 'flex',
  gap: 1.5,
  alignItems: 'flex-start',
  p: 2,
  borderRadius: '10px',
  bgcolor: '#FEF2F2',
  border: '1px solid #FECACA',
};

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: 14,
    '& fieldset': { borderColor: '#D0D5DD' },
    '&:hover fieldset': { borderColor: '#98A2B3' },
  },
};

export function CancelOrderDialog({
  open,
  orderCode,
  showWarehouseWarning = false,
  submitting = false,
  title = 'Xác nhận hủy đơn hàng',
  description = 'Hành động này không thể hoàn tác. Vui lòng nhập lý do hủy đơn.',
  confirmLabel = 'Xác nhận hủy đơn',
  onClose,
  onConfirm,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState('');

  const resetForm = useCallback(() => {
    setReason('');
  }, []);

  const handleRequestClose = useCallback(() => {
    if (submitting) return;
    resetForm();
    onClose();
  }, [onClose, resetForm, submitting]);

  const handleConfirm = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) return;
    onConfirm({ reason: trimmedReason });
  };

  const confirmDisabled = !reason.trim() || submitting;

  return (
    <Dialog
      open={open}
      onClose={handleRequestClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="cancel-order-dialog-title"
      slotProps={{
        transition: {
          onEnter: resetForm,
        },
        paper: {
          sx: {
            borderRadius: '12px',
            maxWidth: 480,
          },
        },
      }}
    >
      <DialogTitle
        id="cancel-order-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          pb: 2,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, color: '#101828', lineHeight: 1.35 }}>
          {title}
        </Typography>
        <PermissionIconButton type="button" aria-label="Đóng" onClick={handleRequestClose} disabled={submitting} size="small" sx={{ color: '#667085', ml: 1 }}>
          <CloseRounded sx={{ fontSize: 22 }} />
        </PermissionIconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: 0 }}>
        <Stack sx={{ px: 3, pt: 2.5, pb: 3 }}>
          <Box sx={alertBoxSx}>
            <ErrorOutlineRounded sx={{ fontSize: 22, color: '#DC2626', flexShrink: 0, mt: 0.125 }} />
            <Stack gap={0.75} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#B42318', lineHeight: 1.5 }}>Bạn đang hủy đơn hàng {orderCode}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, color: '#DC2626', lineHeight: 1.5 }}>{description}</Typography>
            </Stack>
          </Box>
          {showWarehouseWarning ? (
            <Box
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: '10px',
                bgcolor: '#FFF7ED',
                border: '1px solid #FDBA74',
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#C2410C', lineHeight: 1.5 }}>Đơn đang ở trạng thái Đã đóng gói. Khi hủy đơn cần cảnh báo cho bộ phận Kho.</Typography>
            </Box>
          ) : null}

          <Stack gap={0.25}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#101828' }}>
              Lý do hủy đơn{' '}
              <Typography component="span" sx={{ color: '#DC2626', fontWeight: 600 }}>
                *
              </Typography>
            </Typography>
            <TextField multiline minRows={3} fullWidth placeholder="Nhập lý do hủy đơn..." value={reason} onChange={(e) => setReason(e.target.value)} disabled={submitting} sx={textFieldSx} />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          borderTop: '1px solid #E5E7EB',
          justifyContent: 'flex-end',
        }}
      >
        <CustomButton
          fullWidth={false}
          variant="outline"
          onClick={handleRequestClose}
          disabled={submitting}
          sx={{
            height: 40,
            px: 2,
            minWidth: 100,
            borderColor: '#D0D5DD',
            color: '#101828',
            bgcolor: '#FFFFFF',
            borderRadius: '10px',
          }}
        >
          Quay lại
        </CustomButton>
        <CustomButton
          fullWidth={false}
          variant="primary"
          onClick={handleConfirm}
          disabled={confirmDisabled}
          sx={{
            height: 40,
            px: 2,
            minWidth: 160,
            bgcolor: '#F97066',
            color: '#FFFFFF',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#EF4444', boxShadow: 'none' },
            '&:disabled': { bgcolor: '#FECACA', color: '#9CA3AF' },
            borderRadius: '10px',
          }}
        >
          {submitting ? (
            <Stack direction="row" alignItems="center" gap={1} component="span">
              <CircularProgress size={16} thickness={5} sx={{ color: 'inherit' }} />
              Đang xử lý…
            </Stack>
          ) : (
            confirmLabel
          )}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
