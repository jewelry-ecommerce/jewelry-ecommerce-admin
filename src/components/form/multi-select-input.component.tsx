import { Checkbox, Chip, ListItemText, MenuItem, TextField, Typography, type TextFieldProps } from "@mui/material";

import { FormFieldShell } from "@/components/form/form-field-shell.component";
import type { FormFieldBaseProps, FormSelectOption } from "@/components/form/form-field.interface";
import { formInputSx } from "@/components/form/form-field.styles";
import { COLOR } from "@/theme/design-tokens";

const MENU_MAX_HEIGHT = 280;

export interface MultiSelectInputProps<TValue extends string = string> extends FormFieldBaseProps {
  value: TValue[];
  onChange: (value: TValue[]) => void;
  options: readonly FormSelectOption<TValue>[];
  name?: string;
  id?: string;
  sx?: TextFieldProps["sx"];
}

export const MultiSelectInput = <TValue extends string = string>({
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
  name,
  id,
  fullWidth = true,
  sx,
}: MultiSelectInputProps<TValue>) => {
  const labelOf = (optionValue: TValue): string => options.find((option) => option.value === optionValue)?.label ?? optionValue;

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
        select
        value={value}
        disabled={disabled}
        error={error}
        fullWidth
        size="small"
        inputRef={inputRef}
        onBlur={onBlur}
        onChange={(event) => {
          const raw = event.target.value as unknown;
          onChange(Array.isArray(raw) ? (raw as TValue[]) : ([raw] as TValue[]));
        }}
        slotProps={{
          select: {
            multiple: true,
            displayEmpty: true,
            MenuProps: { disableScrollLock: true, slotProps: { paper: { sx: { maxHeight: MENU_MAX_HEIGHT } } } },
            renderValue: (selected) => {
              const selectedValues = Array.isArray(selected) ? (selected as TValue[]) : [];
              if (selectedValues.length === 0) {
                return (
                  <Typography component="em" sx={{ color: COLOR.NEUTRAL[400], fontStyle: "normal" }}>
                    {placeholder ?? "Select…"}
                  </Typography>
                );
              }
              return selectedValues.map((entry) => <Chip key={entry} size="small" label={labelOf(entry)} sx={{ mr: 0.5 }} />);
            },
          },
        }}
        sx={[formInputSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled} sx={{ py: 0.5 }}>
            <Checkbox size="small" checked={value.includes(option.value)} tabIndex={-1} disableRipple sx={{ p: 0.5, mr: 0.75 }} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </TextField>
    </FormFieldShell>
  );
};
