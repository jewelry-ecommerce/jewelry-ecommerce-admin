import type { PermissionBrand, PermissionBundlePayload } from '../pages/permission/permission.types';
import { parsePermissionBundleImport } from '../pages/permission/permission.utils';
import { getBranchCodeFromTenant } from '../router/dashboard-sidebar.nav';
import { buildPermissionCode, parsePermissionCode } from './permission-code.utils';
import { normalizePermissionBranchCode } from './permission-branch.utils';

export { getBranchCodeFromTenant, normalizePermissionBranchCode };

export type PermissionSnapshot = {
  brands: PermissionBrand[];
  permissions: Set<string>;
  branchCodes: string[];
  apiCodes: Set<string>;
};

const emptyPermissionSnapshot = (): PermissionSnapshot => ({
  brands: [],
  permissions: new Set<string>(),
  branchCodes: [],
  apiCodes: new Set<string>(),
});

export const buildPermissionSnapshotFromBundle = (payload?: PermissionBundlePayload | null): PermissionSnapshot | null => {
  if (!payload) return null;
  if (!Array.isArray(payload.branches) || payload.branches.length === 0) {
    return emptyPermissionSnapshot();
  }
  const parsed = parsePermissionBundleImport(payload);
  if (!parsed) return emptyPermissionSnapshot();

  const permissions = new Set<string>();
  const apiCodes = new Set<string>();
  parsed.brands.forEach((brand) => {
    brand.menus.forEach((menu) => {
      menu.tabs.forEach((tab) => {
        tab.actions.forEach((action) => {
          permissions.add(buildPermissionCode(brand.code, menu.code, tab.code, action.code));
          action.apiCodes.forEach((apiCode) => {
            if (apiCode) apiCodes.add(apiCode);
          });
        });
      });
    });
  });

  const branchCodes = parsed.brands.map((brand) => brand.code);
  return { brands: parsed.brands, permissions, branchCodes, apiCodes };
};

const toPermissionCodeString = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  const row = value as Record<string, unknown>;
  const candidates = [row.code, row.permissionCode, row.key, row.permission, row.path];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return '';
};

export const buildPermissionSnapshotFromCodes = (codes: unknown[]): PermissionSnapshot => {
  const permissionCodes = Array.isArray(codes) ? codes.map(toPermissionCodeString).filter(Boolean) : [];
  const permissions = new Set<string>(permissionCodes);
  const branchCodes = Array.from(new Set(permissionCodes.map((code) => parsePermissionCode(code)?.branchCode).filter((branchCode): branchCode is string => Boolean(branchCode))));
  return { brands: [], permissions, branchCodes, apiCodes: new Set<string>() };
};

export const hasPermissionPrefix = (permissions: Set<string>, prefix: string): boolean => {
  if (!prefix) return false;
  for (const code of permissions) {
    if (code.startsWith(prefix)) return true;
  }
  return false;
};
