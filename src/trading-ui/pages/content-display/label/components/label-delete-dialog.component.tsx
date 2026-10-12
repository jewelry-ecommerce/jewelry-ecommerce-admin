import { DialogConfirmComponent } from '../../../../components/dialog';

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
      description: 'Thao tác xóa cứng, không thể hoàn tác.',
    }}
    cancelLabel="Hủy"
    confirmLabel="Xóa"
    onCancel={onClose}
    onConfirm={onConfirm}
    loading={loading}
  />
);
