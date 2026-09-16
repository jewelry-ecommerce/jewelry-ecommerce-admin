import { IconButtonElement, type IconButtonElementProps } from "@/components/button/button-element.component";
import { usePermissionGate, type PermissionGateProps } from "@/permissions/use-permission-gate.hook";

export type PermissionIconButtonProps = IconButtonElementProps & PermissionGateProps;

/**
 * Permission-gated icon button. Hidden by default when denied, since an icon with no label gives the
 * user nothing to reason about. `actionLabel` becomes the accessible name unless `aria-label` is set.
 */
export const PermissionIconButton = ({
  apiCode,
  actionCode,
  actionLabel,
  menuCode,
  tabCode,
  unauthorizedMode = "hide",
  disabled = false,
  onClick,
  ...props
}: PermissionIconButtonProps) => {
  const canAccess = usePermissionGate({ apiCode, actionCode, menuCode, tabCode });

  if (!canAccess && unauthorizedMode === "hide") return null;

  return (
    <IconButtonElement
      {...props}
      aria-label={props["aria-label"] ?? actionLabel}
      disabled={disabled || !canAccess}
      onClick={canAccess ? onClick : undefined}
    />
  );
};
