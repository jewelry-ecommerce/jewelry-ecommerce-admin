import { Box, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

import { COLOR, STYLE } from "@/theme/design-tokens";

export interface DataTableFilterCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/** Padded card holding the search + filter toolbar, above the table card. */
export const DataTableFilterCard = ({ children, sx }: DataTableFilterCardProps) => (
  <Box
    sx={{
      p: 2,
      border: `1px solid ${COLOR.NEUTRAL[200]}`,
      borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_WRAPPER}px`,
      bgcolor: COLOR.COMMON.white,
      flexShrink: 0,
      ...sx,
    }}
  >
    {children}
  </Box>
);
