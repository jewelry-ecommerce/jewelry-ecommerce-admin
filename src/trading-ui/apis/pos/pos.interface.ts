import type { ResList } from '../../common/constant/api.interface';
import { type BaseFilterQuery } from '../../common/constant/ware-house/wms-base.interface';
import type { PosStore } from './pos.entities';
import type { PosStaffRole, PosStoreProperty, PosStoreStatus, PosStoreType } from './pos.enum';

export type PosStoreListResponse = ResList<PosStore>;

export type WarehouseRawResponse = Omit<PosStore, 'type' | 'status' | 'property' | 'startAt' | 'endAt' | 'createdAt'> & {
  type: number | string;
  status: number | string;
  property?: number | string;
  startAt?: number | null;
  endAt?: number | null;
  createdOn?: number | null;
};

export interface QueryPosStoreDto extends BaseFilterQuery {
  type?: PosStoreType;
  status?: PosStoreStatus;
  property?: PosStoreProperty | number;
  brand?: string;
}

export interface CurrentWarehouse {
  warehouseId: string;
  warehouseCode?: string | null;
  isResolvedFromToken: boolean;
  property?: PosStoreProperty | null;
}

export interface CreatePosStoreDto {
  code?: string;
  name: string;
  type: PosStoreType;
  /** BE bắt buộc. Bỏ trống thì pos.api.ts mặc định STORE (màn này tạo cửa hàng, không phải kho tổng). */
  property?: PosStoreProperty | number;
  brand?: string;
  status?: PosStoreStatus;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  address: string;
  phone?: string;
  startAt: string;
  endAt?: string;
  description?: string;
}

export type UpdatePosStoreDto = Partial<CreatePosStoreDto>;

export interface UpdatePosStoreStatusDto {
  status: PosStoreStatus.ACTIVE | PosStoreStatus.INACTIVE | PosStoreStatus.MAINTENANCE;
}

export interface ClonePosStoreDto {
  sourceWarehouseId: string;
  name: string;
  code?: string;
  startAt?: number;
  endAt?: number;
}

export interface AssignPosStoreStaffDto {
  employeeId: string;
  employeeCode?: string;
  employeeName?: string;
  phone?: string;
  role: PosStaffRole;
}

/** Bulk assign nhiều nhân sự cùng lúc — POST :warehouseId/staff/bulk. */
export interface BulkAssignPosStoreStaffDto {
  staff: AssignPosStoreStaffDto[];
}

/** Một dòng cập nhật trong bulk update — bắt buộc staffId, các field còn lại optional. */
export interface BulkUpdatePosStoreStaffItem {
  staffId: string;
  role?: PosStaffRole;
  phone?: string;
  employeeName?: string;
  employeeCode?: string;
}

/** Bulk update nhiều nhân sự cùng lúc — PATCH :warehouseId/staff/bulk. */
export interface BulkUpdatePosStoreStaffDto {
  staff: BulkUpdatePosStoreStaffItem[];
}

/** Tạo thiết bị mới gắn với điểm bán. */
export interface CreatePosStoreDeviceDto {
  terminalCode: string;
  name: string;
  deviceType: string;
  note?: string;
}

/** Cập nhật thiết bị gắn với điểm bán. */
export type UpdatePosStoreDeviceDto = Partial<CreatePosStoreDeviceDto>;

export interface UpdatePosStoreOperatingHoursDto {
  days: {
    dayOfWeek: number;
    isOpen: boolean;
    openTime?: string | null;
    closeTime?: string | null;
    isCrossDay?: boolean;
    shifts?: {
      name: string;
      startTime: string;
      endTime: string;
    }[];
  }[];
}
