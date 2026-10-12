import { axiosRequest } from '../../common/config/axios.config';
import type { PosShiftAdminDetail, PosShiftAdminExportDto, PosShiftAdminExportResponse, PosShiftAdminFilterDto, PosShiftAdminListResponse, PosShiftDeviceOption } from './pos-shift.interface';

/** pos-service `admin/pos-shifts` qua gateway admin (prefix `pos`). */
const POS_SHIFT_ADMIN = 'pos/admin/pos-shifts';

/**
 * Timeout riêng (mặc định axios 30s): ca đang mở phải lấy doanh thu live từ OMS theo từng lô cửa hàng tuần tự
 * (mỗi lần gọi OMS tối đa 10s + 1 lần thử lại). Khi OMS chậm, BE vẫn trả 200 với `liveUnavailable` sau hơn 30s —
 * FE phải chờ đủ lâu để hiện số liệu trống thay vì báo lỗi timeout.
 */
export const POS_SHIFT_ADMIN_LIST_TIMEOUT_MS = 120_000;
export const POS_SHIFT_ADMIN_DETAIL_TIMEOUT_MS = 60_000;
/** Xuất tối đa 10.000 dòng, có thể trải trên hàng trăm cửa hàng. */
export const POS_SHIFT_ADMIN_EXPORT_TIMEOUT_MS = 300_000;

/** BE trả thẳng body; vẫn chấp nhận dạng `{ data: T }` như các API POS khác. */
const unwrapData = <T>(response: unknown): T => {
  if (response && typeof response === 'object' && 'data' in response && (response as { data?: unknown }).data !== undefined) {
    return (response as { data: T }).data;
  }
  return response as T;
};

/** Danh sách ca bán theo bộ lọc — POST pos/admin/pos-shifts/filter */
export const filterPosShifts = async (dto: PosShiftAdminFilterDto): Promise<PosShiftAdminListResponse> => {
  const response = unwrapData<PosShiftAdminListResponse | null>(await axiosRequest.post(`${POS_SHIFT_ADMIN}/filter`, dto, { timeout: POS_SHIFT_ADMIN_LIST_TIMEOUT_MS }));
  return {
    total: response?.total ?? 0,
    page: response?.page ?? dto.page ?? 1,
    take: response?.take ?? dto.take ?? 20,
    list: Array.isArray(response?.list) ? response.list : [],
  };
};

/** Chi tiết X-Report của một ca — GET pos/admin/pos-shifts/:shiftId */
export const getPosShiftDetail = async (shiftId: string): Promise<PosShiftAdminDetail> => {
  return unwrapData<PosShiftAdminDetail>(await axiosRequest.get(`${POS_SHIFT_ADMIN}/${encodeURIComponent(shiftId)}`, { timeout: POS_SHIFT_ADMIN_DETAIL_TIMEOUT_MS }));
};

/** Toàn bộ dòng khớp bộ lọc để xuất Excel (BE chặn > 10.000 dòng) — POST pos/admin/pos-shifts/export */
export const exportPosShifts = async (dto: PosShiftAdminExportDto): Promise<PosShiftAdminExportResponse> => {
  const response = unwrapData<PosShiftAdminExportResponse | null>(await axiosRequest.post(`${POS_SHIFT_ADMIN}/export`, dto, { timeout: POS_SHIFT_ADMIN_EXPORT_TIMEOUT_MS }));
  return {
    total: response?.total ?? 0,
    paymentMethods: Array.isArray(response?.paymentMethods) ? response.paymentMethods : [],
    rows: Array.isArray(response?.rows) ? response.rows : [],
  };
};

/** Máy POS của nhiều cửa hàng (gồm máy đã xóa) — POST pos/admin/pos-shifts/devices */
export const getPosShiftDevices = async (warehouseIds: string[]): Promise<PosShiftDeviceOption[]> => {
  if (!warehouseIds.length) return [];
  const response = unwrapData<PosShiftDeviceOption[] | null>(await axiosRequest.post(`${POS_SHIFT_ADMIN}/devices`, { warehouseIds }));
  return Array.isArray(response) ? response : [];
};
