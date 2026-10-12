import { axiosRequest } from '../../common/config/axios.config';
import type {
  BranchListItemDto,
  BundleListItemDto,
  CreateBranchRequestDto,
  EndpointItemDto,
  CreateCatalogEndpointRequestDto,
  LinkActionEndpointsRequestDto,
  MenuListItemDto,
  PermissionCatalogBundleDto,
  PermissionBundleTreeDto,
  PermissionListQuery,
  RoleContextResponseDto,
  SearchEndpointsQuery,
  SyncEndpointsFromServiceRequestDto,
  TabActionsResponseDto,
  TabActionItemDto,
  TabListItemDto,
  UpdateBranchRequestDto,
  UpdateBundleRequestDto,
  UpdateCatalogActionRequestDto,
  UpdateMenuRequestDto,
  UpdatePermissionRequestDto,
  UpdateTabPermissionsRequestDto,
  UpdateTabPermissionsResponseDto,
  UpdateTabRequestDto,
} from './permission.interface';

export interface CreateBundleRequestDto {
  code: string;
  name: string;
  version: string;
  description?: string;
  status?: 'Active' | 'Inactive';
  jobTitleId?: string;
}

export interface ServiceListQuery {
  orderType?: 'ASC' | 'DESC';
  orderBy?: string;
  page?: number;
  take?: number;
  search?: string;
  isPagination?: boolean;
  status?: 'Active' | 'Inactive' | 'Deleted';
  moduleCode?: string;
}

export interface ServicePayload {
  [key: string]: unknown;
}

const ROLES_BASE = 'iam/roles';
const PERMISSIONS_BASE = 'iam/permissions';
const SERVICES_BASE = 'iam/services';
const CATALOG_BASE = 'iam/permission-catalog';
const BUNDLES_BASE = `${CATALOG_BASE}/bundles`;

/** GET /permissions */
export const listPermissions = async (query?: PermissionListQuery): Promise<unknown> => await axiosRequest.get(PERMISSIONS_BASE, { params: query });

/** PATCH /permissions/{id} */
export const updatePermission = async (id: string, payload: UpdatePermissionRequestDto): Promise<unknown> => await axiosRequest.patch(`${PERMISSIONS_BASE}/${id}`, payload);

/** PATCH /permissions/{id}/delete */
export const softDeletePermission = async (id: string): Promise<unknown> => await axiosRequest.patch(`${PERMISSIONS_BASE}/${id}/delete`);

/** PATCH /permissions/{id}/restore */
export const restorePermission = async (id: string): Promise<unknown> => await axiosRequest.patch(`${PERMISSIONS_BASE}/${id}/restore`);

/** GET /services */
export const listServices = async (query?: ServiceListQuery): Promise<unknown> => await axiosRequest.get(SERVICES_BASE, { params: query });

/** POST /services */
export const createService = async (payload: ServicePayload): Promise<unknown> => await axiosRequest.post(SERVICES_BASE, payload);

/** GET /services/{id} */
export const getService = async (id: string): Promise<unknown> => await axiosRequest.get(`${SERVICES_BASE}/${id}`);

/** PATCH /services/{id} */
export const updateService = async (id: string, payload: ServicePayload): Promise<unknown> => await axiosRequest.patch(`${SERVICES_BASE}/${id}`, payload);

/** DELETE /services/{id} */
export const deleteService = async (id: string): Promise<unknown> => await axiosRequest.delete(`${SERVICES_BASE}/${id}`);

/** POST /services/sync */
export const syncServices = async (payload: ServicePayload): Promise<unknown> => await axiosRequest.post(`${SERVICES_BASE}/sync`, payload);

/** GET /permission-catalog/bundles */
export const listBundles = async (): Promise<BundleListItemDto[]> => await axiosRequest.get(BUNDLES_BASE);

/** POST /permission-catalog/bundles */
export const createBundle = async (payload: CreateBundleRequestDto): Promise<BundleListItemDto> => await axiosRequest.post(BUNDLES_BASE, payload);

/** POST /permission-catalog/bundles/{code}/clone */
export const cloneBundle = async (sourceCode: string, payload: CreateBundleRequestDto): Promise<BundleListItemDto> =>
  await axiosRequest.post(`${BUNDLES_BASE}/${encodeURIComponent(sourceCode)}/clone`, payload);

