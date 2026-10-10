import { Box, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Calendar } from '@untitledui/icons';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { FocusEventHandler } from 'react';
import { useMemo } from 'react';
import { STORED_DATE_FORMAT, STORED_DATE_TIME_FORMAT, viDayOfWeekFormatter } from '../../common/utils/date-format.util';
import { formLabelSx, textDateInputSx } from './form-field.styles';

dayjs.extend(customParseFormat);

const DISPLAY_DATE_FMT = 'DD/MM/YYYY';
const VI_LOCALE = {
  cancelButtonLabel: 'Hủy',
  clearButtonLabel: 'Xóa',
  okButtonLabel: 'Lưu',
  todayButtonLabel: 'Hôm nay',
  datePickerToolbarTitle: 'Chọn ngày',
  dateTimePickerToolbarTitle: 'Chọn ngày giờ',
  timePickerToolbarTitle: 'Chọn giờ',
  previousMonth: 'Tháng trước',
  nextMonth: 'Tháng sau',
};

const DISPLAY_DATE_TIME_FMT = 'DD/MM/YYYY HH:mm';

type TextDateInputMode = 'date' | 'dateTime';

const parseStored = (s: string, mode: TextDateInputMode): Dayjs | null => {
  if (!s?.trim()) return null;
  const candidates = mode === 'dateTime' ? buildDateTimeCandidates(s) : buildDateCandidates(s);
  for (const [fmt, val] of candidates) {
    const d = dayjs(val, fmt, true);
    if (d.isValid()) return d;
  }
  if (mode === 'dateTime') {
    const isoDate = dayjs(s);
    if (isoDate.isValid()) return isoDate;
  }
  return null;
};

const buildDateCandidates = (value: string): Array<[string, string]> => [
  [STORED_DATE_FORMAT, value],
  ['DD/MM/YYYY', value],
  ['D/M/YYYY', value],
];

const buildDateTimeCandidates = (value: string): Array<[string, string]> => [
  [STORED_DATE_TIME_FORMAT, value],
  ['YYYY-MM-DD HH:mm', value],
  ['DD/MM/YYYY HH:mm', value],
  ['D/M/YYYY HH:mm', value],
  ['YYYY-MM-DDTHH:mm:ss.SSSZ', value],
];

