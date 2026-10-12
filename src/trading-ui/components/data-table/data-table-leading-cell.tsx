import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { DATA_TABLE_CHECKBOX_SLOT_WIDTH, DATA_TABLE_EXPAND_CHECKBOX_GAP, DATA_TABLE_EXPAND_TOGGLE_SIZE } from './data-table.types';
import { StackRowAlignJustCenter } from '../styled';

interface DataTableLeadingCellContentProps {
  expandSlot: ReactNode;
  checkboxSlot?: ReactNode;
}

/** Arrow 26px + gap 14px + checkbox 24px — căn thẳng header/body. */
export const DataTableLeadingCellContent = ({ expandSlot, checkboxSlot }: DataTableLeadingCellContentProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `${DATA_TABLE_EXPAND_TOGGLE_SIZE}px ${DATA_TABLE_CHECKBOX_SLOT_WIDTH}px`,
      columnGap: `${DATA_TABLE_EXPAND_CHECKBOX_GAP}px`,
      alignItems: 'center',
      width: 'fit-content',
    }}
  >
    <StackRowAlignJustCenter sx={{ width: DATA_TABLE_EXPAND_TOGGLE_SIZE, height: DATA_TABLE_EXPAND_TOGGLE_SIZE, gap: 0 }}>{expandSlot}</StackRowAlignJustCenter>
    {checkboxSlot ? <StackRowAlignJustCenter sx={{ width: DATA_TABLE_CHECKBOX_SLOT_WIDTH, gap: 0 }}>{checkboxSlot}</StackRowAlignJustCenter> : null}{' '}
  </Box>
);
