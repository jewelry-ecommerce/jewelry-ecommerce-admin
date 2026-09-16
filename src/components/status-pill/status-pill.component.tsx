import { Box, type SxProps, type Theme } from "@mui/material";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { getStatusToneColors, STYLE, type StatusTone } from "@/theme/design-tokens";

export interface StatusPillProps {
  label: string;
  tone: StatusTone;
  /** Small leading dot — helps distinguish tones for colour-blind users alongside the label text. */
  withDot?: boolean;
  sx?: SxProps<Theme>;
}

/** Status chip driven entirely by `COLOR.STATUS`, so a tone renders the same on every screen. */
export const StatusPill = ({ label, tone, withDot = true, sx }: StatusPillProps) => {
  const { bg, fg } = getStatusToneColors(tone);

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1,
        py: "3px",
        borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_MIDDLE}px`,
        bgcolor: bg,
        color: fg,
        whiteSpace: "nowrap",
        ...TYPOGRAPHY_STYLES.sm.medium,
        ...sx,
      }}
    >
      {withDot ? <Box component="span" aria-hidden sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: fg, flexShrink: 0 }} /> : null}
      {label}
    </Box>
  );
};
