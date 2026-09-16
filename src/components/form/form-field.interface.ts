import type { Ref } from "react";

/**
 * Contract every input in this kit exposes. `onChange` receives the parsed value rather than the DOM
 * event, so React Hook Form controllers wire up as `onChange={field.onChange}` with no adapter.
 */
export interface FormFieldBaseProps {
  label?: string;
  /** Renders the red asterisk. Purely visual — validation lives in the Yup schema. */
  requiredMark?: boolean;
  error?: boolean;
  errorMessage?: string;
  /** Guidance shown when there is no error. */
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  fullWidth?: boolean;
}

export interface FormSelectOption<TValue extends string | number = string> {
  value: TValue;
  label: string;
  disabled?: boolean;
}
