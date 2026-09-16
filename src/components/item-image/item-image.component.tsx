import { Box, type SxProps, type Theme } from "@mui/material";
import { useState } from "react";

import { buildPlaceholderImage } from "@/utils/media/placeholder.util";
import { COLOR, STYLE } from "@/theme/design-tokens";

export interface ItemImageProps {
  src: string | null | undefined;
  alt: string;
  size?: number;
  /** Non-square thumbnails, e.g. banner rows. */
  width?: number;
  height?: number;
  rounded?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Thumbnail with a deterministic fallback. When `src` is missing or fails to load, a locally
 * generated placeholder derived from `alt` renders instead — no broken-image icon, no network call.
 */
export const ItemImage = ({ src, alt, size = 48, width, height, rounded = false, sx }: ItemImageProps) => {
  /** The URL that failed, not a boolean: a new `src` is therefore retried without an effect. */
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const hasFailed = Boolean(src) && failedSrc === src;
  const resolvedSrc = !src || hasFailed ? buildPlaceholderImage({ label: alt, width: 240, height: 240 }) : src;

  return (
    <Box
      component="img"
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src ?? null)}
      sx={{
        width: width ?? size,
        height: height ?? size,
        flexShrink: 0,
        objectFit: "cover",
        bgcolor: COLOR.NEUTRAL[100],
        borderRadius: rounded ? "50%" : `${STYLE.BORDER_RADIUS_ELEMENT}px`,
        border: `1px solid ${COLOR.NEUTRAL[200]}`,
        ...sx,
      }}
    />
  );
};
