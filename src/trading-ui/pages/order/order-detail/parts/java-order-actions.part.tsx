import { useState } from 'react';
import { CustomButton } from '@/trading-ui/components/button';
import { DialogConfirmComponent } from '@/trading-ui/components/dialog';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { isJavaBackend } from '@/common/config/app.config';
import { JAVA_ORDER_ACTIONS } from '@/apis/java/java-ui-policy';
import { changeJavaSourceOrder } from '@/trading-ui/apis/order/order-java.adapter';
import type { IOrder } from '@/trading-ui/apis/order/order.interface';

export function JavaOrderActions({ order, onSuccess }: { order: IOrder; onSuccess: () => Promise<boolean> }) {
  const [open, setOpen] = useState(false), [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const action = order.status in JAVA_ORDER_ACTIONS ? JAVA_ORDER_ACTIONS[order.status as keyof typeof JAVA_ORDER_ACTIONS] : undefined;
  if (!isJavaBackend() || !action) return null;
  async function confirm() {
    if (!action || loading) return;
    setLoading(true);
    try {
      await changeJavaSourceOrder(order.orderCode, action.target);
      setOpen(false);
      if (!await onSuccess()) throw new Error('Đã cập nhật trạng thái nhưng tải lại đơn thất bại. Tải lại trang để kiểm tra.');
      showSnackbar({ type: SnackbarType.SUCCESS, message: action.label + ' thành công.' });
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: error instanceof Error ? error.message : 'Không thể cập nhật đơn.' });
    } finally { setLoading(false); }
  }
  return <>
    <CustomButton fullWidth={false} variant="primary" disabled={loading} onClick={() => setOpen(true)}>{action.label}</CustomButton>
    <DialogConfirmComponent open={open} title={action.label} confirmVariant="primary" cancelLabel="Hủy" confirmLabel="Xác nhận"
      loading={loading} onCancel={() => { if (!loading) setOpen(false); }} onConfirm={() => void confirm()}>
      {'Xác nhận thao tác cho đơn ' + order.orderCode + '?'}
    </DialogConfirmComponent>
  </>;
}
