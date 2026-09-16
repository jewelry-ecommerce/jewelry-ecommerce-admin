import { Box, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { COLOR, STYLE } from "@/theme/design-tokens";

export interface TagComponentProps {
  content: ReactNode;
  /** Outlined instead of filled — used inside dense table cells. */
  border?: boolean;
  color?: string;
  backgroundColor?: string;
  icon?: ReactNode;
  sx?: SxProps<Theme>;
}

export const TagComponent = ({
  content,
  border = false,
  color = COLOR.NEUTRAL[700],
  backgroundColor = COLOR.NEUTRAL[100],
  icon,
  sx,
}: TagComponentProps) => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      px: 1,
      py: "2px",
      borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_SMALL}px`,
      whiteSpace: "nowrap",
      ...TYPOGRAPHY_STYLES.sm.medium,
      color,
      ...(border ? { border: `1px solid ${COLOR.NEUTRAL[300]}`, backgroundColor: "transparent" } : { backgroundColor }),
      ...sx,
    }}
  >
    {icon}
    {content}
  </Box>
);
