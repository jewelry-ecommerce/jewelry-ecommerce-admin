import { Divider, Typography } from '@mui/material';
import type { CmsNavigation, CmsNavigationBadgeScheduleConflictResponse } from '../../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { DialogConfirmComponent } from '../../../../../components/dialog';

export type NavigationDialogsProps = {
  archiveTarget: CmsNavigation | null;
  conflict: CmsNavigationBadgeScheduleConflictResponse | null;
  saving: boolean;
  onCloseArchive: () => void;
  onConfirmArchive: () => void;
  onCloseConflict: () => void;
  onConfirmConflict: () => void;
};

export const NavigationDialogs = ({ archiveTarget, conflict, saving, onCloseArchive, onConfirmArchive, onCloseConflict, onConfirmConflict }: NavigationDialogsProps) => (
  <>
    <DialogConfirmComponent
      open={Boolean(archiveTarget)}
      onClose={onCloseArchive}
      title="Xác nhận lưu trữ menu"
      highlight={{
        tone: 'danger',
        title: `Lưu trữ ${archiveTarget?.label ?? ''}`,
        description: 'Hành động này sẽ ẩn mục menu và toàn bộ menu con khỏi cây bản nháp. website E-commerce chỉ thay đổi sau khi xuất bản giao diện.',
      }}
      cancelLabel="Hủy"
      confirmLabel="Lưu trữ"
      onCancel={onCloseArchive}
      onConfirm={onConfirmArchive}
      loading={saving}
    />

    <DialogConfirmComponent
      open={Boolean(conflict)}
      onClose={onCloseConflict}
      title="Trùng lịch hiển thị nhãn"
      highlight={{
        tone: 'danger',
        title: conflict?.message ?? 'Thời gian hiển thị nhãn đang bị trùng lặp.',
        description: conflict?.conflictingBadges?.length ? `Nhãn đang trùng: ${conflict.conflictingBadges.map((item) => item.displayText || item.designType).join(', ')}` : undefined,
      }}
      cancelLabel="Hủy"
      confirmLabel="Xác nhận ghi đè"
      onCancel={onCloseConflict}
      onConfirm={onConfirmConflict}
      loading={saving}
    >
      <Divider />
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Nếu xác nhận, hệ thống sẽ gửi lại cấu hình với cờ ghi đè lịch nhãn.</Typography>
    </DialogConfirmComponent>
  </>
);
