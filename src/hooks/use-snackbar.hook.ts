import { createContext, useContext } from "react";
import type { SnackbarOrigin } from "@mui/material";

/**
 * Snackbar contract and consumer hook.
 *
 * The context, the enum and the hook live apart from the provider component on purpose: a module
 * that exports a component must export nothing else, otherwise fast refresh cannot swap it.
 */
export enum SnackbarType {
  INFO = "info",
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
}

export interface SnackbarPayload {
  message: string;
  type: SnackbarType;
  anchorOrigin?: SnackbarOrigin;
}

export interface SnackbarContextValue {
  showSnackbar: (payload: SnackbarPayload) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export const useSnackbar = (): SnackbarContextValue => {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error("useSnackbar must be used within a SnackbarProvider");
  return context;
};
