import type { PosDayOfWeek, PosDeviceType, PosStaffRole, PosStoreProperty, PosStoreStatus, PosStoreType } from './pos.enum';

/**
 * Shape dùng trong UI. BE (WMS `warehouses`) trả enum dạng số và thời gian dạng Unix seconds —
 * `pos.api.ts` quy đổi ở ranh giới API nên các field dưới đây giữ nguyên kiểu thân thiện với UI.
 */
export interface PosStore {
  id: string;
  code: string;
  name: string;
  type: PosStoreType;
  status: PosStoreStatus;
  property: PosStoreProperty;
  brand: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  address: string;
  phone?: string;
  /** YYYY-MM-DD cho UI — quy đổi từ Unix seconds của BE trong pos.api.ts. */
  startAt?: string | null;
  endAt?: string | null;
  /** Unix timestamp gốc để hiển thị list có kèm giờ. */
  rawStartAt?: number | null;
  rawEndAt?: number | null;
  description?: string | null;
  /** ISO string cho UI — quy đổi từ `createdOn` (Unix seconds) của BE. */
  createdAt: string;
  operatingHours?: PosOperatingDay[];
  staffAssignments?: PosStoreStaff[];
}

export interface PosOperatingHour {
  id?: string;
  weekday: PosDayOfWeek;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface PosStoreStaff {
  id: string;
  employeeId: string;
  role: PosStaffRole;
  /** Object nhân viên lồng (nếu BE trả kèm). */
  employee?: {
    id?: string;
    code?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phone?: string;
    avatarUrl?: string | null;
    url?: string | null;
  } | null;
  /** Field phẳng — BE lưu từ payload assign (employeeName/employeeCode/phone). */
  employeeName?: string | null;
  employeeCode?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  url?: string | null;
}

/** UI tab giờ (có ca) — chưa persist BE. */
export interface PosOperatingShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface PosOperatingDay {
  dayOfWeek: PosDayOfWeek;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  shifts: PosOperatingShift[];
}

/** UI tab nhân sự. */
export interface PosStaffAssignment {
  id: string;
  userId: string;
  userCode: string;
  fullName: string;
  phone: string;
  role: PosStaffRole;
  avatarUrl?: string | null;
}

/** Thiết bị gắn với điểm bán (tab Máy POS). */
export interface PosStoreDevice {
  id: string;
  terminalCode: string;
  name: string;
  deviceType: PosDeviceType;
  note?: string | null;
}
