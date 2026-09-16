import { Stack, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

import { COLOR, STYLE } from "@/theme/design-tokens";

export interface DataTableContentCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/** White card wrapping the table and its pagination row. */
export const DataTableContentCard = ({ children, sx }: DataTableContentCardProps) => (
  <Stack
    sx={{
      flex: 1,
      minHeight: 0,
      mt: 2,
      borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_WRAPPER}px ${STYLE.BORDER_RADIUS_ELEMENT_WRAPPER}px 0 0`,
      border: `1px solid ${COLOR.NEUTRAL[200]}`,
      overflow: "hidden",
      bgcolor: COLOR.COMMON.white,
      ...sx,
    }}
  >
    {children}
  </Stack>
);
