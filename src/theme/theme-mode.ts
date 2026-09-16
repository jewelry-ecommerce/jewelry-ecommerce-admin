import type { PaletteMode } from "@mui/material";

import { COLOR } from "@/theme/design-tokens";

export enum Mode {
  LIGHT = "light",
  DARK = "dark",
}

/** Surface colours of the dark scheme. Kept here so no screen invents its own dark value. */
const DARK_SURFACE = {
  /** App background behind the shell. */
  default: "#15181C",
  /** Cards, sidebar, header. */
  paper: "#1E2227",
  ink: "#F5F5F4",
  divider: "#2E343B",
} as const;

export interface ModePalette {
  mode: PaletteMode;
  background: { default: string; paper: string };
  text: { primary: string; secondary: string };
  divider: string;
}

/**
 * Surface layer of the palette per mode. Plain string values — `getTheme` feeds this straight into
 * `createTheme`, which is why no cast is needed anywhere in the theme layer.
 */
export const MODE_PALETTE: Record<Mode, ModePalette> = {
  [Mode.LIGHT]: {
    mode: "light",
    background: { default: COLOR.NEUTRAL[100], paper: COLOR.COMMON.white },
    text: { primary: COLOR.NEUTRAL[900], secondary: COLOR.NEUTRAL[500] },
    divider: COLOR.NEUTRAL[200],
  },
  [Mode.DARK]: {
    mode: "dark",
    background: { default: DARK_SURFACE.default, paper: DARK_SURFACE.paper },
    text: { primary: DARK_SURFACE.ink, secondary: COLOR.NEUTRAL[400] },
    divider: DARK_SURFACE.divider,
  },
};
