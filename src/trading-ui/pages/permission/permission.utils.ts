import type { PermissionAction, PermissionBrand, PermissionBundlePayload, PermissionMenu, PermissionMode, PermissionTab, RoleSet } from './permission.types';
import type { PermissionCatalogBundleDto, PermissionCatalogBundleApiDto, EndpointItemDto } from '../../apis/permission';
import { normalizePermissionCatalogBundle } from '../../apis/permission';
import { getTenantCodes } from '../../common/config/tenant.config';
import {
  getDashboardMenuCatalog,
  getDashboardTabCatalogEntries,
  getPrimaryMenuCodeForSidebarMenu,
  getSidebarGroupCatalogMenuCodes,
  getSidebarGroupSecondaryMenuCodes,
  getTenantBranchCatalog,
  isSidebarGroupFullyProvisioned,
  type DashboardMenuCatalogItem,
  type TenantBranchCatalogItem,
} from '../../router/dashboard-sidebar.nav';
import { normalizePermissionBranchCode } from '../../permissions/permission-branch.utils';
import { buildPermissionCode, buildPermissionItemKey, parsePermissionCode, parsePermissionItemKey, type PermissionCodeParts } from '../../permissions/permission-code.utils';
import { flattenTabTree, getTabCodeDepth, updateTabInTree } from './permission-tab-tree.utils';
import { SENSITIVE_ACTION_CODES } from '../../permissions/page-action.registry';
import { getDefaultTenantCode } from '../../common/config';

export { buildPermissionCode, buildPermissionItemKey, parsePermissionCode, parsePermissionItemKey, type PermissionCodeParts };

export type RemainingTabCatalogItem = {
  menuId: string;
  menuCode: string;
  tabCode: string;
  tabName: string;
};

export const listRemainingBrandCatalogItems = (brands: PermissionBrand[]): TenantBranchCatalogItem[] => {
  const existingCanonical = new Set(
    brands.map((brand) =>
      normalizePermissionBranchCode({
        code: brand.code,
        tenantCode: brand.tenantCode,
        name: brand.name,
      }),
    ),
  );
  const existingTenants = new Set(brands.map((brand) => brand.tenantCode).filter(Boolean));
  return getTenantBranchCatalog().filter((item) => !existingCanonical.has(item.branchCode) && !existingTenants.has(item.tenantCode));
};

export type MergedPermissionMenuDisplayItem = {
  primary: PermissionMenu;
  secondaryMenus: PermissionMenu[];
};

export const listRemainingMenuCatalogItems = (menus: PermissionMenu[]): DashboardMenuCatalogItem[] => {
  const existing = new Set(menus.map((menu) => menu.code));
  return getDashboardMenuCatalog().filter((menu) => !isSidebarGroupFullyProvisioned(menu.menuCode, existing));
};

export const getMergedMenuDisplayItems = (menus: PermissionMenu[]): MergedPermissionMenuDisplayItem[] => {
  const menusByCode = new Map(menus.map((menu) => [menu.code, menu]));
  const consumed = new Set<string>();
  const results: MergedPermissionMenuDisplayItem[] = [];

  for (const catalog of getDashboardMenuCatalog()) {
    const primary = menusByCode.get(catalog.menuCode);
    if (!primary) continue;

    consumed.add(primary.code);
    const secondaryMenus = getSidebarGroupSecondaryMenuCodes(catalog.menuCode)
      .map((code) => menusByCode.get(code))
      .filter((menu): menu is PermissionMenu => Boolean(menu));
    secondaryMenus.forEach((menu) => consumed.add(menu.code));
    results.push({ primary, secondaryMenus });
  }

  for (const menu of menus) {
    if (!consumed.has(menu.code)) {
      results.push({ primary: menu, secondaryMenus: [] });
    }
  }

  return results;
};

export const findMenuOwnerForTab = (tabId: string, primary: PermissionMenu, secondaryMenus: PermissionMenu[]): PermissionMenu | undefined => {
  const candidates = [primary, ...secondaryMenus];
  return candidates.find((menu) => flattenTabTree(menu.tabs).some((tab) => tab.id === tabId));
};

export const resolveCatalogMenuCodeForTab = (tabCode: string, fallbackMenuCode: string): string => {
  const entry = getDashboardTabCatalogEntries().find((item) => item.tabCode === tabCode);
  return entry?.menuCode ?? fallbackMenuCode;
};

