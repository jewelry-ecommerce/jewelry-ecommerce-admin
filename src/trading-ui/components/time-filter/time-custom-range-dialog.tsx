import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link, Popover, Stack, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import type { PickerValidDate } from '@mui/x-date-pickers/models';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import { useCallback, useMemo, useState } from 'react';
import { viDayOfWeekFormatter } from '../../common/utils';
import { CustomButton } from '../../components/button';
import { formLabelSx, textDateInputSx } from '../form/form-field.styles';

const DATETIME_FMT = 'DD/MM/YYYY HH:mm:ss';
const TIME_FMT = 'HH:mm:ss';

const outlinedButtonSx = {
  height: 40,
  px: 1.75,
  borderColor: '#D0D5DD',
  color: '#111827',
  backgroundColor: '#FFFFFF',
  textTransform: 'none',
  borderRadius: 2,
  fontSize: 13,
  fontWeight: 600,
  '&:hover': {
    borderColor: '#94A3B8',
    backgroundColor: '#F8FAFC',
  },
};

const containedButtonSx = {
  height: 40,
  px: 1.75,
  backgroundColor: '#111827',
  color: '#FFFFFF',
  textTransform: 'none',
  borderRadius: 2,
  fontSize: 13,
  fontWeight: 700,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#0B1220',
    boxShadow: 'none',
  },
};

const combineDateAndTime = (date: Dayjs | null, time: Dayjs | null, fallback: 'start' | 'end'): Dayjs | null => {
  if (!date) return null;
  if (time && time.isValid()) {
    return date.hour(time.hour()).minute(time.minute()).second(time.second()).millisecond(0);
  }
  return fallback === 'start' ? date.startOf('day') : date.endOf('day');
};

const placeholder = (value: Dayjs | null) => (value ? value.format(DATETIME_FMT) : 'dd/mm/yyyy hh:mm:ss');

type RangeTuple = [Dayjs | null, Dayjs | null];

const useRangeDaySlot = (rangeStart: Dayjs | null, rangeEnd: Dayjs | null, onSelectDay: (d: Dayjs) => void) => {
  const SELECTED_BG = '#1F2937';
  const HOVER_BG = '#111827';
  const BETWEEN_BG = '#F3F4F6';
  const BETWEEN_HOVER_BG = '#E5E7EB';

  return useMemo(() => {
    const RangeDay = (props: PickersDayProps) => {
      const { day, outsideCurrentMonth, sx: daySx, ...rest } = props;
      const d = dayjs(day as PickerValidDate).startOf('day');
      const start = rangeStart?.startOf('day') ?? null;
      const end = rangeEnd?.startOf('day') ?? null;

      const isStart = Boolean(start && d.isSame(start, 'day'));
      const isEnd = Boolean(end && d.isSame(end, 'day'));
      const sameDay = isStart && isEnd;
      const inBetween = Boolean(start && end && d.isAfter(start, 'day') && d.isBefore(end, 'day'));

      return (
        <PickersDay
          {...rest}
          day={day}
          outsideCurrentMonth={outsideCurrentMonth}
          onDaySelect={() => onSelectDay(d)}
          selected={isStart || isEnd}
          sx={[
            sameDay ? { borderRadius: 1.5, bgcolor: SELECTED_BG, color: '#fff', '&:hover': { bgcolor: HOVER_BG } } : null,
            !sameDay && inBetween ? { borderRadius: 0, bgcolor: BETWEEN_BG, '&:hover': { bgcolor: BETWEEN_HOVER_BG } } : null,
            !sameDay && isStart ? { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 } : null,
            !sameDay && isEnd ? { borderTopRightRadius: 8, borderBottomRightRadius: 8 } : null,
            !sameDay && isEnd && !isStart ? { bgcolor: SELECTED_BG, color: '#fff', '&:hover': { bgcolor: HOVER_BG } } : null,
            !sameDay && isStart && !isEnd ? { border: `2px solid ${SELECTED_BG}`, bgcolor: '#fff', color: SELECTED_BG } : null,
            ...(daySx != null ? (Array.isArray(daySx) ? daySx : [daySx]) : []),
          ]}
        />
      );
    };
    return RangeDay;
  }, [rangeStart, rangeEnd, onSelectDay]);
};

interface DualMonthRangeCalendarsProps {
  pickerStart: Dayjs | null;
  pickerEnd: Dayjs | null;
  onRangeTupleChange: (updater: RangeTuple | ((prev: RangeTuple) => RangeTuple)) => void;
  leftMonth: Dayjs;
  onLeftMonthChange: (m: Dayjs) => void;
}

