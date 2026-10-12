import type { LogoAdmin } from '../../../../../apis';
import { DialogConfirmComponent } from '../../../../../components/dialog';

export type LogoArchiveDialogProps = {
  archiveTarget: LogoAdmin | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const LogoArchiveDialog = ({ archiveTarget, loading, onClose, onConfirm }: LogoArchiveDialogProps) => (
  <DialogConfirmComponent
    open={Boolean(archiveTarget)}
    onClose={onClose}
    title="Xác nhận lưu trữ logo"
    highlight={{
      tone: 'danger',
      title: `Lưu trữ ${archiveTarget?.name ?? ''}`,
      description: 'Bản logo nháp sẽ bị ẩn khỏi danh sách. Logo đang hiển thị trên website E-commerce không thay đổi cho đến khi bạn xuất bản.',
    }}
    cancelLabel="Hủy"
    confirmLabel="Lưu trữ"
    onCancel={onClose}
    onConfirm={onConfirm}
    loading={loading}
  />
);
