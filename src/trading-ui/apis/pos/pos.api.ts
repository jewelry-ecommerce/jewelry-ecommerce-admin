import type { UpdatePosStoreOperatingHoursDto } from './pos.interface';
 
import { axiosRequest } from '../../common/config/axios.config';
import { WMS_API_BASE, type BaseResponseWithData, type PaginatedResultResponse } from '../../common/constant/ware-house/api-base-response.interface';
import type { PosStore, PosStoreDevice, PosStoreStaff, PosOperatingDay } from './pos.entities';
import { PosStoreProperty, PosStoreStatus, type PosStoreType } from './pos.enum';
import type {
  AssignPosStoreStaffDto,
  BulkAssignPosStoreStaffDto,
  BulkUpdatePosStoreStaffDto,
  ClonePosStoreDto,
  CreatePosStoreDeviceDto,
  CreatePosStoreDto,
  CurrentWarehouse,
  PosStoreListResponse,
  QueryPosStoreDto,
  UpdatePosStoreDeviceDto,
  UpdatePosStoreDto,
  UpdatePosStoreStatusDto,
} from './pos.interface';

const POS_STORES = 'pos/pos/stores';

type WarehouseRawResponse = Omit<PosStore, 'type' | 'status' | 'property' | 'startAt' | 'endAt' | 'createdAt'> & {
  type: number;
  status: number;
  property?: number;
  startAt?: number | null;
  endAt?: number | null;
  createdOn?: number | null;
};

/** Unix seconds (BE) → ISO string cho TextDateInput / formatDate. */
const unixToDateString = (ts?: number | null): string | null => {
  if (ts == null || !Number.isFinite(ts) || ts <= 0) return null;
  return new Date(ts * 1000).toISOString();
};

/** Unix seconds (BE) → ISO string cho formatDateTime. */
const unixToIsoString = (ts?: number | null): string => {
  if (ts == null || !Number.isFinite(ts) || ts <= 0) return '';
  return new Date(ts * 1000).toISOString();
};

import { toUnixTimestamp } from '../../common/utils/date-format.util';

/**
 * ISO Date String (from UI) → Unix seconds (BE).
 * Trả undefined khi rỗng/không hợp lệ để field bị bỏ khỏi payload thay vì gửi 0.
 */
const dateStringToUnix = (value: string | null | undefined, _boundary: 'start' | 'end'): number | undefined => toUnixTimestamp(value);

const mapWarehouseToPosStore = (item: WarehouseRawResponse): PosStore => {
  if (!item) return item as unknown as PosStore;

  let operatingHours: PosOperatingDay[] = [];
  const rawHours = (item as Record<string, unknown>).operatingHours;

  const normalizeKeys = (arr: unknown[]) => {
    return arr.map((item) => {
      const d = item as Record<string, unknown>;
      const shiftsArr = Array.isArray(d.shifts) ? d.shifts : Array.isArray(d.Shifts) ? d.Shifts : [];
      return {
        dayOfWeek: d.dayOfWeek ?? d.DayOfWeek ?? d.weekday,
        isOpen: d.isOpen ?? d.IsOpen ?? false,
        openTime: d.openTime ?? d.OpenTime ?? null,
        closeTime: d.closeTime ?? d.CloseTime ?? null,
        shifts: shiftsArr.map((shiftItem) => {
          const s = shiftItem as Record<string, unknown>;
          return {
            name: s.name ?? s.Name,
            startTime: s.startTime ?? s.StartTime,
            endTime: s.endTime ?? s.EndTime,
          };
        }),
      };
    }) as unknown as PosOperatingDay[];
  };

  if (typeof rawHours === 'string') {
    try {
      const parsed = JSON.parse(rawHours);
      const parsedObj = parsed as Record<string, unknown>;
      const arr = Array.isArray(parsed) ? parsed : (parsedObj.days as unknown[]) || [];
      operatingHours = normalizeKeys(arr);
    } catch {
      operatingHours = [];
    }
  } else if (rawHours && typeof rawHours === 'object') {
    const rawObj = rawHours as Record<string, unknown>;
    const arr = Array.isArray(rawObj) ? rawObj : (rawObj.days as unknown[]) || [];
    operatingHours = normalizeKeys(arr);
  }

  return {
    ...item,
    operatingHours,
    type: item.type as PosStoreType,
    status: item.status as PosStoreStatus,
    property: (item.property ?? PosStoreProperty.STORE) as PosStoreProperty,
    startAt: unixToDateString(item.startAt) ?? undefined,
    endAt: unixToDateString(item.endAt) ?? undefined,
    rawStartAt: typeof item.startAt === 'number' ? item.startAt : undefined,
    rawEndAt: typeof item.endAt === 'number' ? item.endAt : undefined,
    createdAt: unixToIsoString(item.createdOn),
    staffAssignments: item.staffAssignments ?? [],
  };
};

