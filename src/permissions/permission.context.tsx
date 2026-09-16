import { useMemo, type ReactNode } from "react";

import type { AdminRoleCode } from "@/apis/auth/auth.interface";
import type { PermissionContextValue, RolePermissionGrant } from "@/permissions/permission.interface";
import { buildActionKey, buildTabKey, ROLE_PERMISSIONS } from "@/permissions/role.constant";
import { ALWAYS_ALLOWED_PATHS, DENY_ALL, PermissionContext } from "@/permissions/use-permission-context.hook";
import { useAppSelector } from "@/redux/store.redux";
import { collectNavLeaves, resolveLeafMenuCode, type DashboardSidebarNavGroup } from "@/router/dashboard-sidebar.nav";

type GrantSets = {
  isSuperAdmin: boolean;
  menuCodes: Set<string> | "all";
  tabCodes: Set<string> | "all";
  actionCodes: Set<string> | "all";
  apiCodes: Set<string> | "all";
};

const toGrantSet = (grant: string[] | "*"): Set<string> | "all" => (grant === "*" ? "all" : new Set(grant));

const buildGrantSets = (role: AdminRoleCode | null): GrantSets => {
  if (!role) return { isSuperAdmin: false, menuCodes: new Set(), tabCodes: new Set(), actionCodes: new Set(), apiCodes: new Set() };

  const grant: RolePermissionGrant = ROLE_PERMISSIONS[role];
  return {
    isSuperAdmin: grant.menuCodes === "*" && grant.tabCodes === "*" && grant.actionCodes === "*",
    menuCodes: toGrantSet(grant.menuCodes),
    tabCodes: toGrantSet(grant.tabCodes),
    actionCodes: toGrantSet(grant.actionCodes),
    apiCodes: toGrantSet(grant.apiCodes),
  };
};

const isGranted = (grant: Set<string> | "all", key: string): boolean => grant === "all" || grant.has(key);

/** Longest-prefix match so `/products/create` resolves to the products tab, not to `/`. */
const resolveRouteScope = (pathname: string): { menuCode: string; tabCode: string } | null => {
  const candidates = collectNavLeaves().flatMap((leaf) =>
    leaf.matchPaths
      .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
      .map((path) => ({ menuCode: leaf.menuCode, tabCode: leaf.tabCode, length: path.length })),
  );

  if (candidates.length === 0) return null;
  return candidates.reduce((best, candidate) => (candidate.length > best.length ? candidate : best));
};

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const role = useAppSelector((state) => state.auth.user?.role ?? null);

  const value = useMemo<PermissionContextValue>(() => {
    if (!role) return DENY_ALL;
    const grants = buildGrantSets(role);

    const canAccessMenu = (menuCode: string): boolean => (menuCode ? isGranted(grants.menuCodes, menuCode) : true);

    const canAccessMenuTab = (menuCode: string, tabCode: string): boolean => {
      if (!menuCode || !tabCode) return true;
      return canAccessMenu(menuCode) && isGranted(grants.tabCodes, buildTabKey(menuCode, tabCode));
    };

    const canAccessAction = (menuCode: string, tabCode: string, actionCode = "view"): boolean => {
      if (!menuCode || !tabCode) return true;
      return canAccessMenuTab(menuCode, tabCode) && isGranted(grants.actionCodes, buildActionKey(menuCode, tabCode, actionCode));
    };

    const hasApiAccess = (apiCode: string | string[]): boolean => {
      if (!apiCode) return true;
      const codes = (Array.isArray(apiCode) ? apiCode : [apiCode]).filter(Boolean);
      return codes.length === 0 || codes.every((code) => isGranted(grants.apiCodes, code));
    };

    const canAccessRoute = (pathname: string): boolean => {
      if (ALWAYS_ALLOWED_PATHS.includes(pathname)) return true;
      const scope = resolveRouteScope(pathname);
      // Unmapped routes stay reachable; the page's own view gate is the authority for them.
      if (!scope) return true;
      return canAccessMenuTab(scope.menuCode, scope.tabCode);
    };

    const filterSidebarNav = (groups: DashboardSidebarNavGroup[]): DashboardSidebarNavGroup[] =>
      groups
        .map((group) => {
          if (!group.items?.length) return canAccessMenu(group.menuCode) ? group : null;

          const items = group.items.filter((leaf) => canAccessMenuTab(resolveLeafMenuCode(group, leaf), leaf.tabCode));
          if (items.length === 0) return null;
          return { ...group, items };
        })
        .filter((group): group is DashboardSidebarNavGroup => group !== null);

    return {
      isSuperAdmin: grants.isSuperAdmin,
      hasApiAccess,
      canAccessAction,
      canAccessMenu,
      canAccessMenuTab,
      canAccessRoute,
      filterSidebarNav,
    };
  }, [role]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};
