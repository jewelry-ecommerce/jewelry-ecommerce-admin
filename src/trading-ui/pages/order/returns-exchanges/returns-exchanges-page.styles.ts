import { STYLE } from '@/trading-ui/adapters/library';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import type { ReturnExchangeStepConfirmPartProps } from '../order.types';

/** Desktop layout only — không dùng breakpoint responsive. */
export const PAGE_INSET = 2.5;

export const sxPage = {
  pt: 0,
  px: PAGE_INSET,
  pb: PAGE_INSET,
  height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
  boxSizing: 'border-box' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  minHeight: 0,
  overflow: 'hidden' as const,
};

/** Chỉ nội dung step scroll; stepper đứng im phía trên. */
export const sxStepScrollRegion = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto' as const,
  '& > .MuiStack-root': {
    marginTop: 0,
  },
};

export const sxHeaderBackRow = {
  flexShrink: 0,
  mx: -PAGE_INSET,
  px: PAGE_INSET,
  py: 0.75,
  borderBottom: '1px solid #EAECF0',
  bgcolor: '#FFFFFF',
};

export const sxHeaderTitleRow = {
  flexShrink: 0,
  mx: -PAGE_INSET,
  px: PAGE_INSET,
  py: 1.5,
  borderBottom: '1px solid #EAECF0',
  bgcolor: '#FFF',
};

export const sxMainColumn = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  overflow: 'hidden' as const,
};

export const sxCardShell = {
  width: '1006px',
  maxWidth: '100%',
  alignSelf: 'center',
  boxSizing: 'border-box' as const,
};

export const sxCardFooterWrap = {
  display: 'flex',
  flexDirection: 'column' as const,
  flex: 1,
  minHeight: 0,
  overflow: 'hidden' as const,
  width: '1006px',
  maxWidth: '100%',
  alignSelf: 'center',
};

export const sxFooter = {
  flexShrink: 0,
  py: 1.75,
  display: 'flex',
  justifyContent: 'flex-end' as const,
  gap: 1,
  bgcolor: 'transparent',
  width: '1006px',
  maxWidth: '100%',
  alignSelf: 'center',
};

export const sxFooterBtn = { p: '8px 12px', borderRadius: '10px', minWidth: 133 };

export const sxBackNav = {
  minWidth: 0,
  flexShrink: 0,
  px: 0,
  py: 0,
  border: 'none',
  boxShadow: 'none',
  borderRadius: 0,
  bgcolor: 'transparent',
  color: '#4A5565',
  ...TYPOGRAPHY_STYLES.base.medium,
  '&:hover': { bgcolor: 'transparent', color: '#4A5565' },
};

export const sxTitle = { ...TYPOGRAPHY_STYLES['2xl'].semibold, minWidth: 0 };

export const sxLoadingHint = { ...TYPOGRAPHY_STYLES.base.regular, mt: 2, color: '#667085' };

export const sxStepError = { color: '#B42318', ...TYPOGRAPHY_STYLES.base.medium };

export const DEFAULT_ITEM_DIMENSION = { length: 10, width: 10, height: 5, weight: 500 };

/** Để trống cho tới khi OMS trả kho (useReturnExchangeWarehouseOptions tự chọn kho). */
export const INITIAL_PICKUP_ADDRESS: ReturnExchangeStepConfirmPartProps['pickupAddress'] = {
  warehouseId: '',
  warehouseName: '',
  addressLine: '',
  provinceCode: 0,
  provinceName: '',
  phone: '',
  wardCode: 0,
  wardName: '',
};
