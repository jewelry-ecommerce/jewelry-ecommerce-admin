import dayjs, { type Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import type {
  PosShiftAdminDetail,
  PosShiftAdminExportDto,
  PosShiftAdminFilterDto,
  PosShiftCashTransaction,
  PosShiftCloseReconStatus,
  PosShiftDeviceOption,
  PosShiftLifecycleStatus,
  PosShiftReconStatus,
} from '../../../apis/pos/pos-shift.interface';
import { OrderTimeFilter } from '../../../apis/order/order.enum';
import { formatCurrency } from '../../../common/utils/number.utils';
import {
  POS_SHIFT_EXPORT_TOO_LARGE_CODE,
  POS_SHIFT_KEYWORD_MAX_LENGTH,
  POS_SHIFT_MAX_RANGE_DAYS,
  POS_SHIFT_NOW_LABEL,
  POS_SHIFT_OPEN_LABEL,
  POS_SHIFT_PAYMENT_METHOD_DISPLAY_LABEL,
  POS_SHIFT_SELECT_PLACEHOLDER,
} from './pos-shift.constants';

dayjs.extend(utc);
dayjs.extend(timezone);

/** Ngày kinh doanh POS tính theo giờ Việt Nam (khớp POS_BUSINESS_TIMEZONE phía BE). */
export const POS_SHIFT_TZ = 'Asia/Ho_Chi_Minh';

const BUSINESS_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Khoảng ngày kinh doanh `YYYY-MM-DD` (gồm cả hai đầu). */
export type PosShiftDateRange = { from: string; to: string };

/** Cửa hàng đã chọn — giữ cả tên để chip không mất nhãn khi đổi từ khóa tìm kiếm. */
export type PosShiftStoreOption = { id: string; code: string; name: string };

/** Bộ lọc nâng cao (dialog) — không chọn = tất cả. Từ khóa tìm kiếm nằm trên toolbar (`keyword`). */
export type PosShiftAdvancedFilters = {
  stores: PosShiftStoreOption[];
  deviceIds: string[];
  openReconStatuses: Array<Exclude<PosShiftReconStatus, 'NONE'>>;
  closeReconStatuses: PosShiftCloseReconStatus[];
};

export const POS_SHIFT_INITIAL_ADVANCED_FILTERS: PosShiftAdvancedFilters = {
  stores: [],
  deviceIds: [],
  openReconStatuses: [],
  closeReconStatuses: [],
};

/** Điều kiện lọc của danh sách (không gồm phân trang) — dùng chung cho `filter` và `export`. */
export type PosShiftListQuery = {
  range: PosShiftDateRange;
  filters: PosShiftAdvancedFilters;
  keyword: string;
};

const nowInBusinessTz = (now?: Date | Dayjs): Dayjs => dayjs(now ?? new Date()).tz(POS_SHIFT_TZ);

export const getPosShiftTodayRange = (now?: Date | Dayjs): PosShiftDateRange => {
  const today = nowInBusinessTz(now).format('YYYY-MM-DD');
  return { from: today, to: today };
};

/** Preset nhanh trên toolbar → khoảng ngày kinh doanh; `CUSTOM` do dialog chọn ngày xử lý. */
export const resolvePosShiftDatePreset = (preset: OrderTimeFilter, now?: Date | Dayjs): PosShiftDateRange | null => {
  const today = nowInBusinessTz(now).startOf('day');
  const fmt = (d: Dayjs) => d.format('YYYY-MM-DD');
  switch (preset) {
    case OrderTimeFilter.TODAY:
      return { from: fmt(today), to: fmt(today) };
    case OrderTimeFilter.YESTERDAY: {
      const yesterday = today.subtract(1, 'day');
      return { from: fmt(yesterday), to: fmt(yesterday) };
    }
    case OrderTimeFilter.LAST_7_DAYS:
      return { from: fmt(today.subtract(6, 'day')), to: fmt(today) };
    case OrderTimeFilter.LAST_30_DAYS:
      return { from: fmt(today.subtract(29, 'day')), to: fmt(today) };
    case OrderTimeFilter.LAST_90_DAYS:
      return { from: fmt(today.subtract(89, 'day')), to: fmt(today) };
    case OrderTimeFilter.THIS_MONTH:
      return { from: fmt(today.startOf('month')), to: fmt(today) };
    case OrderTimeFilter.LAST_MONTH: {
      const lastMonth = today.subtract(1, 'month');
      return { from: fmt(lastMonth.startOf('month')), to: fmt(lastMonth.endOf('month')) };
    }
    default:
      return null;
  }
};

/** Số ngày trong khoảng (tính cả hai đầu); NaN khi ngày sai định dạng. */
export const countPosShiftRangeDays = (range: PosShiftDateRange): number => {
  if (!BUSINESS_DATE_REGEX.test(range.from) || !BUSINESS_DATE_REGEX.test(range.to)) return Number.NaN;
  return dayjs(range.to).diff(dayjs(range.from), 'day') + 1;
};

/** Trả thông báo lỗi khi khoảng ngày không hợp lệ (BE cũng chặn bằng POS_SHIFT_INVALID_DATE_RANGE). */
export const validatePosShiftDateRange = (range: PosShiftDateRange): string | null => {
  const days = countPosShiftRangeDays(range);
  if (!Number.isFinite(days)) return 'Khoảng ngày không hợp lệ.';
  if (days < 1) return 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.';
  if (days > POS_SHIFT_MAX_RANGE_DAYS) return `Chỉ được lọc tối đa ${POS_SHIFT_MAX_RANGE_DAYS} ngày. Vui lòng thu hẹp khoảng ngày.`;
  return null;
};

/** `YYYY-MM-DD` → `DD/MM/YYYY` (cắt chuỗi, không qua Date để khỏi lệch múi giờ). */
export const formatPosShiftBusinessDate = (value?: string | null): string => {
  const match = value ? BUSINESS_DATE_REGEX.exec(value.trim()) : null;
  if (!match) return value?.trim() || '—';
  return `${match[3]}/${match[2]}/${match[1]}`;
};

export const formatPosShiftDateRangeLabel = (range: PosShiftDateRange): string => {
  const from = formatPosShiftBusinessDate(range.from);
  const to = formatPosShiftBusinessDate(range.to);
  return from === to ? from : `${from} - ${to}`;
};

/** `YYYY-MM-DD` → `YYYYMMDD` cho tên file xuất. */
export const toPosShiftCompactDate = (value: string): string => value.replace(/-/g, '');

const toBusinessTz = (value?: string | null): Dayjs | null => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.tz(POS_SHIFT_TZ) : null;
};

