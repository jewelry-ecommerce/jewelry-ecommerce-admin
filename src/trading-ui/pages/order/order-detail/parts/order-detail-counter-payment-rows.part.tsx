import { Divider } from '@mui/material';
import useSWR from 'swr';
import { getOrderCounterPayment, type IOrder } from '../../../../apis/order';
import { formatCurrency } from '../../../../common/utils/number.utils';
import { isCounterPaymentMethod, isPosOrder } from '../order-detail.helpers';
import { OrderDetailRow } from './order-detail-row-column.part';

const formatMoney = (value: number | null | undefined) => (value == null ? '—' : `${formatCurrency(value)} đ`);

/** Khoản thu tại quầy POS: tiền mặt → Khách đưa + Tiền thừa; thẻ máy POS Payoo → Mã chuẩn chi. Đơn chưa thu (404) hiển thị "—". */
export function OrderDetailCounterPaymentRows({ order }: { order: IOrder }) {
  const method = String(order.paymentMethod ?? '')
    .toUpperCase()
    .trim();
  const enabled = isPosOrder(order) && isCounterPaymentMethod(method);
  const { data: payment } = useSWR(enabled ? (['order-counter-payment', order.id, order.paymentStatus] as const) : null, () => getOrderCounterPayment(order.id), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  if (!enabled) return null;
  // Đơn đổi phương thức sau khi thu: lấy theo khoản thu thực tế, không theo phương thức hiện tại.
  const paidMethod = payment?.method ?? method;

  if (paidMethod === 'CARD_POS_PAYOO') {
    return (
      <>
        <Divider sx={{ mb: 2 }} />
        <OrderDetailRow label="Mã chuẩn chi" value={payment?.approvalCode?.trim() || '—'} />
      </>
    );
  }

  return (
    <>
      <Divider sx={{ mb: 2 }} />
      <OrderDetailRow label="Khách đưa" value={formatMoney(payment?.cashTendered)} />
      <Divider sx={{ mb: 2 }} />
      <OrderDetailRow label="Tiền thừa" value={formatMoney(payment?.changeAmount)} />
    </>
  );
}
