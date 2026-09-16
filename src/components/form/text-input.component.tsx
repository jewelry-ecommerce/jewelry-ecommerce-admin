import { TextField, type TextFieldProps } from "@mui/material";
import type { ReactNode } from "react";

import { FormFieldShell } from "@/components/form/form-field-shell.component";
import type { FormFieldBaseProps } from "@/components/form/form-field.interface";
import { formInputSx } from "@/components/form/form-field.styles";

export interface TextInputProps extends FormFieldBaseProps {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "tel" | "url";
  name?: string;
  id?: string;
  autoComplete?: string;
  maxLength?: number;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  sx?: TextFieldProps["sx"];
}

export const TextInput = ({
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
  type = "text",
  name,
  id,
  autoComplete,
  maxLength,
  startAdornment,
  endAdornment,
  fullWidth = true,
  sx,
}: TextInputProps) => (
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
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      fullWidth
      size="small"
      autoComplete={autoComplete}
      inputRef={inputRef}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      slotProps={{ htmlInput: { maxLength }, input: { startAdornment, endAdornment } }}
      sx={[formInputSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    />
  </FormFieldShell>
);
