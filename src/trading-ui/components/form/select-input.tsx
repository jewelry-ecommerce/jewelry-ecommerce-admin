import { Box, MenuItem, TextField, type MenuProps, type SelectProps, type TextFieldProps, Typography } from '@mui/material';
import type React from 'react';
import { formInputSx, formLabelSx } from './form-field.styles';

export const SELECT_INPUT_MENU_MAX_HEIGHT = 200;

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectInputProps extends Omit<TextFieldProps, 'select' | 'label' | 'variant'> {
  label?: string;
  requiredMark?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  errorMessage?: string;
  allowDeselect?: boolean;
  menuMaxHeight?: number;
}

const buildSelectMenuProps = (menuMaxHeight: number | undefined, userSelectProps?: Partial<SelectProps>): Partial<MenuProps> | undefined => {
  if (!menuMaxHeight) {
    return userSelectProps?.MenuProps;
  }

  const userPaper = userSelectProps?.MenuProps?.slotProps?.paper;
  const userPaperProps = typeof userPaper === 'object' && userPaper !== null ? userPaper : {};

  return {
    disableScrollLock: true,
    ...userSelectProps?.MenuProps,
    slotProps: {
      ...userSelectProps?.MenuProps?.slotProps,
      paper: {
        ...userPaperProps,
        sx: [{ maxHeight: menuMaxHeight }, ...(Array.isArray(userPaperProps.sx) ? userPaperProps.sx : userPaperProps.sx ? [userPaperProps.sx] : [])],
      },
    },
  };
};

export const SelectInput = ({
  label,
  requiredMark = false,
  options = [],
  placeholder,
  errorMessage,
  error = false,
  allowDeselect = false,
  menuMaxHeight,
  sx,
  SelectProps: userSelectProps,
  value,
  onChange,
  ...props
}: SelectInputProps) => {
  return (
    <Box sx={{ width: '100%' }}>
      {label ? (
        <Typography sx={formLabelSx}>
          {label}
          {requiredMark ? (
            <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
              *
            </Box>
          ) : null}
        </Typography>
      ) : null}
      <TextField
        fullWidth
        select
        size="small"
        error={error}
        SelectProps={{
          displayEmpty: Boolean(placeholder),
          ...userSelectProps,
          MenuProps: buildSelectMenuProps(menuMaxHeight, userSelectProps),
          renderValue:
            userSelectProps?.renderValue ??
            ((selected) => {
              const hit = options.find((o) => o.value === selected);

              if (hit) return hit.label;

              if (placeholder && (selected === '' || selected === undefined || selected === null)) {
                return (
                  <Typography component="em" sx={{ color: 'text.disabled', fontStyle: 'inherit' }}>
                    {placeholder}
                  </Typography>
                );
              }

              return String(selected ?? '');
            }),
        }}
        sx={[formInputSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
        value={value}
        onChange={onChange}
        {...props}
      >
        {options.map((option) => (
          <MenuItem
            key={String(option.value)}
            value={option.value}
            disabled={option.disabled}
            onClick={(event) => {
              if (!allowDeselect || option.value !== value) return;
              event.preventDefault();
              event.stopPropagation();
              onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
            }}
            sx={{
              '&&.Mui-selected': {
                bgcolor: '#101828',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#101828', color: '#FFFFFF' },
              },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
        {placeholder ? <MenuItem value="" sx={{ display: 'none' }} /> : null}
      </TextField>

      {error && errorMessage ? (
        <Typography
          sx={{
            fontSize: 12,
            color: '#EF4444',
            mt: 0.5,
          }}
        >
          {errorMessage}
        </Typography>
      ) : null}
    </Box>
  );
};
