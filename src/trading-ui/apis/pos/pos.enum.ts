export enum PosStoreStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  MAINTENANCE = 3,
}

export enum PosStoreType {
  FIXED = 1,
  POPUP = 2,
}

export enum PosStoreProperty {
  MAIN = 1,
  STORE = 2,
  ONLINE = 3,
}

/** Khớp BE PosStoreStaffRole. */
export enum PosStaffRole {
  SALES = 'Sales',
  DISCOUNT_APPROVER = 'DiscountApprover',
  MANAGER = 'Manager',
}

/** Loại thiết bị POS. */
export enum PosDeviceType {
  POS = 'POS',
  KIOSK = 'KIOSK',
  TABLET = 'TABLET',
  OTHER = 'OTHER',
}

/** 1=Mon … 7=Sun — khớp BE PosWeekday. */
export enum PosDayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}
