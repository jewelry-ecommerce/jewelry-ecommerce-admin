import SearchRounded from "@mui/icons-material/SearchRounded";
import { InputAdornment, TextField, type TextFieldProps } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { formInputSx } from "@/components/form/form-field.styles";
import { COLOR, STYLE } from "@/theme/design-tokens";

export interface SearchInputProps {
  /**
   * Seeds the field. The draft is owned locally from then on, so a parent that needs to clear the
   * box (e.g. a "reset filters" action) changes the `key` of this element rather than the value.
   */
  value: string;
  /** Fires after `debounceMs` of inactivity — wire list queries to this, not to every keystroke. */
  onDebouncedChange: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  /** Defaults to `off` so browser autofill cannot inject a login value into a search box. */
  autoComplete?: string;
  sx?: TextFieldProps["sx"];
}

export const SearchInput = ({
  value,
  onDebouncedChange,
  debounceMs = 500,
  placeholder = "Search…",
  disabled = false,
  name = "search",
  id,
  autoComplete = "off",
  sx,
}: SearchInputProps) => {
  const [draft, setDraft] = useState(value);
  const onDebouncedChangeRef = useRef(onDebouncedChange);
  /** Last value handed to the parent — stops a re-render from re-emitting the same search term. */
  const lastEmittedRef = useRef(value);

  useEffect(() => {
    onDebouncedChangeRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(() => {
    if (draft === lastEmittedRef.current) return;

    const emit = () => {
      lastEmittedRef.current = draft;
      onDebouncedChangeRef.current(draft);
    };

    if (debounceMs <= 0) {
      emit();
      return;
    }

    const timer = window.setTimeout(emit, debounceMs);
    return () => window.clearTimeout(timer);
  }, [draft, debounceMs]);

  return (
    <TextField
      id={id}
      name={name}
      value={draft}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      fullWidth
      size="small"
      onChange={(event) => setDraft(event.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded sx={{ color: COLOR.NEUTRAL[400], fontSize: 20 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={[
        formInputSx,
        { "& .MuiOutlinedInput-root": { height: STYLE.HEIGHT_DEFAULT_TEXT_FIELD_BUTTON } },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
};
