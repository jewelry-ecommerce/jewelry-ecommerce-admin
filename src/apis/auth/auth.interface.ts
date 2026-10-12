/** Roles available in the mock RBAC model. Codes are stable and shared with `role.constant.ts`. */
export type AdminRoleCode = "ADMIN" | "CATALOG_MANAGER" | "ORDER_MANAGER" | "VIEWER";

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRoleCode;
  avatar: string | null;
  jobTitle: string;
  lastLoginAt: string | null;
};

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminSession = {
  user: AdminUser;
  accessToken: string;
  refreshToken?: string;
  issuedAt: string;
};
