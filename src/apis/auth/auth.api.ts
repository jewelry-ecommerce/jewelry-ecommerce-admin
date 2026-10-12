import type { AdminLoginPayload, AdminSession, AdminUser } from "@/apis/auth/auth.interface";
import { apiRequest } from "@/apis/transport";
import { getDataSourceMode, isJavaBackend } from "@/common/config/app.config";
import { javaLogin, javaLogout, javaGetMe } from "../java/java-auth.api";
const isJavaTransport = () => getDataSourceMode() === "HTTP" && isJavaBackend();
import { findAdminAccountByEmail, MOCK_ADMIN_ACCOUNTS, toAdminUser } from "@/mocks/data/admin-user.data";
import { MockApiError, withLatency } from "@/mocks/mock-transport";

/** Session issued by the last successful mock login. Lets `getMe` behave like a real endpoint. */
let activeMockSession: AdminSession | null = null;

const buildMockToken = (userId: string): string => `mock-admin-token.${userId}.${Date.now().toString(36)}`;

/** POST admin/auth/login */
export const login = (payload: AdminLoginPayload): Promise<AdminSession> =>
  isJavaTransport() ? javaLogin(payload.email, payload.password) : apiRequest({
    method: "POST",
    path: "admin/auth/login",
    body: payload,
    mock: () =>
      withLatency(() => {
        const account = findAdminAccountByEmail(payload.email);
        if (!account || account.password !== payload.password) {
          throw new MockApiError("AUTH_INVALID_CREDENTIALS", "Email or password is incorrect.", 401);
        }

        activeMockSession = {
          user: toAdminUser(account),
          accessToken: buildMockToken(account.id),
          issuedAt: new Date().toISOString(),
        };
        return activeMockSession;
      }),
  });

/** POST admin/auth/logout */
export const logout = (): Promise<{ success: true }> =>
  isJavaTransport() ? javaLogout() : apiRequest({
    method: "POST",
    path: "admin/auth/logout",
    mock: () =>
      withLatency(() => {
        activeMockSession = null;
        return { success: true as const };
      }),
  });

/** GET admin/auth/me */
export const getMe = (): Promise<AdminUser> =>
  isJavaTransport() ? javaGetMe() : apiRequest({
    method: "GET",
    path: "admin/auth/me",
    mock: () =>
      withLatency(() => {
        if (!activeMockSession) {
          throw new MockApiError("AUTH_SESSION_EXPIRED", "The session is no longer valid. Please sign in again.", 401);
        }
        return activeMockSession.user;
      }),
  });

/**
 * Re-arms the mock session after a page reload so `getMe` keeps working against a persisted token.
 * No-op when the data source is HTTP — the backend owns the session there.
 */
export const restoreMockSession = (user: AdminUser, accessToken: string): void => {
  if (!MOCK_ADMIN_ACCOUNTS.some((account) => account.id === user.id)) return;
  activeMockSession = { user, accessToken, issuedAt: new Date().toISOString() };
};
