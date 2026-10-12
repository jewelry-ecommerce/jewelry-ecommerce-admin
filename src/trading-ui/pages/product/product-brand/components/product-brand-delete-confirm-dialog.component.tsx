import { Typography } from '@mui/material';
import { DialogConfirmComponent } from '../../../../components/dialog';
import { productListButtonPermission } from '../../product-permission.constants';

import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRowAlignCenter } from '../../../../components/styled';

export interface ProductBrandDeleteConfirmDialogProps {
  open: boolean;
  brandName?: string | null;
  loading?: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}

export function ProductBrandDeleteConfirmDialog({ open, brandName, loading = false, onDismiss, onConfirm }: ProductBrandDeleteConfirmDialogProps) {
  return (
    <DialogConfirmComponent
      open={open}
      loading={loading}
      onClose={onDismiss}
      title="Xác nhận xoá thương hiệu"
      cancelLabel="Quay lại"
      confirmLabel="Xác nhận xoá"
      onCancel={onDismiss}
      onConfirm={onConfirm}
      confirmButtonProps={productListButtonPermission('delete_brand', 'Xác nhận xoá thương hiệu', 'api_brand_delete')}
      highlight={{
        tone: 'danger',
        title: `Bạn đang xoá thương hiệu ${brandName ?? '—'}`,
        description: 'Thao tác này không thể hoàn tác.',
      }}
    >
      <StackRowAlignCenter sx={{ gap: 0.75 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280', lineHeight: 1.5 }}>Bạn có chắc chắn muốn</Typography>
        <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>
          Xoá ?
        </Typography>
      </StackRowAlignCenter>
    </DialogConfirmComponent>
  );
}
