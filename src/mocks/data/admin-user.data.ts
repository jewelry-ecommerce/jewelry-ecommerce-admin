import type { AdminRoleCode, AdminUser } from "@/apis/auth/auth.interface";
import { buildThumbImage } from "@/utils/media/placeholder.util";

/**
 * DEMO-ONLY credentials.
 *
 * These accounts exist purely so the mock data source can exercise every branch of the role model
 * without a backend. They are not secrets, they are not reused anywhere else, and they must never be
 * carried into an environment that talks to a real identity provider — when `VITE_DATA_SOURCE=HTTP`
 * the login call goes to the backend and this fixture is ignored entirely.
 */
export type MockAdminAccount = AdminUser & {
  /** Plain-text demo password. Intentionally visible: there is nothing to protect in a fixture. */
  password: string;
};

export const MOCK_ADMIN_ACCOUNTS: MockAdminAccount[] = [
  {
    id: "adm-owner",
    email: "admin@aurelia.test",
    password: "admin1234",
    displayName: "Aurelia Owner",
    role: "ADMIN",
    avatar: buildThumbImage("Aurelia Owner", "charcoal"),
    jobTitle: "Platform administrator",
    lastLoginAt: "2026-09-08T01:05:00.000Z",
  },
  {
    id: "adm-catalog",
    email: "catalog@aurelia.test",
    password: "catalog1234",
    displayName: "Mai Catalog",
    role: "CATALOG_MANAGER",
    avatar: buildThumbImage("Mai Catalog", "gold"),
    jobTitle: "Merchandising lead",
    lastLoginAt: "2026-09-07T08:40:00.000Z",
  },
  {
    id: "adm-order",
    email: "orders@aurelia.test",
    password: "orders1234",
    displayName: "Khanh Orders",
    role: "ORDER_MANAGER",
    avatar: buildThumbImage("Khanh Orders", "sage"),
    jobTitle: "Fulfilment supervisor",
    lastLoginAt: "2026-09-08T00:20:00.000Z",
  },
  {
    id: "adm-viewer",
    email: "viewer@aurelia.test",
    password: "viewer1234",
    displayName: "Linh Viewer",
    role: "VIEWER",
    avatar: buildThumbImage("Linh Viewer", "blush"),
    jobTitle: "Business analyst",
    lastLoginAt: "2026-09-06T03:15:00.000Z",
  },
];

/** Hint rendered on the login screen so the demo is usable without reading the source. */
export const MOCK_ADMIN_CREDENTIAL_HINTS: { email: string; password: string; role: AdminRoleCode }[] = MOCK_ADMIN_ACCOUNTS.map(
  ({ email, password, role }) => ({ email, password, role }),
);

export const findAdminAccountByEmail = (email: string): MockAdminAccount | undefined =>
  MOCK_ADMIN_ACCOUNTS.find((account) => account.email.toLowerCase() === email.trim().toLowerCase());

export const toAdminUser = (account: MockAdminAccount): AdminUser => {
  const { id, email, displayName, role, avatar, jobTitle, lastLoginAt } = account;
  return { id, email, displayName, role, avatar, jobTitle, lastLoginAt };
};
