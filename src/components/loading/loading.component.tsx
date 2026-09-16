import { CircularProgress, type SxProps, type Theme } from "@mui/material";

import { StackAlignJustCenter } from "@/components/styled/stack.style";
import { COLOR, FONT_SIZE_LOADING } from "@/theme/design-tokens";

export interface LoadingComponentProps {
  size?: "small" | "medium" | "large";
  color?: string;
  label?: string;
  sx?: SxProps<Theme>;
}

export const LoadingComponent = ({ size = "medium", color = COLOR.NEUTRAL[900], label = "Loading", sx }: LoadingComponentProps) => (
  <StackAlignJustCenter sx={{ flex: 1, minHeight: 120, ...sx }}>
    <CircularProgress size={FONT_SIZE_LOADING[size]} aria-label={label} sx={{ color }} />
  </StackAlignJustCenter>
);
