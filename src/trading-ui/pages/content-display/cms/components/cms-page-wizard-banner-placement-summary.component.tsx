import type React from "react";
import useSWR from "swr";
import { Box, Typography } from "@mui/material";
import { bannerApi, PlacementDisplayType } from "../../../../apis";
import { TYPOGRAPHY_STYLES } from "../../../../common/constant/typography.constant";
import { StackRow } from "../../../../components/styled";
const PLACEMENT_DISPLAY_TYPE_LABEL: Record<PlacementDisplayType, string> = {
  [PlacementDisplayType.GRID]: "Lưới",
  [PlacementDisplayType.SLIDER]: "Trượt ngang",
  [PlacementDisplayType.CAROUSEL]: "Băng chuyền",
  [PlacementDisplayType.DOUBLE_BANNER]: "Hai khung",
  [PlacementDisplayType.POPUP]: "Cửa sổ bật lên",
};

interface CmsPageWizardBannerPlacementSummaryProps {
  placementCode: string;
}
export const CmsPageWizardBannerPlacementSummary: React.FC<CmsPageWizardBannerPlacementSummaryProps> = ({ placementCode }) => {
  const { data, isLoading: loading } = useSWR(
    placementCode ? ["cms-banner-summary", placementCode] : null,
    () => bannerApi.getPlacementList({ isPagination: false, code: placementCode }),
    { revalidateOnFocus: false },
  );
  const placement = data?.list.find((entry) => entry.code === placementCode);
  const placementName = placement?.name || "";
  const displayTypeLabel = placement?.displayType ? PLACEMENT_DISPLAY_TYPE_LABEL[placement.displayType] : "";
  if (!placementCode) return null;

  return (
    <Box sx={{ mt: 1.25, p: 1.25, border: "1px solid #EAECF0", borderRadius: 1.5, bgcolor: "#F9FAFB" }}>
      <StackRow gap={2} sx={{ alignItems: "flex-start" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#667085" }}>Tên vị trí hiển thị</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: "#101828" }}>
            {loading ? "Đang tải..." : placementName || "—"}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#667085" }}>Kiểu hiển thị</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: "#101828" }}>
            {loading ? "Đang tải..." : displayTypeLabel || "—"}
          </Typography>
        </Box>
      </StackRow>
    </Box>
  );
};
