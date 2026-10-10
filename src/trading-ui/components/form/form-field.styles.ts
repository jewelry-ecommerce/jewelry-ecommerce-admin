import type { SxProps, Theme } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';

export const formLabelSx: SxProps<Theme> = {
  ...TYPOGRAPHY_STYLES.base.regular,
  fontFamily: 'Inter',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '20px',
  color: '#364153',
  mb: '4px',
};

export const formInputSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    bgcolor: '#fff',
    '& fieldset': { borderColor: '#D5DFEC' },
    '&:hover fieldset': { borderColor: '#C3D0E0' },
    '&.Mui-focused fieldset': {
      borderColor: '#0F172A',
      borderWidth: 2,
    },
    '&.Mui-error fieldset': {
      borderColor: '#EF4444',
    },
    '&.Mui-disabled': {
      bgcolor: '#E5E7EB',
      '& fieldset': {
        borderColor: '#D1D5DB',
      },
      '&:hover fieldset': {
        borderColor: '#D1D5DB',
      },
    },
  },
  '& .MuiInputBase-input': {
    fontSize: 14,
    color: '#0F172A',
  },
  '& .MuiInputBase-input.Mui-disabled': {
    color: '#6B7280',
    WebkitTextFillColor: '#6B7280',
    opacity: 1,
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#8FA0B5',
    opacity: 1,
  },
  '& .MuiSelect-select em': {
    fontStyle: 'normal',
    color: '#9CA3AF',
  },
};

export const textDateInputSx: SxProps<Theme> = [
  formInputSx,
  {
    '& .MuiPickersOutlinedInput-root.Mui-focused': {
      '& fieldset, & .MuiOutlinedInput-notchedOutline': {
        borderColor: '#0F172A !important',
      },
    },
  },
];
