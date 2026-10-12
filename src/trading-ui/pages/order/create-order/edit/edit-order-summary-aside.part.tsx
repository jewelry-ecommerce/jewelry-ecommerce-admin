 
import { Divider, Paper, Stack, Typography } from '@mui/material';
import { memo } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatVnd } from '../../../../common/utils/order/create-order.utils';
import { AdminOrderVoucherSection, type AdminOrderVoucherSectionProps } from '../parts/admin-order-voucher-section.component';

const STRIKETHROUGH_SX = { fontSize: 13, color: '#98A2B3', textDecoration: 'line-through' } as const;
void STRIKETHROUGH_SX;
const DISCOUNT_COLOR = '#B42318';

export interface EditOrderSummaryAsideProps {
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  preDiscountTotal: number;
  grandTotal: number;
  baselineSubtotal: number | null;
  baselineShippingFee: number | null;
  baselineDiscountTotal: number | null;
  amountReceived?: number | null;
  voucher?: AdminOrderVoucherSectionProps;
}

function SummaryMoneyRow({ label, amount, baselineAmount: _baselineAmount, valueSx }: { label: string; amount: number; baselineAmount: number | null; valueSx?: object }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>{label}</Typography>
      <Stack alignItems="flex-end" gap={0.25}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, fontWeight: 700, color: '#111827', ...valueSx }}>{formatVnd(amount)}</Typography>
      </Stack>
    </Stack>
  );
}

export const EditOrderSummaryAside = memo(function EditOrderSummaryAside({
  subtotal,
  shippingFee,
  discountTotal,
  preDiscountTotal,
  grandTotal,
  amountReceived,
  baselineSubtotal,
  baselineShippingFee,
  baselineDiscountTotal,
  voucher,
}: EditOrderSummaryAsideProps) {
  const hasDiscount = discountTotal > 0;
  const baselinePreDiscount = baselineSubtotal != null && baselineShippingFee != null ? baselineSubtotal + baselineShippingFee : null;
  const preDiscountChanged = baselinePreDiscount != null && baselinePreDiscount !== preDiscountTotal;
void preDiscountChanged;
  const discountChanged = baselineDiscountTotal != null && baselineDiscountTotal !== discountTotal;
void discountChanged;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        bgcolor: '#FAFAFA',
        position: 'sticky',
        top: 12,
        alignSelf: 'flex-start',
      }}
    >
      <Typography sx={{ ...TYPOGRAPHY_STYLES.md.bold, fontWeight: 800, color: '#111827', mb: 2 }}>Tóm tắt thay đổi</Typography>
      {voucher ? <AdminOrderVoucherSection {...voucher} /> : null}
      <Stack gap={1.5}>
        <SummaryMoneyRow label="Tổng tiền hàng" amount={subtotal} baselineAmount={baselineSubtotal} />
        <SummaryMoneyRow label="Phí ship" amount={shippingFee} baselineAmount={baselineShippingFee} />

        {hasDiscount ? (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>Tổng khuyến mãi</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, fontWeight: 700, color: DISCOUNT_COLOR }}>-{formatVnd(discountTotal)}</Typography>
            </Stack>
            {voucher?.selectedVouchers?.map((v) => (
              <Stack key={v.voucherCodeId || v.code} direction="row" justifyContent="space-between" alignItems="center" sx={{ pl: 1.5, mt: -0.75 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>• Voucher {v.code}:</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>-{formatVnd(discountTotal)}</Typography>
              </Stack>
            ))}
          </>
        ) : null}

        <Divider sx={{ borderColor: '#E5E7EB' }} />

        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" gap={1}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>Tổng thanh toán</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, fontWeight: 800, color: '#111827' }}>{formatVnd(grandTotal)}</Typography>
        </Stack>

        {amountReceived != null ? (
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" gap={1}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>Đã thanh toán</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, fontWeight: 700, color: '#027A48' }}>{formatVnd(amountReceived)}</Typography>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
});
