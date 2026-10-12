import { CloseRounded } from '@mui/icons-material';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { CustomButton, PermissionIconButton } from '../../../components/button';

interface CloneOrderConfirmDialogProps {
  open: boolean;
  orderCode: string;
  submitting: boolean;
  onClose: () => void;
  onConfirmKeepOriginal: () => void;
  onConfirmCancelOriginal: () => void;
}

export const CloneOrderConfirmDialog = ({ open, orderCode, submitting, onClose, onConfirmKeepOriginal, onConfirmCancelOriginal }: CloneOrderConfirmDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      // maxWidth="sm"
      // fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '14px',
            maxWidth: 448,
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogTitle sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E4E7EC' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold }}>Sao chép & Hủy đơn</Typography>
          <PermissionIconButton size="small" aria-label="Đóng" onClick={onClose} disabled={submitting} sx={{ color: '#98A2B3' }}>
            <CloseRounded />
          </PermissionIconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: '24px !important', borderBottom: '1px solid #E4E7EC' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular }}>
          Bạn đang sao chép đơn hàng <strong style={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{orderCode}</strong>, bạn có muốn <strong style={{ ...TYPOGRAPHY_STYLES.base.semibold }}>HUỶ</strong> đơn
          hàng này rồi sao chép không?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5, justifyContent: 'flex-start', bgcolor: '#F9FAFB' }}>
        <CustomButton
          fullWidth={false}
          variant="outline"
          disabled={submitting}
          onClick={onConfirmKeepOriginal}
          sx={{
            borderColor: '#D0D5DD',
            color: '#1D2939',
            borderRadius: '14px',
            p: '8px 12px',
            ...TYPOGRAPHY_STYLES.md.medium,
            '&:hover': { borderColor: '#98A2B3', backgroundColor: '#F9FAFB' },
          }}
        >
          Sao chép & Không huỷ
        </CustomButton>
        <CustomButton
          fullWidth={false}
          variant="primary"
          disabled={submitting}
          onClick={onConfirmCancelOriginal}
          sx={{
            bgcolor: '#EF4444',
            color: '#FFFFFF',
            borderRadius: '14px',
            p: '8px 12px',
            ...TYPOGRAPHY_STYLES.md.medium,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#EF4444', boxShadow: 'none' },
          }}
        >
          Sao chép & Hủy đơn
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
