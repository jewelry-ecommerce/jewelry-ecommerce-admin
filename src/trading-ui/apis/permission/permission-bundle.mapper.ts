 
import type {
  PermissionCatalogBundleDto,
  PermissionCatalogBundleActionDto,
  PermissionCatalogBundleApiDto,
  PermissionCatalogBundleBranchDto,
  PermissionCatalogBundleMenuDto,
  PermissionCatalogBundlePermissionDto,
  PermissionCatalogBundleTabDto,
} from './permission.interface';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => Boolean(value) && typeof value === 'object';

const asString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
};

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

const mapBundleApi = (raw: unknown, _index: number): PermissionCatalogBundleApiDto | null => {
  if (!isRecord(raw)) return null;
  const code = asString(raw.code ?? raw.key, '');
  if (!code) return null;
  return {
    code,
    method: asString(raw.method, 'GET'),
    path: asString(raw.path, ''),
    name: asString(raw.name, code),
    serviceCode: asString(raw.serviceCode ?? raw.service_code, '') || undefined,
  };
};

const mapBundleAction = (raw: unknown): PermissionCatalogBundleActionDto | null => {
  if (!isRecord(raw)) return null;
  const action = asString(raw.action, '');
  const code = asString(raw.code, action);
  if (!code || !action) return null;
  const apis = (Array.isArray(raw.apis) ? raw.apis : []).map((item, index) => mapBundleApi(item, index)).filter((item): item is PermissionCatalogBundleApiDto => Boolean(item));
  return {
    code,
    action,
    action_name: asString(raw.action_name ?? raw.actionName, action),
    sensitive: asBoolean(raw.sensitive, false),
    apis: apis.length > 0 ? apis : undefined,
  };
};

const mapLegacyPermissionAsAction = (raw: UnknownRecord): PermissionCatalogBundleActionDto | null => {
  const action = asString(raw.action, '');
  const key = asString(raw.key, '');
  const code = asString(raw.code, key || action);
  if (!code || !action) return null;
  const apis = (Array.isArray(raw.apis) ? raw.apis : []).map((item, index) => mapBundleApi(item, index)).filter((item): item is PermissionCatalogBundleApiDto => Boolean(item));
  return {
    code,
    action,
    action_name: asString(raw.action_name ?? raw.actionName, action),
    sensitive: asBoolean(raw.sensitive, false),
    apis: apis.length > 0 ? apis : undefined,
  };
};

const mapBundlePermission = (raw: unknown, menuCode: string, tabCode: string, index: number): PermissionCatalogBundlePermissionDto | null => {
  if (!isRecord(raw)) return null;

  if (Array.isArray(raw.actions)) {
    const actions = raw.actions.map((item) => mapBundleAction(item)).filter((item): item is PermissionCatalogBundleActionDto => Boolean(item));
    if (actions.length === 0) return null;
    const code = asString(raw.code, `${menuCode}.${tabCode}`);
    return {
      code,
      name: asString(raw.name, code),
      sortOrder: asNumber(raw.sortOrder ?? raw.sort_order, index),
      actions,
    };
  }

  const legacyAction = mapLegacyPermissionAsAction(raw);
  if (!legacyAction) return null;
  const code = asString(raw.code, `${menuCode}.${tabCode}`);
  return {
    code,
    name: asString(raw.name, legacyAction.action_name),
    sortOrder: asNumber(raw.sortOrder ?? raw.sort_order, index),
    actions: [legacyAction],
  };
};

const mapBundleTab = (raw: unknown, menuCode: string): PermissionCatalogBundleTabDto | null => {
  if (!isRecord(raw)) return null;
  const code = asString(raw.code ?? raw.key, '');
  if (!code) return null;
  const permissions = (Array.isArray(raw.permissions) ? raw.permissions : [])
    .map((item, index) => mapBundlePermission(item, menuCode, code, index))
    .filter((item): item is PermissionCatalogBundlePermissionDto => Boolean(item));

  if (permissions.length === 0 && Array.isArray(raw.actions)) {
    const actions = raw.actions.map((item) => mapBundleAction(item)).filter((item): item is PermissionCatalogBundleActionDto => Boolean(item));
    if (actions.length > 0) {
      permissions.push({
        code: `${menuCode}.${code}`,
        name: asString(raw.name, code),
        sortOrder: 0,
        actions,
      });
    }
  }

  if (permissions.length === 0) return null;

  return {
    code,
    name: asString(raw.name, code),
    sortOrder: asNumber(raw.sortOrder ?? raw.sort_order, 0),
    permissions,
  };
};

const mapBundleMenu = (raw: unknown, menuIndex: number): PermissionCatalogBundleMenuDto | null => {
  if (!isRecord(raw)) return null;
  const code = asString(raw.code ?? raw.key, '');
  if (!code) return null;
  const tabs = (Array.isArray(raw.tabs) ? raw.tabs : []).map((item) => mapBundleTab(item, code)).filter((item): item is PermissionCatalogBundleTabDto => Boolean(item));
  if (tabs.length === 0) return null;
  return {
    code,
    name: asString(raw.name, code),
    sortOrder: asNumber(raw.sortOrder ?? raw.sort_order, menuIndex),
    tabs,
  };
};

