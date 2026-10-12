import { useCallback, useEffect, useState } from 'react';
import { cancelOrder, OrderCancellationReason, PaymentMethod } from '../../../apis/order';
import { createRefundProposal, RefundProposalPaymentChannel, RefundProposalSourceType } from '../../../apis/refund-proposal';
import { parseOrderAmount } from '../../order/order-detail/order-detail.helpers';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { CancelOrderDialog } from '../../order/components/cancel-order-dialog';
import { RefundProposalCreateDialog, type RefundProposalCreatePayload } from './refund-proposal-create-dialog.part';

/** Tối giản input — đủ field cần cho 2 popup, tương thích cả `Order` (list) và `IOrder` (detail). */
export interface CancelOrderWithRefundOrder {
  id: string;
  orderCode: string;
  paymentMethod?: PaymentMethod | string;
  grandTotal?: string | number | null;
  contactEmail?: string;
  customer?: { email?: string };
  shippingAddressSnapshot?: {
    firstName?: string;
    addressLine?: string;
    wardName?: string;
    provinceName?: string;
    provinceCode?: number | null;
    wardCode?: number | string | null;
    receiverPhone?: string;
  } | null;
  shippingAddress?: {
    firstName?: string;
    addressLine?: string;
    wardName?: string;
    provinceName?: string;
    provinceCode?: number | null;
    wardCode?: number | string | null;
    receiverPhone?: string;
  } | null;
}

export interface CancelOrderWithRefundDialogProps {
  open: boolean;
  order: CancelOrderWithRefundOrder | null;
  onClose: () => void;
  /** Gọi sau khi cả 2 bước (cancel + create refund) đã thành công. */
  onSuccess: () => void;
}

const resolvePaymentChannel = (method?: PaymentMethod | string): RefundProposalPaymentChannel => (method === PaymentMethod.COD ? RefundProposalPaymentChannel.COD : RefundProposalPaymentChannel.PAYOO);

const resolveRefundCustomerSnapshot = (order: CancelOrderWithRefundOrder) => {
  const shippingAddress = order.shippingAddressSnapshot ?? order.shippingAddress ?? null;
  const shippingAddressLine = shippingAddress?.addressLine?.trim();
  const shippingWardName = shippingAddress?.wardName?.trim();
  const shippingProvinceName = shippingAddress?.provinceName?.trim();
  const customerAddress = [shippingAddressLine, shippingWardName, shippingProvinceName].filter(Boolean).join(', ');
  const shippingWardCodeRaw = shippingAddress?.wardCode;
  const shippingWardCode = shippingWardCodeRaw != null ? String(shippingWardCodeRaw).trim() || undefined : undefined;

  return {
    firstName: shippingAddress?.firstName?.trim() || undefined,
    contactEmail: order.contactEmail?.trim() || order.customer?.email?.trim() || undefined,
    shippingAddressLine: shippingAddressLine || undefined,
    shippingWardName: shippingWardName || undefined,
    shippingProvinceName: shippingProvinceName || undefined,
    shippingProvinceCode: shippingAddress?.provinceCode ?? undefined,
    shippingWardCode,
    customerAddress: customerAddress || undefined,
    receiverPhone: shippingAddress?.receiverPhone?.trim() || undefined,
  };
};

export function CancelOrderWithRefundDialog({ open, order, onClose, onSuccess }: CancelOrderWithRefundDialogProps) {
  const { showSnackbar } = useSnackbar();
  const [step, setStep] = useState<'cancel' | 'refund'>('cancel');
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep('cancel');
      setCancelReason('');
      setSubmitting(false);
    }
  }, [open]);

  const handleCancelConfirm = useCallback(
    async ({ reason }: { reason: string }) => {
      if (!order || submitting) return;
      const note = reason.trim();
      setSubmitting(true);
      try {
        await cancelOrder(order.id, {
          cancellationReason: OrderCancellationReason.OTHER,
          ...(note ? { note } : {}),
        });
        setCancelReason(note);
        setStep('refund');
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã hủy đơn. Vui lòng gửi yêu cầu hoàn tiền.' });
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (error as { message?: string })?.message || 'Không hủy được đơn.',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [order, showSnackbar, submitting],
  );

  const handleRefundConfirm = useCallback(
    async (payload: RefundProposalCreatePayload) => {
      if (!order || submitting) return;
      setSubmitting(true);
      try {
        await createRefundProposal({
          sourceType: RefundProposalSourceType.CANCEL,
          sourceId: order.id,
          ...payload,
          ...(!payload.detailNote && cancelReason ? { detailNote: cancelReason } : {}),
        });
        showSnackbar({
          type: SnackbarType.SUCCESS,
          message: `Đã tạo yêu cầu hoàn tiền cho đơn ${order.orderCode}.`,
        });
        onSuccess();
        onClose();
      } catch (error) {
        showSnackbar({
          type: SnackbarType.ERROR,
          message: (error as { message?: string })?.message || 'Không tạo được yêu cầu hoàn tiền.',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [cancelReason, onClose, onSuccess, order, showSnackbar, submitting],
  );

  if (!order) return null;

  const paymentChannel = resolvePaymentChannel(order.paymentMethod);
  const totalRefundAmount = parseOrderAmount(order.grandTotal);
  const customerSnapshot = resolveRefundCustomerSnapshot(order);

  return (
    <>
      <CancelOrderDialog
        open={open && step === 'cancel'}
        orderCode={order.orderCode}
        submitting={submitting}
        title="Huỷ đơn hàng"
        description="Hành động này không thể hoàn tác. Vui lòng chọn lý do huỷ đơn."
        confirmLabel="Huỷ & Yêu cầu hoàn tiền"
        onClose={onClose}
        onConfirm={(payload) => void handleCancelConfirm(payload)}
      />
      <RefundProposalCreateDialog
        open={open && step === 'refund'}
        submitting={submitting}
        sourceCode={order.orderCode}
        sourceType={RefundProposalSourceType.CANCEL}
        totalRefundAmount={totalRefundAmount}
        paymentChannel={paymentChannel}
        customerSnapshot={customerSnapshot}
        onClose={onClose}
        onConfirm={(payload) => void handleRefundConfirm(payload)}
      />
    </>
  );
}
