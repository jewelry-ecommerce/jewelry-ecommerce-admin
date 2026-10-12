import { Box, Paper, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { StackRow } from '../styled';

const TITLE_COLOR = '#101828';
const HEADER_BORDER = '#E5E7EB';

export interface WrapperComponentProps {
  label: ReactNode;
  description?: ReactNode;
  headerAside?: ReactNode;
  tabs?: ReactNode;
  nodeLabel?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

export const WrapperComponent = ({ label, description, headerAside, tabs, nodeLabel, children, aside, sx, contentSx }: WrapperComponentProps) => {
  const content = (
    <Stack
      sx={{
        flex: 1,
        minHeight: 0,
        boxSizing: 'border-box',
      }}
    >
      {nodeLabel}
      {children}
    </Stack>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        border: `1px solid ${HEADER_BORDER}`,
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        ...sx,
      }}
    >
      <Box sx={{ borderBottom: `1px solid ${HEADER_BORDER}`, flexShrink: 0 }}>
        {description || headerAside ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ px: 3, py: 1.5 }}>
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography component="div" sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: TITLE_COLOR }}>
                {label}
              </Typography>
              {description ? (
                <Typography component="div" sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>
                  {description}
                </Typography>
              ) : null}
            </Stack>
            {headerAside ? <Box sx={{ flexShrink: 0 }}>{headerAside}</Box> : null}
          </Stack>
        ) : (
          <Typography
            component="div"
            sx={{
              ...TYPOGRAPHY_STYLES['2xl'].bold,
              color: TITLE_COLOR,
              p: '12px 24px',
            }}
          >
            {label}
          </Typography>
        )}
      </Box>

      {tabs ? <Box sx={{ flexShrink: 0 }}>{tabs}</Box> : null}

      {aside ? (
        <StackRow sx={{ flex: 1, minHeight: 0, alignItems: 'stretch', bgcolor: '#F9FAFB', p: 3, pb: 0 }}>
          <Stack
            sx={{
              flex: '1 1 70%',
              minWidth: 0,
              minHeight: 0,
            }}
          >
            {content}
          </Stack>
          <Stack sx={{ flex: '0 0 410px', minHeight: 0, overflow: 'hidden' }}>{aside}</Stack>
        </StackRow>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: '#F9FAFB', p: 3, pb: 0, ...contentSx }}>{content}</Box>
      )}
    </Paper>
  );
};