const unwrapWarehouse = (response: BaseResponseWithData<WarehouseRawResponse>): PosStore => mapWarehouseToPosStore(response?.data ?? (response as unknown as WarehouseRawResponse));

export const getPosStoreList = async (dto: QueryPosStoreDto): Promise<PosStoreListResponse> => {
  const payload = { ...dto };

  const response = (await axiosRequest.post(`${WMS_API_BASE}warehouses/filter`, payload)) as PaginatedResultResponse<WarehouseRawResponse>;

  const list = (response?.list ?? []).map(mapWarehouseToPosStore);
  return { list, total: response?.total ?? list.length };
};

export const getPosStoreDetail = async (id: string): Promise<PosStore> => {
  const response = (await axiosRequest.get(`${WMS_API_BASE}warehouses/${id}`)) as BaseResponseWithData<WarehouseRawResponse>;
  const store = unwrapWarehouse(response);

  try {
    const staffRes = (await axiosRequest.get(`${POS_STORES}/${id}/staff`)) as BaseResponseWithData<PosStoreStaff[]>;
    const staffList = staffRes?.data ?? (staffRes as unknown as PosStoreStaff[]);
    if (Array.isArray(staffList)) {
      store.staffAssignments = staffList;
    }
  } catch (error) {
    console.error('Failed to load POS staff assignments:', error);
  }

  return store;
};

export const createPosStore = async (dto: CreatePosStoreDto): Promise<PosStore> => {
  const payload = {
    ...dto,
    status: dto.status ?? PosStoreStatus.INACTIVE,
    property: dto.property ?? PosStoreProperty.STORE,
    startAt: dateStringToUnix(dto.startAt, 'start'),
    endAt: dateStringToUnix(dto.endAt, 'end'),
    brand: dto.brand ?? 'SEVAGO',
  };
  const response = (await axiosRequest.post(`${WMS_API_BASE}warehouses`, payload)) as BaseResponseWithData<WarehouseRawResponse>;

  return unwrapWarehouse(response);
};

export const updatePosStore = async (id: string, dto: UpdatePosStoreDto): Promise<PosStore> => {
  const payload = {
    ...dto,
    startAt: dateStringToUnix(dto.startAt, 'start'),
    endAt: dateStringToUnix(dto.endAt, 'end'),
  };
  const response = (await axiosRequest.patch(`${WMS_API_BASE}warehouses/${id}`, payload)) as BaseResponseWithData<WarehouseRawResponse>;

  return unwrapWarehouse(response);
};

export const updatePosStoreStatus = async (id: string, dto: UpdatePosStoreStatusDto): Promise<PosStore> => {
  const response = (await axiosRequest.patch(`${WMS_API_BASE}warehouses/${id}/status`, {
    status: dto.status,
  })) as BaseResponseWithData<WarehouseRawResponse>;

  return unwrapWarehouse(response);
};

