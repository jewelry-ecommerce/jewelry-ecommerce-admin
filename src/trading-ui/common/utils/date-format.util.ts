import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const DATE_ONLY_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const TIME_ONLY_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
});

/** Values above this are Unix milliseconds; otherwise seconds (aligned with BE ParseUnixTimestamp). */
const UNIX_MS_THRESHOLD = 1_000_000_000_000;

const UNIX_DATETIME_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};

/**
 * Normalize Unix timestamp from WMS APIs (seconds or ms) to milliseconds.
 * Values below 1e12 are treated as seconds (2026 ≈ 1.77e9 s; ms ≈ 1.77e12).
 */
export const unixTimestampToMilliseconds = (ts: number): number => {
  if (!Number.isFinite(ts) || ts === 0) return 0;
  if (Math.abs(ts) < UNIX_MS_THRESHOLD) return Math.round(ts * 1000);
  return ts;
};

/** Parse optional API timestamp → ms, or null when missing/invalid. */
export const normalizeOptionalUnixTimestampMs = (v: unknown): number | null => {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' && Number.isFinite(v) ? v : Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return unixTimestampToMilliseconds(n);
};

/** Chuyển đổi Date / string / timestamp sang Unix seconds (dùng cho WMS / POS APIs). */
export const toUnixTimestamp = (val: unknown): number | undefined => {
  if (!val) return undefined;
  if (typeof val === 'number') {
    return val > 1e11 ? Math.floor(val / 1000) : val;
  }
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    if (!Number.isNaN(parsed)) return Math.floor(parsed / 1000);
  }
  if (val instanceof Date) {
    return Math.floor(val.getTime() / 1000);
  }
  return undefined;
};
/** Chuyển đổi Unix timestamp hoặc chuỗi ngày sang ISO Date String chuẩn cho UI. */
export const normalizeIsoDate = (val: unknown): string => {
  if (!val) return '';
  if (typeof val === 'number') {
    const ms = val > 1e11 ? val : val * 1000;
    return new Date(ms).toISOString();
  }
  if (typeof val === 'string' && /^\d+$/.test(val)) {
    const num = Number(val);
    const ms = num > 1e11 ? num : num * 1000;
    return new Date(ms).toISOString();
  }
  return String(val);
};

/** Format Unix timestamp (seconds or ms) for warehouse/inventory APIs. */
export const formatUnixTimestampVi = (ts?: number | null): string => {
  if (ts == null || Number.isNaN(Number(ts))) return '—';
  const n = Number(ts);
  if (n <= 0) return '—';
  const d = new Date(unixTimestampToMilliseconds(n));
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', UNIX_DATETIME_FORMAT);
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${DATE_ONLY_FORMATTER.format(date)} ${TIME_ONLY_FORMATTER.format(date)}`;
};

//viết function chỉ lấy time
export const formatTime = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};
//viết function chỉ lấy date
export const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** dayjs pattern — giá trị lưu trong form (TextDateInput value / minDate / maxDate). */
export const STORED_DATE_FORMAT = 'YYYY-MM-DD';
export const STORED_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

/** Parse giá trị form TextDateInput (STORED_DATE_TIME_FORMAT hoặc STORED_DATE_FORMAT). */
export const parseStoredDateTime = (value: string): Dayjs | null => {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const strict = dayjs(trimmed, [STORED_DATE_TIME_FORMAT, STORED_DATE_FORMAT], true);
  if (strict.isValid()) return strict;

  const fallback = dayjs(trimmed);
  return fallback.isValid() ? fallback : null;
};

/** Chuẩn hoá input form về STORED_DATE_TIME_FORMAT. */
export const normalizeStoredDateTimeInput = (value: string): string => {
  const parsed = parseStoredDateTime(value);
  return parsed ? parsed.format(STORED_DATE_TIME_FORMAT) : '';
};

/** Giá trị datetime hiện tại (hoặc cộng thêm ngày) theo format form. */
export const formatStoredDateTimeNow = (offsetDays = 0): string => dayjs().add(offsetDays, 'day').format(STORED_DATE_TIME_FORMAT);

/** ISO/API datetime → giá trị form TextDateInput. */
export const isoToStoredDateTime = (value: string | null | undefined): string => {
  if (!value?.trim()) return '';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(STORED_DATE_TIME_FORMAT) : '';
};

/** Giá trị form TextDateInput → chuỗi hiển thị DD/MM/YYYY HH:mm. */
export const formatStoredDateTimeDisplay = (value?: string | null): string => {
  if (!value?.trim()) return '-';
  const parsed = parseStoredDateTime(value);
  return parsed ? parsed.format('DD/MM/YYYY HH:mm') : value;
};

/** Giá trị form TextDateInput → ISO cho API. Date-only legacy dùng UTC start/end of day. */
export const storedDateTimeToIso = (value: string, endOfDay = false): string => {
  const parsed = parseStoredDateTime(value);
  if (!parsed) return '';

  const hasTimePart = /T\d{2}:\d{2}/.test(value.trim());
  if (hasTimePart) return parsed.toDate().toISOString();

  const utcDate = new Date(`${parsed.format(STORED_DATE_FORMAT)}T${endOfDay ? '23:59:59.000' : '00:00:00.000'}Z`);
  return Number.isNaN(utcDate.getTime()) ? '' : utcDate.toISOString();
};

export const viDayOfWeekFormatter = (date: string | { day: () => number } | null | undefined): string => {
  if (date && typeof date !== 'string') {
    return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.day()];
  }
  if (typeof date === 'string') return date;
  return '';
};
