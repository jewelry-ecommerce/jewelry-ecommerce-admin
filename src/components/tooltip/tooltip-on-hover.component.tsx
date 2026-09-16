import { Box, Tooltip, type TooltipProps } from "@mui/material";
import type { ReactNode } from "react";

// `content` is omitted from `TooltipProps` because the DOM attribute of that name is a plain string.
export interface TooltipOnHoverComponentProps extends Partial<Omit<TooltipProps, "title" | "children" | "content">> {
  /** Tooltip body. An empty value renders the child without a tooltip wrapper. */
  content: ReactNode;
  children: ReactNode;
  /** Opts out of the hint without changing the markup around the child. */
  disabled?: boolean;
  leaveDelay?: number;
}

const HOVER_TARGET_SX = { display: "inline-flex" } as const;

const isEmptyContent = (content: ReactNode): boolean => {
  if (content === null || content === undefined || content === false) return true;
  return typeof content === "string" && content.trim().length === 0;
};

/**
 * Tooltip that also works over a disabled control: the child is always wrapped in an inline-flex
 * `span`, so hover events reach the tooltip even though a disabled button emits none.
 */
export const TooltipOnHoverComponent = ({
  content,
  children,
  placement = "top",
  disabled = false,
  leaveDelay = 200,
  ...rest
}: TooltipOnHoverComponentProps) => {
  const hoverTarget = (
    <Box component="span" sx={HOVER_TARGET_SX}>
      {children}
    </Box>
  );

  if (disabled || isEmptyContent(content)) return hoverTarget;

  return (
    <Tooltip title={content} placement={placement} leaveDelay={leaveDelay} disableFocusListener {...rest}>
      {hoverTarget}
    </Tooltip>
  );
};
