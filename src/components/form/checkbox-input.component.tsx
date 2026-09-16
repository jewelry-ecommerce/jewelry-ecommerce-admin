import { Checkbox, FormControlLabel, Typography } from "@mui/material";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { FormFieldShell } from "@/components/form/form-field-shell.component";
import type { FormFieldBaseProps } from "@/components/form/form-field.interface";
import { COLOR } from "@/theme/design-tokens";

export interface CheckboxInputProps extends Omit<FormFieldBaseProps, "placeholder"> {
  value: boolean;
  onChange: (value: boolean) => void;
  /** Text beside the box. Falls back to `label` when omitted. */
  checkboxLabel?: string;
  indeterminate?: boolean;
  name?: string;
  id?: string;
}

export const CheckboxInput = ({
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
  checkboxLabel,
  indeterminate = false,
  name,
  id,
  fullWidth = true,
}: CheckboxInputProps) => (
  <FormFieldShell
    label={label}
    requiredMark={requiredMark}
    error={error}
    errorMessage={errorMessage}
    helperText={helperText}
    fullWidth={fullWidth}
  >
    <FormControlLabel
      sx={{ ml: 0 }}
      control={
        <Checkbox
          id={id}
          name={name}
          size="small"
          checked={value}
          indeterminate={indeterminate}
          disabled={disabled}
          inputRef={inputRef}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.checked)}
        />
      }
      label={
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: disabled ? COLOR.NEUTRAL[400] : COLOR.NEUTRAL[700] }}>
          {checkboxLabel ?? label ?? ""}
        </Typography>
      }
    />
  </FormFieldShell>
);