const mapBundleBranch = (raw: unknown, _branchIndex: number): PermissionCatalogBundleBranchDto | null => {
  if (!isRecord(raw)) return null;
  const code = asString(raw.code, '').toUpperCase();
  if (!code) return null;
  const menus = (Array.isArray(raw.menus) ? raw.menus : []).map((item, index) => mapBundleMenu(item, index)).filter((item): item is PermissionCatalogBundleMenuDto => Boolean(item));
  if (menus.length === 0) return null;
  const tenantCode = asString(raw.tenantCode ?? raw.tenant_code, '');
  return {
    code,
    name: asString(raw.name, code),
    tenantCode: tenantCode || undefined,
    menus,
  };
};

const normalizeBranches = (raw: unknown): PermissionCatalogBundleBranchDto[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => mapBundleBranch(item, index)).filter((item): item is PermissionCatalogBundleBranchDto => Boolean(item));
};

export interface PermissionBundleDefaults {
  code?: string;
  name?: string;
  version?: string;
  description?: string;
}

/** Chuẩn hóa JSON import/export theo contract BE (bundle + branches + permissions.actions). */
export const normalizePermissionCatalogBundle = (raw: unknown, defaults?: PermissionBundleDefaults): PermissionCatalogBundleDto | null => {
  if (!isRecord(raw)) return null;

  const nestedBundle = isRecord(raw.bundle) ? raw.bundle : null;
  const branchesSource = raw.branches ?? nestedBundle?.branches;
  const branches = normalizeBranches(branchesSource);
  if (branches.length === 0) return null;

  const code = asString(raw.code ?? nestedBundle?.code ?? defaults?.code, '');
  const name = asString(raw.name ?? nestedBundle?.name ?? defaults?.name, '');
  if (!code || !name) return null;

  return {
    code,
    name,
    version: asString(raw.version ?? nestedBundle?.version ?? defaults?.version, '1.0.0') || '1.0.0',
    description: asString(raw.description ?? nestedBundle?.description ?? defaults?.description, name),
    branches,
  };
};

/** API export tree có thể trả full bundle hoặc chỉ `{ branches }`. */
export const normalizePermissionBundleExport = (raw: unknown, defaults: PermissionBundleDefaults): PermissionCatalogBundleDto | null => normalizePermissionCatalogBundle(raw, defaults);

const compactBundleApi = (api: PermissionCatalogBundleApiDto): PermissionCatalogBundleApiDto => {
  const serviceCode = api.serviceCode?.trim();
  return {
    code: api.code,
    method: api.method || 'GET',
    path: api.path || '',
    name: api.name || api.code,
    ...(serviceCode ? { serviceCode } : {}),
  };
};
const compactBundleAction = (action: PermissionCatalogBundleActionDto): PermissionCatalogBundleActionDto => {
  const apis = action.apis?.map(compactBundleApi);
  const uniqueApis = apis?.filter((api, index, list) => list.findIndex((item) => item.code === api.code) === index);
  return {
    code: action.code,
    action: action.action,
    action_name: action.action_name || action.action,
    sensitive: Boolean(action.sensitive),
    ...(uniqueApis && uniqueApis.length > 0 ? { apis: uniqueApis } : {}),
  };
};

const compactBundlePermission = (permission: PermissionCatalogBundlePermissionDto): PermissionCatalogBundlePermissionDto => ({
  code: permission.code,
  name: permission.name || permission.code,
  sortOrder: permission.sortOrder,
  actions: permission.actions.map(compactBundleAction),
});

const compactBundleTab = (tab: PermissionCatalogBundleTabDto): PermissionCatalogBundleTabDto => ({
  code: tab.code,
  name: tab.name || tab.code,
  sortOrder: tab.sortOrder,
  permissions: tab.permissions.map(compactBundlePermission),
});

const compactBundleMenu = (menu: PermissionCatalogBundleMenuDto): PermissionCatalogBundleMenuDto => ({
  code: menu.code,
  name: menu.name || menu.code,
  sortOrder: menu.sortOrder,
  tabs: menu.tabs.map(compactBundleTab),
});

const compactBundleBranch = (branch: PermissionCatalogBundleBranchDto): PermissionCatalogBundleBranchDto => {
  const tenantCode = branch.tenantCode?.trim();
  return {
    code: branch.code,
    name: branch.name || branch.code,
    ...(tenantCode ? { tenantCode } : {}),
    menus: branch.menus.map(compactBundleMenu),
  };
};

/** Thu gọn payload trước POST import — bỏ field thừa, dedupe API, giảm kích thước body. */
export const compactPermissionCatalogBundleForImport = (bundle: PermissionCatalogBundleDto): PermissionCatalogBundleDto => {
  const description = bundle.description?.trim();
  const normalizedDescription = description && description !== bundle.name ? description : undefined;

  return {
    code: bundle.code,
    name: bundle.name,
    version: bundle.version || '1.0.0',
    ...(normalizedDescription ? { description: normalizedDescription } : {}),
    branches: bundle.branches.map(compactBundleBranch),
  };
};
