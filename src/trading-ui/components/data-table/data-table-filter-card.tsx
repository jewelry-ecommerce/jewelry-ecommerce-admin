import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

interface DataTableFilterCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/** Card padded cho search + filter toolbar (tách khỏi header title/tabs). */
export const DataTableFilterCard = ({ children, sx }: DataTableFilterCardProps) => (
  <Box
    sx={{
      p: '16px',
      border: '1px solid #E5E7EB',
      bgcolor: '#FFFFFF',
      borderRadius: '10px',
      flexShrink: 0,
      ...sx,
    }}
  >
    {children}
  </Box>
);
