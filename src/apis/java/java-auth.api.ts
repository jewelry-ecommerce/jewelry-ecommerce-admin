
import { backendRequest } from '../backend-request';
import type { AdminRoleCode, AdminSession, AdminUser, PagePermissionGrant } from '../auth/auth.interface';
import { store } from '@/redux/store.redux';

interface JavaUser {
  id: number;
  email: string | null;
  fullName: string;
  roles: string[];
  root?: boolean;
  pagePermissions?: Array<{ pageCode: string; view: boolean; edit: boolean; delete: boolean }>;
}
interface JavaSession { user: JavaUser; accessToken: string; refreshToken: string }

const STAFF = new Set(['ROOT', 'ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'ROLE_ROOT', 'ROLE_ADMIN', 'ROLE_CATALOG_MANAGER', 'ROLE_ORDER_MANAGER']);

const normalizeRole = (role: string): AdminRoleCode | null => {
  const code = role.replace(/^ROLE_/, '');
  if (code === 'ROOT' || code === 'ADMIN' || code === 'CATALOG_MANAGER' || code === 'ORDER_MANAGER' || code === 'VIEWER') return code;
  return null;
};

const pickPrimaryRole = (roles: AdminRoleCode[]): AdminRoleCode => {
  if (roles.includes('ROOT')) return 'ROOT';
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('CATALOG_MANAGER')) return 'CATALOG_MANAGER';
  if (roles.includes('ORDER_MANAGER')) return 'ORDER_MANAGER';
  return roles[0] ?? 'VIEWER';
};

export function javaAdminUser(user: JavaUser): AdminUser {
  const rawRoles = user.roles ?? [];
  if (!rawRoles.some((role) => STAFF.has(role) || STAFF.has(role.replace(/^ROLE_/, '')))) {
    throw new Error('Tài khoản không có quyền quản trị.');
  }
  const roles = rawRoles.map(normalizeRole).filter((role): role is AdminRoleCode => Boolean(role));
  const root = Boolean(user.root) || roles.includes('ROOT');
  const pagePermissions: PagePermissionGrant[] = root
    ? []
    : (user.pagePermissions ?? []).map((item) => ({
        pageCode: item.pageCode,
        view: Boolean(item.view),
        edit: Boolean(item.edit),
        delete: Boolean(item.delete),
      }));
  return {
    id: String(user.id),
    email: user.email ?? '',
    displayName: user.fullName,
    role: pickPrimaryRole(roles),
    roles,
    root,
    pagePermissions,
    avatar: null,
    jobTitle: '',
    lastLoginAt: null,
  };
}

export async function javaLogin(phone: string, password: string): Promise<AdminSession> {
  const session = await backendRequest<JavaSession>('admin/auth/login', 'POST', { phone, password });
  return {
    user: javaAdminUser(session.user),
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    issuedAt: new Date().toISOString(),
  };
}

export async function javaLogout(): Promise<{ success: true }> {
  const refreshToken = store.getState().auth.refreshToken;
  if (refreshToken) await backendRequest<void>('admin/auth/logout', 'POST', { refreshToken });
  return { success: true };
}

export async function javaGetMe(): Promise<AdminUser> {
  return javaAdminUser(await backendRequest<JavaUser>('admin/auth/me'));
}