const DualMonthRangeCalendars = ({ pickerStart, pickerEnd, onRangeTupleChange, leftMonth, onLeftMonthChange }: DualMonthRangeCalendarsProps) => {
  const handleDaySelect = useCallback(
    (date: Dayjs) => {
      const d = date.startOf('day');
      onRangeTupleChange((prev) => {
        const [start, end] = prev;
        if (!start || (start && end)) {
          return [d, null];
        }
        if (d.isBefore(start)) {
          return [d, start];
        }
        return [start, d];
      });
    },
    [onRangeTupleChange],
  );

  const RangeDay = useRangeDaySlot(pickerStart, pickerEnd, handleDaySelect);
  const rightMonth = leftMonth.add(1, 'month');

  const calendarSx = {
    maxWidth: 320,
    '& .MuiPickersCalendarHeader-label': { fontSize: 14, fontWeight: 600 },
    '& .MuiPickersDay-root.Mui-selected': {
      backgroundColor: '#1F2937 !important',
      color: '#FFFFFF !important',
      '&:hover': { backgroundColor: '#111827 !important' },
    },
    '& .MuiPickersDay-today': { borderColor: '#1F2937 !important' },
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center' }}>
      <DateCalendar
        referenceDate={leftMonth}
        onMonthChange={(m) => onLeftMonthChange(dayjs(m))}
        value={null}
        onChange={() => {}}
        views={['day']}
        showDaysOutsideCurrentMonth
        slots={{ day: RangeDay }}
        dayOfWeekFormatter={viDayOfWeekFormatter}
        sx={calendarSx}
      />
      <DateCalendar
        referenceDate={rightMonth}
        onMonthChange={(m) => onLeftMonthChange(dayjs(m).subtract(1, 'month'))}
        value={null}
        onChange={() => {}}
        views={['day']}
        showDaysOutsideCurrentMonth
        slots={{ day: RangeDay }}
        dayOfWeekFormatter={viDayOfWeekFormatter}
        sx={calendarSx}
      />
    </Stack>
  );
};

export interface OrderTimeCustomRangeDialogProps {
  open: boolean;
  initialRange: { from: Dayjs; to: Dayjs } | null;
  onClose: () => void;
  onApply: (range: { from: Dayjs; to: Dayjs }) => void;
}

