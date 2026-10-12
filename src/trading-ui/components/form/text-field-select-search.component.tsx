import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { Box, Typography, Menu, MenuItem, Stack, InputBase, CircularProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { sanitizePlainTextInput } from './input-sanitize.util';
import { StackRowAlignCenterJustBetween } from '../styled';
import { ANIMATION_TIME } from '../../common/constant/style.constant';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';

interface StyleParams {
  isOpen: boolean;
  disabled: boolean;
  hasError: boolean;
  hasLabel: boolean;
}

const createStyles = ({ isOpen, disabled, hasError, hasLabel }: StyleParams) => {
  return {
    wrapper: {
      width: '100%',
    },
    label: {
      marginBottom: 0.75,
      color: '#27272A',
      ...TYPOGRAPHY_STYLES.base.regular,
    },
    requiredMark: {
      color: '#EF4444',
      marginLeft: 0.25,
    },
    root: {
      position: 'relative',
      width: '100%',
      height: hasLabel ? 37 : 40,
      border: '1px solid',
      borderColor: disabled ? '#E5E7EB' : hasError ? '#EF4444' : isOpen ? '#9CA3AF' : '#D1D5DB',
      borderRadius: 1.5,
      padding: '0 10px',
      transition: `all ${ANIMATION_TIME}ms ease`,
      backgroundColor: disabled ? '#F3F4F6' : '#F9FAFB',
      cursor: 'text',
      overflow: 'hidden',
      '&:hover': {
        borderColor: disabled ? '#E5E7EB' : '#9CA3AF',
      },
    },
    main: {
      flex: 1,
      height: '100%',
      display: 'flex',
      alignItems: 'stretch',
    },
    inputWrap: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    },
    inputBase: {
      width: '100%',
      color: disabled ? '#9CA3AF' : '#111827',
      ...TYPOGRAPHY_STYLES.base.regular,
      fontSize: '14px',
      '& input': {
        padding: 0,
        height: '22px',
        '&::placeholder': {
          color: '#A1A1AA',
          opacity: 1,
        },
      },
    },
    iconGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
    },
    dropdownIcon: {
      color: disabled ? '#9CA3AF' : '#6B7280',
      transition: `all ${ANIMATION_TIME}ms ease`,
      transform: isOpen ? 'rotate(180deg)' : 'none',
      fontSize: 20,
    },
    clearIcon: {
      color: '#9CA3AF',
      fontSize: 16,
      '&:hover': {
        color: '#4B5563',
      },
    },
    error: {
      marginTop: '2px',
      margin: 0,
      ...TYPOGRAPHY_STYLES.base.regular,
      fontSize: '12px',
      color: '#EF4444',
    },
    menuList: {
      maxHeight: 250,
      overflowY: 'auto',
      padding: '4px 0',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px 0',
    },
    noResult: {
      padding: '16px',
      textAlign: 'center',
      color: '#71717A',
      ...TYPOGRAPHY_STYLES.base.regular,
      fontSize: '14px',
    },
  };
};

interface Option {
  label: string;
  value: string | number;
}

interface TextFieldSelectSearchProps {
  label?: string;
  requiredMark?: boolean;
  value?: string | number;
  options: Option[];
  onSelect?: (val: string | number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  onSearch?: (val: string) => void;
  searchValue?: string;
  isLoading?: boolean;
  error?: string;
  placeholder?: string;
}

const TextFieldSelectSearchComponent = memo(function TextFieldSelectSearchComponent({
  label = '',
  requiredMark = false,
  value = '',
  options,
  onSelect,
  onBlur,
  disabled = false,
  onSearch,
  searchValue = '',
  isLoading = false,
  error,
  placeholder = 'Gõ để tìm kiếm...',
}: TextFieldSelectSearchProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpen = Boolean(anchorEl);

  const selectedOption = useMemo(() => options.find((opt) => String(opt.value) === String(value)), [options, value]);
  const [inputValue, setInputValue] = useState('');

  const hasLabel = Boolean(label?.trim());

  const classes = useMemo(
    () =>
      createStyles({
        isOpen,
        disabled,
        hasError: Boolean(error),
        hasLabel,
      }),
    [disabled, error, hasLabel, isOpen],
  );

  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else if (!value) {
      setInputValue('');
    }
  }, [selectedOption, value]);

