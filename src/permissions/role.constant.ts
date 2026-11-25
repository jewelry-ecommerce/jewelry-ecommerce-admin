import type { AdminRoleCode, PagePermissionGrant } from "@/apis/auth/auth.interface";
import type { RolePermissionGrant } from "@/permissions/permission.interface";

/** Read-only actions every role with tab access may perform. */
const READ_ACTIONS = ["view", "detail", "export_excel", "refresh"] as const;

const WRITE_ACTIONS = [
  "view",
  "detail",
  "create",
  "update",
  "delete",
  "archive",
  "publish",
  "duplicate",
  "reorder",
  "toggle_visibility",
  "status_change",
  "refresh",
  "export_excel",
  "import_excel",
  "download_template",
  "validate_import",
  "start_import",
  "request_export",
  "submit",
  "cancel_approval",
  "restore_published",
] as const;

const DELETE_ACTIONS = ["delete", "archive"] as const;

const EDIT_ACTIONS = WRITE_ACTIONS.filter((action) => !DELETE_ACTIONS.includes(action as (typeof DELETE_ACTIONS)[number]) && action !== "view" && action !== "detail" && action !== "export_excel" && action !== "refresh");

export const ROLE_PERMISSIONS: Record<AdminRoleCode, RolePermissionGrant> = {
  ROOT: { menuCodes: "*", tabCodes: "*", actionCodes: "*", apiCodes: "*" },
  ADMIN: { menuCodes: "*", tabCodes: "*", actionCodes: "*", apiCodes: "*" },
  CATALOG_MANAGER: { menuCodes: ["dashboard", "product", "content", "promotion"], tabCodes: "*", actionCodes: "*", apiCodes: "*" },
  ORDER_MANAGER: { menuCodes: ["dashboard", "order", "inventory", "customer_request"], tabCodes: "*", actionCodes: "*", apiCodes: "*" },
  VIEWER: { menuCodes: "*", tabCodes: "*", actionCodes: [], apiCodes: "*" },
};

export const ROLE_LABELS: Record<AdminRoleCode, string> = {
  ROOT: "Root",
  ADMIN: "Administrator",
  CATALOG_MANAGER: "Catalog manager",
  ORDER_MANAGER: "Order manager",
  VIEWER: "Viewer (read-only)",
};

export const buildTabKey = (menuCode: string, tabCode: string): string => `${menuCode}.${tabCode}`;

export const buildActionKey = (menuCode: string, tabCode: string, actionCode: string): string => `${menuCode}.${tabCode}.${actionCode}`;

/** Map page grant → RolePermissionGrant for PermissionProvider. */
export const grantsToPermissionGrant = (pagePermissions: readonly PagePermissionGrant[]): RolePermissionGrant => {
  const menuCodes = new Set<string>();
  const tabCodes = new Set<string>();
  const actionCodes = new Set<string>();

  for (const grant of pagePermissions) {
    if (!grant.view && !grant.edit && !grant.delete) continue;
    const [menuCode, ...rest] = grant.pageCode.split(".");
    const tabCode = rest.join(".") || "list";
    if (!menuCode) continue;
    menuCodes.add(menuCode);
    tabCodes.add(buildTabKey(menuCode, tabCode));
    if (grant.view || grant.edit || grant.delete) {
      for (const action of READ_ACTIONS) actionCodes.add(buildActionKey(menuCode, tabCode, action));
    }
    if (grant.edit) {
      for (const action of EDIT_ACTIONS) actionCodes.add(buildActionKey(menuCode, tabCode, action));
    }
    if (grant.delete) {
      for (const action of DELETE_ACTIONS) actionCodes.add(buildActionKey(menuCode, tabCode, action));
    }
  }

  return {
    menuCodes: [...menuCodes],
    tabCodes: [...tabCodes],
    actionCodes: [...actionCodes],
    apiCodes: "*",
  };
};
