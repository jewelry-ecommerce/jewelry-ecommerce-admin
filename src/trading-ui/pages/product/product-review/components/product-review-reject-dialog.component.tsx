import { Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { DialogConfirmComponent } from '../../../../components/dialog';
import { productReviewsButtonPermission } from '../../product-permission.constants';

export interface ProductReviewRejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  count?: number;
}

export const ProductReviewRejectDialog = ({ open, onClose, onConfirm, count = 1 }: ProductReviewRejectDialogProps) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
    }
  };

  return (
    <DialogConfirmComponent
      open={open}
      title="Từ chối duyệt"
      cancelLabel="Quay lại"
      confirmLabel="Xác nhận từ chối"
      confirmVariant="danger"
      onCancel={onClose}
      onConfirm={handleConfirm}
      onClose={onClose}
      cancelButtonProps={productReviewsButtonPermission('dialog_close', 'Hủy từ chối duyệt đánh giá', 'api_product_approval_review')}
      confirmButtonProps={{
        disabled: !reason.trim(),
      }}
      highlight={{
        tone: 'danger',
        title: `Bạn đang từ chối duyệt ${count} đánh giá.`,
        description: 'Hành động này không thể hoàn tác.',
      }}
    >
      <Stack gap={1}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#344054' }}>
          Lý do từ chối <span style={{ color: '#F04438' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Nhập lý do từ chối"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      </Stack>
    </DialogConfirmComponent>
  );
};
