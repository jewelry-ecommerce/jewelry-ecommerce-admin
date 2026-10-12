import type { HeaderAdmin } from '../../../../../apis';
import { DialogConfirmComponent } from '../../../../../components/dialog';

export type TopBannerStopDialogProps = {
  stopTarget: HeaderAdmin | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const TopBannerStopDialog = ({ stopTarget, loading, onClose, onConfirm }: TopBannerStopDialogProps) => (
  <DialogConfirmComponent
    open={Boolean(stopTarget)}
    onClose={onClose}
    title="Ngừng top banner"
    highlight={{
      tone: 'danger',
      title: `Ngừng "${stopTarget?.bannerName ?? ''}"?`,
      description: 'Top banner sẽ không còn hiển thị trên website E-commerce sau khi xác nhận.',
    }}
    cancelLabel="Hủy"
    confirmLabel="Ngừng banner"
    onCancel={onClose}
    onConfirm={onConfirm}
    loading={loading}
  />
);
