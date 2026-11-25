import { backendRequest } from '../backend-request';
import type { PagePermissionGrant } from '../auth/auth.interface';

export type PermissionPageCatalogItem = {
  code: string;
  label: string;
  menuCode: string;
  tabCode: string;
};

export type AdminAccessUser = {
  id: number;
  phone: string;
  email: string | null;
  fullName: string;
  enabled: boolean;
  roles: string[];
};

export const listPermissionPages = () =>
  backendRequest<PermissionPageCatalogItem[]>('admin/permission-pages', 'GET');

export const listAccessUsers = () => backendRequest<AdminAccessUser[]>('admin/users', 'GET');

export const getUserPagePermissions = (userId: string | number) =>
  backendRequest<PagePermissionGrant[]>(`admin/users/${userId}/page-permissions`, 'GET');

export const putUserPagePermissions = (userId: string | number, items: PagePermissionGrant[]) =>
  backendRequest<PagePermissionGrant[]>(`admin/users/${userId}/page-permissions`, 'PUT', {
    items: items.map((item) => ({
      pageCode: item.pageCode,
      view: item.view,
      edit: item.edit,
      delete: item.delete,
    })),
  });
