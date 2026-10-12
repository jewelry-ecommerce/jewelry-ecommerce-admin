import React from 'react';
import { Stack, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

export const ReadonlyField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack gap={0.5}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#6B7280' }}>{label}</Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#101828' }}>{value || '-'}</Typography>
  </Stack>
);
