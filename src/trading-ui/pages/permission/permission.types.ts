import type { EmployeeRoleType } from '../../apis/employee/employee.enum';
import type { PermissionCatalogBundleBranchDto } from '../../apis/permission';

export type PermissionMode = 'system' | 'custom';

export interface PermissionAction {
  id: string;
  code: string;
  name: string;
  /** Trạng thái bật/tắt action — đồng bộ field `sensitive` từ BE. */
  sensitive: boolean;
  apiCodes: string[];
  displayCode?: string;
  granted?: boolean;
  endpointCount?: number;
}

export type PermissionTabKind = 'group' | 'leaf';

export interface PermissionTab {
  id: string;
  code: string;
  name: string;
  parentTabId?: string | null;
  tabKind?: PermissionTabKind;
  sortOrder?: number;
  children?: PermissionTab[];
  actions: PermissionAction[];
}

export interface PermissionMenu {
  id: string;
  code: string;
  name: string;
  tabs: PermissionTab[];
}

export interface PermissionBrand {
  id: string;
  code: string;
  name: string;
  tenantCode?: string;
  menus: PermissionMenu[];
}

export type BundleStatus = 'Active' | 'Inactive' | 'Deleted';

export interface RoleSet {
  id: string;
  code: string;
  label: string;
  mode: PermissionMode;
  permissions: string[];
  description: string;
  brandCount: number;
  version: string;
  status?: BundleStatus;
  jobTitleId?: string;
  jobTitle?: { id: string; code: string; name: string };
  department?: { id: string; code?: string; name?: string };
  departmentName?: string;
}

export interface PermissionDialogsState {
  brand: boolean;
  menu: boolean;
  tab: boolean;
  action: boolean;
  role: boolean;
  editRole: boolean;
  api: boolean;
  editBrand: boolean;
  editMenu: boolean;
  editTab: boolean;
  editAction: boolean;
}

export type CatalogDeleteTarget =
  | { kind: 'bundle'; code: string; label: string }
  | { kind: 'brand'; id: string; label: string }
  | { kind: 'menu'; id: string; label: string; brandId: string }
  | { kind: 'tab'; id: string; label: string; brandId: string; menuId: string }
  | { kind: 'action'; id: string; label: string; brandId: string; menuId: string; tabId: string };

export interface PermissionFormsState {
  newBrandCode: string;
  newBrandName: string;
  newBrandTenantCode: string;
  newMenuCode: string;
  newMenuName: string;
  createTabMenuId: string;
  createTabParentCode: string | null;
  newTabSegment: string;
  newTabCode: string;
  newTabName: string;
  createActionTabId: string;
  createActionPickerSearch: string;
  createActionSelectedIds: string[];
  newActionCode: string;
  newActionName: string;
  newActionSensitive: boolean;
  newRoleCode: string;
  newRoleName: string;
  newRoleVersion: string;
  newRoleDescription: string;
  newRoleStatus: 'Active' | 'Inactive';
  newRoleJobTitleId: string;
}

/** Query `?code=` trên Trung tâm phân quyền — mã bundle cần mở. */
export const PERMISSION_BUNDLE_CODE_QUERY_KEY = 'code';

/** Query tab khi mở trang tạo action — id tab catalog. */
export const PERMISSION_CREATE_ACTION_TAB_QUERY_KEY = 'tabId';

export interface ImportedRolesPayload {
  type?: string;
  roles?: Record<string, { label?: string; mode?: PermissionMode; permissions?: string[] }>;
}

export interface ImportedApiMappingsPayload {
  type?: string;
  api_mappings?: Record<string, string[]>;
}

/** Format catalog v4 — API gắn vào từng permission */
export interface PermissionCatalogApi {
  key: string;
  method: string;
  path: string;
  name: string;
}

export interface PermissionCatalogPermission {
  key: string;
  action: string;
  action_name: string;
  sensitive: boolean;
  apis?: PermissionCatalogApi[];
}

export interface PermissionCatalogTab {
  key: string;
  name: string;
  permissions: PermissionCatalogPermission[];
}

export interface PermissionCatalogMenu {
  key: string;
  name: string;
  tabs: PermissionCatalogTab[];
}

export interface PermissionCatalogBrand {
  code: string;
  name: string;
  menus: PermissionCatalogMenu[];
}

export interface PermissionBundleRoleExport {
  label?: string;
  mode?: PermissionMode;
  /** v4 — theo brand, key dạng order.list.view */
  grants?: Record<string, string[]>;
  /** legacy — perm.B1.order.list.view */
  permissions?: string[];
}

/**
 * Import/export JSON — contract BE:
 * `{ code, name, version, description, branches: [...] }`
 */
export interface PermissionBundlePayload {
  code?: string;
  name?: string;
  version?: string;
  description?: string;
  branches?: PermissionCatalogBrand[] | PermissionCatalogBundleBranchDto[];
  /** optional khi import file cũ có kèm roles */
  roles?: Record<string, PermissionBundleRoleExport>;
  /** legacy */
  exported_at?: string;
  type?: string;
  schema?: unknown;
  bundle?: {
    code?: string;
    name?: string;
    version?: string;
    description?: string;
    branches?: PermissionBundlePayload['branches'];
  };
}

export type UserAccessStatus = 'active' | 'inactive';

export interface UserRoleScope {
  bundleId?: string;
  bundleCode?: string;
  /** Tên hiển thị từ BE (`label` hoặc `bundle.name`). */
  label?: string;
  brandCode?: string;
  expiredAt?: string;
  status: UserAccessStatus;
}

export interface AssignUserPermissionInput {
  userId: string;
  /** Id bộ quyền catalog — map sang `roleIds` trên API assign-users. */
  roleIds: string[];
  bundles: Array<{ id: string; code: string }>;
  expiredAt?: string;
}

export interface PermissionUser {
  id: string;
  code: string;
  /** ID người tạo tài khoản — gate quyền sửa theo người tạo (Admin chỉ sửa tài khoản mình tạo). */
  createdById?: string;
  /** Hiển thị danh sách — chỉ firstName. */
  name: string;
  email: string;
  phone?: string;
  firstName?: string;
  birthday?: string;
  gender?: string;
  url?: string;
  /** IAM employee role — dùng kiểm tra quyền cập nhật cấp dưới. */
  roleType?: EmployeeRoleType;
  jobTitleId?: string;
  jobTitleName?: string;
  departmentName?: string;
  status: UserAccessStatus;
  assignments: UserRoleScope[];
}
