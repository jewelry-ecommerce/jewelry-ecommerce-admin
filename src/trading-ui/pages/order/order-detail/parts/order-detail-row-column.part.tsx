import { Stack, Typography } from '@mui/material';
import { StackRowAlignCenterJustBetween } from '@/trading-ui/adapters/library';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

export function OrderDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <StackRowAlignCenterJustBetween gap={2}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>{label}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', textAlign: 'right' }}>{value}</Typography>
    </StackRowAlignCenterJustBetween>
  );
}

export function OrderDetailColumn({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={0.25}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>{label}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{value}</Typography>
    </Stack>
  );
}
