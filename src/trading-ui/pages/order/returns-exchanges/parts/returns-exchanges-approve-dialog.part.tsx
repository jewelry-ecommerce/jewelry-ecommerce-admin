import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

export interface ReturnExchangesApproveDialogPartProps {
  open: boolean;
  returnCode: string;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ReturnExchangesApproveDialogPart = ({ open, returnCode, submitting = false, onClose, onConfirm }: ReturnExchangesApproveDialogPartProps) => {
  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
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
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold }}>Xác nhận duyệt yêu cầu đổi/trả</Typography>
        <PermissionIconButton onClick={handleClose} disabled={submitting} size="small" sx={{ color: '#667085' }}>
          <CloseRounded sx={{ fontSize: 28 }} />
        </PermissionIconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Stack sx={{ px: 3, py: 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
              p: 2,
              borderRadius: '10px',
              bgcolor: '#FFFBEB',
              border: '1px solid #FDE68A',
            }}
          >
            <WarningAmberRounded sx={{ fontSize: 24, color: '#B45309', mt: 0.125, flexShrink: 0 }} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#92400E' }}>
              Bạn đang xác nhận duyệt yêu cầu đổi/trả{' '}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {returnCode}
              </Box>
              . Vui lòng kiểm tra kỹ trước khi tiếp tục.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E5E7EB', gap: 1.25, justifyContent: 'flex-end' }}>
        <CustomButton fullWidth={false} variant="outline" onClick={handleClose} disabled={submitting} sx={{ height: 40, minWidth: 120, borderRadius: '10px' }}>
          Quay lại
        </CustomButton>
        <CustomButton
          fullWidth={false}
          variant="primary"
          onClick={onConfirm}
          disabled={submitting}
          sx={{
            height: 40,
            minWidth: 168,
            borderRadius: '10px',
            bgcolor: '#2563EB',
            color: '#FFF',
            marginLeft: '0 !important',
            '&:hover': { bgcolor: '#1D4ED8' },
            '&:disabled': { bgcolor: '#2563EB', opacity: 0.55 },
          }}
        >
          Xác nhận duyệt
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