/** ISO → `pattern` theo giờ Việt Nam; '—' khi rỗng/không hợp lệ. */
export const formatPosShiftDateTime = (value: string | null | undefined, pattern = 'HH:mm DD/MM/YYYY'): string => toBusinessTz(value)?.format(pattern) ?? '—';

/**
 * Thời gian ca: `HH:mm DD/MM - HH:mm DD/MM`; ca chưa đóng thì vế sau là `openLabel`
 * (danh sách: "Đang mở", tiêu đề trang chi tiết: "Hiện tại").
 */
export const formatPosShiftTimeRange = (openedAt: string | null | undefined, closedAt: string | null | undefined, openLabel: string = POS_SHIFT_OPEN_LABEL): string => {
  const open = formatPosShiftDateTime(openedAt, 'HH:mm DD/MM');
  const close = closedAt ? formatPosShiftDateTime(closedAt, 'HH:mm DD/MM') : openLabel;
  return `${open} - ${close}`;
};

type PosShiftTimeSource = { openedAt: string | null | undefined; closedAt: string | null | undefined; lifecycleStatus: PosShiftLifecycleStatus };

/** Thời gian ca trên trang chi tiết: ca chưa đóng kết thúc bằng "Hiện tại"; ca đã đóng mà thiếu giờ đóng thì "—". */
export const formatPosShiftDetailTimeRange = (shift: PosShiftTimeSource): string =>
  shift.lifecycleStatus === 'CLOSED' ? formatPosShiftTimeRange(shift.openedAt, shift.closedAt, '—') : formatPosShiftTimeRange(shift.openedAt, null, POS_SHIFT_NOW_LABEL);