export const findMenuOwnerForTabByCode = (tabCode: string, primary: PermissionMenu, secondaryMenus: PermissionMenu[]): PermissionMenu | undefined => {
  const menuCode = resolveCatalogMenuCodeForTab(tabCode, primary.code);
  if (menuCode === primary.code) return primary;
  return secondaryMenus.find((menu) => menu.code === menuCode);
};

const normalizeCatalogTabCode = (code: string): string => code.trim().toLowerCase();

/** Catalog `invoice` khớp tab API `invoice` hoặc `order.invoice` (cùng menu). */
export const isCatalogTabPresentInMenu = (existingTabCodes: string[], catalogTabCode: string): boolean => {
  const target = normalizeCatalogTabCode(catalogTabCode);
  if (!target) return false;
  return existingTabCodes.some((existing) => {
    const code = normalizeCatalogTabCode(existing);
    return code === target || code.endsWith(`.${target}`);
  });
};

export const listRemainingTabCatalogItems = (brand: PermissionBrand | undefined): RemainingTabCatalogItem[] => {
  if (!brand) return [];
  const menusByCode = new Map(brand.menus.map((menu) => [menu.code, menu]));
  const results: RemainingTabCatalogItem[] = [];

  for (const tab of getDashboardTabCatalogEntries()) {
    const primaryMenuCode = getPrimaryMenuCodeForSidebarMenu(tab.menuCode);
    const groupMenuCodes = getSidebarGroupCatalogMenuCodes(primaryMenuCode);
    const targetMenu = menusByCode.get(tab.menuCode) ?? menusByCode.get(primaryMenuCode);
    if (!targetMenu) continue;

    const existingTabCodes = groupMenuCodes
      .map((code) => menusByCode.get(code))
      .filter((menu): menu is PermissionMenu => Boolean(menu))
      .flatMap((menu) => flattenTabTree(menu.tabs).map((item) => item.code));

    if (!isCatalogTabPresentInMenu(existingTabCodes, tab.tabCode)) {
      results.push({
        menuId: targetMenu.id,
        menuCode: targetMenu.code,
        tabCode: tab.tabCode,
        tabName: tab.name,
      });
    }
  }

  return results.sort((a, b) => {
    const depthDiff = getTabCodeDepth(a.tabCode) - getTabCodeDepth(b.tabCode);
    if (depthDiff !== 0) return depthDiff;
    return a.tabCode.localeCompare(b.tabCode);
  });
};

export const createId = (() => {
  let sequence = 0;
  return (prefix: string): string => {
    sequence += 1;
    return `${prefix}_${sequence}`;
  };
})();

export const toCode = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

const normalizeUniqueKey = (value: string): string => value.trim().toLowerCase();

/** Tên bộ quyền sao chép: `Tên gốc copy` → `Tên gốc copy 1` → … */
export const buildClonedBundleLabel = (sourceLabel: string, existingLabels: string[]): string => {
  const base = sourceLabel.trim() || 'Bộ quyền';
  const taken = new Set(existingLabels.map(normalizeUniqueKey));
  const first = `${base} copy`;
  if (!taken.has(normalizeUniqueKey(first))) return first;
  let index = 1;
  while (taken.has(normalizeUniqueKey(`${base} copy ${index}`))) {
    index += 1;
  }
  return `${base} copy ${index}`;
};

/** Mã bộ quyền sao chép: `code_copy` → `code_copy_1` → … */
export const buildClonedBundleCode = (sourceCode: string, existingCodes: string[]): string => {
  const base = toCode(sourceCode) || 'bundle';
  const taken = new Set(existingCodes.map(normalizeUniqueKey));
  const first = `${base}_copy`;
  if (!taken.has(normalizeUniqueKey(first))) return first;
  let index = 1;
  while (taken.has(normalizeUniqueKey(`${base}_copy_${index}`))) {
    index += 1;
  }
  return `${base}_copy_${index}`;
};

/** Map brand code → tenant code (ưu tiên khớp exact / suffix trong VITE_TENANT_CODES). */
export const suggestTenantCodeForBrand = (brandCode: string): string => {
  const code = brandCode.trim().toUpperCase();
  if (!code) return '';

  const exact = getTenantCodes().find((tenant) => tenant.toUpperCase() === code);
  if (exact) return exact;

  const fromTenant = getTenantCodes().find((tenant) => tenant.toUpperCase().endsWith(`-${code}`));
  return fromTenant ?? getDefaultTenantCode();
};
/** "SEVA RETAIL B1" → SEVA-RETAIL-B1 (ưu tiên mã đã khai báo trong env). */
export const suggestTenantCodeFromBrandName = (brandName: string): string => {
  const slug = brandName
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '');
  if (!slug) return '';
  const exact = getTenantCodes().find((tenant) => tenant.toUpperCase() === slug);
  if (exact) return exact;
  const branchSuffix = slug.match(/B\d+$/)?.[0];
  if (branchSuffix) {
    const fromEnv = getTenantCodes().find((tenant) => tenant.toUpperCase().endsWith(`-${branchSuffix}`));
    if (fromEnv) return fromEnv;
  }
  return slug;
};

