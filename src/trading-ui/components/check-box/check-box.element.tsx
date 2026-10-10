import { Checkbox, type CheckboxProps, FormControlLabel, type SxProps, type Theme } from '@mui/material';
import React from 'react';
import { STYLE } from '@/trading-ui/adapters/library';

export interface CheckboxComponentProps extends CheckboxProps {
  label?: React.ReactNode;
  isSameButton?: boolean;
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

export const CheckboxComponent: React.FC<CheckboxComponentProps> = ({ label, name, size = 'small', isSameButton = false, disabled = false, sx, ...rest }) => {
  return (
    <FormControlLabel
      sx={{ marginRight: 0, ...(isSameButton ? { marginLeft: 0 } : {}) }}
      name={name}
      control={
        <Checkbox
          size={size}
          disabled={disabled}
          {...rest}
          sx={{
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: STYLE.PADDING_GAP_ITEM,
            ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
            '&.Mui-checked': {
              color: '#111827',
            },
            '&.MuiCheckbox-indeterminate': {
              color: '#111827',
            },
            ...(isSameButton
              ? {
                  width: STYLE.HEIGHT_DEFAULT_TEXT_FIELD_BUTTON,
                  height: STYLE.HEIGHT_DEFAULT_TEXT_FIELD_BUTTON,
                }
              : {
                  '&:hover': {
                    backgroundColor: 'unset',
                  },
                }),
            ...sx,
          }}
        />
      }
      label={label}
    />
  );
};
