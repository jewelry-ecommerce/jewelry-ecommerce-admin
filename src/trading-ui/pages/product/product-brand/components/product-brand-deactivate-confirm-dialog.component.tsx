import { Stack, Typography } from '@mui/material';
import { DialogConfirmComponent } from '../../../../components/dialog';
import { productListButtonPermission } from '../../product-permission.constants';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

export interface ProductBrandDeactivateConfirmDialogProps {
  open: boolean;
  brandName?: string | null;
  onDismiss: () => void;
  onConfirm: () => void;
}

export function ProductBrandDeactivateConfirmDialog({ open, brandName, onDismiss, onConfirm }: ProductBrandDeactivateConfirmDialogProps) {
  return (
    <DialogConfirmComponent
      open={open}
      onClose={onDismiss}
      title="Xác nhận vô hiệu hoá"
      cancelLabel="Quay lại"
      confirmLabel="Xác nhận vô hiệu hoá"
      confirmButtonProps={productListButtonPermission('deactivate_brand', 'Xác nhận vô hiệu hóa thương hiệu', 'api_brand_update')}
      onCancel={onDismiss}
      onConfirm={onConfirm}
      highlight={{
        tone: 'danger',
        title: `Bạn đang vô hiệu hoá thương hiệu ${brandName}`,
      }}
    >
      <Stack sx={{ gap: 0.75 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>
          Lưu ý:{' '}
          <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' }}>
            Thao tác này sẽ làm ảnh hưởng đến{' '}
            <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>
              hiển thị của các sản phẩm
            </Typography>{' '}
            thuộc thương hiệu này trên{' '}
            <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>
              Website.
            </Typography>{' '}
          </Typography>
        </Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280', lineHeight: 1.5 }}>
          Bạn có chắc chắn muốn{' '}
          <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>
            Vô hiệu hóa
          </Typography>
          ?
        </Typography>
      </Stack>
    </DialogConfirmComponent>
  );
}
