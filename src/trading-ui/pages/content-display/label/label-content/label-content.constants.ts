import { BadgeCampaignDisplayStatus, BadgeCampaignStatus, BadgeStatus } from "@/trading-ui/apis/badge";
import type { LabelContentHeatmapSlotLayout } from "./label-content.interface";

export const LABEL_CONTENT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Vị trí overlay trên ảnh preview — số liệu `running`/`upcoming` lấy từ API badge-flow. */
export const LABEL_CONTENT_HEATMAP_SLOT_LAYOUTS: LabelContentHeatmapSlotLayout[] = [
  { id: "TL", labelVi: "Trên - Trái", top: "12px", left: "16px" },
  { id: "TR", labelVi: "Trên - Phải", top: "12px", right: "16px" },
  { id: "ML", labelVi: "Giữa - Trái", top: "37%", left: "16px" },
  { id: "MR", labelVi: "Giữa - Phải", top: "37%", right: "16px" },
  { id: "BL", labelVi: "Dưới - Trái", bottom: "12px", left: "16px" },
  { id: "BC", labelVi: "Dưới cùng - Ngang" },
  { id: "BR", labelVi: "Dưới - Phải", bottom: "12px", right: "16px" },
];

export const LABEL_CONTENT_HEATMAP_FOOT_LAYOUT: LabelContentHeatmapSlotLayout = {
  id: "BF",
  labelVi: "Dòng giá",
};

export const getBadgeStatusLabelVi = (status: BadgeStatus): string => {
  switch (status) {
    case BadgeStatus.ACTIVE:
      return "Kích hoạt";
    case BadgeStatus.INACTIVE:
      return "Vô hiệu hóa";
    case BadgeStatus.DRAFT:
      return "Nháp";
    default:
      return String(status);
  }
};

/** Label hiển thị khi form/API có thể trả `''`. */
export const resolveBadgeStatusLabelVi = (status: BadgeStatus | ""): string => (status ? getBadgeStatusLabelVi(status) : "—");

export const getBadgeCampaignStatusLabelVi = (status: BadgeCampaignStatus): string => {
  switch (status) {
    case BadgeCampaignStatus.ACTIVE:
      return "Kích hoạt";
    case BadgeCampaignStatus.INACTIVE:
      return "Vô hiệu hóa";
    case BadgeCampaignStatus.DRAFT:
      return "Nháp";
    default:
      return String(status);
  }
};

export const getBadgeCampaignDisplayStatusLabelVi = (status: BadgeCampaignDisplayStatus): string => {
  switch (status) {
    case BadgeCampaignDisplayStatus.DRAFT:
      return "Nháp";
    case BadgeCampaignDisplayStatus.SCHEDULED:
      return "Đã lên lịch";
    case BadgeCampaignDisplayStatus.RUNNING:
      return "Đang chạy";
    case BadgeCampaignDisplayStatus.PAUSED:
      return "Tạm dừng";
    case BadgeCampaignDisplayStatus.ENDED:
      return "Đã kết thúc";
    default:
      return String(status);
  }
};

export const LABEL_BADGE_STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: BadgeStatus.ACTIVE, label: "Kích hoạt" },
  { value: BadgeStatus.INACTIVE, label: "Vô hiệu hóa" },
  // { value: BadgeStatus.DRAFT, label: 'Nháp' },
];

/** Màu mặc định label TEXT — đồng bộ preview, form và API. */
export const LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR = "#FF3DD1";
export const LABEL_CONTENT_DEFAULT_TEXT_COLOR = "#FFFFFF";

export const TEXT_PRIMARY = "#101828";
export const PREVIEW_SWATCH_ROSE =
  "https://cdn-media-test.sevagoretail.jewelry/v1/img/test-external-trading/019eb0ec-bea5-76a4-91a6-7e7baf87d5dc/v-cab09246/original.png";
export const PREVIEW_SWATCH_SILVER =
  "https://cdn-media-test.sevagoretail.jewelry/v1/img/test-external-trading/019eb0ed-25e5-7387-b4ab-4852b9ae2626/v-2c57d229/original.png";
