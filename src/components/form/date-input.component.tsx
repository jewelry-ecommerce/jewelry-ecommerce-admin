import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";

import { FormFieldShell } from "@/components/form/form-field-shell.component";
import type { FormFieldBaseProps } from "@/components/form/form-field.interface";
import { formInputSx } from "@/components/form/form-field.styles";

export interface DateInputProps extends FormFieldBaseProps {
  /** ISO string or null. Kept as a string so the value round-trips through the API unchanged. */
  value: string | null;
  onChange: (value: string | null) => void;
  minDate?: string;
  maxDate?: string;
  format?: string;
  name?: string;
  id?: string;
}

const toDayjs = (value: string | null | undefined): Dayjs | null => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

export const DateInput = ({
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
  minDate,
  maxDate,
  format = "DD/MM/YYYY",
  name,
  id,
  fullWidth = true,
}: DateInputProps) => (
  <FormFieldShell
    label={label}
    requiredMark={requiredMark}
    error={error}
    errorMessage={errorMessage}
    helperText={helperText}
    htmlFor={id}
    fullWidth={fullWidth}
  >
    <DatePicker
      value={toDayjs(value)}
      format={format}
      disabled={disabled}
      minDate={toDayjs(minDate) ?? undefined}
      maxDate={toDayjs(maxDate) ?? undefined}
      onChange={(next) => onChange(next && next.isValid() ? next.toISOString() : null)}
      slotProps={{
        textField: {
          id,
          name,
          error,
          placeholder,
          fullWidth: true,
          size: "small",
          inputRef,
          onBlur,
          sx: formInputSx,
        },
      }}
    />
  </FormFieldShell>
);
