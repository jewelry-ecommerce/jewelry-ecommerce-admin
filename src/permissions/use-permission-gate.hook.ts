import { usePermissionContext } from "@/permissions/use-permission-context.hook";
import type { UnauthorizedMode } from "@/permissions/permission.interface";

export type PermissionGateInput = {
  apiCode?: string | string[];
  actionCode?: string;
  menuCode?: string;
  tabCode?: string;
};

export type PermissionGateProps = PermissionGateInput & {
  actionLabel?: string;
  unauthorizedMode?: UnauthorizedMode;
};

/**
 * Resolves whether the current admin may use one control. Matching is by action code and API code —
 * never by HTTP path — so renaming an endpoint cannot silently open a button.
 */
export const usePermissionGate = ({ apiCode, actionCode, menuCode, tabCode }: PermissionGateInput): boolean => {
  const { hasApiAccess, canAccessAction } = usePermissionContext();

  const hasActionAccess = menuCode && tabCode && actionCode ? canAccessAction(menuCode, tabCode, actionCode) : true;
  const hasApiPermission = apiCode ? hasApiAccess(apiCode) : true;

  return hasActionAccess && hasApiPermission;
};
