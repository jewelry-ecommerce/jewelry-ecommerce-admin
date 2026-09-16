import type { DashboardSidebarNavGroup } from "@/router/dashboard-sidebar.nav";

/**
 * A page scope pins every action on a screen to one `(menuCode, tabCode)` pair. Both codes are the
 * same identifiers the sidebar navigation declares, so navigation and action gating cannot drift.
 */
export type PagePermissionScope = {
  menuCode: string;
  tabCode: string;
};

export type UnauthorizedMode = "hide" | "disable";

/** Props spread onto a gated control. */
export type PageButtonPermissionProps = PagePermissionScope & {
  /** Unique snake_case action identifier within the scope, e.g. `create`, `export_excel`. */
  actionCode: string;
  /** Human-readable action name — used for accessible labels and permission catalogues. */
  actionLabel: string;
  /** API code(s) the action calls. Present whenever the action performs a request. */
  apiCode?: string | string[];
  unauthorizedMode?: UnauthorizedMode;
};

/** What one role is allowed to do. */
export type RolePermissionGrant = {
  /** Sidebar menus the role can reach. `*` grants everything. */
  menuCodes: string[] | "*";
  /** `menuCode.tabCode` pairs the role can open. `*` grants everything. */
  tabCodes: string[] | "*";
  /** `menuCode.tabCode.actionCode` triples the role can perform. `*` grants everything. */
  actionCodes: string[] | "*";
  /** API codes the role may call. `*` grants everything. */
  apiCodes: string[] | "*";
};

export type PermissionContextValue = {
  /** True when the signed-in role has unrestricted access. */
  isSuperAdmin: boolean;
  /** Matches by API code, never by HTTP path. */
  hasApiAccess: (apiCode: string | string[]) => boolean;
  canAccessAction: (menuCode: string, tabCode: string, actionCode?: string) => boolean;
  canAccessMenu: (menuCode: string) => boolean;
  canAccessMenuTab: (menuCode: string, tabCode: string) => boolean;
  canAccessRoute: (pathname: string) => boolean;
  filterSidebarNav: (groups: DashboardSidebarNavGroup[]) => DashboardSidebarNavGroup[];
};
