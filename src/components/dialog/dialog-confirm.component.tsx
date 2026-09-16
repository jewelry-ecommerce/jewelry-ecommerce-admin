import { CheckCircleOutlineRounded, CloseRounded, ErrorOutlineRounded, InfoOutlined } from "@mui/icons-material";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { ButtonElement, type ButtonElementProps } from "@/components/button/button-element.component";
import { CustomButton } from "@/components/button/custom-button.component";
import type { PageButtonPermissionProps } from "@/permissions/permission.interface";
import { COLOR, STYLE } from "@/theme/design-tokens";

const ICON_SIZE = 20;

export type DialogConfirmTone = "danger" | "warning" | "info" | "neutral";

export type DialogConfirmButtonProps = Partial<Omit<ButtonElementProps, "variant">> & Partial<PageButtonPermissionProps>;

const HIGHLIGHT_PALETTE: Record<
  DialogConfirmTone,
  { bg: string; border: string; titleColor: string; descColor: string; iconColor: string }
> = {
  danger: {
    bg: COLOR.STATUS.dangerBg,
    border: "#FECDCA",
    titleColor: COLOR.STATUS.dangerFg,
    descColor: COLOR.STATUS.dangerFg,
    iconColor: "#D92D20",
  },
  warning: {
    bg: COLOR.STATUS.warningBg,
    border: "#FEDF89",
    titleColor: COLOR.STATUS.warningFg,
    descColor: COLOR.STATUS.warningFg,
    iconColor: "#F79009",
  },
  info: {
    bg: COLOR.STATUS.infoBg,
    border: "#B2DDFF",
    titleColor: COLOR.STATUS.infoFg,
    descColor: COLOR.STATUS.infoFg,
    iconColor: "#1570EF",
  },
  neutral: {
    bg: COLOR.NEUTRAL[50],
    border: COLOR.NEUTRAL[200],
    titleColor: COLOR.NEUTRAL[900],
    descColor: COLOR.NEUTRAL[600],
    iconColor: COLOR.NEUTRAL[600],
  },
};

export interface DialogConfirmHighlight {
  tone: DialogConfirmTone;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

export interface DialogConfirmComponentProps {
  open: boolean;
  loading?: boolean;
  title: string;
  /** Coloured callout summarising the consequence of confirming. */
  highlight?: DialogConfirmHighlight;
  children?: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "danger";
  cancelButtonProps?: DialogConfirmButtonProps;
  confirmButtonProps?: DialogConfirmButtonProps;
  /** Removes the header close button — for confirmations that must be answered explicitly. */
  hideCloseButton?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const defaultHighlightIcon = (tone: DialogConfirmTone): ReactNode => {
  const iconSx = { fontSize: ICON_SIZE, color: HIGHLIGHT_PALETTE[tone].iconColor };
  if (tone === "danger" || tone === "warning") return <ErrorOutlineRounded aria-hidden sx={iconSx} />;
  if (tone === "info") return <CheckCircleOutlineRounded aria-hidden sx={iconSx} />;
  return <InfoOutlined aria-hidden sx={iconSx} />;
};

const renderActionButton = (
  button: DialogConfirmButtonProps,
  defaultLabel: string,
  variant: ButtonElementProps["variant"],
  loading: boolean,
  onClick: () => void,
) => {
  const { actionCode, actionLabel, apiCode, menuCode, tabCode, unauthorizedMode, content, children, ...rest } = button;
  const label = children ?? content ?? defaultLabel;
  const isGated = Boolean(actionCode || apiCode);

  if (!isGated) {
    return <ButtonElement {...rest} variant={variant} loading={loading} content={label} onClick={onClick} />;
  }

  return (
    <CustomButton
      {...rest}
      variant={variant}
      loading={loading}
      menuCode={menuCode}
      tabCode={tabCode}
      actionCode={actionCode}
      actionLabel={actionLabel ?? (typeof label === "string" ? label : undefined)}
      apiCode={apiCode}
      unauthorizedMode={unauthorizedMode ?? "hide"}
      onClick={onClick}
    >
      {label}
    </CustomButton>
  );
};

export const DialogConfirmComponent = ({
  open,
  loading = false,
  title,
  highlight,
  children,
  cancelLabel,
  confirmLabel,
  confirmVariant = "danger",
  cancelButtonProps,
  confirmButtonProps,
  hideCloseButton = false,
  onCancel,
  onConfirm,
}: DialogConfirmComponentProps) => {
  const palette = highlight ? HIGHLIGHT_PALETTE[highlight.tone] : null;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_MIDDLE}px` } } }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          p: 3,
          borderBottom: `1px solid ${COLOR.NEUTRAL[200]}`,
        }}
      >
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semiBold, color: COLOR.NEUTRAL[900] }}>{title}</Typography>
        {hideCloseButton ? null : (
          <IconButton size="small" aria-label="Close dialog" onClick={onCancel} sx={{ color: COLOR.NEUTRAL[400] }}>
            <CloseRounded sx={{ fontSize: ICON_SIZE }} />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3, ".MuiDialogTitle-root + &": { pt: 3 } }}>
        <Stack gap={2}>
          {highlight && palette ? (
            <Stack
              direction="row"
              gap={1.5}
              alignItems="flex-start"
              sx={{
                p: 2,
                borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_MIDDLE}px`,
                bgcolor: palette.bg,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Box sx={{ flexShrink: 0, lineHeight: 0, pt: "2px" }}>{highlight.icon ?? defaultHighlightIcon(highlight.tone)}</Box>
              <Stack gap={0.5} sx={{ minWidth: 0 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold, color: palette.titleColor }}>{highlight.title}</Typography>
                {highlight.description ? (
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: palette.descColor }}>{highlight.description}</Typography>
                ) : null}
              </Stack>
            </Stack>
          ) : null}
          {children}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${COLOR.NEUTRAL[200]}`, gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {renderActionButton({ disabled: loading, ...cancelButtonProps }, cancelLabel, "outline", false, onCancel)}
        {renderActionButton(confirmButtonProps ?? {}, confirmLabel, confirmVariant, loading, onConfirm)}
      </DialogActions>
    </Dialog>
  );
};
