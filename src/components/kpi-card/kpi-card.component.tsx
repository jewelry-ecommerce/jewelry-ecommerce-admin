import { Stack, Typography, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { COLOR, getStatusToneColors, STYLE, type StatusTone } from "@/theme/design-tokens";

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  /** Pre-formatted change indicator, e.g. `+12.4%`. */
  delta?: string;
  deltaTone?: StatusTone;
  icon?: ReactNode;
  caption?: string;
  sx?: SxProps<Theme>;
}

export const KpiCard = ({ label, value, delta, deltaTone = "neutral", icon, caption, sx }: KpiCardProps) => {
  const deltaColors = getStatusToneColors(deltaTone);

  return (
    <Stack
      spacing={1}
      sx={{
        p: 2,
        border: `1px solid ${COLOR.NEUTRAL[200]}`,
        borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_WRAPPER}px`,
        bgcolor: COLOR.COMMON.white,
        minWidth: 0,
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: COLOR.NEUTRAL[500] }}>{label}</Typography>
        {icon ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 32,
              height: 32,
              borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT}px`,
              bgcolor: COLOR.BRAND[50],
              color: COLOR.BRAND[600],
              flexShrink: 0,
            }}
          >
            {icon}
          </Stack>
        ) : null}
      </Stack>

      <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
        <Typography component="div" sx={{ ...TYPOGRAPHY_STYLES.xl.bold, color: COLOR.NEUTRAL[900] }}>
          {value}
        </Typography>
        {delta ? (
          <Typography
            component="span"
            sx={{
              ...TYPOGRAPHY_STYLES.sm.medium,
              color: deltaColors.fg,
              bgcolor: deltaColors.bg,
              px: 0.75,
              py: "1px",
              borderRadius: "999px",
            }}
          >
            {delta}
          </Typography>
        ) : null}
      </Stack>

      {caption ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[400] }}>{caption}</Typography> : null}
    </Stack>
  );
};
