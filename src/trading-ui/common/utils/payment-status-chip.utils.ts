import type { SxProps, Theme } from '@mui/material';
import { PaymentStatus } from '../../apis/order';

type PaymentStatusChipPalette = {
  bgColor: string;
  textColor: string;
  borderColor: string;
};

const PAYMENT_STATUS_CHIP_PALETTE: Record<PaymentStatus, PaymentStatusChipPalette> = {
  [PaymentStatus.PAID]: {
    bgColor: '#ECFDF3',
    textColor: '#027A48',
    borderColor: '#ABEFC6',
  },
  [PaymentStatus.UNPAID]: {
    bgColor: '#FFF7ED',
    textColor: '#CA3500',
    borderColor: '#FFD6A8',
  },
  [PaymentStatus.PARTIAL]: {
    bgColor: '#FFFAEB',
    textColor: '#B54708',
    borderColor: '#FEDF89',
  },
  [PaymentStatus.PARTIAL_PAID_COD]: {
    bgColor: '#FFFAEB',
    textColor: '#B54708',
    borderColor: '#FEDF89',
  },
  [PaymentStatus.FAILED]: {
    bgColor: '#FEF3F2',
    textColor: '#B42318',
    borderColor: '#FECDCA',
  },
  [PaymentStatus.REFUNDED]: {
    bgColor: '#EEF4FF',
    textColor: '#3538CD',
    borderColor: '#C7D7FE',
  },
};

export const getPaymentStatusChipSx = (status: PaymentStatus): SxProps<Theme> => {
  const palette = PAYMENT_STATUS_CHIP_PALETTE[status] ?? PAYMENT_STATUS_CHIP_PALETTE[PaymentStatus.UNPAID];
  return {
    bgcolor: palette.bgColor,
    color: palette.textColor,
    border: `1px solid ${palette.borderColor}`,
    fontWeight: 700,
  };
};
