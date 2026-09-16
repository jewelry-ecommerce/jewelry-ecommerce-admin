/**
 * Local design tokens.
 *
 * These replace the internal design-token package the reference admin app imports — this app has no
 * dependency on it. Palette values are copied from
 * `jewelry-commerce-client/src/utils/constants/style.constant.ts` so the storefront and the back
 * office render one visual system; the layout block adds the admin-only shell measurements
 * (sidebar widths, row heights, content padding).
 */
export const STYLE = {
  /** Fixed dashboard header row. */
  HEIGHT_HEADER: 64,
  /** Shared control height for text fields and buttons. */
  HEIGHT_DEFAULT_TEXT_FIELD_BUTTON: 40,
  /** One sidebar navigation leaf. */
  HEIGHT_SIDEBAR_ITEM: 40,
  SIDEBAR_WIDTH: 268,
  SIDEBAR_COLLAPSED_WIDTH: 76,
  PADDING_GAP_LAYOUT: 16,
  PADDING_GAP_ITEM: 8,
  BORDER_RADIUS_ELEMENT_SMALL: 4,
  BORDER_RADIUS_ELEMENT: 8,
  BORDER_RADIUS_ELEMENT_MIDDLE: 12,
  BORDER_RADIUS_ELEMENT_ACTION: 8,
  BORDER_RADIUS_ELEMENT_WRAPPER: 10,
  /** Outer padding of a routed page inside the dashboard shell. */
  CONTENT_PADDING: 24,
} as const;

/** Loading spinner sizes keyed by the `size` prop of the shared loading component. */
export const FONT_SIZE_LOADING = {
  small: 18,
  medium: 28,
  large: 44,
} as const;

/**
 * Palette tokens: neutral ramp, champagne-gold brand ramp, and status background/foreground pairs.
 * Hex values are identical to the storefront constants, so a status chip looks the same in both apps.
 */
export const COLOR = {
  COMMON: {
    white: "#FFFFFF",
    black: "#1B1F22",
  },
  NEUTRAL: {
    25: "#FCFCFD",
    50: "#F9FAFB",
    100: "#F2F4F7",
    200: "#E5E7EB",
    300: "#D0D5DD",
    400: "#98A2B3",
    500: "#667085",
    600: "#475467",
    700: "#344054",
    800: "#1D2939",
    900: "#101828",
  },
  BRAND: {
    /** Champagne gold — primary accent of the jewelry brand. */
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#2563EB",
    600: "#1D4ED8",
    700: "#1E40AF",
  },
  STATUS: {
    successBg: "#ECFDF3",
    successFg: "#027A48",
    warningBg: "#FFFAEB",
    warningFg: "#B54708",
    dangerBg: "#FEF3F2",
    dangerFg: "#B42318",
    infoBg: "#EFF8FF",
    infoFg: "#175CD3",
    neutralBg: "#F2F4F7",
    neutralFg: "#344054",
  },
} as const;

/** Hex alpha suffixes, e.g. `${COLOR.NEUTRAL[300]}${OPACITY[30]}`. */
export const OPACITY = {
  8: "14",
  12: "1F",
  30: "4D",
  60: "99",
} as const;

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

/** Background / foreground pair for one status tone. */
export const getStatusToneColors = (tone: StatusTone): { bg: string; fg: string } => {
  switch (tone) {
    case "success":
      return { bg: COLOR.STATUS.successBg, fg: COLOR.STATUS.successFg };
    case "warning":
      return { bg: COLOR.STATUS.warningBg, fg: COLOR.STATUS.warningFg };
    case "danger":
      return { bg: COLOR.STATUS.dangerBg, fg: COLOR.STATUS.dangerFg };
    case "info":
      return { bg: COLOR.STATUS.infoBg, fg: COLOR.STATUS.infoFg };
    default:
      return { bg: COLOR.STATUS.neutralBg, fg: COLOR.STATUS.neutralFg };
  }
};

/** Clamp text to a fixed number of lines. Replaces the internal token helper. */
export const getLimitLineCss = (line: number) => ({
  display: "-webkit-box",
  WebkitLineClamp: line,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
});
