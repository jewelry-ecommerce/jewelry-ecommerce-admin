import { OrderErrorType } from '../../../apis/order';

export const PAGE_PADDING_X = { xs: 2, md: 3 } as const;

export const ORDER_ERROR_LOG_PALETTE: Record<OrderErrorType, { chipBg: string; chipBorder: string; chipColor: string; detailColor: string }> = {
  [OrderErrorType.PAYMENT]: { chipBg: '#FFF9E6', chipBorder: '#FFE082', chipColor: '#795548', detailColor: '#795548' },
  [OrderErrorType.ADDRESS]: { chipBg: '#FFF1F2', chipBorder: '#FECDD3', chipColor: '#9F1239', detailColor: '#9F1239' },
  [OrderErrorType.STOCK]: { chipBg: '#FFF7ED', chipBorder: '#FDBA74', chipColor: '#9A3412', detailColor: '#9A3412' },
  [OrderErrorType.CATALOG]: { chipBg: '#F5F3FF', chipBorder: '#DDD6FE', chipColor: '#5B21B6', detailColor: '#5B21B6' },
  [OrderErrorType.OTHER]: { chipBg: '#FEF2F2', chipBorder: '#FECACA', chipColor: '#B42318', detailColor: '#B42318' },
};

export const ORDER_ERROR_VALIDATION_CARD_THEME: Record<OrderErrorType, { iconCircleBg: string; iconColor: string; bodyTitleColor: string; descriptionColor: string }> = {
  [OrderErrorType.PAYMENT]: {
    iconCircleBg: '#FEF3C6',
    iconColor: '#B45309',
    bodyTitleColor: '#7B3306',
    descriptionColor: '#BB4D00',
  },
  [OrderErrorType.ADDRESS]: {
    iconCircleBg: '#FEF3C6',
    iconColor: '#BE123C',
    bodyTitleColor: '#7B3306',
    descriptionColor: '#BB4D00',
  },
  [OrderErrorType.STOCK]: {
    iconCircleBg: '#FEF3C6',
    iconColor: '#C2410C',
    bodyTitleColor: '#7B3306',
    descriptionColor: '#BB4D00',
  },
  [OrderErrorType.CATALOG]: {
    iconCircleBg: '#FEF3C6',
    iconColor: '#6D28D9',
    bodyTitleColor: '#7B3306',
    descriptionColor: '#BB4D00',
  },
  [OrderErrorType.OTHER]: {
    iconCircleBg: '#FEF3C6',
    iconColor: '#B91C1C',
    bodyTitleColor: '#7B3306',
    descriptionColor: '#BB4D00',
  },
};

export const ORDER_ERROR_TOOLTIP_BODY_TITLE: Record<OrderErrorType, string> = {
  [OrderErrorType.PAYMENT]: 'Lỗi thanh toán',
  [OrderErrorType.ADDRESS]: 'Lỗi địa chỉ',
  [OrderErrorType.STOCK]: 'Lỗi tồn kho',
  [OrderErrorType.CATALOG]: 'Lỗi danh mục',
  [OrderErrorType.OTHER]: 'Lỗi xử lý',
};

export const VALIDATION_TOOLTIP_CARD_SX = {
  width: '100%',
  maxWidth: 380,
  p: 2,
  bgcolor: '#FFFFFF',
  borderRadius: '16px',
  boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08)',
  border: '1px solid #F1F5F9',
} as const;

export const TOOLTIP_SLOT_PROPS = {
  tooltip: {
    sx: {
      bgcolor: 'transparent',
      p: 0,
      m: 0,
      maxWidth: 'none',
      border: 'none',
      boxShadow: 'none',
    },
  },
};
