import InfoOutlined from '@mui/icons-material/InfoOutlined';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

export interface ReturnExchangesRejectDialogPartProps {
  open: boolean;
  /** Mã yêu cầu đổi/trả (tham chiếu / toast). */
  returnCode: string;
  /** Mã đơn hàng gốc hiển thị trong dòng "của đơn hàng …" (vd. ORD-…). Mặc định dùng `returnCode`. */
  relatedOrderCode?: string | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (payload: { note: string }) => void;
}

export const ReturnExchangesRejectDialogPart = ({ open, returnCode, relatedOrderCode, submitting = false, onClose, onConfirm }: ReturnExchangesRejectDialogPartProps) => {
  const [note, setNote] = useState('');

  const resetForm = useCallback(() => {
    setNote('');
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    resetForm();
    onClose();
  }, [onClose, resetForm, submitting]);

  const handleConfirm = useCallback(() => {
    const trimmed = note.trim();
    if (!trimmed) return;
    onConfirm({ note: trimmed });
  }, [note, onConfirm]);

  const confirmDisabled = !note.trim() || submitting;
  const bannerOrderCode = relatedOrderCode?.trim() || returnCode;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        transition: { onEnter: resetForm },
        paper: { sx: { borderRadius: '12px', maxWidth: 448 } },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold }}>Huỷ yêu cầu đổi/trả</Typography>
        <PermissionIconButton onClick={handleClose} disabled={submitting} size="small" sx={{ color: '#667085' }}>
          <CloseRounded sx={{ fontSize: 28 }} />
        </PermissionIconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Stack sx={{ px: 3, py: 2.5, gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
              p: 2,
              borderRadius: '10px',
              bgcolor: '#FFF1F2',
              border: '1px solid #FECDD3',
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.125,
              }}
            >
              <InfoOutlined sx={{ fontSize: 18, color: '#BE123C' }} />
            </Box>
            <Stack gap={0.5}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#9F1239' }}>
                Bạn đang huỷ yêu cầu đổi/trả của đơn hàng{' '}
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {bannerOrderCode}
                </Box>
              </Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#BE123C' }}>Hành động này không thể hoàn tác. Vui lòng chọn lý do hủy đơn.</Typography>
            </Stack>
          </Box>

          <Stack gap={0.5}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular }}>
              Lý do hủy yêu cầu{' '}
              <Box component="span" sx={{ color: '#DC2626' }}>
                *
              </Box>
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập lý do huỷ"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={submitting}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#D0D5DD' },
                  '&:hover fieldset': { borderColor: '#98A2B3' },
                  '&.Mui-focused fieldset': { borderColor: '#111827' },
                },
                '& .MuiInputBase-input': { fontSize: 14, py: 1.5 },
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E5E7EB', gap: 1.25, justifyContent: 'flex-end' }}>
        <CustomButton fullWidth={false} variant="outline" onClick={handleClose} disabled={submitting} sx={{ height: 40, minWidth: 120, borderRadius: '10px' }}>
          Quay lại
        </CustomButton>
        <CustomButton
          fullWidth={false}
          variant="primary"
          onClick={handleConfirm}
          disabled={confirmDisabled}
          sx={{
            height: 40,
            minWidth: 160,
            borderRadius: '10px',
            bgcolor: '#F87171',
            color: '#FFF',
            opacity: confirmDisabled ? 0.5 : 1,
            marginLeft: '0 !important',
            '&:hover': { bgcolor: '#EF4444' },
            '&:disabled': { bgcolor: '#F87171' },
          }}
        >
          Xác nhận hủy
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
