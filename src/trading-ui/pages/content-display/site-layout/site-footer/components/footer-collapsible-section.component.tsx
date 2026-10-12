import { KeyboardArrowDownRounded } from '@mui/icons-material';
import { Box, Collapse, IconButton, Stack, Typography } from '@mui/material';
import type { ReactNode, MouseEvent } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../components/styled';

export type FooterCollapsibleSectionProps = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  actions?: ReactNode;
};

export const FooterCollapsibleSection = ({ title, expanded, onToggle, children, actions }: FooterCollapsibleSectionProps) => (
  <Stack
    sx={{
      border: '1px solid #E5E7EB',
      borderRadius: '10px',
      bgcolor: '#FFFFFF',
    }}
  >
    <StackRowAlignCenterJustBetween
      sx={{
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        userSelect: 'none',
        borderBottom: expanded ? '1px solid #E5E7EB' : 'none',
        borderRadius: expanded ? '10px 10px 0 0' : '10px',
        '&:hover': { bgcolor: '#F9FAFB' },
      }}
      onClick={onToggle}
    >
      <StackRowAlignCenter gap={0.5}>
        <IconButton
          size="small"
          aria-label={expanded ? 'Thu gọn' : 'Mở rộng'}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          sx={{ color: '#667085' }}
        >
          <KeyboardArrowDownRounded
            sx={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </IconButton>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>{title}</Typography>
      </StackRowAlignCenter>
      {actions ? (
        <Box onClick={stopPropagation} sx={{ flexShrink: 0 }}>
          {actions}
        </Box>
      ) : null}
    </StackRowAlignCenterJustBetween>

    <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
      <Stack gap={2} sx={{ px: 2, pt: 2, pb: 2, width: '100%', boxSizing: 'border-box' }}>
        {children}
      </Stack>
    </Collapse>
  </Stack>
);

const stopPropagation = (event: MouseEvent) => {
  event.stopPropagation();
};
