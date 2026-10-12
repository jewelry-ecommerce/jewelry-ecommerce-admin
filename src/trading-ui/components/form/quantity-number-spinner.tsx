import { Box, CircularProgress, IconButton, InputBase, Stack, Typography } from '@mui/material';
import { useCallback, useState } from 'react';

/** Gọn: không giãn full width; gap 8px; viền xám; bo 8px */
const segmentBorder = '1px solid #E0E0E0';
const radius = '8px';
const btnSize = 32;
const centerWidth = 52;
const gapPx = 1; // 8px

export interface QuantityNumberSpinnerProps {
  value: number;
  min?: number;
  max: number;
  onCommit: (next: number) => void;
  disabled?: boolean;
  incrementLoading?: boolean;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * Number spinner: [−] 8px [ô số] 8px [+] — IconButton + InputBase (MUI).
 */
export const QuantityNumberSpinner = ({ value, min = 1, max, onCommit, disabled = false, incrementLoading = false }: QuantityNumberSpinnerProps) => {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // useEffect(() => {
  //   if (!focused) setDraft(String(value));
  // }, [value, focused]);

  const atMin = value <= min;
  const atMax = value >= max;
  const blockDec = disabled || atMin;
  const blockInput = disabled || incrementLoading;

  const commitDraft = useCallback(() => {
    const parsed = Number.parseInt(String(draft).replace(/\D/g, ''), 10);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = clamp(parsed, min, max);
    setDraft(String(next));
    if (next !== value) onCommit(next);
  }, [draft, value, min, max, onCommit]);

  const applyMinus = () => {
    if (blockDec) return;
    onCommit(Math.max(min, value - 1));
  };

  const applyPlus = () => {
    if (disabled || atMax || incrementLoading) return;
    onCommit(Math.min(max, value + 1));
  };

  const btnSx = {
    width: btnSize,
    height: btnSize,
    p: 0,
    px: '5px',
    flexShrink: 0,
    border: segmentBorder,
    borderRadius: radius,
    bgcolor: '#FFFFFF',
    color: '#000000',
    boxSizing: 'border-box' as const,
    '&.Mui-disabled': { opacity: 0.45, border: segmentBorder },
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        gap: gapPx,
        width: 'fit-content',
        maxWidth: '100%',
        flexShrink: 0,
      }}
    >
      <IconButton
        type="button"
        disabled={blockDec}
        onClick={applyMinus}
        aria-label="Giảm số lượng"
        disableRipple
        sx={{
          ...btnSx,
          '&:hover': { bgcolor: blockDec ? '#FFFFFF' : '#FAFAFA' },
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1,
            color: '#000000',
            userSelect: 'none',
          }}
        >
          −
        </Typography>
      </IconButton>

      <InputBase
        value={focused ? draft : String(value)}
        onChange={(e) => {
          setDraft(e.target.value.replace(/[^\d]/g, ''));
        }}
        onFocus={() => {
          setFocused(true);
          setDraft(String(value));
        }}
        onBlur={() => {
          setFocused(false);
          commitDraft();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        disabled={blockInput}
        inputProps={{
          'aria-label': 'Số lượng',
          inputMode: 'numeric',
          style: {
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 14,
            padding: 0,
            color: '#000000',
          },
        }}
        sx={{
          flex: '0 0 auto',
          width: centerWidth,
          minWidth: centerWidth,
          maxWidth: centerWidth,
          height: btnSize,
          px: '8px',
          border: segmentBorder,
          borderRadius: radius,
          bgcolor: '#FFFFFF',
          boxSizing: 'border-box',
          '& .MuiInputBase-input': {
            py: 0,
            height: '100%',
            display: 'block',
          },
          '&.Mui-disabled': { opacity: 0.45 },
        }}
      />

      <IconButton
        type="button"
        disabled={disabled || atMax || incrementLoading}
        onClick={applyPlus}
        aria-label="Tăng số lượng"
        disableRipple
        sx={{
          ...btnSx,
          '&:hover': { bgcolor: disabled || atMax || incrementLoading ? '#FFFFFF' : '#FAFAFA' },
        }}
      >
        {incrementLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1, height: 1 }}>
            <CircularProgress size={16} thickness={4} sx={{ color: '#000000' }} />
          </Box>
        ) : (
          <Typography
            component="span"
            sx={{
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1,
              color: '#000000',
              userSelect: 'none',
            }}
          >
            +
          </Typography>
        )}
      </IconButton>
    </Stack>
  );
};