/** Tiêu đề trang chi tiết: `Thời gian ca: 08:30 16/09 - Hiện tại` (ca mở) / `... - 18:00 16/09` (ca đóng). */
export const formatPosShiftDetailTitle = (shift: PosShiftTimeSource): string => `Thời gian ca: ${formatPosShiftDetailTimeRange(shift)}`;

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/** Số nguyên có dấu chấm ngăn cách hàng nghìn, giữ dấu âm; null khi không phải số. */
const formatThousands = (value: unknown): string | null => {
  if (!isFiniteNumber(value)) return null;
  const abs = formatCurrency(Math.abs(Math.trunc(value)));
  return `${value < 0 ? '-' : ''}${abs}`;
};

/** Số tiền trên bảng danh sách: `5.000.000` (không ký hiệu tiền tệ); '—' khi chưa có số liệu. */
export const formatPosShiftListMoney = (value: number | null | undefined): string => formatThousands(value) ?? '—';

/** Số tiền trên trang chi tiết: `3.100.000 đ`; '—' khi chưa có số liệu (vd. OMS lỗi). */
export const formatPosShiftMoney = (value: number | null | undefined): string => {
  const text = formatThousands(value);
  return text === null ? '—' : `${text} đ`;
};

/** Chênh lệch có dấu: `+500 đ`, `-20.000 đ`, `0 đ`. */
export const formatPosShiftSignedMoney = (value: number | null | undefined): string => {
  if (!isFiniteNumber(value)) return '—';
  if (value > 0) return `+${formatPosShiftMoney(value)}`;
  return formatPosShiftMoney(value);
};

/**
 * Một dòng của "Dòng tiền mặt": khoản cộng vào két `+3.100.000 đ`, khoản trừ `-200.000 đ`
 * (BE trả số dương cho cả hai chiều); 0 thì không kèm dấu.
 */
export const formatPosShiftCashFlowAmount = (value: number | null | undefined, direction: 'in' | 'out'): string => {
  if (!isFiniteNumber(value)) return '—';
  const amount = Math.abs(value);
  if (amount === 0) return formatPosShiftMoney(0);
  return `${direction === 'in' ? '+' : '-'}${formatPosShiftMoney(amount)}`;
};

/** Thu ngân trên danh sách / chi tiết: `MÃ - Tên` — thiếu phần nào thì bỏ phần đó. */
export const formatPosShiftCashierLabel = (name?: string | null, code?: string | null): string => {
  const n = name?.trim() ?? '';
  const c = code?.trim() ?? '';
  if (n && c) return `${c} - ${n}`;
  return n || c || '—';
};

/** Chữ cái cho avatar thu ngân: chữ đầu của tên riêng (từ cuối họ tên); không có tên thì lấy mã. */
export const getPosShiftCashierInitial = (name?: string | null, code?: string | null): string => {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const source = words[words.length - 1] || code?.trim() || '';
  return source ? source.charAt(0).toLocaleUpperCase('vi-VN') : '?';
};

/** Máy POS trên danh sách: chỉ mã terminal (vd. `POS-01`). */
export const formatPosShiftTerminal = (terminalCode?: string | null, deviceName?: string | null): string => terminalCode?.trim() || deviceName?.trim() || '—';

/** Máy POS trên trang chi tiết: tên máy, chưa đặt tên thì dùng mã terminal. */
export const formatPosShiftDeviceName = (deviceName?: string | null, terminalCode?: string | null): string => deviceName?.trim() || terminalCode?.trim() || '—';

/** Nhãn phương thức thanh toán trên trang chi tiết; mã chưa có trong bảng nhãn thì dùng nhãn BE trả về. */
export const getPosShiftPaymentMethodLabel = (method: string, apiLabel?: string | null): string => POS_SHIFT_PAYMENT_METHOD_DISPLAY_LABEL[method] ?? (apiLabel?.trim() || method);

/** `Tên (Mã)` — thiếu phần nào thì bỏ phần đó (định dạng cột Thu ngân trong file Excel). */
export const formatPosShiftCashier = (name?: string | null, code?: string | null): string => {
  const n = name?.trim() ?? '';
  const c = code?.trim() ?? '';
  if (n && c) return `${n} (${c})`;
  return n || c || '—';
};

