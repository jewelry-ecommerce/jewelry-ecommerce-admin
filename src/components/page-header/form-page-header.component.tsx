import { ArrowBackRounded } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { CustomButton } from "@/components/button/custom-button.component";
import { StackRow, StackRowAlignCenterJustBetween } from "@/components/styled/stack.style";
import type { PageButtonPermissionProps } from "@/permissions/permission.interface";
import { COLOR } from "@/theme/design-tokens";

const BACK_ICON_SIZE = 16;

const barSx = {
  display: "flex",
  px: 2,
  py: 1.5,
  justifyContent: "space-between",
  alignItems: "center",
  alignSelf: "stretch",
  borderBottom: `1px solid ${COLOR.NEUTRAL[200]}`,
  bgcolor: COLOR.COMMON.white,
} as const;

export interface FormPageHeaderProps {
  /** `backOnly` renders just the back bar; `full` adds the title row with cancel / save. */
  variant?: "full" | "backOnly";
  title?: string;
  backLabel?: string;
  onBack: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  saveLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  /** Extra content left of the cancel / save pair, e.g. a status pill. */
  actionsStart?: ReactNode;
  backPermission?: PageButtonPermissionProps;
  cancelPermission?: PageButtonPermissionProps;
  savePermission?: PageButtonPermissionProps;
}

/**
 * Sticky header for create / edit screens. Shared on purpose: the reference implementation lived
 * inside one feature folder and every other module had to import across domains to reuse it.
 */
export const FormPageHeader = ({
  variant = "full",
  title,
  backLabel = "Back to list",
  onBack,
  onCancel,
  onSave,
  saveLabel = "Save",
  loading = false,
  disabled = false,
  actionsStart,
  backPermission,
  cancelPermission,
  savePermission,
}: FormPageHeaderProps) => {
  const backButton = (
    <CustomButton
      variant="ghost"
      size="md"
      startIcon={<ArrowBackRounded sx={{ fontSize: BACK_ICON_SIZE }} />}
      onClick={onBack}
      unauthorizedMode="disable"
      {...(backPermission ?? {})}
      sx={{ px: 1.5, color: COLOR.NEUTRAL[600] }}
    >
      {backLabel}
    </CustomButton>
  );

  if (variant === "backOnly") return <Box sx={barSx}>{backButton}</Box>;

  return (
    <Box sx={{ flexShrink: 0, bgcolor: COLOR.COMMON.white, position: "sticky", top: 0, zIndex: 2 }}>
      <Box sx={barSx}>{backButton}</Box>

      <StackRowAlignCenterJustBetween sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${COLOR.NEUTRAL[200]}`, bgcolor: COLOR.COMMON.white }}>
        <Typography component="h1" sx={{ ...TYPOGRAPHY_STYLES["2xl"].bold, color: COLOR.NEUTRAL[900] }}>
          {title}
        </Typography>

        <StackRow sx={{ alignItems: "center", gap: 1.5 }}>
          {actionsStart}
          {onCancel ? (
            <CustomButton variant="outline" onClick={onCancel} disabled={loading} unauthorizedMode="disable" {...(cancelPermission ?? {})}>
              Cancel
            </CustomButton>
          ) : null}
          {onSave ? (
            <CustomButton
              variant="primary"
              onClick={onSave}
              disabled={disabled}
              loading={loading}
              unauthorizedMode="disable"
              {...(savePermission ?? {})}
            >
              {saveLabel}
            </CustomButton>
          ) : null}
        </StackRow>
      </StackRowAlignCenterJustBetween>
    </Box>
  );
};
