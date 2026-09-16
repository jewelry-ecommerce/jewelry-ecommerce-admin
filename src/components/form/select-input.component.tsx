import { MenuItem, TextField, Typography, type TextFieldProps } from "@mui/material";

import { FormFieldShell } from "@/components/form/form-field-shell.component";
import type { FormFieldBaseProps, FormSelectOption } from "@/components/form/form-field.interface";
import { formInputSx } from "@/components/form/form-field.styles";
import { COLOR } from "@/theme/design-tokens";

const MENU_MAX_HEIGHT = 280;

export interface SelectInputProps<TValue extends string | number = string> extends FormFieldBaseProps {
  value: TValue | "";
  onChange: (value: TValue | "") => void;
  options: readonly FormSelectOption<TValue>[];
  /** Lets the user clear the field by picking the current option again. */
  allowDeselect?: boolean;
  name?: string;
  id?: string;
  sx?: TextFieldProps["sx"];
}

export const SelectInput = <TValue extends string | number = string>({
  label,
  requiredMark,
  value,
  onChange,
  onBlur,
  inputRef,
  options,
  error = false,
  errorMessage,
  helperText,
  disabled = false,
  placeholder,
  allowDeselect = false,
  name,
  id,
  fullWidth = true,
  sx,
}: SelectInputProps<TValue>) => (
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
      select
      value={value}
      disabled={disabled}
      error={error}
      fullWidth
      size="small"
      inputRef={inputRef}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value as TValue)}
      slotProps={{
        select: {
          displayEmpty: Boolean(placeholder),
          MenuProps: { disableScrollLock: true, slotProps: { paper: { sx: { maxHeight: MENU_MAX_HEIGHT } } } },
          renderValue: (selected) => {
            const hit = options.find((option) => option.value === selected);
            if (hit) return hit.label;
            if (placeholder) {
              return (
                <Typography component="em" sx={{ color: COLOR.NEUTRAL[400], fontStyle: "normal" }}>
                  {placeholder}
                </Typography>
              );
            }
            return String(selected ?? "");
          },
        },
      }}
      sx={[formInputSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
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
            onChange("");
          }}
        >
          {option.label}
        </MenuItem>
      ))}
      {placeholder ? <MenuItem value="" sx={{ display: "none" }} /> : null}
    </TextField>
  </FormFieldShell>
);
