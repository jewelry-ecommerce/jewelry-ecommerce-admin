import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, InputAdornment, ListSubheader, MenuItem, TextField, type TextFieldProps, Typography } from '@mui/material';
import { SearchLg } from '@untitledui/icons';
import { StackRowAlignCenter } from '@/trading-ui/adapters/library';
import type { ChangeEvent, KeyboardEvent, SyntheticEvent, UIEvent } from 'react';
import { useMemo, useState } from 'react';
import { ChipComponent } from '../chip/chip.component';
import { DEFAULT_MAX_VISIBLE_CHIPS } from '../chip/chip.constant';
import { LoadingComponent } from '../loading/loading.component';
import { useInfiniteScroll } from '../../hooks/use-infinite-scroll.hook';
import { formInputSx, formLabelSx } from './form-field.styles';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectAllInputProps extends Omit<TextFieldProps, 'select' | 'label' | 'variant'> {
  label?: string;
  requiredMark?: boolean;
  options?: SelectOption[];
  readonlyPrefixOptions?: SelectOption[];
  placeholder?: string;
  errorMessage?: string;
  maxVisibleChips?: number;
  /** Show search filter inside dropdown */
  searchable?: boolean;
  searchPlaceholder?: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

const attributePillChipSx = {
  bgcolor: '#EFF6FF',
  border: 'none',
  height: 22,
  maxWidth: 140,
  flexShrink: 1,
  '& .MuiChip-label': {
    px: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
} as const;

/** Khớp height TextField size="small" / SelectInput bên cạnh. */
const selectAllInputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 40,
    height: 40,
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    minHeight: 'unset !important',
    py: '0 !important',
    height: '100%',
    boxSizing: 'border-box',
  },
} as const;

const selectMenuItemSx = {
  color: '#374151',
  '&.Mui-disabled': {
    opacity: 1,
    color: '#9CA3AF',
    WebkitTextFillColor: '#9CA3AF',
  },
  '&&.Mui-selected': {
    bgcolor: '#101828',
    color: '#FFFFFF',
    '&:hover': { bgcolor: '#101828', color: '#FFFFFF' },
  },
  '&.Mui-selected.Mui-disabled': {
    opacity: 1,
    color: '#9CA3AF',
    WebkitTextFillColor: '#9CA3AF',
    bgcolor: '#101828',
  },
} as const;

const normalizeSearch = (value: string) => value.trim().toLowerCase();
const noop = () => undefined;

