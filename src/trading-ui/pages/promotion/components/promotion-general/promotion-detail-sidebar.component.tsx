import React, { useMemo } from 'react';
void React;
import { Stack, Typography } from '@mui/material';
import { StackRowAlignCenter } from '../../../../components/styled';
import { getPromotionDetailSections } from '../../promotion.constant';

export const PromotionDetailSidebar = ({ activeKey, onNavigate, source }: { activeKey: string; onNavigate: (key: string) => void; source: 'draft' | 'published' }) => {
  const sections = useMemo(() => getPromotionDetailSections(source), [source]);

  return (
    <Stack sx={{ bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', p: 1.5, minWidth: 0, height: 'fit-content' }}>
      {sections.map((item) => {
        const isActive = activeKey === item.key;
        const Icon = item.Icon;
        return (
          <Stack
            key={item.key}
            onClick={() => onNavigate(item.key)}
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: '8px',
              cursor: 'pointer',
              userSelect: 'none',
              bgcolor: isActive ? '#F3F4F6' : 'transparent',
              '&:hover': { bgcolor: isActive ? '#F3F4F6' : 'rgba(15, 23, 42, 0.04)' },
            }}
          >
            <StackRowAlignCenter gap={1}>
              <Icon size={18} color={isActive ? '#101828' : '#667085'} />
              <Typography sx={{ fontSize: 14, fontWeight: isActive ? 600 : 500, lineHeight: 1.4, color: isActive ? '#101828' : '#475467' }}>{item.label}</Typography>
            </StackRowAlignCenter>
          </Stack>
        );
      })}
    </Stack>
  );
};
