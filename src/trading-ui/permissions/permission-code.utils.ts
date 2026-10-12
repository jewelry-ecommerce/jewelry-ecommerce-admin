/** Mã permission/action — tách file nhỏ để runtime gate không kéo catalog IAM nặng. */

export type PermissionCodeParts = {
  branchCode: string;
  menuCode: string;
  tabCode: string;
  actionCode: string;
};

export const buildPermissionCode = (branchCode: string, menuCode: string, tabCode: string, actionCode: string): string => `perm.${branchCode}.${menuCode}.${tabCode}.${actionCode}`;

export const parsePermissionCode = (permissionCode: string): PermissionCodeParts | null => {
  if (!permissionCode || !permissionCode.startsWith('perm.')) return null;
  const parts = permissionCode.split('.').filter(Boolean);
  if (parts.length < 5) return null;
  const branchCode = parts[1];
  const actionCode = parts[parts.length - 1];
  const menuCode = parts[2];
  const tabCode = parts.slice(3, -1).join('.');
  if (!branchCode || !menuCode || !tabCode || !actionCode) return null;
  return { branchCode, menuCode, tabCode, actionCode };
};

export const buildPermissionItemKey = (menuCode: string, tabCode: string, actionCode: string): string => `${menuCode}.${tabCode}.${actionCode}`;

export const parsePermissionItemKey = (key: string): { menuCode: string; tabCode: string; actionCode: string } | null => {
  const parts = key.split('.').filter(Boolean);
  if (parts.length < 3) return null;
  const actionCode = parts[parts.length - 1];
  const menuCode = parts[0];
  const tabCode = parts.slice(1, -1).join('.');
  if (!menuCode || !tabCode || !actionCode) return null;
  return { menuCode, tabCode, actionCode };
};

/** Menu IAM cũ gộp vào `permission` — dùng khi check quyền / đọc catalog đã seed. */
const LEGACY_MENU_CODE_ALIASES: Record<string, string[]> = {
  permission: ['account'],
  account: ['permission'],
};

export const resolvePermissionMenuCodeCandidates = (menuCode: string): string[] => {
  const normalized = menuCode.trim().toLowerCase();
  const aliases = LEGACY_MENU_CODE_ALIASES[normalized] ?? [];
  return [...new Set([normalized, ...aliases.map((code) => code.toLowerCase())])];
};
