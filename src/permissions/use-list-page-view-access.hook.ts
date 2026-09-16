import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { usePermissionContext } from "@/permissions/use-permission-context.hook";
import { PAGE_VIEW_ACTION_CODE } from "@/permissions/page-button-permission.utils";
import type { PagePermissionScope } from "@/permissions/permission.interface";
import { getNoAccessPath } from "@/router/route.path";

type UseListPageViewAccessOptions = {
  /** Redirect to the no-access page when denied. Set false to render a local empty state instead. */
  redirectOnDeny?: boolean;
};

/**
 * Gates a list or detail screen on the `view` action of its scope. Call it before fetching so a
 * denied user never triggers a request.
 */
export const useListPageViewAccess = (
  scope: PagePermissionScope,
  { redirectOnDeny = true }: UseListPageViewAccessOptions = {},
): boolean => {
  const { canAccessAction } = usePermissionContext();
  const navigate = useNavigate();

  const canViewList = canAccessAction(scope.menuCode, scope.tabCode, PAGE_VIEW_ACTION_CODE);

  useEffect(() => {
    if (!redirectOnDeny || canViewList) return;
    navigate(getNoAccessPath("permission"), { replace: true });
  }, [canViewList, navigate, redirectOnDeny]);

  return canViewList;
};
