import { Button, CircularProgress, IconButton, darken, type ButtonProps, type IconButtonProps } from "@mui/material";
import type { ReactNode } from "react";

import { TYPOGRAPHY_STYLES, type TypographyScaleKey } from "@/common/constant/typography.constant";
import { COLOR, STYLE } from "@/theme/design-tokens";

export type ButtonElementVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type ButtonElementSize = "sm" | "md" | "lg";
export type IconButtonElementTone = "default" | "danger";

/**
 * Base button of the design system. This is the local replacement for the internal `ButtonElement`
 * the reference admin app imports; it holds styling and the loading state only — permission gating
 * is layered on top by `CustomButton`.
 */
export interface ButtonElementProps extends Omit<ButtonProps, "variant" | "size" | "color" | "content"> {
  /** Label. Kept for parity with the reference API; `children` wins when both are provided. */
  content?: ReactNode;
  variant?: ButtonElementVariant;
  size?: ButtonElementSize;
  /** Shows a spinner and blocks interaction while a mutation is in flight. */
  loading?: boolean;
}

const SPINNER_SIZE = 16;

const HOVER_DARKEN_RATIO = 0.12;

type ButtonSizeSpec = {
  minHeight: number;
  paddingInline: number;
  typography: TypographyScaleKey;
};

/** Heights derive from the shared control height so buttons line up with text fields. */
const SIZE_SPEC: Record<ButtonElementSize, ButtonSizeSpec> = {
  sm: {
    minHeight: STYLE.HEIGHT_DEFAULT_TEXT_FIELD_BUTTON - STYLE.PADDING_GAP_ITEM,
    paddingInline: STYLE.PADDING_GAP_ITEM + STYLE.PADDING_GAP_ITEM / 2,
    typography: "sm",
  },
  md: {
    minHeight: STYLE.HEIGHT_DEFAULT_TEXT_FIELD_BUTTON,
    paddingInline: STYLE.PADDING_GAP_LAYOUT,
    typography: "base",
  },
  lg: {
    minHeight: STYLE.HEIGHT_DEFAULT_TEXT_FIELD_BUTTON + STYLE.PADDING_GAP_ITEM,
    paddingInline: STYLE.PADDING_GAP_LAYOUT + STYLE.PADDING_GAP_ITEM,
    typography: "md",
  },
};

type ButtonVariantSpec = {
  /** The MUI variant the semantic variant maps to. */
  muiVariant: ButtonProps["variant"];
  background: string;
  color: string;
  borderColor: string;
  hoverBackground: string;
  hoverBorderColor: string;
  disabledBackground: string;
  disabledColor: string;
};

const TRANSPARENT = "transparent";

const VARIANT_SPEC: Record<ButtonElementVariant, ButtonVariantSpec> = {
  primary: {
    muiVariant: "contained",
    background: COLOR.NEUTRAL[900],
    color: COLOR.COMMON.white,
    borderColor: TRANSPARENT,
    hoverBackground: COLOR.NEUTRAL[800],
    hoverBorderColor: TRANSPARENT,
    disabledBackground: COLOR.NEUTRAL[300],
    disabledColor: COLOR.NEUTRAL[500],
  },
  secondary: {
    muiVariant: "contained",
    background: COLOR.BRAND[500],
    color: COLOR.COMMON.white,
    borderColor: TRANSPARENT,
    hoverBackground: COLOR.BRAND[600],
    hoverBorderColor: TRANSPARENT,
    disabledBackground: COLOR.BRAND[100],
    disabledColor: COLOR.BRAND[300],
  },
  outline: {
    muiVariant: "outlined",
    background: COLOR.COMMON.white,
    color: COLOR.NEUTRAL[900],
    borderColor: COLOR.NEUTRAL[300],
    hoverBackground: COLOR.NEUTRAL[50],
    hoverBorderColor: COLOR.NEUTRAL[400],
    disabledBackground: COLOR.COMMON.white,
    disabledColor: COLOR.NEUTRAL[400],
  },
  danger: {
    muiVariant: "contained",
    background: COLOR.STATUS.dangerFg,
    color: COLOR.COMMON.white,
    borderColor: TRANSPARENT,
    hoverBackground: darken(COLOR.STATUS.dangerFg, HOVER_DARKEN_RATIO),
    hoverBorderColor: TRANSPARENT,
    disabledBackground: COLOR.STATUS.dangerBg,
    disabledColor: COLOR.STATUS.dangerFg,
  },
  ghost: {
    muiVariant: "text",
    background: TRANSPARENT,
    color: COLOR.NEUTRAL[700],
    borderColor: TRANSPARENT,
    hoverBackground: COLOR.NEUTRAL[100],
    hoverBorderColor: TRANSPARENT,
    disabledBackground: TRANSPARENT,
    disabledColor: COLOR.NEUTRAL[400],
  },
};

export const ButtonElement = ({
  content,
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  startIcon,
  endIcon,
  sx,
  ...props
}: ButtonElementProps) => {
  const sizeSpec = SIZE_SPEC[size];
  const variantSpec = VARIANT_SPEC[variant];

  return (
    <Button
      {...props}
      type={type}
      variant={variantSpec.muiVariant}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={SPINNER_SIZE} color="inherit" /> : startIcon}
      endIcon={endIcon}
      sx={[
        {
          minHeight: sizeSpec.minHeight,
          paddingInline: `${sizeSpec.paddingInline}px`,
          ...TYPOGRAPHY_STYLES[sizeSpec.typography].medium,
          borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_ACTION}px`,
          textTransform: "none",
          whiteSpace: "nowrap",
          boxShadow: "none",
          backgroundColor: variantSpec.background,
          color: variantSpec.color,
          border: `1px solid ${variantSpec.borderColor}`,
          "&:hover": {
            backgroundColor: variantSpec.hoverBackground,
            borderColor: variantSpec.hoverBorderColor,
            boxShadow: "none",
          },
          "&.Mui-disabled": {
            backgroundColor: variantSpec.disabledBackground,
            color: variantSpec.disabledColor,
            borderColor: variantSpec.borderColor,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children ?? content}
    </Button>
  );
};

export interface IconButtonElementProps extends Omit<IconButtonProps, "size" | "color"> {
  size?: ButtonElementSize;
  tone?: IconButtonElementTone;
  loading?: boolean;
}

type IconButtonToneSpec = { color: string; hoverBackground: string };

const ICON_TONE_SPEC: Record<IconButtonElementTone, IconButtonToneSpec> = {
  default: { color: COLOR.NEUTRAL[600], hoverBackground: COLOR.NEUTRAL[100] },
  danger: { color: COLOR.STATUS.dangerFg, hoverBackground: COLOR.STATUS.dangerBg },
};

/** Square icon action. Same size ramp as `ButtonElement`, so toolbars align on one baseline. */
export const IconButtonElement = ({
  size = "md",
  tone = "default",
  loading = false,
  disabled = false,
  children,
  sx,
  ...props
}: IconButtonElementProps) => {
  const edge = SIZE_SPEC[size].minHeight;
  const toneSpec = ICON_TONE_SPEC[tone];

  return (
    <IconButton
      {...props}
      disabled={disabled || loading}
      sx={[
        {
          width: edge,
          height: edge,
          borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_SMALL}px`,
          color: toneSpec.color,
          "&:hover": { backgroundColor: toneSpec.hoverBackground },
          "&.Mui-disabled": { color: COLOR.NEUTRAL[400] },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {loading ? <CircularProgress size={SPINNER_SIZE} color="inherit" /> : children}
    </IconButton>
  );
};
