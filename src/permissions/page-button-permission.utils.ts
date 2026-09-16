import type { PageButtonPermissionProps, PagePermissionScope, UnauthorizedMode } from "@/permissions/permission.interface";

export type { PageButtonPermissionProps, PagePermissionScope, UnauthorizedMode };

/**
 * Builds the permission props for every action on one page.
 *
 * Declare the scope once per feature (in a `*-permission.constants.ts` next to the page) and spread
 * the result onto the gated control, so permission literals never end up scattered through JSX:
 *
 * ```ts
 * export const PRODUCT_LIST_SCOPE = { menuCode: 'product', tabCode: 'list' } as const;
 * export const productListButtonPermission = createPageButtonPermission(PRODUCT_LIST_SCOPE);
 * // <CustomButton {...productListButtonPermission('create', 'Create product', 'api_product_create')} />
 * ```
 */
export const createPageButtonPermission =
  (scope: PagePermissionScope, defaultUnauthorizedMode: UnauthorizedMode = "hide") =>
  (actionCode: string, actionLabel: string, apiCode?: string | string[]): PageButtonPermissionProps => ({
    ...scope,
    actionCode,
    actionLabel,
    ...(apiCode ? { apiCode } : {}),
    unauthorizedMode: defaultUnauthorizedMode,
  });

/** Action code every list / detail screen checks before it renders or fetches. */
export const PAGE_VIEW_ACTION_CODE = "view";
