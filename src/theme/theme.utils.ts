import { createTheme, type Theme } from "@mui/material/styles";

import { COLOR, getLimitLineCss, OPACITY, STYLE } from "@/theme/design-tokens";
import { Mode, MODE_PALETTE } from "@/theme/theme-mode";

const SCROLLBAR_SIZE = 6;

const FONT_FAMILY = "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

/**
 * Ink colour of the primary action per mode. Light mode is the neutral-900 ink of the design system;
 * dark mode inverts it, because a neutral-900 button on a neutral-900 surface is unreadable.
 */
const MODE_PRIMARY: Record<Mode, { main: string; contrastText: string }> = {
  [Mode.LIGHT]: { main: COLOR.NEUTRAL[900], contrastText: COLOR.COMMON.white },
  [Mode.DARK]: { main: COLOR.NEUTRAL[25], contrastText: COLOR.NEUTRAL[900] },
};

/**
 * Builds the MUI theme for a mode. Returns a real `Theme`: every value below is typed by
 * `createTheme`, so the theme layer needs no cast at all.
 */
export const getTheme = (mode: Mode = Mode.LIGHT): Theme => {
  const surface = MODE_PALETTE[mode];
  const primary = MODE_PRIMARY[mode];

  return createTheme({
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
    palette: {
      mode: surface.mode,
      common: { white: COLOR.COMMON.white, black: COLOR.COMMON.black },
      primary: { main: primary.main, contrastText: primary.contrastText },
      secondary: { main: COLOR.BRAND[500], light: COLOR.BRAND[300], dark: COLOR.BRAND[700], contrastText: COLOR.COMMON.white },
      success: { main: COLOR.STATUS.successFg, light: COLOR.STATUS.successBg, contrastText: COLOR.COMMON.white },
      warning: { main: COLOR.STATUS.warningFg, light: COLOR.STATUS.warningBg, contrastText: COLOR.COMMON.white },
      error: { main: COLOR.STATUS.dangerFg, light: COLOR.STATUS.dangerBg, contrastText: COLOR.COMMON.white },
      info: { main: COLOR.STATUS.infoFg, light: COLOR.STATUS.infoBg, contrastText: COLOR.COMMON.white },
      background: surface.background,
      text: surface.text,
      divider: surface.divider,
    },
    shape: {
      borderRadius: STYLE.BORDER_RADIUS_ELEMENT,
    },
    typography: {
      fontFamily: FONT_FAMILY,
      button: {
        textTransform: "none",
      },
    },
    components: {
      MuiStack: { styleOverrides: { root: { gap: STYLE.PADDING_GAP_LAYOUT } } },
      MuiButton: {
        // No `fullWidth` default: width is a layout decision of the call site, not of the theme.
        defaultProps: {
          size: "medium",
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: STYLE.HEIGHT_DEFAULT_TEXT_FIELD_BUTTON,
            borderRadius: STYLE.BORDER_RADIUS_ELEMENT_ACTION,
            fontWeight: 500,
            lineHeight: "unset",
            whiteSpace: "nowrap",
            "&.Mui-disabled": {
              borderColor: surface.divider,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "small",
          fullWidth: true,
        },
        styleOverrides: {
          root: {
            "& fieldset": {
              borderColor: surface.divider,
            },
            "& .MuiFormHelperText-root": {
              ...getLimitLineCss(1),
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: STYLE.BORDER_RADIUS_ELEMENT_SMALL,
          },
          notchedOutline: {
            borderRadius: STYLE.BORDER_RADIUS_ELEMENT_SMALL,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: surface.background.paper,
            color: surface.text.primary,
            border: `1px solid ${surface.divider}`,
            borderRadius: STYLE.BORDER_RADIUS_ELEMENT_SMALL,
            padding: STYLE.PADDING_GAP_ITEM,
            boxShadow: `0 8px 20px ${COLOR.NEUTRAL[900]}${OPACITY[12]}`,
            maxWidth: 320,
          },
          arrow: {
            color: surface.background.paper,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: surface.divider,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            border: "none",
            boxShadow: "none",
            fontWeight: "unset",
            padding: `${STYLE.PADDING_GAP_ITEM}px ${STYLE.PADDING_GAP_LAYOUT}px`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          "*, *::before, *::after": {
            boxSizing: "border-box",
          },
          "*::-webkit-scrollbar": {
            width: SCROLLBAR_SIZE,
            height: SCROLLBAR_SIZE,
          },
          "*::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "*::-webkit-scrollbar-thumb": {
            borderRadius: STYLE.BORDER_RADIUS_ELEMENT,
            backgroundClip: "content-box",
            backgroundColor: `${COLOR.NEUTRAL[500]}${OPACITY[60]}`,
          },
          "*:hover::-webkit-scrollbar-thumb": {
            backgroundColor: COLOR.NEUTRAL[500],
          },
        },
      },
    },
  });
};
