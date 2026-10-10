import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { TooltipOnHoverComponent } from '@/components/tooltip/tooltip-on-hover.component';
import { formInputSx, formLabelSx } from './form-field.styles';

export type PrefixedNumericInputProps = {
  label?: string;
  requiredMark?: boolean;
  prefix?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  tooltipContent?: ReactElement | string;
};

export const PrefixedNumericInput = ({
  label,
  requiredMark = false,
  prefix,
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  errorMessage,
  onBlur,
  onFocus,
  tooltipContent,
}: PrefixedNumericInputProps) => {
  const field = (
    <TextField
      fullWidth
      size="small"
      disabled={disabled}
      error={error}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d.,]/g, '');
        onChange(raw);
      }}
      onBlur={onBlur}
      onFocus={onFocus}
      type="text"
      inputProps={{ inputMode: 'decimal' }}
      sx={formInputSx}
      InputProps={{
        startAdornment: prefix ? (
          <InputAdornment position="start" sx={{ mr: 0.5 }}>
            <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: '#6B7280' }}>
              {prefix}
            </Typography>
          </InputAdornment>
        ) : undefined,
      }}
    />
  );

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
      {tooltipContent ? (
        <TooltipOnHoverComponent content={tooltipContent} placement="top" leaveDelay={400} sx={{ zIndex: 100, maxWidth: 280 }}>
          <Box sx={{ width: '100%', display: 'block' }}>{field}</Box>
        </TooltipOnHoverComponent>
      ) : (
        field
      )}
      {error && errorMessage ? <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5 }}>{errorMessage}</Typography> : null}
    </Box>
  );
};