export const OrderTimeCustomRangeDialog = ({ open, initialRange, onClose, onApply }: OrderTimeCustomRangeDialogProps) => {
  const [fieldFrom, setFieldFrom] = useState<Dayjs | null>(null);
  const [fieldTo, setFieldTo] = useState<Dayjs | null>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);
  const [snapshotRange, setSnapshotRange] = useState<RangeTuple>([null, null]);
  const [pickerRange, setPickerRange] = useState<RangeTuple>([null, null]);
  const [timeStart, setTimeStart] = useState<Dayjs | null>(null);
  const [timeEnd, setTimeEnd] = useState<Dayjs | null>(null);
  const [snapshotTime, setSnapshotTime] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [leftMonth, setLeftMonth] = useState(() => dayjs().startOf('month'));
  const [pickerStart, pickerEnd] = pickerRange;

  const syncDialogState = useCallback(() => {
    const from = initialRange?.from ?? null;
    const to = initialRange?.to ?? null;
    setFieldFrom(from);
    setFieldTo(to);
    setCalendarAnchor(null);
    setPickerRange([from, to]);
    setSnapshotRange([from, to]);
    setTimeStart(from ?? null);
    setTimeEnd(to ?? null);
    setSnapshotTime([from ?? null, to ?? null]);
    setLeftMonth((from ?? dayjs()).startOf('month'));
  }, [initialRange]);

  const calendarOpen = Boolean(calendarAnchor);

  const openCalendar = (anchor: HTMLElement) => {
    const snap: RangeTuple = [fieldFrom, fieldTo];
    setSnapshotRange(snap);
    setPickerRange(snap);
    const sTimeStart = fieldFrom ?? null;
    const sTimeEnd = fieldTo ?? null;
    setTimeStart(sTimeStart);
    setTimeEnd(sTimeEnd);
    setSnapshotTime([sTimeStart, sTimeEnd]);
    setLeftMonth((snap[0] ?? dayjs()).startOf('month'));
    setCalendarAnchor(anchor);
  };

  const onRangeTupleChange = useCallback((updater: RangeTuple | ((prev: RangeTuple) => RangeTuple)) => {
    setPickerRange((prev) => (typeof updater === 'function' ? (updater as (p: RangeTuple) => RangeTuple)(prev) : updater));
  }, []);

  const applyPickerToFields = () => {
    const [from, to] = pickerRange;
    if (!from || !to) return;
    const resolvedFrom = combineDateAndTime(from, timeStart, 'start');
    const resolvedTo = combineDateAndTime(to, timeEnd, 'end');
    setFieldFrom(resolvedFrom);
    setFieldTo(resolvedTo);
    setCalendarAnchor(null);
  };

  const cancelPicker = () => {
    setPickerRange(snapshotRange);
    setTimeStart(snapshotTime[0]);
    setTimeEnd(snapshotTime[1]);
    setCalendarAnchor(null);
  };

  const handleDialogApply = () => {
    if (!fieldFrom || !fieldTo) return;
    if (fieldFrom.isAfter(fieldTo)) {
      onApply({ from: fieldTo, to: fieldFrom });
      return;
    }
    onApply({ from: fieldFrom, to: fieldTo });
  };

  const effectivePickerFrom = useMemo(() => combineDateAndTime(pickerStart, timeStart, 'start'), [pickerStart, timeStart]);
  const effectivePickerTo = useMemo(() => combineDateAndTime(pickerEnd, timeEnd, 'end'), [pickerEnd, timeEnd]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        TransitionProps={{
          onEnter: syncDialogState,
        }}
        slotProps={{
          paper: {
            sx: { borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)' },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Chọn khoảng thời gian</Typography>
          <IconButton aria-label="Đóng" onClick={onClose} size="small" sx={{ color: '#64748B' }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography sx={formLabelSx}>Từ ngày</Typography>
              <DateTimeField
                format={DATETIME_FMT}
                value={fieldFrom}
                onChange={(next) => {
                  setFieldFrom(next);
                  if (!next) setFieldTo(null);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    placeholder: 'dd/mm/yyyy hh:mm:ss',
                    onClick: (ev) => openCalendar(ev.currentTarget as HTMLElement),
                    sx: textDateInputSx,
                  },
                }}
              />
            </Box>
            <Box>
              <Typography sx={formLabelSx}>Đến ngày</Typography>
              <DateTimeField
                format={DATETIME_FMT}
                value={fieldTo}
                onChange={(next) => setFieldTo(next)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    placeholder: 'dd/mm/yyyy hh:mm:ss',
                    onClick: (ev) => openCalendar(ev.currentTarget as HTMLElement),
                    sx: textDateInputSx,
                  },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0, gap: 1 }}>
          <CustomButton fullWidth={false} variant="outline" onClick={onClose} sx={outlinedButtonSx}>
            Hủy
          </CustomButton>
          <CustomButton fullWidth={false} variant="primary" disabled={!fieldFrom || !fieldTo} onClick={handleDialogApply} sx={containedButtonSx}>
            Áp dụng
          </CustomButton>
        </DialogActions>

        <Popover
          open={calendarOpen}
          anchorEl={calendarAnchor}
          onClose={cancelPicker}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                p: 2,
                borderRadius: 3,
                border: '1px solid #E5E7EB',
                boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
                maxWidth: 'min(720px, calc(100vw - 32px))',
                zIndex: (theme) => theme.zIndex.modal + 2,
              },
            },
          }}
        >
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
              Từ ngày:{' '}
              <Box component="span" sx={{ color: '#111827', fontWeight: 600 }}>
                {placeholder(effectivePickerFrom)}
              </Box>{' '}
              — Đến ngày:{' '}
              <Box component="span" sx={{ color: '#111827', fontWeight: 600 }}>
                {placeholder(effectivePickerTo)}
              </Box>
            </Typography>
            <DualMonthRangeCalendars pickerStart={pickerStart} pickerEnd={pickerEnd} onRangeTupleChange={onRangeTupleChange} leftMonth={leftMonth} onLeftMonthChange={setLeftMonth} />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 1.5,
                backgroundColor: '#F8FAFC',
                borderRadius: 2,
                border: '1px solid #E2E8F0',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Thời gian (Giờ:Phút:Giây):</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TimeField
                  format={TIME_FMT}
                  value={timeStart ?? dayjs().startOf('day')}
                  onChange={(next) => setTimeStart(next)}
                  size="small"
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        width: 110,
                        '& .MuiInputBase-input': { py: 0.75, px: 1, fontSize: 13, textAlign: 'center' },
                        '& .MuiOutlinedInput-root': { borderRadius: 1.5, backgroundColor: '#FFFFFF' },
                      },
                    },
                  }}
                />
                <Typography sx={{ color: '#94A3B8', fontSize: 13 }}>—</Typography>
                <TimeField
                  format={TIME_FMT}
                  value={timeEnd ?? dayjs().endOf('day')}
                  onChange={(next) => setTimeEnd(next)}
                  size="small"
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        width: 110,
                        '& .MuiInputBase-input': { py: 0.75, px: 1, fontSize: 13, textAlign: 'center' },
                        '& .MuiOutlinedInput-root': { borderRadius: 1.5, backgroundColor: '#FFFFFF' },
                      },
                    },
                  }}
                />
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1 }}>
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() => setLeftMonth(dayjs().startOf('month'))}
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#111827',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  p: 0,
                }}
              >
                Hôm nay
              </Link>
              <Stack direction="row" spacing={1}>
                <CustomButton fullWidth={false} variant="outline" onClick={cancelPicker} sx={outlinedButtonSx}>
                  Huỷ
                </CustomButton>
                <CustomButton fullWidth={false} variant="primary" disabled={!pickerStart || !pickerEnd} onClick={applyPickerToFields} sx={containedButtonSx}>
                  Áp dụng
                </CustomButton>
              </Stack>
            </Stack>
          </Stack>
        </Popover>
      </Dialog>
    </LocalizationProvider>
  );
};
