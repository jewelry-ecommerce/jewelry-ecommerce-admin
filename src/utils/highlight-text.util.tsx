import { Box } from "@mui/material";
import type { ReactNode } from "react";

import { COLOR, STYLE } from "@/theme/design-tokens";

/** Escapes regex metacharacters so a search term like `18k (rose)` cannot break the pattern. */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Wraps every case-insensitive occurrence of `term` inside `text` in a highlighted `mark`. Returns
 * the plain string when there is nothing to highlight, so callers can render the result directly.
 */
export const highlightText = (text: string, term: string): ReactNode => {
  const needle = term.trim();
  if (!needle || !text) return text;

  const segments = text.split(new RegExp(`(${escapeRegExp(needle)})`, "gi"));
  if (segments.length === 1) return text;

  return segments.map((segment, index) =>
    segment.toLowerCase() === needle.toLowerCase() ? (
      <Box
        key={`${segment}-${index}`}
        component="mark"
        sx={{
          backgroundColor: COLOR.BRAND[100],
          color: COLOR.BRAND[700],
          paddingInline: "2px",
          borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_SMALL / 2}px`,
          fontWeight: 600,
        }}
      >
        {segment}
      </Box>
    ) : (
      segment
    ),
  );
};
