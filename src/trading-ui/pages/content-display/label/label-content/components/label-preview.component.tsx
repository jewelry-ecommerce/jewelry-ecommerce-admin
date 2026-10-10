import FavoriteIcon from "@mui/icons-material/Favorite";

import { Box, Stack, Typography } from "@mui/material";

import { BadgePosition, BadgeType } from "@/trading-ui/apis/badge";

import { TYPOGRAPHY_STYLES } from "@/trading-ui/common/constant/typography.constant";

import { StackRowAlignCenter } from "@/trading-ui/components/styled";

import { LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR, LABEL_CONTENT_DEFAULT_TEXT_COLOR } from "../label-content.constants";

import { badgePositionToImagePreviewSx } from "../label-content.utils";

const IMG = "/images/label.jpg";

const PREVIEW_INSET = 8;

export interface LabelContentPreviewProps {
  visible: boolean;

  type: BadgeType.TEXT | BadgeType.IMAGE;

  displayText: string;

  image: string;

  backgroundColor: string;

  textColor: string;

  defaultPosition: BadgePosition | "";
}

export const LabelContentPreview = ({
  visible,
  type,
  displayText,
  image,
  backgroundColor,
  textColor,
  defaultPosition,
}: LabelContentPreviewProps) => {
  if (!visible) {
    return null;
  }

  const position = defaultPosition || BadgePosition.TOP_LEFT;

  const isPriceLine = position === BadgePosition.PRICE_LINE;

  const isBottomFull = position === BadgePosition.BOTTOM_CENTER;

  const safeDisplayText = typeof displayText === "string" ? displayText.trim() : "";

  const safeImage = typeof image === "string" ? image.trim() : "";

  const bg =
    typeof backgroundColor === "string" && backgroundColor.trim() ? backgroundColor.trim() : LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR;

  const fg = typeof textColor === "string" && textColor.trim() ? textColor.trim() : LABEL_CONTENT_DEFAULT_TEXT_COLOR;

  const textBadge = (
    <Box
      sx={{
        bgcolor: bg,

        color: fg,

        px: "8px",

        py: "4px",

        borderRadius: "16px",

        whiteSpace: "nowrap",

        ...TYPOGRAPHY_STYLES.sm.regular,
      }}
    >
      {safeDisplayText || "\u00A0"}
    </Box>
  );

  const imageBadge = safeImage ? (
    <Box
      component="img"
      src={safeImage}
      alt=""
      sx={{
        display: "block",

        maxWidth: 96,

        maxHeight: 32,

        objectFit: "contain",
      }}
    />
  ) : null;

  const bottomFullBadge = isBottomFull && (
    <Box
      sx={{
        position: "absolute",

        zIndex: 2,

        bottom: PREVIEW_INSET,

        left: PREVIEW_INSET,

        right: PREVIEW_INSET,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        boxSizing: "border-box",

        minHeight: 36,

        px: "6px",

        py: "6px",

        borderRadius: 0,

        ...(type === BadgeType.TEXT ? { bgcolor: bg, color: fg, ...TYPOGRAPHY_STYLES.sm.regular } : {}),
      }}
    >
      {type === BadgeType.IMAGE && safeImage ? (
        <Box component="img" src={safeImage} alt="" sx={{ display: "block", width: "100%", maxHeight: 40, objectFit: "contain" }} />
      ) : (
        safeDisplayText || "\u00A0"
      )}
    </Box>
  );

  const cornerBadge =
    !isPriceLine &&
    !isBottomFull &&
    (type === BadgeType.IMAGE ? (
      imageBadge && <Box sx={{ position: "absolute", zIndex: 2, ...badgePositionToImagePreviewSx(position) }}>{imageBadge}</Box>
    ) : (
      <Box sx={{ position: "absolute", zIndex: 2, ...badgePositionToImagePreviewSx(position) }}>{textBadge}</Box>
    ));

  return (
    <Stack
      sx={{
        height: "100%",

        border: "1px solid #E5E7EB",

        borderRadius: "10px",

        bgcolor: "#FFF",

        p: 2,

        gap: 3,
      }}
    >
      <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: "#000" }}>Xem trước</Typography>

      <Stack
        sx={{
          p: 2,

          gap: 2,

          border: "1px solid #E0E0E0",

          boxSizing: "border-box",
        }}
      >
        <Box sx={{ position: "relative", width: "100%", aspectRatio: "350 / 440", overflow: "hidden" }}>
          <Box component="img" src={IMG} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

          {bottomFullBadge}

          {cornerBadge}

          <StackRowAlignCenter
            sx={{
              position: "absolute",

              top: 0,

              right: 0,
            }}
          >
            <FavoriteIcon sx={{ fontSize: 20, color: "#fff", stroke: "#000" }} />
          </StackRowAlignCenter>
        </Box>

        <Box sx={{ position: "relative" }}>
          {isPriceLine ? (
            <Box
              sx={{
                position: "absolute",

                right: 0,

                bottom: 0,

                zIndex: 1,
              }}
            >
              {type === BadgeType.TEXT ? textBadge : imageBadge}
            </Box>
          ) : null}

          <Stack gap={0.5}>
            <Typography
              sx={{
                ...TYPOGRAPHY_STYLES.sm.bold,

                textTransform: "uppercase",

                color: "#101828",
              }}
            >
              Silver Zircon Drizzle Drop Earrings
            </Typography>

            <Stack sx={{ gap: 0.5 }}>
              <StackRowAlignCenter sx={{ gap: 0.5, flexWrap: "wrap" }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#101828" }}>77.000đ</Typography>

                <Typography
                  sx={{
                    ...TYPOGRAPHY_STYLES.xs.regular,

                    color: "text.secondary",

                    textDecoration: "line-through",
                  }}
                >
                  100.000đ
                </Typography>
              </StackRowAlignCenter>

              <StackRowAlignCenter sx={{ gap: 0.5 }}>
                <Box
                  sx={{
                    width: 12,

                    height: 12,

                    borderRadius: "2px",

                    border: "1px solid #ddd",

                    bgcolor: "#F5D5C8",
                  }}
                />

                <Box
                  sx={{
                    width: 12,

                    height: 12,

                    borderRadius: "2px",

                    border: "1px solid #ddd",

                    bgcolor: "#D1D5DB",
                  }}
                />
              </StackRowAlignCenter>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};
