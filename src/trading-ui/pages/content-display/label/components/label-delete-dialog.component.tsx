import { DialogConfirmComponent } from '@/trading-ui/components/dialog';

type LabelDeleteDialogProps = {
  open: boolean;
  title: string;
  itemName?: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const LabelDeleteDialog = ({ open, title, itemName, loading, onClose, onConfirm }: LabelDeleteDialogProps) => (
  <DialogConfirmComponent
    open={open}
    onClose={onClose}
    title={title}
    highlight={{
      tone: 'danger',
      title: itemName ? `Xóa ${itemName}?` : 'Xác nhận xóa?',
      description: 'Nhãn sẽ bị gỡ khỏi danh sách. Nhãn đang được cấu hình sử dụng phải được gỡ liên kết trước.',
    }}
    cancelLabel="Hủy"
    confirmLabel="Xóa"
    onCancel={onClose}
    onConfirm={onConfirm}
    loading={loading}
  />
);
