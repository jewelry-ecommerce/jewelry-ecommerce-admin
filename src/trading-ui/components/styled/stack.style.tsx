import { STYLE } from '@/trading-ui/adapters/style';
import { LinearProgress, linearProgressClasses, Stack, TableCell, tableCellClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StackRow = styled(Stack)(() => ({
  flexDirection: 'row',
}));

export const StackRowWrap = styled(Stack)(() => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
}));

export const StackRowAlignCenter = styled(Stack)(() => ({
  flexDirection: 'row',
  alignItems: 'center',
}));

export const StackRowAlignCenterEqual = styled(StackRowAlignCenter)(() => ({
  width: '100%',
  '& > *': {
    flex: '1 1 0',
    minWidth: 0,
  },
}));

export const StackAlignCenter = styled(Stack)(() => ({
  alignItems: 'center',
}));

export const StackRowAlignEnd = styled(Stack)(() => ({
  flexDirection: 'row',
  alignItems: 'flex-end',
}));

export const StackAlignEnd = styled(Stack)(() => ({
  alignItems: 'flex-end',
}));

export const StackRowJustCenter = styled(Stack)(() => ({
  flexDirection: 'row',
  justifyContent: 'center',
}));

export const StackJustCenter = styled(Stack)(() => ({
  flexDirection: 'row',
}));

export const StackRowJustAround = styled(Stack)(() => ({
  flexDirection: 'row',
  justifyContent: 'space-around',
}));

export const StackJustAround = styled(Stack)(() => ({
  justifyContent: 'space-around',
}));

export const StackRowAlignJustCenter = styled(Stack)(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const StackAlignJustCenter = styled(Stack)(() => ({
  alignItems: 'center',
  justifyContent: 'center',
}));

export const StackRowAlignCenterJustEnd = styled(Stack)(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
}));

export const StackAlignCenterJustEnd = styled(Stack)(() => ({
  alignItems: 'center',
  justifyContent: 'flex-end',
}));

export const StackRowJustEnd = styled(Stack)(() => ({
  flexDirection: 'row',
  justifyContent: 'flex-end',
}));

export const StackJustEnd = styled(Stack)(() => ({
  justifyContent: 'flex-end',
}));

export const StackRowJustBetween = styled(Stack)(() => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
}));

export const StackJustBetween = styled(Stack)(() => ({
  justifyContent: 'space-between',
}));

export const StackRowAlignCenterJustBetween = styled(Stack)(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const StackAlignCenterJustBetween = styled(Stack)(() => ({
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const StackRowAlignStartJustBetween = styled(Stack)(() => ({
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
}));

export const StackAlignStartJustBetween = styled(Stack)(() => ({
  alignItems: 'flex-start',
  justifyContent: 'space-between',
}));

export const StackBgDefaultBorRadLayCol = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: STYLE.PADDING_GAP_LAYOUT,
  borderRadius: STYLE.BORDER_RADIUS_ELEMENT,
}));

export const StackBgPaperBorRadLayCol = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: STYLE.PADDING_GAP_LAYOUT,
  borderRadius: STYLE.BORDER_RADIUS_ELEMENT,
}));

export const StackLabel = styled(Stack)(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: STYLE.PADDING_GAP_ITEM_SMALL,
  gap: STYLE.PADDING_GAP_ITEM_SMALL,
}));

export const SmallIcon = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.palette.common.white}`,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: theme.palette.background.paper,
  width: 16,
  height: 16,
}));

export const StackTabs = styled(Stack)(({ theme }) => ({
  borderRadius: STYLE.BORDER_RADIUS_ELEMENT_TAG,
  // padding: '6px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  width: 'fit-content',
  gap: 'unset',
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#008A77',
    color: theme.palette.common.white,
    fontWeight: 600,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  '&:first-of-type': {
    borderBottomLeftRadius: '0 !important',
  },
  '&:last-child': {
    borderBottomRightRadius: '0 !important',
  },
}));

export const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary,
  },
}));