/** PATCH /permission-catalog/bundles/{code} */
export const updateBundle = async (code: string, payload: UpdateBundleRequestDto): Promise<unknown> => await axiosRequest.patch(`${BUNDLES_BASE}/${code}`, payload);

/** PATCH /permission-catalog/bundles/{code}/delete */
export const deleteBundle = async (code: string): Promise<unknown> => await axiosRequest.patch(`${BUNDLES_BASE}/${encodeURIComponent(code)}/delete`);

/** Backward-compatible alias for bundle listing */
export const getRoles = async (): Promise<BundleListItemDto[]> => listBundles();

/** Backward-compatible alias for bundle creation */
export const createRole = async (payload: CreateBundleRequestDto): Promise<BundleListItemDto> => createBundle(payload);

/** PUT /roles/{roleId}/tab-permissions */
export const updateTabPermissions = async (roleId: string, payload: UpdateTabPermissionsRequestDto): Promise<UpdateTabPermissionsResponseDto> =>
  await axiosRequest.put(`${ROLES_BASE}/${roleId}/tab-permissions`, payload);

/** GET /permission-catalog/roles/{roleId}/context */
export const getRoleContext = async (roleId: string): Promise<RoleContextResponseDto> => await axiosRequest.get(`${CATALOG_BASE}/roles/${roleId}/context`);

/** GET /permission-catalog/bundles/{code}/branches */
export const getBundleBranches = async (bundleCode: string): Promise<BranchListItemDto[]> => await axiosRequest.get(`${CATALOG_BASE}/bundles/${bundleCode}/branches`);

/** POST /permission-catalog/bundles/{code}/branches */
export const createBundleBranch = async (bundleCode: string, payload: CreateBranchRequestDto): Promise<BranchListItemDto> =>
  await axiosRequest.post(`${CATALOG_BASE}/bundles/${bundleCode}/branches`, payload);

/** PATCH /permission-catalog/branches/{branchId} */
export const updateBranch = async (branchId: string, payload: UpdateBranchRequestDto): Promise<unknown> => await axiosRequest.patch(`${CATALOG_BASE}/branches/${branchId}`, payload);

/** PATCH /permission-catalog/branches/{branchId}/delete */
export const deleteBranch = async (branchId: string): Promise<unknown> => await axiosRequest.patch(`${CATALOG_BASE}/branches/${branchId}/delete`);

/** GET /permission-catalog/bundles/{code}/tree */
export const exportBundleTree = async (bundleCode: string): Promise<PermissionBundleTreeDto> => await axiosRequest.get(`${CATALOG_BASE}/bundles/${bundleCode}/tree`);

/** GET /permission-catalog/branches/{branchId}/menus */
export const getBranchMenus = async (branchId: string): Promise<MenuListItemDto[]> => await axiosRequest.get(`${CATALOG_BASE}/branches/${branchId}/menus`);

/** POST /permission-catalog/branches/{branchId}/menus */
export const createBranchMenu = async (branchId: string, payload: Record<string, unknown>): Promise<MenuListItemDto> => await axiosRequest.post(`${CATALOG_BASE}/branches/${branchId}/menus`, payload);

/** PATCH /permission-catalog/menus/{menuId} */
export const updateMenu = async (menuId: string, payload: UpdateMenuRequestDto): Promise<unknown> => await axiosRequest.patch(`${CATALOG_BASE}/menus/${menuId}`, payload);

/** PATCH /permission-catalog/menus/{menuId}/delete */
export const deleteMenu = async (menuId: string): Promise<unknown> => await axiosRequest.patch(`${CATALOG_BASE}/menus/${menuId}/delete`);

/** GET /permission-catalog/menus/{menuId}/tabs */
export const getMenuTabs = async (menuId: string): Promise<TabListItemDto[]> => await axiosRequest.get(`${CATALOG_BASE}/menus/${menuId}/tabs`);

/** POST /permission-catalog/menus/{menuId}/tabs */
export const createMenuTab = async (menuId: string, payload: Record<string, unknown>): Promise<TabListItemDto> => await axiosRequest.post(`${CATALOG_BASE}/menus/${menuId}/tabs`, payload);

/** PATCH /permission-catalog/tabs/{tabId} */
export const updateTab = async (tabId: string, payload: UpdateTabRequestDto): Promise<unknown> => await axiosRequest.patch(`${CATALOG_BASE}/tabs/${tabId}`, payload);

