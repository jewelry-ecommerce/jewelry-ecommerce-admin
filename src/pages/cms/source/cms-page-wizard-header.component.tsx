// Header layout ported from trading-admin CMS; local icons/button adapters only.
import { Box, Typography } from "@mui/material";
import { ArrowLeft, Edit02, Eye } from "./cms-source-icons";
import { CustomButton } from "@/trading-ui/components/button/custom-button";
import { ButtonIconContentComponent } from "./cms-source-header-action.component";
import { TYPOGRAPHY_STYLES } from "@/trading-ui/common/constant/typography.constant";
import { StackRowAlignCenter } from "@/trading-ui/components/styled";
import type { PageButtonPermissionProps } from "@/permissions/permission.interface";
export interface CmsPageWizardHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  showPreviewAction?: boolean;
  showPublishAction?: boolean;
  onPreview?: () => void;
  onPublish?: () => void;
  loadingPublish?: boolean;
  viewMode?: boolean;
  onEdit?: () => void;
  editPermission?: PageButtonPermissionProps;
}
function HeaderActions({ viewMode, onEdit, editPermission, showPreviewAction, onPreview }: CmsPageWizardHeaderProps) {
  if (viewMode && onEdit)
    return (
      <ButtonIconContentComponent
        content="Chỉnh sửa"
        icon={<Edit02 size={20} color="#737373" />}
        onClick={onEdit}
        {...editPermission}
        sx={{ color: "#101828", border: "1px solid #111827", padding: "6px 12px" }}
      />
    );
  if (!viewMode && showPreviewAction)
    return (
      <StackRowAlignCenter sx={{ gap: 1 }}>
        <CustomButton type="button" variant="outline" fullWidth={false} onClick={onPreview} startIcon={<Eye size={18} />} sx={{ px: 2 }}>
          Xem trước
        </CustomButton>
      </StackRowAlignCenter>
    );
  return null;
}
export function CmsPageWizardHeader(props: CmsPageWizardHeaderProps) {
  return (
    <StackRowAlignCenter sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E5E7EB", bgcolor: "#FFF", alignItems: "center" }}>
      <Box sx={{ cursor: "pointer" }}>
        <ArrowLeft size={20} onClick={props.onBack} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, pl: 1 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES["2xl"].bold, color: "#101828" }}>{props.title}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#6B7280" }}>{props.subtitle}</Typography>
      </Box>
      <HeaderActions {...props} />
    </StackRowAlignCenter>
  );
}
