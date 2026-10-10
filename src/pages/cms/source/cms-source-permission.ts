import type { PermissionGateProps } from "@/permissions/use-permission-gate.hook";
// Permissions are enforced by the existing route shell; no unknown SevaTrading API permission IDs.
export function contentCmsPagesButtonPermission(_action: string, label: string, _api: string): PermissionGateProps {
  return { actionLabel: label };
}
export const contentButtonPermission = contentCmsPagesButtonPermission;