export const createAction = (code: string, name: string, apiCodes: string[] = []): PermissionAction => ({
  id: createId('action'),
  code,
  name,
  sensitive: SENSITIVE_ACTION_CODES.has(code),
  apiCodes,
});

export const createTab = (code: string, name: string, actions: PermissionAction[]): PermissionTab => ({
  id: createId('tab'),
  code,
  name,
  actions,
});

export const createMenu = (code: string, name: string, tabs: PermissionTab[]): PermissionMenu => ({
  id: createId('menu'),
  code,
  name,
  tabs,
});

/** Fallback export UI — method/path lấy từ BE qua exportBundleTree; chỉ gửi mã API. */
const toBundleApis = (apiCodes: string[]): PermissionCatalogBundleApiDto[] | undefined => {
  if (apiCodes.length === 0) return undefined;
  return apiCodes.map((code) => ({ code, method: '', path: '', name: code }));
};

const fromBundleBrand = (brand: PermissionCatalogBundleDto['branches'][number]): PermissionBrand => {
  const tenantCode = String(brand.tenantCode ?? '').trim();
  const name = String(brand.name ?? '').trim();
  const code = normalizePermissionBranchCode({
    code: String(brand.code ?? '').trim(),
    tenantCode,
    name,
  });

  return {
    id: createId('brand'),
    code,
    name,
    tenantCode: tenantCode || undefined,
    menus: (brand.menus ?? []).map((menu) =>
      createMenu(
        toCode(menu.code),
        String(menu.name ?? '').trim(),
        (menu.tabs ?? []).map((tab) =>
          createTab(
            toCode(tab.code),
            String(tab.name ?? '').trim(),
            (tab.permissions ?? []).flatMap((permission) =>
              (permission.actions ?? []).map((action) => {
                const actionCode = toCode(action.action || action.code.split('.').pop() || '');
                const actionName = String(action.action_name ?? '').trim();
                const apiCodes = (action.apis ?? []).map((api) => String(api.code ?? '')).filter(Boolean);
                const created = createAction(actionCode, actionName, apiCodes);
                created.sensitive = Boolean(action.sensitive);
                if (action.code) created.displayCode = action.code;
                return created;
              }),
            ),
          ),
        ),
      ),
    ),
  };
};

const roleGrantsToPermissions = (grants: Record<string, string[]>): string[] => {
  const permissions: string[] = [];
  Object.entries(grants).forEach(([branchCode, keys]) => {
    const canonicalBranchCode = normalizePermissionBranchCode({ code: branchCode });
    keys.forEach((shortKey) => {
      const parsed = parsePermissionItemKey(shortKey);
      if (!parsed) return;
      permissions.push(buildPermissionCode(canonicalBranchCode, parsed.menuCode, parsed.tabCode, parsed.actionCode));
    });
  });
  return permissions;
};

const importRolesFromPayload = (roles: PermissionBundlePayload['roles']): RoleSet[] => {
  if (!roles) return [];

  return Object.entries(roles).map(([code, role]) => {
    let permissions: string[] = [];
    if (role.grants && typeof role.grants === 'object' && !Array.isArray(role.grants)) {
      permissions = roleGrantsToPermissions(role.grants);
    } else if (Array.isArray(role.permissions)) {
      permissions = role.permissions;
    }

    return {
      id: createId('role'),
      code,
      label: role.label ?? code,
      mode: (role.mode === 'system' ? 'system' : 'custom') as PermissionMode,
      permissions,
      description: '',
      brandCount: 0,
      version: '',
    };
  });
};

export interface BuildPermissionBundleExportOptions {
  code: string;
  name: string;
  version?: string;
  description?: string;
}

