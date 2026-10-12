import { Box } from '@mui/material';
import type { KeyboardEvent, MouseEvent } from 'react';
import { IconArrowDown } from '../../assets/icon';

interface DataTableExpandToggleProps {
  expanded: boolean;
  onToggle: () => void;
}

export const DataTableExpandToggle = ({ expanded, onToggle }: DataTableExpandToggleProps) => {
  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggle();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    onToggle();
  };

  return (
    <Box
      component="span"
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      data-row-click-ignore="true"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      sx={{
        width: 26,
        height: 26,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 1,
        flexShrink: 0,
        cursor: 'pointer',
        '& svg': {
          transition: 'transform 160ms ease',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        },
        '&:hover': { bgcolor: 'rgba(16, 24, 40, 0.04)' },
      }}
    >
      <IconArrowDown width={20} height={20} />
    </Box>
  );
};

export const DataTableExpandSpacer = () => <Box component="span" sx={{ width: 26, height: 26, display: 'inline-block', flexShrink: 0 }} />;