  useEffect(() => {
    if (!selectedOption) {
      setInputValue(searchValue);
    }
  }, [searchValue, selectedOption]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setAnchorEl(containerRef.current);
    onSearch?.('');
  }, [disabled, onSearch]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    onBlur?.();
    if (!selectedOption || inputValue !== selectedOption.label) {
      setInputValue(selectedOption?.label || '');
    }
  }, [onBlur, selectedOption, inputValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = sanitizePlainTextInput(e.target.value);
      setInputValue(val);
      onSearch?.(val);
      if (!anchorEl) {
        setAnchorEl(containerRef.current);
      }
    },
    [anchorEl, onSearch],
  );

  const handleItemClick = useCallback(
    (event: React.MouseEvent, option: Option) => {
      event.stopPropagation();
      setAnchorEl(null);
      onSelect?.(option.value);
      setInputValue(option.label);
      setTimeout(() => {
        inputRef.current?.blur();
      }, 0);
    },
    [onSelect],
  );

  const handleClear = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onSelect?.('');
      setInputValue('');
      onSearch?.('');
      setTimeout(() => {
        inputRef.current?.blur();
      }, 0);
    },
    [onSelect, onSearch],
  );

  return (
    <Box sx={classes.wrapper}>
      {hasLabel ? (
        <Typography sx={classes.label}>
          {label}
          {requiredMark ? (
            <Box component="span" sx={classes.requiredMark}>
              *
            </Box>
          ) : null}
        </Typography>
      ) : null}
      <StackRowAlignCenterJustBetween
        ref={containerRef}
        sx={classes.root}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.focus();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Stack sx={classes.main} justifyContent="center">
          <Box sx={classes.inputWrap}>
            <InputBase
              inputRef={inputRef}
              sx={classes.inputBase}
              placeholder={isOpen ? placeholder : ''}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleOpen}
              disabled={disabled}
              fullWidth
              autoComplete="off"
            />
          </Box>
        </Stack>

        <Box sx={classes.iconGroup}>
          {isOpen && Boolean(inputValue) && !disabled && (
            <IconButton size="small" onClick={handleClear} sx={{ padding: '2px' }} aria-label="clear selection">
              <CloseIcon sx={classes.clearIcon} />
            </IconButton>
          )}
          <KeyboardArrowDownRoundedIcon sx={classes.dropdownIcon} />
        </Box>
      </StackRowAlignCenterJustBetween>

      {error && (
        <Typography component="div" sx={classes.error}>
          {error}
        </Typography>
      )}

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        disableScrollLock
        PaperProps={{
          style: {
            width: anchorEl ? anchorEl.clientWidth : undefined,
            marginTop: 4,
            boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
            borderRadius: '8px',
            border: '1px solid #F4F4F5',
          },
        }}
        MenuListProps={{
          sx: { padding: 0 },
          role: 'listbox',
        }}
      >
        <Box sx={classes.menuList}>
          {isLoading ? (
            <Box sx={classes.loadingContainer}>
              <CircularProgress size={24} sx={{ color: '#171717' }} />
            </Box>
          ) : options.length > 0 ? (
            options.map((option) => (
              <MenuItem
                key={option.value}
                role="option"
                aria-selected={String(option.value) === String(value)}
                selected={String(option.value) === String(value)}
                onClick={(e) => handleItemClick(e, option)}
                sx={{
                  padding: '10px 12px',
                  ...TYPOGRAPHY_STYLES.base.regular,
                  fontSize: '14px',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(23, 23, 23, 0.08)',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(23, 23, 23, 0.12)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(23, 23, 23, 0.04)',
                  },
                }}
              >
                {option.label}
              </MenuItem>
            ))
          ) : (
            <Typography sx={classes.noResult}>Không có kết quả</Typography>
          )}
        </Box>
      </Menu>
    </Box>
  );
});

export default TextFieldSelectSearchComponent;
