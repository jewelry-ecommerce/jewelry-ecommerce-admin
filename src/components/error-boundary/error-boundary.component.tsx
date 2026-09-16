import { Stack, Typography } from "@mui/material";
import { Component, type ErrorInfo, type ReactNode } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { ButtonElement } from "@/components/button/button-element.component";
import { COLOR, STYLE } from "@/theme/design-tokens";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time failures so one broken screen cannot blank the whole console.
 * Data-layer failures are surfaced through the snackbar instead — this is the last resort.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // No logging service is wired up yet; keep the component stack visible for local debugging.
    console.error("[ErrorBoundary] Unhandled render error", error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (!error) return children;
    if (fallback) return fallback;

    return (
      <Stack
        spacing={1.5}
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: "60vh",
          p: 4,
          textAlign: "center",
          bgcolor: COLOR.NEUTRAL[50],
          borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_WRAPPER}px`,
        }}
      >
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, color: COLOR.NEUTRAL[900] }}>This screen ran into a problem</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: COLOR.NEUTRAL[500], maxWidth: 520 }}>{error.message}</Typography>
        <ButtonElement variant="primary" content="Try again" onClick={this.handleReset} />
      </Stack>
    );
  }
}

export default ErrorBoundary;
