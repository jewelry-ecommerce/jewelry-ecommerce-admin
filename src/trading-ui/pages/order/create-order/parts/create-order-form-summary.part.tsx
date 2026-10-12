import CheckCircleOutlineRounded from '@mui/icons-material/CheckCircleOutlineRounded';
import { Alert, Divider, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import * as React from 'react';
import { memo } from 'react';
import { CustomButton } from '../../../../components/button';
import { StackRowAlignCenterJustBetween, StackRowJustBetween, StackRowJustEnd } from '../../../../components/styled';

import { formatVnd } from '../../../../common/utils/order/create-order.utils';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { ADMIN_ORDER_V2_MESSAGE } from '../../../../common/constant/order/admin-order-v2.constants';
import { ORDER_FORM_CARD_SX } from './create-order-form.shared';
import { AdminOrderVoucherSection, type AdminOrderVoucherSectionProps } from './admin-order-voucher-section.component';

const DISCOUNT_COLOR = '#B42318';

export interface OrderShippingSummary {
  baseFee: number | null;
  discount: number | null;
  customerFee: number | null;
}

export interface CreateOrderFormSummaryPartProps {
  subtotal: number | null;
  shippingFee: number | null;
  discountTotal?: number | null;
  grandTotal: number | null;
  shippingBreakdown?: OrderShippingSummary;
  pricingPending?: boolean;
  pricingError?: string | null;
  pricingReady?: boolean;
  submitting: boolean;
  formValid: boolean;
  onCancel: () => void;
  onCreateOrder: () => void;
  /** Mặc định: Tạo đơn hàng */
  primaryActionLabel?: string;
  voucher?: AdminOrderVoucherSectionProps;
}

const formatSummaryAmount = (amount: number | null): string => (amount === null ? 'Chưa tính' : formatVnd(amount));

const formatShippingDiscount = (amount: number | null): string => {
  if (amount === null) return 'Chưa tính';
  return amount > 0 ? `-${formatVnd(amount)}` : formatVnd(amount);
};

const OrderShippingRows = ({ shippingFee, breakdown }: { shippingFee: number | null; breakdown?: OrderShippingSummary }) => {
  if (!breakdown) {
    return (
      <StackRowJustBetween>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#364153' }}>Phí vận chuyển</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' }}>{formatSummaryAmount(shippingFee)}</Typography>
      </StackRowJustBetween>
    );
  }

  return (
    <React.Fragment>
      <StackRowJustBetween>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#364153' }}>Phí vận chuyển gốc</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' }}>{formatSummaryAmount(breakdown.baseFee)}</Typography>
      </StackRowJustBetween>
      <StackRowJustBetween>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#364153' }}>Ưu đãi phí vận chuyển</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: DISCOUNT_COLOR }}>{formatShippingDiscount(breakdown.discount)}</Typography>
      </StackRowJustBetween>
      <StackRowJustBetween>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#364153' }}>Phí vận chuyển khách trả</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' }}>{formatSummaryAmount(breakdown.customerFee)}</Typography>
      </StackRowJustBetween>
    </React.Fragment>
  );
};

export const CreateOrderFormSummaryPart = memo(function CreateOrderFormSummaryPart({
  subtotal,
  shippingFee,
  discountTotal = 0,
  grandTotal,
  shippingBreakdown,
  pricingPending = false,
  pricingError = null,
  pricingReady = true,
  submitting,
  formValid,
  onCancel,
  onCreateOrder,
  primaryActionLabel = 'Tạo đơn hàng',
  voucher,
}: CreateOrderFormSummaryPartProps) {
  const hasDiscount = discountTotal !== null && discountTotal > 0;

  return (
    <React.Fragment>
      <Paper
        elevation={0}
        sx={{
          ...ORDER_FORM_CARD_SX,
          borderRadius: '14px',
          marginTop: 0,
        }}
      >
        <Typography fontWeight={800} fontSize={36 / 3} sx={{ mb: 2, color: '#101828' }}>
          Tổng đơn hàng
        </Typography>
        {voucher ? <AdminOrderVoucherSection {...voucher} /> : null}
        {pricingPending ? <LinearProgress aria-label={ADMIN_ORDER_V2_MESSAGE.PRICING_PENDING} sx={{ mb: 1.5 }} /> : null}
        {pricingError ? (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {pricingError}
          </Alert>
        ) : null}
        <Stack>
          <StackRowJustBetween>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#364153' }}>Tạm tính</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' }}>{formatSummaryAmount(subtotal)}</Typography>
          </StackRowJustBetween>
          <OrderShippingRows shippingFee={shippingFee} breakdown={shippingBreakdown} />
          {hasDiscount ? (
            <StackRowJustBetween>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#364153' }}>Tổng giảm giá</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, fontWeight: 700, color: DISCOUNT_COLOR }}>-{formatVnd(discountTotal)}</Typography>
            </StackRowJustBetween>
          ) : null}
          <Divider sx={{ borderColor: '#E5E7EB', my: 0.25 }} />
          <StackRowAlignCenterJustBetween>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.regular, fontWeight: 600, color: '#101828' }}>Tổng thanh toán</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, color: '#101828' }}>{formatSummaryAmount(grandTotal)}</Typography>
          </StackRowAlignCenterJustBetween>
        </Stack>
      </Paper>

      <StackRowJustEnd sx={{ pb: 1 }}>
        <CustomButton
          fullWidth={false}
          variant="outline"
          onClick={onCancel}
          sx={{
            width: 'max-content',
            minWidth: 'fit-content',
            textTransform: 'none',
            borderRadius: '10px',
            borderColor: '#D0D5DD',
            color: '#1F2937',
            ...TYPOGRAPHY_STYLES.md.medium,
            padding: '8px 12px',
          }}
        >
          Huỷ
        </CustomButton>
        <CustomButton
          fullWidth={false}
          variant="primary"
          disabled={!formValid || !pricingReady || submitting}
          onClick={onCreateOrder}
          startIcon={<CheckCircleOutlineRounded sx={{ fontSize: 28 }} />}
          sx={{
            width: 'max-content',
            minWidth: 'fit-content',
            textTransform: 'none',
            ...TYPOGRAPHY_STYLES.md.medium,
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: '#101828',
            boxShadow: 'none',
            '&:hover': { backgroundColor: '#0B1220', boxShadow: 'none' },
          }}
        >
          {primaryActionLabel}
        </CustomButton>
      </StackRowJustEnd>
    </React.Fragment>
  );
});
