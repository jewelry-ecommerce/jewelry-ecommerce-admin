import { ErrorOutlineRounded, InboxOutlined, SearchOffRounded } from "@mui/icons-material";
import { Stack, Typography, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { COLOR } from "@/theme/design-tokens";

export type EmptyVariant = "empty" | "search" | "error";

export interface EmptyComponentProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  /** Usually a permission-gated call to action, e.g. "Create the first product". */
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

const ICON_SIZE = 28;

const VARIANT_DEFAULTS: Record<EmptyVariant, { title: string; description: string; icon: ReactNode }> = {
  empty: {
    title: "Nothing here yet",
    description: "Records will appear once they exist.",
    icon: <InboxOutlined sx={{ fontSize: ICON_SIZE, color: COLOR.NEUTRAL[400] }} />,
  },
  search: {
    title: "No matches",
    description: "Try a different search term or clear the filters.",
    icon: <SearchOffRounded sx={{ fontSize: ICON_SIZE, color: COLOR.NEUTRAL[400] }} />,
  },
  error: {
    title: "Could not load this",
    description: "Something went wrong. Please try again.",
    icon: <ErrorOutlineRounded sx={{ fontSize: ICON_SIZE, color: COLOR.STATUS.dangerFg }} />,
  },
};

export const EmptyComponent = ({ variant = "empty", title, description, action, sx }: EmptyComponentProps) => {
  const defaults = VARIANT_DEFAULTS[variant];

  return (
    <Stack
      spacing={1}
      alignItems="center"
      justifyContent="center"
      sx={{ flex: 1, minHeight: 200, px: 3, py: 6, textAlign: "center", ...sx }}
    >
      {defaults.icon}
      <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semiBold, color: COLOR.NEUTRAL[900] }}>{title ?? defaults.title}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: COLOR.NEUTRAL[500], maxWidth: 420 }}>
        {description ?? defaults.description}
      </Typography>
      {action ? <Stack sx={{ pt: 1 }}>{action}</Stack> : null}
    </Stack>
  );
};
