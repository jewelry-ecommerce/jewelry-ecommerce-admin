/** Mã service gửi API (`serviceCode`). */
export const PermissionServiceCode = {
  AUDIT: 'AUDIT',
  BADGE: 'BADGE',
  BANNER: 'BANNER',
  CART: 'CART',
  CMS: 'CMS',
  FILE: 'FILE',
  IAM: 'IAM',
  IMPORTEXPORT: 'IMPORTEXPORT',
  LOYALTY: 'LOYALTY',
  MEDIA: 'MEDIA',
  OMS: 'OMS',
  PAYMENT: 'PAYMENT',
  PIM: 'PIM',
  PROMOTION: 'PROMOTION',
  SHIPPING: 'SHIPPING',
} as const;

export type PermissionServiceCode = (typeof PermissionServiceCode)[keyof typeof PermissionServiceCode];

/** Nhãn tiếng Việt hiển thị cho người dùng — `value` vẫn là mã service. */
export const PERMISSION_SERVICE_CODE_LABELS: Record<PermissionServiceCode, string> = {
  [PermissionServiceCode.AUDIT]: 'Lịch sử',
  [PermissionServiceCode.BADGE]: 'Huy hiệu',
  [PermissionServiceCode.BANNER]: 'Quản lý banner',
  [PermissionServiceCode.CART]: 'Quản lý giỏ hàng',
  [PermissionServiceCode.CMS]: 'Quản lý nội dung',
  [PermissionServiceCode.FILE]: 'Quản lý tệp tin',
  [PermissionServiceCode.IAM]: 'Quản lý danh tính & phân quyền',
  [PermissionServiceCode.IMPORTEXPORT]: 'Import / Export',
  [PermissionServiceCode.LOYALTY]: 'Quản lý khách hàng thân thiết',
  [PermissionServiceCode.MEDIA]: 'Quản lý thư viện media',
  [PermissionServiceCode.OMS]: 'Quản lý đơn hàng',
  [PermissionServiceCode.PAYMENT]: 'Quản lý thanh toán',
  [PermissionServiceCode.PIM]: 'Quản lý sản phẩm (PIM)',
  [PermissionServiceCode.PROMOTION]: 'Quản lý khuyến mãi',
  [PermissionServiceCode.SHIPPING]: 'Quản lý vận chuyển',
};

export const getPermissionServiceCodeLabel = (code: PermissionServiceCode | string): string => PERMISSION_SERVICE_CODE_LABELS[code as PermissionServiceCode] ?? code;

/** `{ label: 'Đơn hàng', value: 'OMS' }` — dùng cho select/search trên UI. */
export const PERMISSION_SERVICE_CODE_SELECT_OPTIONS = (Object.values(PermissionServiceCode) as PermissionServiceCode[]).map((code) => ({
  value: code,
  label: PERMISSION_SERVICE_CODE_LABELS[code],
}));
