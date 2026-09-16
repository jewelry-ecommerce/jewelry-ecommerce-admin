import { createContext, useContext } from "react";

import type { PermissionContextValue } from "@/permissions/permission.interface";
import { ROUTE_PATH } from "@/router/route.path";

/** Routes any signed-in admin may open regardless of role. */
export const ALWAYS_ALLOWED_PATHS: readonly string[] = [ROUTE_PATH.DASHBOARD, ROUTE_PATH.NO_ACCESS];

/**
 * Default value of the permission context: nothing is granted. Rendering a gated control outside the
 * provider therefore hides it instead of exposing it.
 */
export const DENY_ALL: PermissionContextValue = {
  isSuperAdmin: false,
  hasApiAccess: () => false,
  canAccessAction: () => false,
  canAccessMenu: () => false,
  canAccessMenuTab: () => false,
  canAccessRoute: (pathname) => ALWAYS_ALLOWED_PATHS.includes(pathname),
  filterSidebarNav: () => [],
};

export const PermissionContext = createContext<PermissionContextValue>(DENY_ALL);

export const usePermissionContext = (): PermissionContextValue => useContext(PermissionContext);