/** PATCH /permission-catalog/tabs/{tabId}/delete */
export const deleteTab = async (tabId: string): Promise<unknown> => await axiosRequest.patch(`${CATALOG_BASE}/tabs/${tabId}/delete`);

/** GET /permission-catalog/tabs/{tabId}/actions */
export const getTabActions = async (tabId: string): Promise<TabActionsResponseDto> => await axiosRequest.get(`${CATALOG_BASE}/tabs/${tabId}/actions`);

/** POST /permission-catalog/tabs/{tabId}/actions */
export const createTabAction = async (tabId: string, payload: Record<string, unknown>): Promise<TabActionItemDto> => await axiosRequest.post(`${CATALOG_BASE}/tabs/${tabId}/actions`, payload);

export interface BulkCreateTabActionItem {
  code: string;
  action: string;
  actionName: string;
  permissionCode: string;
  permissionName: string;
  sensitive: boolean;
  endpointIds?: string[];
}

/** POST /permission-catalog/tabs/{tabId}/actions/bulk */
export const bulkCreateTabActions = async (tabId: string, actions: BulkCreateTabActionItem[]): Promise<unknown> => await axiosRequest.post(`${CATALOG_BASE}/tabs/${tabId}/actions/bulk`, { actions });

/** PATCH /permission-catalog/actions/{actionId} */
export const updateCatalogAction = async (actionId: string, payload: UpdateCatalogActionRequestDto): Promise<unknown> => await axiosRequest.patch(`${CATALOG_BASE}/actions/${actionId}`, payload);

/** PATCH /permission-catalog/actions/{actionId}/delete */
export const deleteCatalogAction = async (actionId: string): Promise<unknown> => await axiosRequest.patch(`${CATALOG_BASE}/actions/${actionId}/delete`);

/** GET /permission-catalog/actions/{actionId}/endpoints */
export const getActionEndpoints = async (actionId: string): Promise<EndpointItemDto[]> => await axiosRequest.get(`${CATALOG_BASE}/actions/${actionId}/endpoints`);

/** POST /permission-catalog/actions/{actionId}/endpoints */
export const linkActionEndpoints = async (actionId: string, payload: LinkActionEndpointsRequestDto): Promise<void> => {
  await axiosRequest.post(`${CATALOG_BASE}/actions/${actionId}/endpoints`, payload);
};

/** DELETE /permission-catalog/actions/{actionId}/endpoints/{endpointId} */
export const detachActionEndpoint = async (actionId: string, endpointId: string): Promise<void> => {
  await axiosRequest.delete(`${CATALOG_BASE}/actions/${actionId}/endpoints/${endpointId}`);
};

/** GET /permission-catalog/endpoints */
export const searchEndpoints = async (query?: SearchEndpointsQuery): Promise<EndpointItemDto[]> => await axiosRequest.get(`${CATALOG_BASE}/endpoints`, { params: query });

/** POST /permission-catalog/endpoints */
export const createCatalogEndpoint = async (payload: CreateCatalogEndpointRequestDto): Promise<EndpointItemDto> => (await axiosRequest.post(`${CATALOG_BASE}/endpoints`, payload)) as EndpointItemDto;

/** PATCH /permission-catalog/endpoints/{endpointId}/delete */
export const deleteCatalogEndpoint = async (endpointId: string): Promise<unknown> => await axiosRequest.patch(`${CATALOG_BASE}/endpoints/${endpointId}/delete`);

/** POST /permission-catalog/endpoints/sync-all */
export const syncAllEndpoints = async (): Promise<unknown> => await axiosRequest.post(`${CATALOG_BASE}/endpoints/sync-all`);

/** POST /permission-catalog/endpoints/sync-from-service */
export const syncEndpointsFromService = async (payload: SyncEndpointsFromServiceRequestDto): Promise<unknown> => await axiosRequest.post(`${CATALOG_BASE}/endpoints/sync-from-service`, payload);

/** POST /permission-catalog/import */
export const importPermissionCatalog = async (payload: PermissionCatalogBundleDto): Promise<void> => {
  await axiosRequest.post(`${CATALOG_BASE}/import`, payload);
};

/** POST /permission-catalog/import/default */
export const importDefaultPermissionCatalog = async (): Promise<void> => {
  await axiosRequest.post(`${CATALOG_BASE}/import/default`);
};
