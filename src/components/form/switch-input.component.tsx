import { FormControlLabel, Switch, Typography } from "@mui/material";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { FormFieldShell } from "@/components/form/form-field-shell.component";
import type { FormFieldBaseProps } from "@/components/form/form-field.interface";
import { COLOR } from "@/theme/design-tokens";

export interface SwitchInputProps extends Omit<FormFieldBaseProps, "placeholder"> {
  value: boolean;
  onChange: (value: boolean) => void;
  /** Text beside the switch. Falls back to `label` when omitted. */
  switchLabel?: string;
  name?: string;
  id?: string;
}

export const SwitchInput = ({
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
  switchLabel,
  name,
  id,
  fullWidth = true,
}: SwitchInputProps) => (
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
        <Switch
          id={id}
          name={name}
          checked={value}
          disabled={disabled}
          inputRef={inputRef}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.checked)}
        />
      }
      label={
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: disabled ? COLOR.NEUTRAL[400] : COLOR.NEUTRAL[700] }}>
          {switchLabel ?? label ?? ""}
        </Typography>
      }
    />
  </FormFieldShell>
);