/** Máy POS: `Tên máy (TERMINAL)` — máy chưa có tên thì chỉ hiện mã terminal. */
export const formatPosShiftDevice = (deviceName?: string | null, terminalCode?: string | null): string => {
  const name = deviceName?.trim() ?? '';
  const code = terminalCode?.trim() ?? '';
  if (name && code && name.toUpperCase() !== code.toUpperCase()) return `${name} (${code})`;
  return name || code || '—';
};

export const buildPosShiftDeviceLabel = (device: PosShiftDeviceOption): string => {
  const label = formatPosShiftDevice(device.name, device.terminalCode);
  return device.deleted ? `${label} · Đã xóa` : label;
};

/** Số điều kiện đang bật trong dialog Bộ lọc (không tính ô tìm kiếm và khoảng ngày). */
export const countActivePosShiftFilters = (filters: PosShiftAdvancedFilters): number =>
  [filters.stores.length > 0, filters.stores.length > 0 && filters.deviceIds.length > 0, filters.openReconStatuses.length > 0, filters.closeReconStatuses.length > 0].filter(Boolean).length;

/** Từ khóa gửi BE: bỏ khoảng trắng thừa, tối đa 100 ký tự. */
export const normalizePosShiftKeyword = (keyword: string | null | undefined): string => (keyword ?? '').trim().slice(0, POS_SHIFT_KEYWORD_MAX_LENGTH).trim();

/** Body `export` = điều kiện lọc hiện tại, không phân trang; chỉ gửi field có giá trị. */
export const buildPosShiftExportBody = ({ range, filters, keyword }: PosShiftListQuery): PosShiftAdminExportDto => {
  const normalizedKeyword = normalizePosShiftKeyword(keyword);
  return {
    businessDateFrom: range.from,
    businessDateTo: range.to,
    ...(filters.stores.length > 0 ? { warehouseIds: filters.stores.map((store) => store.id) } : {}),
    ...(filters.stores.length > 0 && filters.deviceIds.length > 0 ? { deviceIds: [...filters.deviceIds] } : {}),
    ...(filters.openReconStatuses.length > 0 ? { openReconStatuses: [...filters.openReconStatuses] } : {}),
    ...(filters.closeReconStatuses.length > 0 ? { closeReconStatuses: [...filters.closeReconStatuses] } : {}),
    ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
  };
};

export const buildPosShiftFilterBody = (query: PosShiftListQuery, page: number, take: number): PosShiftAdminFilterDto => ({
  ...buildPosShiftExportBody(query),
  page,
  take,
});

/**
 * Chỉ giữ máy POS thuộc các cửa hàng đang chọn. SWR `keepPreviousData` trả danh sách máy của bộ cửa hàng trước
 * trong lúc tải (hoặc khi tải lỗi) bộ mới — không lọc thì ô Máy POS hiện máy của cửa hàng khác.
 */
export const selectPosShiftDevicesForStores = (devices: PosShiftDeviceOption[] | null | undefined, warehouseIds: string[]): PosShiftDeviceOption[] => {
  if (!devices?.length || !warehouseIds.length) return [];
  const allowedStores = new Set(warehouseIds);
  return devices.filter((device) => allowedStores.has(device.warehouseId));
};

/** Giữ lại máy POS thuộc các cửa hàng còn được chọn (bỏ chọn cửa hàng thì bỏ luôn máy của nó). */
export const prunePosShiftDeviceIds = (deviceIds: string[], devices: PosShiftDeviceOption[], warehouseIds: string[]): string[] => {
  const allowedDevices = new Set(selectPosShiftDevicesForStores(devices, warehouseIds).map((device) => device.deviceId));
  return deviceIds.filter((id) => allowedDevices.has(id));
};

export const POS_SHIFT_DEVICES_LOAD_ERROR = 'Không tải được danh sách máy POS. Vui lòng thử lại.';

/** Placeholder ô Máy POS theo trạng thái tải danh sách máy. */
export const resolvePosShiftDevicePlaceholder = (state: { hasStores: boolean; isLoading: boolean; hasError: boolean }): string => {
  if (!state.hasStores) return 'Chọn cửa hàng trước';
  if (state.hasError) return 'Không tải được máy POS';
  if (state.isLoading) return 'Đang tải máy POS...';
  return POS_SHIFT_SELECT_PLACEHOLDER;
};

