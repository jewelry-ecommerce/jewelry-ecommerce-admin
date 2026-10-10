import { IconButton, type IconButtonProps } from '@mui/material';
import { usePermissionGate, type PermissionGateInput } from '../../permissions/use-permission-gate.hook';

export type PermissionIconButtonProps = IconButtonProps &
  PermissionGateInput & {
    unauthorizedMode?: 'hide' | 'disable';
    /** Tên cho catalog scan — ưu tiên `aria-label`. */
    actionLabel?: string;
  };

export const PermissionIconButton = ({
  permission,
  apiCode,
  actionCode,
  actionLabel,
  menuCode,
  tabCode,
  permissionResolver,
  unauthorizedMode = 'hide',
  disabled = false,
  onClick,
  ...props
}: PermissionIconButtonProps) => {
  const canAccess = usePermissionGate({
    permission,
    apiCode,
    actionCode,
    menuCode,
    tabCode,
    permissionResolver,
  });

  if (!canAccess && unauthorizedMode === 'hide') return null;

  return <IconButton {...props} disabled={disabled || (!canAccess && unauthorizedMode === 'disable')} onClick={canAccess ? onClick : undefined} aria-label={props['aria-label'] ?? actionLabel} />;
};
