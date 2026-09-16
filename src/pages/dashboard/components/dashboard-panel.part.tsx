import { Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { COLOR, STYLE } from "@/theme/design-tokens";

export interface DashboardPanelProps {
  title: string;
  description?: string;
  /** Permission-gated control for the panel, e.g. "View all". */
  action?: ReactNode;
  children: ReactNode;
}

/** White card used by every dashboard section, so the panels share one rhythm. */
export const DashboardPanel = ({ title, description, action, children }: DashboardPanelProps) => (
  <Stack
    sx={{
      border: `1px solid ${COLOR.NEUTRAL[200]}`,
      borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_WRAPPER}px`,
      bgcolor: COLOR.COMMON.white,
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${COLOR.NEUTRAL[200]}` }}
    >
      <Stack sx={{ minWidth: 0 }}>
        <Typography component="h2" sx={{ ...TYPOGRAPHY_STYLES.md.semiBold, color: COLOR.NEUTRAL[900] }}>
          {title}
        </Typography>
        {description ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[500] }}>{description}</Typography> : null}
      </Stack>
      {action ? <Stack sx={{ flexShrink: 0 }}>{action}</Stack> : null}
    </Stack>

    <Stack sx={{ p: 2, gap: 1.5, minWidth: 0 }}>{children}</Stack>
  </Stack>
);
