import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

import { formErrorSx, formHelperSx, formLabelSx } from "@/components/form/form-field.styles";
import { COLOR } from "@/theme/design-tokens";

export interface FormFieldShellProps {
  label?: string;
  requiredMark?: boolean;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  /** Associates the label with the control for assistive technology. */
  htmlFor?: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  children: ReactNode;
}

/** Label + control + one message slot. Every input in the kit renders through this. */
export const FormFieldShell = ({
  label,
  requiredMark,
  error,
  errorMessage,
  helperText,
  htmlFor,
  fullWidth = true,
  sx,
  children,
}: FormFieldShellProps) => (
  <Box sx={{ width: fullWidth ? "100%" : "auto", ...sx }}>
    {label ? (
      <Typography component="label" htmlFor={htmlFor} sx={{ ...formLabelSx, display: "block" }}>
        {label}
        {requiredMark ? (
          <Box component="span" aria-hidden sx={{ color: COLOR.STATUS.dangerFg, ml: 0.5 }}>
            *
          </Box>
        ) : null}
      </Typography>
    ) : null}

    {children}

    {error && errorMessage ? (
      <Typography role="alert" sx={formErrorSx}>
        {errorMessage}
      </Typography>
    ) : helperText ? (
      <Typography sx={formHelperSx}>{helperText}</Typography>
    ) : null}
  </Box>
);
