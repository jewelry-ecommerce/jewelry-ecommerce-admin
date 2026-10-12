import type { ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';

export type StatusPillSize = 'sm' | 'md' | 'lg';

export interface StatusPillVariant {
  label?: ReactNode;
  color: string;
  backgroundColor: string;
  borderColor: string;
}

export type StatusPillConfig<TStatus extends string | number = string> = Partial<Record<TStatus, StatusPillVariant>>;

interface StatusPillProps<TStatus extends string | number = string> {
  status: TStatus;
  config: StatusPillConfig<TStatus>;
  label?: ReactNode;
  size?: StatusPillSize;
  fallbackVariant?: StatusPillVariant;
  sx?: SxProps<Theme>;
}

const DEFAULT_STATUS_PILL_VARIANT: StatusPillVariant = {
  color: '#344054',
  backgroundColor: '#F9FAFB',
  borderColor: '#D0D5DD',
};

const STATUS_PILL_SIZE_STYLES: Record<StatusPillSize, SxProps<Theme>> = {
  sm: {
    minHeight: 28,
    px: 1.5,
    py: 0.5,
    ...TYPOGRAPHY_STYLES.sm.bold,
  },
  md: {
    minHeight: 36,
    px: 2,
    py: 0.75,
    ...TYPOGRAPHY_STYLES.base.bold,
  },
  lg: {
    minHeight: 56,
    px: 3.5,
    py: 1.25,
    borderWidth: 2,
    ...TYPOGRAPHY_STYLES['2xl'].bold,
  },
};

export function StatusPill<TStatus extends string | number>({ status, config, label, size = 'sm', fallbackVariant = DEFAULT_STATUS_PILL_VARIANT, sx }: StatusPillProps<TStatus>) {
  const resolvedVariant = config[status] ?? fallbackVariant;
  const resolvedLabel = label ?? resolvedVariant.label ?? status;
  const customSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  return (
    <Box
      component="span"
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'fit-content',
          borderRadius: '999px',
          borderStyle: 'solid',
          borderWidth: 1,
          whiteSpace: 'nowrap',
          color: resolvedVariant.color,
          backgroundColor: resolvedVariant.backgroundColor,
          borderColor: resolvedVariant.borderColor,
        },
        STATUS_PILL_SIZE_STYLES[size],
        ...customSx,
      ]}
    >
      {resolvedLabel}
    </Box>
  );
}
