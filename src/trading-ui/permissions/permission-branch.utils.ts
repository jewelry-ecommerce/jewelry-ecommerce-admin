import { getTenantCodes } from '../common/config/tenant.config';
import { getBranchCodeFromTenant } from '../router/dashboard-sidebar.nav';

export type PermissionBranchIdentity = {
  code?: string;
  tenantCode?: string;
  name?: string;
};

const findTenantByCode = (code: string): string | undefined => {
  const upper = code.trim().toUpperCase();
  if (!upper) return undefined;
  return getTenantCodes().find((tenant) => tenant.toUpperCase() === upper);
};

const findTenantBySuffix = (suffix: string): string | undefined => {
  const upper = suffix.trim().toUpperCase();
  if (!upper) return undefined;
  return getTenantCodes().find((tenant) => tenant.toUpperCase().endsWith(`-${upper}`));
};

const inferTenantFromBrandName = (brandName: string): string | undefined => {
  const slug = brandName
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '');
  if (!slug) return undefined;

  const exact = findTenantByCode(slug);
  if (exact) return exact;

  const branchSuffix = slug.match(/B\d+$/)?.[0];
  if (branchSuffix) {
    const fromSuffix = findTenantBySuffix(branchSuffix);
    if (fromSuffix) return fromSuffix;
  }

  return slug;
};

/**
 * Mã branch dùng trong permission phải khớp tenant header (VITE_TENANT_CODES).
 * Chuẩn hóa legacy B1/B2 + tên thương hiệu HEARTLOCK → HEARTLOCK, SEVA-RETAIL-B1, …
 */
export const normalizePermissionBranchCode = (input: PermissionBranchIdentity): string => {
  const tenant = input.tenantCode?.trim();
  if (tenant) {
    const matched = findTenantByCode(tenant);
    if (matched) return getBranchCodeFromTenant(matched);
  }

  const code = input.code?.trim().toUpperCase() ?? '';
  if (code) {
    const exactTenant = findTenantByCode(code);
    if (exactTenant) return getBranchCodeFromTenant(exactTenant);

    const suffixTenant = findTenantBySuffix(code);
    if (suffixTenant) return getBranchCodeFromTenant(suffixTenant);
  }

  if (input.name?.trim()) {
    const fromName = inferTenantFromBrandName(input.name);
    if (fromName) {
      const matched = findTenantByCode(fromName);
      if (matched) return getBranchCodeFromTenant(matched);
    }
  }

  return code;
};

export const permissionBranchCodesMatch = (left: PermissionBranchIdentity, right: PermissionBranchIdentity): boolean => normalizePermissionBranchCode(left) === normalizePermissionBranchCode(right);

export const permissionBranchMatchesTenant = (branch: PermissionBranchIdentity, tenantBranchCode: string): boolean => {
  const tenantKey = getBranchCodeFromTenant(tenantBranchCode);
  if (!tenantKey) return false;
  return normalizePermissionBranchCode(branch) === tenantKey;
};
