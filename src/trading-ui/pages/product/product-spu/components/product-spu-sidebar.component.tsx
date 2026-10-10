import { Stack, Typography, useTheme } from '@mui/material';
import { StackRowAlignCenter } from '../../../../components/styled/stack.style';
import type { ProductSpuSidebarProps } from '../product-spu.interface';

const ACTIVE = {
  bg: '#F3F4F6',
  color: '#101828',
} as const;

export const ProductSpuSidebar = ({ items, activeKey, onNavigate }: ProductSpuSidebarProps) => {
  const { palette } = useTheme();

  return (
    <Stack
      sx={{
        bgcolor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        p: 1.5,
        minWidth: 0,
        flex: 1,
        height: '100%',
      }}
    >
      {items.map((it) => {
        const isActive = activeKey === it.key;
        return (
          <StackRowAlignCenter
            key={it.key}
            onClick={() => onNavigate(it.key)}
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: '8px',
              cursor: 'pointer',
              userSelect: 'none',
              bgcolor: isActive ? ACTIVE.bg : 'transparent',
              transition: 'background-color 0.15s ease',
              '&:hover': {
                bgcolor: isActive ? ACTIVE.bg : 'rgba(15, 23, 42, 0.04)',
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                lineHeight: 1.4,
                color: isActive ? ACTIVE.color : palette.text.secondary,
              }}
            >
              {it.label}
            </Typography>
          </StackRowAlignCenter>
        );
      })}
    </Stack>
  );
};
