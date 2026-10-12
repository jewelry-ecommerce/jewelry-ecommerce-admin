import { Stack, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

interface DataTableContentCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/** Card trắng chứa DataTable (dưới filter / bulk action). */
export const DataTableContentCard = ({ children, sx }: DataTableContentCardProps) => (
  <Stack
    sx={{
      flex: 1,
      minHeight: 0,
      borderRadius: '10px 10px 0 0',
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
      bgcolor: '#FFFFFF',
      ...sx,
    }}
  >
    {children}
  </Stack>
);