export type TextDateInputInputProps = {
  label?: string;
  requiredMark?: boolean;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  minDate?: string;
  maxDate?: string;
  mode?: TextDateInputMode;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

export const TextDateInput = ({
  label,
  requiredMark = false,
  value,
  onChange,
  placeholder = 'VD: 23/12/2026',
  disabled = false,
  error = false,
  errorMessage,
  minDate,
  maxDate,
  mode = 'date',
  onBlur,
  onFocus,
}: TextDateInputInputProps) => {
  const dateValue = useMemo(() => parseStored(value, mode), [mode, value]);
  const minDateValue = useMemo(() => (minDate ? parseStored(minDate, mode) : null), [minDate, mode]);
  const maxDateValue = useMemo(() => (maxDate ? parseStored(maxDate, mode) : null), [maxDate, mode]);
  const dateTimeReference = useMemo(() => {
    if (dateValue && (!minDateValue || !dateValue.isBefore(minDateValue))) return dateValue;
    return minDateValue ?? dayjs();
  }, [dateValue, minDateValue]);
  const fieldSlotProps = buildDateFieldSlotProps({ placeholder, error, errorMessage, onBlur, onFocus });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
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
        {mode === 'dateTime' ? (
          <DateTimePicker
            localeText={VI_LOCALE}
            dayOfWeekFormatter={viDayOfWeekFormatter}
            value={dateValue}
            referenceDate={dateTimeReference}
            onChange={(d) => {
              if (!d) {
                onChange('');
                return;
              }
              const next = minDateValue && d.isBefore(minDateValue) ? minDateValue : d;
              onChange(next.format(STORED_DATE_TIME_FORMAT));
            }}
            disabled={disabled}
            minDateTime={minDateValue ?? undefined}
            maxDateTime={maxDateValue ?? undefined}
            format={DISPLAY_DATE_TIME_FMT}
            ampm={false}
            slots={{ openPickerIcon: Calendar }}
            slotProps={fieldSlotProps}
          />
        ) : (
          <DatePicker
            localeText={VI_LOCALE}
            dayOfWeekFormatter={viDayOfWeekFormatter}
            value={dateValue}
            onChange={(d) => onChange(d ? d.format(STORED_DATE_FORMAT) : '')}
            disabled={disabled}
            minDate={minDateValue ?? undefined}
            maxDate={maxDateValue ?? undefined}
            format={DISPLAY_DATE_FMT}
            views={['year', 'month', 'day']}
            slots={{ openPickerIcon: Calendar }}
            slotProps={fieldSlotProps}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};

const buildDateFieldSlotProps = ({ placeholder, error, errorMessage, onBlur, onFocus }: Pick<TextDateInputInputProps, 'placeholder' | 'error' | 'errorMessage' | 'onBlur' | 'onFocus'>) => ({
  openPickerButton: {
    size: 'small' as const,
    sx: {
      color: '#6B7280',
      '& svg': { width: 20, height: 20, display: 'block' },
    },
  },
  textField: {
    size: 'small' as const,
    fullWidth: true,
    placeholder,
    error,
    helperText: error ? errorMessage : undefined,
    onBlur,
    onFocus,
    sx: textDateInputSx,
  },
  yearButton: {
    sx: {
      '&.Mui-selected': {
        backgroundColor: '#1F2937 !important',
        color: '#FFFFFF !important',
        '&:hover, &:focus': { backgroundColor: '#111827 !important' },
      },
    },
  },
  monthButton: {
    sx: {
      '&.Mui-selected': {
        backgroundColor: '#1F2937 !important',
        color: '#FFFFFF !important',
        '&:hover, &:focus': { backgroundColor: '#111827 !important' },
      },
    },
  },
  desktopPaper: {
    sx: {
      borderRadius: 2,
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #E5E7EB',
      ...pickerPaperSx,
    },
  },
  mobilePaper: {
    sx: pickerPaperSx,
  },
});

const pickerPaperSx = {
  '& .MuiPickersDay-root': {
    borderRadius: 1.5,
    '&.Mui-selected, &.Mui-selected.Mui-selected': {
      backgroundColor: '#1F2937 !important',
      color: '#FFFFFF !important',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: '#111827 !important',
      },
    },
    '&.MuiPickersDay-today': {
      borderColor: '#1F2937 !important',
    },
  },
  '& button.MuiPickersYear-yearButton.Mui-selected.Mui-selected, & .MuiPickersYear-root button.Mui-selected, & button.MuiPickersYear-yearButton.Mui-selected, & .MuiPickersYear-root button[aria-selected="true"]':
    {
      backgroundColor: '#1F2937 !important',
      color: '#FFFFFF !important',
      '&:hover, &:focus': {
        backgroundColor: '#111827 !important',
      },
    },
  '& button.MuiPickersMonth-monthButton.Mui-selected.Mui-selected, & .MuiPickersMonth-root button.Mui-selected, & button.MuiPickersMonth-monthButton.Mui-selected, & .MuiPickersMonth-root button[aria-selected="true"]':
    {
      backgroundColor: '#1F2937 !important',
      color: '#FFFFFF !important',
      '&:hover, &:focus': {
        backgroundColor: '#111827 !important',
      },
    },
  '& .MuiPickersLayout-root': {
    '& .MuiButton-text': {
      color: '#1F2937 !important',
      fontWeight: 600,
      '&:hover, &:focus': {
        backgroundColor: 'rgba(31, 41, 55, 0.08) !important',
      },
    },
  },
  '& .MuiClock-pin': { backgroundColor: '#1F2937 !important' },
  '& .MuiClockPointer-root': { backgroundColor: '#1F2937 !important' },
  '& .MuiClockPointer-thumb': { borderColor: '#1F2937 !important', backgroundColor: '#FFFFFF !important' },
  '& .MuiMenuItem-root.Mui-selected.Mui-selected, & .MuiMenuItem-root.Mui-selected': {
    backgroundColor: '#1F2937 !important',
    color: '#FFFFFF !important',
    '&:hover': { backgroundColor: '#111827 !important' },
  },
};
