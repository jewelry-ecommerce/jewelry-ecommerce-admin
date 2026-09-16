import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { getLimitLineCss } from "@/theme/design-tokens";

/** Single-line label that ellipsises instead of pushing a table column wider. */
export const TypographyOneLine = styled(Typography)(() => ({
  ...getLimitLineCss(1),
  wordBreak: "break-word",
}));

/** Two-line description, used in cards and list secondary text. */
export const TypographyTwoLine = styled(Typography)(() => ({
  ...getLimitLineCss(2),
  wordBreak: "break-word",
}));
