import { DialogConfirmComponent } from '../../../../components/dialog';
import { productReviewsButtonPermission } from '../../product-permission.constants';

export interface ProductReviewApproveDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count?: number;
}

export const ProductReviewApproveDialog = ({ open, onClose, onConfirm, count = 1 }: ProductReviewApproveDialogProps) => {
  return (
    <DialogConfirmComponent
      open={open}
      title="Xác nhận duyệt"
      cancelLabel="Quay lại"
      confirmLabel="Xác nhận duyệt"
      confirmVariant="primary"
      cancelButtonProps={productReviewsButtonPermission('dialog_close', 'Hủy duyệt đánh giá sản phẩm', 'api_product_approval_review')}
      onCancel={onClose}
      onConfirm={onConfirm}
      onClose={onClose}
      highlight={{
        tone: 'info',
        title: `Bạn đang duyệt ${count} đánh giá.`,
        description: 'Hành động này không thể hoàn tác.',
      }}
    />
  );
};
