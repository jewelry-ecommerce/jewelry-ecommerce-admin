import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';

export const SANDBOX_COLUMN_SX = {
  height: '100%',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #E5E7EB',
  borderRadius: '10px',
  bgcolor: '#FFFFFF',
  overflow: 'hidden',
  gap: 0,
} as const;

export const SANDBOX_COLUMN_HEADER_SX = {
  px: 2,
  py: 1,
  borderBottom: '1px solid #E5E7EB',
  flexShrink: 0,
} as const;

export const SANDBOX_COLUMN_BODY_SX = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  p: 2,
} as const;

export const SANDBOX_SECTION_TITLE_SX = {
  ...TYPOGRAPHY_STYLES.md.semibold,
  color: '#101828',
} as const;

export const SANDBOX_SECTION_HINT_SX = {
  ...TYPOGRAPHY_STYLES.xs.regular,
  color: '#667085',
  mt: 0.25,
} as const;

export const SANDBOX_INNER_CARD_SX = {
  p: 1.25,
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  bgcolor: '#FCFCFD',
} as const;
