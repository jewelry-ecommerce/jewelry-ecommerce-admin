import type { HeaderAdmin } from '../../../../../apis';
import { DialogConfirmComponent } from '../../../../../components/dialog';

export type TopBannerDeleteDialogProps = {
  deleteTarget: HeaderAdmin | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const TopBannerDeleteDialog = ({ deleteTarget, loading, onClose, onConfirm }: TopBannerDeleteDialogProps) => (
  <DialogConfirmComponent
    open={Boolean(deleteTarget)}
    onClose={onClose}
    title="Xác nhận xóa top banner"
    highlight={{
      tone: 'danger',
      title: `Xóa ${deleteTarget?.bannerName ?? ''}?`,
      description: 'Thao tác xóa cứng, không thể hoàn tác.',
    }}
    cancelLabel="Hủy"
    confirmLabel="Xóa"
    onCancel={onClose}
    onConfirm={onConfirm}
    loading={loading}
  />
);
