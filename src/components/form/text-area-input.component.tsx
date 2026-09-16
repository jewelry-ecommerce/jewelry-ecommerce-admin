import { TextField, type TextFieldProps } from "@mui/material";

import { FormFieldShell } from "@/components/form/form-field-shell.component";
import type { FormFieldBaseProps } from "@/components/form/form-field.interface";
import { formInputSx } from "@/components/form/form-field.styles";

export interface TextAreaInputProps extends FormFieldBaseProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  name?: string;
  id?: string;
  sx?: TextFieldProps["sx"];
}

export const TextAreaInput = ({
  label,
  requiredMark,
  value,
  onChange,
  onBlur,
  inputRef,
  error = false,
  errorMessage,
  helperText,
  disabled = false,
  placeholder,
  rows = 4,
  maxLength,
  name,
  id,
  fullWidth = true,
  sx,
}: TextAreaInputProps) => (
  <FormFieldShell
    label={label}
    requiredMark={requiredMark}
    error={error}
    errorMessage={errorMessage}
    helperText={helperText}
    htmlFor={id}
    fullWidth={fullWidth}
  >
    <TextField
      id={id}
      name={name}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      fullWidth
      multiline
      minRows={rows}
      inputRef={inputRef}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      slotProps={{ htmlInput: { maxLength } }}
      sx={[formInputSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    />
  </FormFieldShell>
);
