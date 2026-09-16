import { CloseRounded } from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  type DialogProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { ReactNode } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { ButtonElement, type ButtonElementProps } from "@/components/button/button-element.component";
import { CustomButton } from "@/components/button/custom-button.component";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled/stack.style";
import type { PageButtonPermissionProps } from "@/permissions/permission.interface";
import { COLOR, STYLE } from "@/theme/design-tokens";

const CLOSE_ICON_SIZE = 20;

export type DialogButtonProps = Omit<ButtonElementProps, "variant"> &
  Partial<PageButtonPermissionProps> & {
    variant?: ButtonElementProps["variant"];
  };

const hasPermissionGate = (button: DialogButtonProps): boolean => Boolean(button.actionCode || button.apiCode);

/**
 * Footer buttons route through `CustomButton` whenever they declare permission metadata, so a dialog
 * action is gated exactly like a page action.
 */
const renderFooterButton = (button: DialogButtonProps, defaultVariant: ButtonElementProps["variant"]) => {
  const { actionCode, actionLabel, apiCode, menuCode, tabCode, unauthorizedMode, content, variant, children, ...rest } = button;
  const label = children ?? content;

  if (!hasPermissionGate(button)) {
    return <ButtonElement {...rest} variant={variant ?? defaultVariant} content={label} />;
  }

  return (
    <CustomButton
      {...rest}
      variant={variant ?? defaultVariant}
      menuCode={menuCode}
      tabCode={tabCode}
      actionCode={actionCode}
      actionLabel={actionLabel ?? (typeof label === "string" ? label : undefined)}
      apiCode={apiCode}
      unauthorizedMode={unauthorizedMode ?? "hide"}
    >
      {label}
    </CustomButton>
  );
};

export interface DialogComponentProps extends Omit<DialogProps, "children"> {
  title: string;
  children: ReactNode;
  /** Left-aligned action, e.g. a destructive "Delete" in an edit dialog. */
  buttonStart?: DialogButtonProps;
  buttonLeft?: DialogButtonProps;
  buttonRight?: DialogButtonProps;
  icon?: ReactNode;
  sxFooter?: SxProps<Theme>;
}

export const DialogComponent = ({
  title,
  children,
  open,
  onClose,
  buttonStart,
  buttonLeft,
  buttonRight,
  maxWidth = "sm",
  fullWidth = true,
  icon,
  sxFooter,
  ...rest
}: DialogComponentProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth={maxWidth}
    fullWidth={fullWidth}
    slotProps={{ paper: { sx: { borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_MIDDLE}px` } } }}
    {...rest}
  >
    <DialogTitle
      component="div"
      sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 3, borderBottom: `1px solid ${COLOR.NEUTRAL[200]}` }}
    >
      <StackRowAlignCenter sx={{ gap: 1.5, minWidth: 0 }}>
        {icon ? (
          <StackRowAlignCenter sx={{ p: "10px", borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_MIDDLE}px`, bgcolor: COLOR.NEUTRAL[900] }}>
            {icon}
          </StackRowAlignCenter>
        ) : null}
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semiBold, color: COLOR.NEUTRAL[900] }}>{title}</Typography>
      </StackRowAlignCenter>

      <IconButton
        size="small"
        aria-label="Close dialog"
        onClick={(event) => onClose?.(event, "escapeKeyDown")}
        sx={{ color: COLOR.NEUTRAL[500] }}
      >
        <CloseRounded sx={{ fontSize: CLOSE_ICON_SIZE }} />
      </IconButton>
    </DialogTitle>

    <DialogContent sx={{ px: 3, pb: 3, ".MuiDialogTitle-root + &": { pt: 3 } }}>{children}</DialogContent>

    {buttonStart || buttonLeft || buttonRight ? (
      <DialogActions sx={{ p: 3, pt: 0, ...sxFooter }}>
        <StackRowAlignCenterJustBetween sx={{ width: "100%" }}>
          {buttonStart ? renderFooterButton(buttonStart, "outline") : <span />}
          <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
            {buttonLeft ? renderFooterButton(buttonLeft, "outline") : null}
            {buttonRight ? renderFooterButton(buttonRight, "primary") : null}
          </Stack>
        </StackRowAlignCenterJustBetween>
      </DialogActions>
    ) : null}
  </Dialog>
);
