import { TextField, type TextFieldProps } from "@mui/material";
import { useState, type ReactNode } from "react";

import { commonConfig } from "@/common/config/app.config";
import { FormFieldShell } from "@/components/form/form-field-shell.component";
import type { FormFieldBaseProps } from "@/components/form/form-field.interface";
import { formInputSx } from "@/components/form/form-field.styles";

export interface NumberInputProps extends FormFieldBaseProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Decimal places kept while typing. 0 restricts the field to integers. */
  decimalScale?: number;
  /** Turns off thousands separators, e.g. for years or quantities in a dense grid. */
  disableGrouping?: boolean;
  suffix?: ReactNode;
  name?: string;
  id?: string;
  sx?: TextFieldProps["sx"];
}

const groupThousands = (digits: string): string => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** Formats for display. Grouping happens on the integer part only; a trailing `.` is preserved. */
const formatDisplay = (raw: string, disableGrouping: boolean): string => {
  if (raw === "" || raw === "-") return raw;
  const isNegative = raw.startsWith("-");
  const [integerPart = "", decimalPart] = raw.replace("-", "").split(".");
  const grouped = disableGrouping ? integerPart : groupThousands(integerPart);
  const sign = isNegative ? "-" : "";
  if (decimalPart === undefined) return `${sign}${grouped}`;
  return `${sign}${grouped}.${decimalPart}`;
};

/** Strips separators and rejects anything that is not a signed decimal. */
const sanitize = (input: string, decimalScale: number, allowNegative: boolean): string => {
  const cleaned = input.replace(/,/g, "").replace(allowNegative ? /[^\d.-]/g : /[^\d.]/g, "");
  const isNegative = allowNegative && cleaned.startsWith("-");
  const [integerPart = "", ...decimalParts] = cleaned.replace(/-/g, "").split(".");
  const sign = isNegative ? "-" : "";

  if (decimalScale <= 0 || decimalParts.length === 0) return `${sign}${integerPart}`;
  return `${sign}${integerPart}.${decimalParts.join("").slice(0, decimalScale)}`;
};

const clamp = (value: number, min?: number, max?: number): number => {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
};

export const NumberInput = ({
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
  min,
  max,
  decimalScale = 0,
  disableGrouping = false,
  suffix,
  name,
  id,
  fullWidth = true,
  sx,
}: NumberInputProps) => {
  const allowNegative = min === undefined || min < 0;
  const [draft, setDraft] = useState<string>(value === null ? "" : String(value));

  /**
   * The draft is shown only while it still represents the incoming value, so a programmatic change
   * (form reset, server value) takes over by derivation rather than through a synchronising effect.
   * Comparing the parsed number — not the string — keeps a half-typed decimal such as `1.` intact.
   */
  const canonicalRaw = value === null ? "" : String(value);
  const draftNumber = draft === "" || draft === "-" ? null : Number(draft);
  const draftMatchesValue = draftNumber === null ? value === null : Number.isFinite(draftNumber) && draftNumber === value;
  const displayRaw = draftMatchesValue ? draft : canonicalRaw;

  const commit = (raw: string) => {
    if (raw === "" || raw === "-") {
      onChange(null);
      return;
    }
    const parsed = Number(raw);
    onChange(Number.isFinite(parsed) ? clamp(parsed, min, max) : null);
  };

  return (
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
        value={formatDisplay(displayRaw, disableGrouping)}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        fullWidth
        size="small"
        inputRef={inputRef}
        onChange={(event) => {
          const raw = sanitize(event.target.value, decimalScale, allowNegative);
          setDraft(raw);
          commit(raw);
        }}
        onBlur={() => {
          // Re-clamp on blur so a value typed past `max` settles at the boundary.
          commit(displayRaw);
          onBlur?.();
        }}
        slotProps={{
          htmlInput: { inputMode: decimalScale > 0 ? "decimal" : "numeric", lang: commonConfig.LOCALE },
          input: { endAdornment: suffix },
        }}
        sx={[formInputSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      />
    </FormFieldShell>
  );
};
