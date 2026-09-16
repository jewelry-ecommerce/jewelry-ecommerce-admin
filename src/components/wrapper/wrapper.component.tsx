import { Box, Paper, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { StackRow } from "@/components/styled/stack.style";
import { COLOR } from "@/theme/design-tokens";

const ASIDE_WIDTH = 410;

export interface WrapperComponentProps {
  label: ReactNode;
  description?: ReactNode;
  /** Right-hand side of the header row — usually permission-gated page actions. */
  headerAside?: ReactNode;
  tabs?: ReactNode;
  /** Fixed-width companion column, e.g. a summary panel next to a form. */
  aside?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

/** Standard page container: titled header, optional tab strip, scrolling content area. */
export const WrapperComponent = ({ label, description, headerAside, tabs, aside, children, sx, contentSx }: WrapperComponentProps) => {
  const content = <Stack sx={{ flex: 1, minHeight: 0, boxSizing: "border-box" }}>{children}</Stack>;

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        border: `1px solid ${COLOR.NEUTRAL[200]}`,
        bgcolor: COLOR.COMMON.white,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        ...sx,
      }}
    >
      <Box sx={{ borderBottom: `1px solid ${COLOR.NEUTRAL[200]}`, flexShrink: 0 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          sx={{ px: 3, py: 1.5 }}
        >
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography component="h1" sx={{ ...TYPOGRAPHY_STYLES["2xl"].bold, color: COLOR.NEUTRAL[900] }}>
              {label}
            </Typography>
            {description ? (
              <Typography component="div" sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[500] }}>
                {description}
              </Typography>
            ) : null}
          </Stack>
          {headerAside ? <Box sx={{ flexShrink: 0 }}>{headerAside}</Box> : null}
        </Stack>
      </Box>

      {tabs ? <Box sx={{ flexShrink: 0 }}>{tabs}</Box> : null}

      {aside ? (
        <StackRow sx={{ flex: 1, minHeight: 0, alignItems: "stretch", bgcolor: COLOR.NEUTRAL[50], p: 3, pb: 0, gap: 3 }}>
          <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>{content}</Stack>
          <Stack sx={{ flex: `0 0 ${ASIDE_WIDTH}px`, minHeight: 0, overflow: "hidden" }}>{aside}</Stack>
        </StackRow>
      ) : (
        <Box
          sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", bgcolor: COLOR.NEUTRAL[50], p: 3, pb: 0, ...contentSx }}
        >
          {content}
        </Box>
      )}
    </Paper>
  );
};
