/** Roles available in the mock/Java RBAC model. */
export type AdminRoleCode = "ROOT" | "ADMIN" | "CATALOG_MANAGER" | "ORDER_MANAGER" | "VIEWER";

export type PagePermissionGrant = {
  pageCode: string;
  view: boolean;
  edit: boolean;
  delete: boolean;
};

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  /** Primary role for legacy gates; prefer `roles` + `root`. */
  role: AdminRoleCode;
  roles: AdminRoleCode[];
  root: boolean;
  /** Java session luôn gửi mảng (có thể rỗng). Mock bỏ field → FE dùng ROLE_PERMISSIONS. */
  pagePermissions?: PagePermissionGrant[];
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
