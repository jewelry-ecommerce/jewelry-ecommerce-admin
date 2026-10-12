export interface PermissionEntityRef {
  id: string;
  code: string;
  name: string;
}

/** Department embed từ BE (iam/department) — field `department` ở root bundle/employee. */
export interface BundleDepartmentDto {
  id: string;
  code?: string;
  name?: string;
  description?: string | null;
}

/** Nested job-title trên bundle/role (iam/job-title). */
export interface BundleJobTitleDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface RoleListQuery {
  page?: number;
  limit?: number;
}

export type BundleStatus = 'Active' | 'Inactive' | 'Deleted';

export interface RoleListItemDto {
  id: string;
  code: string;
  name: string;
  version?: string;
  description?: string;
  branchCount?: number;
  branch_count?: number;
  mode?: 'system' | 'custom';
  status?: BundleStatus;
  jobTitleId?: string | null;
  jobTitle?: BundleJobTitleDto | null;
  department?: BundleDepartmentDto | null;
}

export interface CreateRoleRequestDto {
  code: string;
  name: string;
  version: string;
  description?: string;
}

export interface RoleContextResponseDto {
  role: PermissionEntityRef;
  bundle: PermissionEntityRef;
}

export interface BundleListItemDto {
  id: string;
  code: string;
  name: string;
  version?: string;
  description?: string;
  branchCount?: number;
  branch_count?: number;
  mode?: 'system' | 'custom';
  status?: BundleStatus;
  jobTitleId?: string | null;
  jobTitle?: BundleJobTitleDto | null;
  department?: BundleDepartmentDto | null;
}

export interface BranchListItemDto {
  id: string;
  code: string;
  name: string;
  mode?: 'system' | 'custom';
  menuCount?: number;
  menu_count?: number;
  tenantCode?: string;
  tenantcode?: string;
  tenant_code?: string;
}

export interface MenuListItemDto {
  id: string;
  code: string;
  name: string;
}

export interface TabListItemDto {
  id: string;
  code: string;
  name: string;
  parentTabId?: string | null;
  tabKind?: 'group' | 'leaf';
  sortOrder?: number;
  children?: TabListItemDto[];
}

export interface TabActionItemDto {
  id: string;
  code: string;
  displayCode: string;
  action: string;
  actionName: string;
  sensitive: boolean;
  granted: boolean;
  endpointCount: number;
}

export interface TabActionsResponseDto {
  tab: PermissionEntityRef;
  menu: PermissionEntityRef;
  branch: PermissionEntityRef;
  role: PermissionEntityRef;
  actions: TabActionItemDto[];
}

export interface UpdateTabPermissionsRequestDto {
  tabId: string;
  grantedActionIds: string[];
  revokedActionIds: string[];
}

export interface UpdateTabPermissionsResponseDto {
  success: boolean;
  granted: number;
  revoked: number;
}

export interface EndpointItemDto {
  id: string;
  /** @deprecated BE mới dùng `code` — đọc qua `resolveEndpointCode`. */
  key?: string;
  code?: string;
  method: string;
  path: string;
  name: string;
}

export interface CreateCatalogEndpointRequestDto {
  code: string;
  method: string;
  path: string;
  name: string;
  serviceCode?: string;
  isInternalOnly?: boolean;
}

export interface SyncEndpointsFromServiceRequestDto {
  serviceCode: string;
}

export interface SearchEndpointsQuery {
  orderType?: 'ASC' | 'DESC';
  orderBy?: string;
  q?: string;
  serviceCode?: string;
  method?: string;
  page?: number;
  take?: number;
  isPagination?: boolean;
}

export interface LinkActionEndpointsRequestDto {
  endpointIds: string[];
}

export interface CreateBranchRequestDto {
  code: string;
  name: string;
  tenantCode: string;
}

export interface UpdateBundleRequestDto {
  name?: string;
  version?: string;
  description?: string;
  status?: 'Active' | 'Inactive';
  jobTitleId?: string;
}

export interface UpdateBranchRequestDto {
  name?: string;
  tenantCode?: string;
}

export interface UpdateMenuRequestDto {
  name?: string;
  sortOrder?: number;
}

export interface UpdateTabRequestDto {
  name?: string;
  sortOrder?: number;
  parentTabId?: string | null;
  tabKind?: 'group' | 'leaf';
}

export interface UpdateCatalogActionRequestDto {
  actionName?: string;
  /** Trạng thái bật/tắt action trong catalog (BE map field `sensitive`). */
  sensitive?: boolean;
}

export interface CreateMenuRequestDto {
  code: string;
  name: string;
  sortOrder: number;
}

export interface CreateTabRequestDto {
  code: string;
  name: string;
  sortOrder: number;
  parentTabId?: string | null;
  tabKind?: 'group' | 'leaf';
}

export interface CreateActionRequestDto {
  code: string;
  action: string;
  actionName: string;
  permissionCode: string;
  permissionName: string;
  sensitive?: boolean;
  endpointIds?: string[];
}

export interface PermissionCatalogBundleApiDto {
  code: string;
  method: string;
  path: string;
  name: string;
  serviceCode?: string;
}

export interface PermissionCatalogBundleActionDto {
  code: string;
  action: string;
  action_name: string;
  sensitive: boolean;
  apis?: PermissionCatalogBundleApiDto[];
}

export interface PermissionCatalogBundlePermissionDto {
  code: string;
  name: string;
  sortOrder: number;
  actions: PermissionCatalogBundleActionDto[];
}

export interface PermissionCatalogBundleTabDto {
  code: string;
  name: string;
  sortOrder: number;
  permissions: PermissionCatalogBundlePermissionDto[];
}

export interface PermissionCatalogBundleMenuDto {
  code: string;
  name: string;
  sortOrder: number;
  tabs: PermissionCatalogBundleTabDto[];
}

export interface PermissionCatalogBundleBranchDto {
  code: string;
  name: string;
  tenantCode?: string;
  menus: PermissionCatalogBundleMenuDto[];
}

/** JSON import/export permission catalog. */
export interface PermissionCatalogBundleDto {
  code: string;
  name: string;
  version: string;
  description?: string;
  branches: PermissionCatalogBundleBranchDto[];
}

export type PermissionBundleTreeDto = PermissionCatalogBundleDto | { branches: PermissionCatalogBundleBranchDto[] };

export interface PermissionListQuery {
  page?: number;
  take?: number;
  search?: string;
  status?: 'Active' | 'Inactive' | 'Deleted';
  orderBy?: string;
  orderType?: 'ASC' | 'DESC';
  isPagination?: boolean;
}

export interface UpdatePermissionRequestDto {
  [key: string]: unknown;
}
