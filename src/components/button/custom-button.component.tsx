import { ButtonElement, type ButtonElementProps } from "@/components/button/button-element.component";
import { usePermissionGate, type PermissionGateProps } from "@/permissions/use-permission-gate.hook";

export type CustomButtonProps = ButtonElementProps & PermissionGateProps;

/**
 * Permission-gated text button. Use this — not a raw MUI `Button` — for every business action:
 * navigation, dialog opening, submit, mutation, export and destructive controls.
 *
 * Denied users get a disabled button by default (`unauthorizedMode: 'disable'`), and `onClick` is
 * withheld entirely so a stray programmatic click cannot fire the action.
 */
export const CustomButton = ({
  apiCode,
  actionCode,
  actionLabel,
  menuCode,
  tabCode,
  unauthorizedMode = "disable",
  disabled = false,
  onClick,
  type = "button",
  ...props
}: CustomButtonProps) => {
  const canAccess = usePermissionGate({ apiCode, actionCode, menuCode, tabCode });

  if (!canAccess && unauthorizedMode === "hide") return null;

  return (
    <ButtonElement
      {...props}
      type={type}
      aria-label={props["aria-label"] ?? actionLabel}
      disabled={disabled || !canAccess}
      onClick={canAccess ? onClick : undefined}
    />
  );
};
