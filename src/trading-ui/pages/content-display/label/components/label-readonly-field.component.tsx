import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formLabelSx } from '../../../../components/form/form-field.styles';

export interface LabelReadonlyFieldProps {
  label: string;
  value?: ReactNode;
  requiredMark?: boolean;
  hint?: string;
  children?: ReactNode;
}

export const LabelReadonlyField = ({ label, value, requiredMark = false, hint, children }: LabelReadonlyFieldProps) => (
  <Stack gap={0.5}>
    <Typography sx={formLabelSx}>
      {label}
      {requiredMark ? (
        <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
          *
        </Box>
      ) : null}
    </Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{children ?? value ?? '—'}</Typography>
    {hint ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.25 }}>{hint}</Typography> : null}
  </Stack>
);