export const SelectAllInput = ({
  label,
  requiredMark = false,
  options = [],
  readonlyPrefixOptions = [],
  placeholder,
  errorMessage,
  error = false,
  maxVisibleChips = DEFAULT_MAX_VISIBLE_CHIPS,
  searchable = false,
  searchPlaceholder = 'Tìm kiếm...',
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  SelectProps: userSelectProps,
  ...props
}: SelectAllInputProps) => {
  const [search, setSearch] = useState('');
  const { onScroll: onLoadMoreScroll } = useInfiniteScroll({
    hasMore,
    isValidating: isLoadingMore,
    onLoadMore: onLoadMore ?? noop,
  });

  const selectedValues = useMemo(() => {
    const raw = props.value;
    return Array.isArray(raw) ? raw.map(String) : [];
  }, [props.value]);

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    const query = normalizeSearch(search);
    if (!query) return options;

    const matched = options.filter((option) => normalizeSearch(option.label).includes(query));
    // Keep selected options visible so MUI Select does not warn about out-of-range values.
    const selectedMissing = options.filter((option) => selectedValues.includes(String(option.value)) && !matched.some((item) => item.value === option.value));
    return [...selectedMissing, ...matched];
  }, [options, search, searchable, selectedValues]);

  const renderSelectedValue = (selected: unknown) => {
    const values = Array.isArray(selected) ? selected : [];
    const hasReadonly = readonlyPrefixOptions.length > 0;

    if (values.length === 0 && !hasReadonly) {
      return placeholder ? (
        <Typography component="em" sx={{ color: 'text.disabled', fontStyle: 'inherit' }}>
          {placeholder}
        </Typography>
      ) : null;
    }

    const cap = Math.max(0, Math.floor(maxVisibleChips));
    const visibleValues = cap === 0 ? [] : values.slice(0, cap);
    const overflow = values.length - visibleValues.length;

    const removeVisibleIndex = (visibleIndex: number) => {
      const valueToRemove = visibleValues[visibleIndex];
      if (valueToRemove === undefined) return;

      const next = [...values];
      const idx = next.findIndex((v) => v === valueToRemove);
      if (idx === -1) return;
      next.splice(idx, 1);

      props.onChange?.({ target: { value: next } } as unknown as ChangeEvent<HTMLInputElement>);
    };

    return (
      <StackRowAlignCenter sx={{ gap: 0.75, flexWrap: 'nowrap', overflow: 'hidden', minWidth: 0, maxWidth: '100%' }}>
        {readonlyPrefixOptions.map((opt) => (
          <ChipComponent key={`readonly-${String(opt.value)}`} label={opt.label} size="small" clickable={false} sx={attributePillChipSx} />
        ))}
        {visibleValues.map((v, visibleIndex) => {
          const text = options.find((o) => o.value === v)?.label ?? String(v);
          const chipRemovable = !props.disabled;
          return (
            <ChipComponent
              key={`${String(v)}-${visibleIndex}`}
              label={text}
              icon={chipRemovable ? <CloseRounded /> : undefined}
              iconPosition="right"
              size="small"
              clickable={false}
              onAction={chipRemovable ? () => removeVisibleIndex(visibleIndex) : undefined}
              sx={attributePillChipSx}
            />
          );
        })}
        {overflow > 0 ? (
          <Box
            component="span"
            sx={{
              height: 22,
              fontSize: '12px',
              borderRadius: '6px',
              padding: '0 8px',
              display: 'inline-flex',
              alignItems: 'center',
              flexShrink: 0,
              bgcolor: '#EFF6FF',
              color: '#171717',
              lineHeight: 1,
            }}
          >
            +{overflow}
          </Box>
        ) : null}
      </StackRowAlignCenter>
    );
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Keep Select menu open while typing; Escape still closes.
    if (event.key !== 'Escape') {
      event.stopPropagation();
    }
  };

  const handleSelectClose = (event: SyntheticEvent) => {
    setSearch('');
    userSelectProps?.onClose?.(event);
  };

  const handleMenuScroll = (event: UIEvent<HTMLDivElement>) => {
    userSelectProps?.MenuProps?.PaperProps?.onScroll?.(event);
    onLoadMoreScroll(event);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label ? (
        <Typography sx={formLabelSx}>
          {label}
          {requiredMark ? (
            <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
              *
            </Box>
          ) : null}
        </Typography>
      ) : null}
      <TextField
        fullWidth
        select
        size="small"
        error={error}
        SelectProps={{
          displayEmpty: Boolean(placeholder),
          multiple: true,
          renderValue: renderSelectedValue,
          ...userSelectProps,
          onClose: handleSelectClose,
          MenuProps: {
            autoFocus: false,
            disableAutoFocusItem: true,
            ...userSelectProps?.MenuProps,
            PaperProps: {
              ...userSelectProps?.MenuProps?.PaperProps,
              onScroll: handleMenuScroll,
              sx: [
                { maxHeight: 320 },
                ...(Array.isArray(userSelectProps?.MenuProps?.PaperProps?.sx)
                  ? userSelectProps.MenuProps.PaperProps.sx
                  : userSelectProps?.MenuProps?.PaperProps?.sx
                    ? [userSelectProps.MenuProps.PaperProps.sx]
                    : []),
              ],
            },
          },
        }}
        sx={[formInputSx, selectAllInputSx, ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : [])]}
        {...props}
      >
        {searchable ? (
          <ListSubheader
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              bgcolor: '#FFFFFF',
              lineHeight: 'normal',
              py: 1,
              px: 1,
              borderBottom: '1px solid #E5E7EB',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <TextField
              fullWidth
              size="small"
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchLg size={16} color="#667085" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&.Mui-focused fieldset': { borderColor: '#101828', borderWidth: 1.5 },
                },
                '& .MuiInputBase-input': { fontSize: 13, py: 0.75 },
              }}
            />
          </ListSubheader>
        ) : null}
        {filteredOptions.length === 0 ? (
          <MenuItem disabled sx={{ ...selectMenuItemSx, justifyContent: 'center', color: '#667085' }}>
            Không tìm thấy kết quả
          </MenuItem>
        ) : (
          filteredOptions.map((option) => (
            <MenuItem key={String(option.value)} value={option.value} disabled={option.disabled} sx={selectMenuItemSx}>
              {option.label}
            </MenuItem>
          ))
        )}
        {isLoadingMore ? (
          <MenuItem disabled sx={{ ...selectMenuItemSx, justifyContent: 'center' }}>
            <LoadingComponent size="small" color="#6B7280" />
          </MenuItem>
        ) : null}
      </TextField>
      {error && errorMessage ? (
        <Typography
          sx={{
            fontSize: 12,
            color: '#EF4444',
            mt: 0.5,
          }}
        >
          {errorMessage}
        </Typography>
      ) : null}
    </Box>
  );
};
