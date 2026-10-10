// Ported from trading-admin CMS; local imports only.
import { Box } from "@mui/material";
import React, { type ReactNode } from "react";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/trading-ui/components/styled";

export interface CmsPageWizardFooterProps {
  left: ReactNode;
  right: ReactNode;
}

export const CmsPageWizardFooter: React.FC<CmsPageWizardFooterProps> = ({ left, right }) => (
  <StackRowAlignCenterJustBetween sx={{ pt: 3 }}>
    <Box>{left}</Box>
    <StackRowAlignCenter sx={{ gap: 1 }}>{right}</StackRowAlignCenter>
  </StackRowAlignCenterJustBetween>
);
