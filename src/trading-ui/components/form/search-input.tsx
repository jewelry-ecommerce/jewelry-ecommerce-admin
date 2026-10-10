import SearchRounded from '@mui/icons-material/SearchRounded';
import { InputAdornment } from '@mui/material';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { TextInput } from './text-input';

type SearchInputProps = ComponentProps<typeof TextInput> & {
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
};

export const SearchInput = ({ debounceMs = 500, onDebouncedChange, slotProps, value, onChange, ...props }: SearchInputProps) => {
  const normalizedValue = typeof value === 'string' ? value : value != null ? String(value) : '';
  const [inputValue, setInputValue] = useState(normalizedValue);
  const onDebouncedChangeRef = useRef(onDebouncedChange);

  useEffect(() => {
    onDebouncedChangeRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  const [previousValue, setPreviousValue] = useState(normalizedValue);
  if (previousValue !== normalizedValue) {
    setPreviousValue(normalizedValue);
    setInputValue(normalizedValue);
  }

  useEffect(() => {
    if (!onDebouncedChangeRef.current) return;

    if (debounceMs <= 0) {
      onDebouncedChangeRef.current(inputValue);
      return;
    }

    const timer = window.setTimeout(() => {
      onDebouncedChangeRef.current?.(inputValue);
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [debounceMs, inputValue]);

  return (
    <TextInput
      size="small"
      value={inputValue}
      onChange={(event) => {
        setInputValue(event.target.value);
        onChange?.(event);
      }}
      slotProps={{
        ...slotProps,
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded sx={{ color: '#98A2B3', fontSize: 20 }} />
            </InputAdornment>
          ),
          ...slotProps?.input,
        },
      }}
      {...props}
    />
  );
};
