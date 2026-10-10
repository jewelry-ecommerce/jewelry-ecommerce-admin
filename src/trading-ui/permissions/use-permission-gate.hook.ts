import { usePermissionGate as useAppPermissionGate } from '@/permissions/use-permission-gate.hook';
import type { PermissionGateInput as AppPermissionGateInput } from '@/permissions/use-permission-gate.hook';
export interface PermissionGateInput extends AppPermissionGateInput {
  permission?: string;
  permissionResolver?: () => boolean;
}
export function usePermissionGate(input: PermissionGateInput): boolean {
  const permitted = useAppPermissionGate(input);
  return permitted && (input.permissionResolver?.() ?? true);
}
