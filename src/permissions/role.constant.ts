import type { AdminRoleCode } from "@/apis/auth/auth.interface";
import type { RolePermissionGrant } from "@/permissions/permission.interface";

/** Read-only actions every role with tab access may perform. */
const READ_ACTIONS = ["view", "detail", "export_excel", "refresh"] as const;

/**
 * Full action vocabulary of the console. Every `actionCode` a screen declares must appear here,
 * otherwise the non-admin roles would silently lose the control.
 */
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
] as const;

const CATALOG_MENUS = ["dashboard", "product", "set", "cms"];
const CATALOG_TABS = [
  "product.list",
  "product.category",
  "product.collection",
  "product.attribute",
  "product.material",
  "product.gemstone",
  "product.import",
  "product.export",
  "set.list",
  "cms.page",
  "cms.banner",
  "cms.navigation",
  "dashboard.overview",
];

const ORDER_MENUS = ["dashboard", "order", "inventory", "customer", "loyalty", "inquiry", "report"];
const ORDER_TABS = [
  "order.list",
  "inventory.overview",
  "inventory.warehouse",
  "inventory.stock",
  "inventory.adjustment",
  "inventory.receipt",
  "inventory.movement",
  "customer.list",
  "loyalty.account",
  "loyalty.tier",
  "inquiry.list",
  "report.sales",
  "report.orders",
  "report.inventory",
  "report.customers",
  "dashboard.overview",
];

const buildWriteActions = (tabCodes: string[]): string[] =>
  tabCodes.flatMap((tabCode) => WRITE_ACTIONS.map((action) => `${tabCode}.${action}`));

const buildReadActions = (tabCodes: string[]): string[] =>
  tabCodes.flatMap((tabCode) => READ_ACTIONS.map((action) => `${tabCode}.${action}`));

/**
 * Mock RBAC grants.
 *
 * `menuCodes` gates sidebar groups, `tabCodes` gates screens (`menu.tab`), `actionCodes` gates
 * individual controls (`menu.tab.action`), and `apiCodes` gates the requests those controls make.
 * `'*'` means unrestricted, which is how the ADMIN role is expressed.
 */
export const ROLE_PERMISSIONS: Record<AdminRoleCode, RolePermissionGrant> = {
  ADMIN: {
    menuCodes: "*",
    tabCodes: "*",
    actionCodes: "*",
    apiCodes: "*",
  },
  CATALOG_MANAGER: {
    menuCodes: CATALOG_MENUS,
    tabCodes: CATALOG_TABS,
    actionCodes: buildWriteActions(CATALOG_TABS),
    apiCodes: "*",
  },
  ORDER_MANAGER: {
    menuCodes: ORDER_MENUS,
    tabCodes: ORDER_TABS,
    actionCodes: buildWriteActions(ORDER_TABS),
    apiCodes: "*",
  },
  VIEWER: {
    menuCodes: [...new Set([...CATALOG_MENUS, ...ORDER_MENUS])],
    tabCodes: [...new Set([...CATALOG_TABS, ...ORDER_TABS])],
    // Read-only: no create / update / delete anywhere.
    actionCodes: buildReadActions([...new Set([...CATALOG_TABS, ...ORDER_TABS])]),
    apiCodes: "*",
  },
};

export const ROLE_LABELS: Record<AdminRoleCode, string> = {
  ADMIN: "Administrator",
  CATALOG_MANAGER: "Catalog manager",
  ORDER_MANAGER: "Order manager",
  VIEWER: "Viewer (read-only)",
};

export const buildTabKey = (menuCode: string, tabCode: string): string => `${menuCode}.${tabCode}`;

export const buildActionKey = (menuCode: string, tabCode: string, actionCode: string): string => `${menuCode}.${tabCode}.${actionCode}`;