/**
 * Dòng/tổng hiển thị trên bảng. Khi request của bộ lọc hiện tại lỗi, SWR `keepPreviousData` vẫn trả dữ liệu
 * của bộ lọc trước — không hiện để khỏi đọc nhầm thành số liệu của bộ lọc mới.
 */
export const resolvePosShiftListView = <T>(state: { data?: { list?: T[] | null; total?: number | null } | null; error?: unknown }): { rows: T[]; totalItems: number } => {
  if (state.error) return { rows: [], totalItems: 0 };
  return { rows: state.data?.list ?? [], totalItems: state.data?.total ?? 0 };
};

/**
 * Từ khóa tìm cửa hàng theo `onInputChange` của MUI Autocomplete: gõ phím thì cập nhật; khi MUI xóa ô nhập
 * (chọn/bỏ option, blur, clear, reset → '') thì về '' để danh sách không còn lọc theo từ khóa cũ.
 */
export const resolvePosShiftStoreKeyword = (current: string, nextInput: string, reason: string): string => (reason === 'input' || nextInput === '' ? nextInput : current);

export type PosShiftExportTooLargeError = { code: typeof POS_SHIFT_EXPORT_TOO_LARGE_CODE; total?: number; limit?: number };

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object';

/** Lỗi 422 POS_SHIFT_EXPORT_TOO_LARGE — axios interceptor reject bằng `error.response.data` (đôi khi bọc thêm `response`). */
export const getPosShiftExportTooLargeError = (error: unknown): PosShiftExportTooLargeError | null => {
  if (!isRecord(error)) return null;
  const candidates = [error, error.response, isRecord(error.response) ? error.response.data : undefined, error.data];
  for (const candidate of candidates) {
    if (isRecord(candidate) && candidate.code === POS_SHIFT_EXPORT_TOO_LARGE_CODE) {
      return {
        code: POS_SHIFT_EXPORT_TOO_LARGE_CODE,
        total: isFiniteNumber(candidate.total) ? candidate.total : undefined,
        limit: isFiniteNumber(candidate.limit) ? candidate.limit : undefined,
      };
    }
  }
  return null;
};

export const buildPosShiftExportTooLargeMessage = (error: PosShiftExportTooLargeError): string => {
  const total = isFiniteNumber(error.total) ? formatCurrency(error.total) : null;
  const limit = isFiniteNumber(error.limit) ? formatCurrency(error.limit) : null;
  const detail = total && limit ? ` (${total} ca, tối đa ${limit} ca)` : limit ? ` (tối đa ${limit} ca)` : '';
  return `Số ca cần xuất quá lớn${detail}. Vui lòng thu hẹp bộ lọc rồi thử lại.`;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** BE kiểm tra `:shiftId` là UUID (400 nếu sai) — FE chặn trước để hiện "Không tìm thấy ca". */
export const isPosShiftId = (value: string | null | undefined): value is string => Boolean(value && UUID_REGEX.test(value.trim()));

/** 404 / POS_SHIFT_NOT_FOUND (ca không tồn tại hoặc thuộc tenant khác). */
export const isPosShiftNotFoundError = (error: unknown): boolean => {
  if (!isRecord(error)) return false;
  const candidates = [error, error.response, isRecord(error.response) ? error.response.data : undefined, error.data];
  return candidates.some((candidate) => isRecord(candidate) && (candidate.code === 'POS_SHIFT_NOT_FOUND' || candidate.statusCode === 404 || candidate.status === 404));
};

/** Lịch sử nộp/rút tiền mặt: BE hiện không trả (chưa có nộp/rút két) → mảng rỗng. */
export const getPosShiftCashTransactions = (detail: Pick<PosShiftAdminDetail, 'cashTransactions'> | null | undefined): PosShiftCashTransaction[] =>
  Array.isArray(detail?.cashTransactions) ? detail.cashTransactions.filter((item) => item && (item.type === 'CASH_IN' || item.type === 'CASH_OUT')) : [];
