import { Box, Drawer as MuiDrawer, Stack, Typography, type DrawerProps } from '@mui/material';
import { XClose } from '@untitledui/icons';
import type { ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../styled/stack.style';

export interface DrawerComponentProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  anchor?: DrawerProps['anchor'];
  width?: { xs: number | string; sm: number | string } | number;
  headerAction?: ReactNode;
}

export const DrawerComponent = ({ open, onClose, title, subtitle, children, footer, anchor = 'right', width = { xs: '100%', sm: 600 }, headerAction }: DrawerComponentProps) => {
  const w = typeof width === 'number' ? { xs: '100%', sm: width } : width;

  return (
    <MuiDrawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.25)' } } }}
      PaperProps={{
        sx: {
          width: w,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxSizing: 'border-box',
        },
      }}
    >
      <StackRowAlignCenterJustBetween sx={{ flexShrink: 0, p: 2, borderBottom: '1px solid #E5E7EB' }}>
        <Stack sx={{ gap: 0.25 }}>
          <Typography component="div" sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography component="div" sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6A7282' }}>
              {subtitle}
            </Typography>
          )}
        </Stack>
        <StackRowAlignCenter gap={1}>
          {headerAction}
          <XClose size={20} onClick={onClose} color="#6B7280" style={{ cursor: 'pointer' }} />
        </StackRowAlignCenter>
      </StackRowAlignCenterJustBetween>

      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto', overflowX: 'hidden' }}>{children}</Box>

      {footer && <Box sx={{ flexShrink: 0, p: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#F9FAFB' }}>{footer}</Box>}
    </MuiDrawer>
  );
};
