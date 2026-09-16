import { createPageButtonPermission } from "@/permissions/page-button-permission.utils";
import type { PagePermissionScope } from "@/permissions/permission.interface";

/** Scope of the overview screen. Matches the `dashboard` sidebar group. */
export const DASHBOARD_PAGE_SCOPE: PagePermissionScope = { menuCode: "dashboard", tabCode: "overview" };

export const dashboardButtonPermission = createPageButtonPermission(DASHBOARD_PAGE_SCOPE);
