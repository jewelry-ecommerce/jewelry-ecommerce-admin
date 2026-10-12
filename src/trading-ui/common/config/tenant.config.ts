import { getRuntimePublicEnv } from './runtime-config';

export type TenantCode = string;

const TENANT_CODE_STORAGE_KEY = 'x-tenant-code';

// VITE_TENANT_CODES được Vite bake vào bundle lúc build — parse một lần.
const TENANT_CODES: TenantCode[] = getRuntimePublicEnv('VITE_TENANT_CODES')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

export const getTenantCodes = (): TenantCode[] => TENANT_CODES;

export const getDefaultTenantCode = (): TenantCode => TENANT_CODES[0] ?? '';

export const isValidTenantCode = (code: string): code is TenantCode => TENANT_CODES.includes(code.trim());

/** Hiển thị tenant cho UI (bỏ dấu `-` trong mã). */
export const formatTenantDisplayLabel = (code: TenantCode): string => code.replace(/-/g, ' ').trim();

/**
 * Giá trị gợi ý trên form đăng nhập — không ghi localStorage.
 * Ưu tiên tenant đã chọn lần trước (nếu còn hợp lệ), ngược lại tenant đầu từ env.
 */
export const getLoginPrefillTenantCode = (): TenantCode => {
  const active = getTenantCodeHeader();
  if (active) return active;
  return getDefaultTenantCode();
};

/**
 * Trả về tenant đang dùng cho header API (chỉ đọc localStorage, không tự ghi mặc định).
 * Tenant được persist khi user chọn trên màn đăng nhập.
 */
export const getTenantCodeHeader = (): TenantCode => {
  if (typeof window === 'undefined') return '';

  const stored = localStorage.getItem(TENANT_CODE_STORAGE_KEY)?.trim() ?? '';
  if (stored && TENANT_CODES.includes(stored)) return stored;

  if (stored) {
    // Env đổi / mã cũ không còn hợp lệ → xóa để tránh gửi header sai.
    localStorage.removeItem(TENANT_CODE_STORAGE_KEY);
  }

  return '';
};

export const setTenantCodeHeader = (tenantCode: TenantCode): void => {
  if (typeof window === 'undefined' || !isValidTenantCode(tenantCode)) return;
  localStorage.setItem(TENANT_CODE_STORAGE_KEY, tenantCode);
};

/** Đã chọn tenant hợp lệ (dùng sau đăng nhập). */
export const hasActiveTenantCode = (): boolean => Boolean(getTenantCodeHeader());

/** @deprecated Dùng `TenantCode` */
export type TenantCodeEnum = TenantCode;
