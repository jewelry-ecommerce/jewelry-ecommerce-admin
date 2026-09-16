import { CloseRounded } from "@mui/icons-material";
import { Alert, IconButton, Snackbar, type SnackbarOrigin } from "@mui/material";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { SnackbarContext, SnackbarType, type SnackbarContextValue, type SnackbarPayload } from "@/hooks/use-snackbar.hook";
import { STYLE } from "@/theme/design-tokens";

const AUTO_HIDE_MS = 6000;
const DEFAULT_ORIGIN: SnackbarOrigin = { vertical: "bottom", horizontal: "right" };

type SnackbarState = SnackbarPayload & { open: boolean };

/** Single toast host for the whole console. Screens raise messages through `useSnackbar`. */
export const SnackbarProvider = ({ children }: { children?: ReactNode }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: "", type: SnackbarType.INFO });

  const showSnackbar = useCallback((payload: SnackbarPayload) => {
    setSnackbar({ open: true, ...payload });
  }, []);

  const handleClose = useCallback(() => {
    setSnackbar((current) => ({ ...current, open: false }));
  }, []);

  const contextValue = useMemo<SnackbarContextValue>(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={AUTO_HIDE_MS}
        onClose={handleClose}
        anchorOrigin={snackbar.anchorOrigin ?? DEFAULT_ORIGIN}
        sx={{ "&.MuiSnackbar-root": { bottom: STYLE.PADDING_GAP_LAYOUT, right: STYLE.PADDING_GAP_LAYOUT } }}
      >
        <Alert
          severity={snackbar.type}
          sx={{ borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT}px`, boxShadow: 2 }}
          action={
            <IconButton size="small" color="inherit" aria-label="Dismiss notification" onClick={handleClose}>
              <CloseRounded fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
