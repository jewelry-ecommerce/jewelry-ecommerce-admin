import { useMemo, type ReactNode } from "react";

import type { AdminRoleCode } from "@/apis/auth/auth.interface";
import type { PermissionContextValue, RolePermissionGrant } from "@/permissions/permission.interface";
import { buildActionKey, buildTabKey, grantsToPermissionGrant, ROLE_PERMISSIONS } from "@/permissions/role.constant";
import { ALWAYS_ALLOWED_PATHS, DENY_ALL, PermissionContext } from "@/permissions/use-permission-context.hook";
import { useAppSelector } from "@/redux/store.redux";
import { collectNavLeaves, resolveLeafMenuCode, isNavItemWithChildren, type DashboardSidebarNavItem, type DashboardSidebarNavGroup } from "@/router/dashboard-sidebar.nav";

type GrantSets = {
  isSuperAdmin: boolean;
  menuCodes: Set<string> | "all";
  tabCodes: Set<string> | "all";
  actionCodes: Set<string> | "all";
  apiCodes: Set<string> | "all";
};

const toGrantSet = (grant: string[] | "*"): Set<string> | "all" => (grant === "*" ? "all" : new Set(grant));

const resolveGrant = (
  role: AdminRoleCode | null,
  root: boolean,
  pagePermissions: RolePermissionGrant | null,
  usePageGrants: boolean,
): RolePermissionGrant | null => {
  if (root) return ROLE_PERMISSIONS.ROOT;
  // Java session: grants array is the source of truth (empty = no pages).
  if (usePageGrants) return pagePermissions ?? grantsToPermissionGrant([]);
  if (pagePermissions && (pagePermissions.menuCodes === "*" || pagePermissions.menuCodes.length > 0)) {
    return pagePermissions;
  }
  if (!role) return null;
  return ROLE_PERMISSIONS[role] ?? null;
};

const buildGrantSets = (grant: RolePermissionGrant | null): GrantSets => {
  if (!grant) return { isSuperAdmin: false, menuCodes: new Set(), tabCodes: new Set(), actionCodes: new Set(), apiCodes: new Set() };
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
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role ?? null;
  const root = Boolean(user?.root || user?.roles?.includes("ROOT"));
  /** Java login always sends pagePermissions (may be []); empty = no page access. Mock may omit and fall back to role matrix. */
  const usePageGrants = !root && Array.isArray(user?.pagePermissions);
  const fromPages = usePageGrants ? grantsToPermissionGrant(user?.pagePermissions ?? []) : null;

  const value = useMemo<PermissionContextValue>(() => {
    const grant = resolveGrant(role, root, fromPages, usePageGrants);
    if (!grant) return DENY_ALL;
    const grants = buildGrantSets(grant);

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
      if (!scope) return true;
      return canAccessMenuTab(scope.menuCode, scope.tabCode);
    };

    const filterSidebarNav = (groups: DashboardSidebarNavGroup[]): DashboardSidebarNavGroup[] => {
      const next: DashboardSidebarNavGroup[] = [];
      for (const group of groups) {
        if (group.menuCode === "permission" && !grants.isSuperAdmin && !root) continue;
        const sourceItems = group.items ?? [];
        const hasMenuAccess =
          canAccessMenu(group.menuCode) ||
          sourceItems.some((item) => {
            if (isNavItemWithChildren(item)) {
              return item.children.some((child) => canAccessMenuTab(resolveLeafMenuCode(group, child), child.tabCode));
            }
            return canAccessMenuTab(resolveLeafMenuCode(group, item), item.tabCode);
          });
        if (!hasMenuAccess) continue;
        const items: DashboardSidebarNavItem[] = [];
        for (const item of sourceItems) {
          if (isNavItemWithChildren(item)) {
            const children = item.children.filter((child) => canAccessMenuTab(resolveLeafMenuCode(group, child), child.tabCode));
            if (children.length) items.push({ ...item, children });
            continue;
          }
          if (item.hiddenFromNav || canAccessMenuTab(resolveLeafMenuCode(group, item), item.tabCode)) items.push(item);
        }
        if (items.length) next.push({ ...group, items });
      }
      return next;
    };

    return {
      isSuperAdmin: grants.isSuperAdmin,
      hasApiAccess,
      canAccessAction,
      canAccessMenu,
      canAccessMenuTab,
      canAccessRoute,
      filterSidebarNav,
    };
  }, [fromPages, role, root, usePageGrants]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};