export const clonePosStore = async (id: string, dto: ClonePosStoreDto): Promise<PosStore> => {
  const response = (await axiosRequest.post(`${WMS_API_BASE}warehouses/${id}/clone`, dto)) as BaseResponseWithData<WarehouseRawResponse>;

  return unwrapWarehouse(response);
};

export const assignStaffPosStore = async (id: string, dto: AssignPosStoreStaffDto): Promise<void> => {
  await axiosRequest.post(`${POS_STORES}/${id}/staff`, dto);
};

/** Gán nhiều nhân sự cùng lúc — POST :warehouseId/staff/bulk. */
export const bulkAssignStaffPosStore = async (id: string, dto: BulkAssignPosStoreStaffDto): Promise<void> => {
  await axiosRequest.post(`${POS_STORES}/${id}/staff/bulk`, dto);
};

/** Cập nhật nhiều nhân sự cùng lúc — PATCH :warehouseId/staff/bulk. */
export const bulkUpdateStaffPosStore = async (id: string, dto: BulkUpdatePosStoreStaffDto): Promise<void> => {
  await axiosRequest.patch(`${POS_STORES}/${id}/staff/bulk`, dto);
};
export const removeStaffPosStore = async (id: string, staffId: string): Promise<void> => {
  await axiosRequest.delete(`${POS_STORES}/${id}/staff/${staffId}`);
};

// ─── Device (Máy POS) APIs ────────────────────────────────────────────────────

/** Lấy danh sách thiết bị của điểm bán — GET pos/pos/stores/:storeId/devices */
export const getPosStoreDevices = async (storeId: string): Promise<PosStoreDevice[]> => {
  const response = (await axiosRequest.get(`${POS_STORES}/${storeId}/devices`)) as PosStoreDevice[] | { data: PosStoreDevice[] } | null;
  if (Array.isArray(response)) return response;
  if (response && 'data' in response && Array.isArray(response.data)) return response.data;
  return [];
};

/** Thêm thiết bị vào điểm bán — POST pos/pos/stores/:storeId/devices */
export const addPosStoreDevice = async (storeId: string, dto: CreatePosStoreDeviceDto): Promise<PosStoreDevice> => {
  const response = (await axiosRequest.post(`${POS_STORES}/${storeId}/devices`, dto)) as PosStoreDevice | { data: PosStoreDevice };
  if (response && 'data' in response) return response.data;
  return response as PosStoreDevice;
};

/** Cập nhật thiết bị — PATCH pos/pos/stores/:storeId/devices/:deviceId */
export const updatePosStoreDevice = async (storeId: string, deviceId: string, dto: UpdatePosStoreDeviceDto): Promise<PosStoreDevice> => {
  const response = (await axiosRequest.patch(`${POS_STORES}/${storeId}/devices/${deviceId}`, dto)) as PosStoreDevice | { data: PosStoreDevice };
  if (response && 'data' in response) return response.data;
  return response as PosStoreDevice;
};

/** Xóa thiết bị khỏi điểm bán — DELETE pos/pos/stores/:storeId/devices/:deviceId */
export const removePosStoreDevice = async (storeId: string, deviceId: string): Promise<void> => {
  await axiosRequest.delete(`${POS_STORES}/${storeId}/devices/${deviceId}`);
};

/** Cập nhật giờ vận hành — PATCH pos/pos/stores/:storeId/operating-hours */
export const updatePosStoreOperatingHours = async (storeId: string, dto: UpdatePosStoreOperatingHoursDto): Promise<void> => {
  await axiosRequest.patch(`${POS_STORES}/${storeId}/operating-hours`, dto);
};

/** Kho/điểm bán của người dùng đang đăng nhập — GET /warehouses/current. */
export const getCurrentWarehouse = async (): Promise<CurrentWarehouse> => {
  return (await axiosRequest.get(`${WMS_API_BASE}warehouses/current`)) as CurrentWarehouse;
};
