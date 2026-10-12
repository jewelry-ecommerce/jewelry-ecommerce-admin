import { Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { DialogConfirmComponent } from '../../../../components/dialog';
import { productReviewsButtonPermission } from '../../product-permission.constants';

export interface ProductReviewReplyDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reply: string) => void;
}

export const ProductReviewReplyDialog = ({ open, onClose, onConfirm }: ProductReviewReplyDialogProps) => {
  const [reply, setReply] = useState('');

  const handleConfirm = () => {
    if (reply.trim()) {
      onConfirm(reply);
      setReply('');
    }
  };

  return (
    <DialogConfirmComponent
      open={open}
      title="Viết trả lời"
      cancelLabel="Quay lại"
      confirmLabel="Trả lời"
      confirmVariant="primary"
      cancelButtonProps={productReviewsButtonPermission('dialog_close', 'Hủy trả lời đánh giá sản phẩm', 'api_product_detail')}
      confirmButtonProps={{
        disabled: !reply.trim(),
      }}
      onCancel={onClose}
      onConfirm={handleConfirm}
      onClose={onClose}
      maxWidth="sm"
    >
      <Stack gap={1}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#27272A' }}>
          Nội dung câu trả lời{' '}
          <Typography component="span" sx={{ color: '#F04438' }}>
            *
          </Typography>
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Nhập nội dung"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
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
