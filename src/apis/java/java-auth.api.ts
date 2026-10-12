
import { backendRequest } from '../backend-request';
import type { AdminSession, AdminUser } from '../auth/auth.interface';
import { store } from '@/redux/store.redux';
interface JavaUser { id: number; email: string | null; fullName: string; roles: string[] }
interface JavaSession { user: JavaUser; accessToken: string; refreshToken: string }
export function javaAdminUser(user: JavaUser): AdminUser {
  if (!user.roles.some(role => role === 'ADMIN' || role === 'ROLE_ADMIN')) throw new Error('Tài khoản không có quyền quản trị.');
  return { id: String(user.id), email: user.email ?? '', displayName: user.fullName, role: 'ADMIN',
    avatar: null, jobTitle: '', lastLoginAt: null };
}
export async function javaLogin(phone: string, password: string): Promise<AdminSession> {
  const session = await backendRequest<JavaSession>('admin/auth/login', 'POST', { phone, password });
  return { user: javaAdminUser(session.user), accessToken: session.accessToken,
    refreshToken: session.refreshToken, issuedAt: new Date().toISOString() };
}
export async function javaLogout(): Promise<{ success: true }> {
  const refreshToken = store.getState().auth.refreshToken;
  if (refreshToken) await backendRequest<void>('admin/auth/logout', 'POST', { refreshToken });
  return { success: true };
}
export async function javaGetMe(): Promise<AdminUser> {
  return javaAdminUser(await backendRequest<JavaUser>('admin/auth/me'));
}
