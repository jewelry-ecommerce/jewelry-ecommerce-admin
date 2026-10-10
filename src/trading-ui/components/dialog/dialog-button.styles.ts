import type { SxProps, Theme } from '@mui/material';
const DIALOG_BUTTON_INK = '#101828';
export const dialogOutlinedButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  borderColor: DIALOG_BUTTON_INK,
  color: DIALOG_BUTTON_INK,
  '&:hover': {
    borderColor: DIALOG_BUTTON_INK,
    bgcolor: 'rgba(16, 24, 40, 0.04)',
  },
};

export const dialogContainedButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  bgcolor: DIALOG_BUTTON_INK,
  color: '#fff',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: DIALOG_BUTTON_INK,
    opacity: 0.92,
    boxShadow: 'none',
  },
};
