import { Box, TextField, type SxProps, type TextFieldProps, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { memo, useCallback, type ChangeEvent, type ReactNode } from 'react';
import { NumericFormat } from 'react-number-format';
import { formInputSx, formLabelSx } from './form-field.styles';
import { sanitizeTextInputChangeEvent, shouldSanitizeTextInputType } from './input-sanitize.util';

interface CustomTextInputProps extends Omit<TextFieldProps, 'variant' | 'label'> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  helperIcon?: ReactNode;
  requiredMark?: boolean;
  errorMessageSx?: SxProps<Theme>;
  // dùng cho type="number" khi sử dụng NumericFormat thay vì TextField
  nativeNumberInput?: boolean;
  numericThousandSeparator?: string | boolean;
  numericDecimalSeparator?: string;
  numericAllowedDecimalSeparators?: string[];
  numericDecimalScale?: number;
  numericFixedDecimalScale?: boolean;
}

const inputSx = (sx: TextFieldProps['sx']): SxProps<Theme> => [formInputSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])];

const TextInputInner = ({
  label,
  error = false,
  errorMessage,
  requiredMark = false,
  errorMessageSx,
  type,
  nativeNumberInput = false,
  numericThousandSeparator = '',
  numericDecimalSeparator = '.',
  numericAllowedDecimalSeparators,
  numericDecimalScale,
  numericFixedDecimalScale,
  onChange,
  value,
  defaultValue,
  ...props
}: CustomTextInputProps) => {
  const sx = inputSx(props.sx);
  const sanitizeInput = shouldSanitizeTextInputType(type, nativeNumberInput);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange?.(sanitizeInput ? sanitizeTextInputChangeEvent(event) : event);
    },
    [onChange, sanitizeInput],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography sx={formLabelSx}>
          {label}
          {requiredMark ? (
            <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
              *
            </Box>
          ) : null}
        </Typography>
      )}

      {type === 'number' && !nativeNumberInput ? (
        <NumericFormat
          customInput={TextField}
          fullWidth
          error={error}
          allowNegative={false}
          decimalSeparator={numericDecimalSeparator}
          thousandSeparator={numericThousandSeparator}
          allowedDecimalSeparators={numericAllowedDecimalSeparators}
          decimalScale={numericDecimalScale}
          fixedDecimalScale={numericFixedDecimalScale}
          value={value === undefined || value === null || value === '' ? '' : typeof value === 'number' ? value : String(value)}
          onValueChange={(v) => {
            const empty = v.value.trim() === '';
            const n = v.floatValue;
            const next = empty || n == null || Number.isNaN(n) ? undefined : n;
            onChange?.({
              target: { name: String(props.name ?? ''), value: next },
            } as unknown as ChangeEvent<HTMLInputElement>);
          }}
          {...props}
          sx={sx}
        />
      ) : (
        <TextField fullWidth error={error} {...props} type={type} value={value} defaultValue={defaultValue} onChange={handleChange} sx={sx} />
      )}

      {error && errorMessage && (
        <Typography sx={[{ fontSize: 12, color: '#EF4444', mt: 0.5 }, ...(errorMessageSx ? (Array.isArray(errorMessageSx) ? errorMessageSx : [errorMessageSx]) : [])]}>{errorMessage}</Typography>
      )}
    </Box>
  );
};

export const TextInput = memo(TextInputInner);