/** Chỉ giữ field catalog khi export file — bỏ phòng ban/chức danh dù BE tree có trả thêm. */
export const toPermissionBundleExportJson = (bundle: PermissionCatalogBundleDto): PermissionCatalogBundleDto => {
  const description = bundle.description?.trim();
  return {
    code: bundle.code,
    name: bundle.name,
    version: bundle.version || '1.0.0',
    ...(description && description !== bundle.name ? { description } : {}),
    branches: bundle.branches,
  };
};

/** Build JSON export từ state UI (catalog tree format). */
export const buildPermissionBundleExportPayload = (options: BuildPermissionBundleExportOptions, brands: PermissionBrand[]): PermissionCatalogBundleDto => ({
  code: options.code,
  name: options.name,
  version: options.version ?? '1.0.0',
  description: options.description ?? options.name,
  branches: brands.map((brand) => ({
    code: normalizePermissionBranchCode({
      code: brand.code,
      tenantCode: brand.tenantCode,
      name: brand.name,
    }),
    name: brand.name,
    tenantCode: brand.tenantCode ?? suggestTenantCodeForBrand(brand.code),
    menus: brand.menus.map((menu, menuIndex) => ({
      code: menu.code,
      name: menu.name,
      sortOrder: menuIndex,
      tabs: flattenTabTree(menu.tabs).map((tab, tabIndex) => ({
        code: tab.code,
        name: tab.name,
        sortOrder: tabIndex,
        permissions: [
          {
            code: `${menu.code}.${tab.code}`,
            name: tab.name,
            sortOrder: 0,
            actions: tab.actions.map((action) => ({
              code: action.displayCode ?? `${menu.code}.${tab.code}.${action.code}`,
              action: action.code,
              action_name: action.name,
              sensitive: action.sensitive,
              apis: toBundleApis(action.apiCodes),
            })),
          },
        ],
      })),
    })),
  })),
});

export const parsePermissionBundleImport = (
  parsed: PermissionBundlePayload,
): { brands: PermissionBrand[]; roles: RoleSet[]; rolesProvided: boolean; bundle: PermissionCatalogBundleDto | null } | null => {
  const bundle = normalizePermissionCatalogBundle(parsed);
  if (!bundle) return null;

  const brands = bundle.branches.map(fromBundleBrand);
  const rolesProvided = Boolean(parsed.roles && Object.keys(parsed.roles).length > 0);
  const roles = rolesProvided ? importRolesFromPayload(parsed.roles) : [];

  return { brands, roles, rolesProvided, bundle };
};

export const mergeEndpointPages = (current: EndpointItemDto[], incoming: EndpointItemDto[]): EndpointItemDto[] => {
  if (incoming.length === 0) return current;
  const seen = new Set(current.map((item) => item.id));
  const merged = [...current];
  incoming.forEach((item) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  });
  return merged;
};

export const downloadJson = (filename: string, payload: object): void => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const updateBrandMenus = (brands: PermissionBrand[], brandId: string, menus: PermissionMenu[]): PermissionBrand[] => brands.map((brand) => (brand.id === brandId ? { ...brand, menus } : brand));

export const updateBrandMenuTabs = (brands: PermissionBrand[], brandId: string, menuId: string, tabs: PermissionTab[]): PermissionBrand[] =>
  brands.map((brand) =>
    brand.id !== brandId
      ? brand
      : {
          ...brand,
          menus: brand.menus.map((menu) => (menu.id === menuId ? { ...menu, tabs } : menu)),
        },
  );

export const updateBrandMenuTabActions = (brands: PermissionBrand[], brandId: string, menuId: string, tabId: string, actions: PermissionAction[]): PermissionBrand[] =>
  brands.map((brand) =>
    brand.id !== brandId
      ? brand
      : {
          ...brand,
          menus: brand.menus.map((menu) =>
            menu.id !== menuId
              ? menu
              : {
                  ...menu,
                  tabs: updateTabInTree(menu.tabs, tabId, (tab) => ({ ...tab, actions })),
                },
          ),
        },
  );

export const pickTreeNodeId = <T extends { id: string }>(items: T[], preferredId?: string): string => {
  if (preferredId && items.some((item) => item.id === preferredId)) return preferredId;
  return items[0]?.id ?? '';
};

/** Giữ cây menu/tab/action đã load của các brand khác khi chỉ refresh danh sách brand. */
export const mergeBrandListPreservingTrees = (previous: PermissionBrand[], incoming: PermissionBrand[]): PermissionBrand[] =>
  incoming.map((brand) => {
    const existing = previous.find((item) => item.id === brand.id);
    return existing ? { ...brand, menus: existing.menus } : brand;
  });
