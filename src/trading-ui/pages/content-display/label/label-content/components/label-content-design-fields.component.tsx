import { Box, Stack, Typography } from "@mui/material";
import { Controller, type Control, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import { BadgePosition, BadgeType } from "@/trading-ui/apis/badge";
import { TYPOGRAPHY_STYLES } from "@/trading-ui/common/constant/typography.constant";
import { uploadSingleImage } from "@/trading-ui/common/utils/image-upload.utils";
import { getErrorMessage } from "@/trading-ui/common/utils";
import { TextFieldUploadContent as TextFieldUpload } from "@/trading-ui/pages/content-display/components/text-field-upload-content.component";
import { ColorPaletteField } from "@/trading-ui/components/color-palette-field/color-palette-field.component";
import { TextInput } from "@/trading-ui/components/form";
import { useSnackbar, SnackbarType } from "@/hooks/use-snackbar.hook";
import { MediaVisibility } from "@/trading-ui/apis/file/file.enum";
import type { LabelContentTemplateFormValues } from "../label-content.interface";
import { badgePositionLabelVi } from "../label-content.utils";
import { StackRowJustEnd } from "@/trading-ui/components/styled";

const POSITION_GRID: Array<BadgePosition | null> = [
  BadgePosition.TOP_LEFT,
  null,
  BadgePosition.TOP_RIGHT,
  BadgePosition.CENTER_LEFT,
  null,
  BadgePosition.CENTER_RIGHT,
  BadgePosition.BOTTOM_LEFT,
  null,
  BadgePosition.BOTTOM_RIGHT,
];

type LabelContentDesignFieldsProps = {
  viewMode?: boolean;
  control: Control<LabelContentTemplateFormValues>;
  watch: UseFormWatch<LabelContentTemplateFormValues>;
  setValue: UseFormSetValue<LabelContentTemplateFormValues>;
  disabled?: boolean;
};

const positionButtonSx = (active: boolean, nonInteractive: boolean) => ({
  minHeight: 32,
  px: 1.5,
  py: 0.75,
  borderRadius: "10px",
  border: active ? "1px solid #93C5FD" : "1px solid #E5E7EB",
  bgcolor: active ? "#EFF6FF" : "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: nonInteractive ? "default" : "pointer",
  ...TYPOGRAPHY_STYLES.xs.medium,
  color: active ? "#1D4ED8" : "#374151",
  textAlign: "center",
});

const renderPositionGrid = (activePosition: BadgePosition | "", nonInteractive: boolean, onSelect?: (position: BadgePosition) => void) => (
  <Stack gap={1}>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(147px, 1fr))",
        gap: 1,
      }}
    >
      {POSITION_GRID.map((position, index) => {
        if (!position) {
          return <Box key={`empty-${index}`} />;
        }

        const active = activePosition === position;
        return (
          <Box
            key={position}
            component={nonInteractive ? "div" : "button"}
            type={nonInteractive ? undefined : "button"}
            onClick={nonInteractive ? undefined : () => onSelect?.(position)}
            sx={positionButtonSx(active, nonInteractive)}
          >
            {badgePositionLabelVi(position)}
          </Box>
        );
      })}
    </Box>
    <Box
      component={nonInteractive ? "div" : "button"}
      type={nonInteractive ? undefined : "button"}
      onClick={nonInteractive ? undefined : () => onSelect?.(BadgePosition.BOTTOM_CENTER)}
      sx={{
        ...positionButtonSx(activePosition === BadgePosition.BOTTOM_CENTER, nonInteractive),
        width: "100%",
      }}
    >
      {badgePositionLabelVi(BadgePosition.BOTTOM_CENTER)}
    </Box>
    <StackRowJustEnd>
      <Box
        component={nonInteractive ? "div" : "button"}
        type={nonInteractive ? undefined : "button"}
        onClick={nonInteractive ? undefined : () => onSelect?.(BadgePosition.PRICE_LINE)}
        sx={{
          ...positionButtonSx(activePosition === BadgePosition.PRICE_LINE, nonInteractive),
          minWidth: 190,
        }}
      >
        {badgePositionLabelVi(BadgePosition.PRICE_LINE)}
      </Box>
    </StackRowJustEnd>
  </Stack>
);

export const LabelContentDesignFields = ({
  viewMode = false,
  control,
  watch,
  setValue,
  disabled = false,
}: LabelContentDesignFieldsProps) => {
  const contentType = watch("type");
  const { showSnackbar } = useSnackbar();
  const fieldsDisabled = viewMode || disabled;

  return (
    <Stack
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        bgcolor: "#FFFFFF",
        p: 2,
        gap: 2,
        flex: 1,
        minHeight: 120,
        opacity: disabled && !viewMode ? 0.65 : 1,
        pointerEvents: disabled && !viewMode ? "none" : "auto",
      }}
    >
      <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: "#101828" }}>Khu vực thiết kế</Typography>

      <Stack gap={1}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: "#374151" }}>Loại nội dung</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            overflow: "hidden",
            pointerEvents: fieldsDisabled ? "none" : "auto",
          }}
        >
          {[BadgeType.TEXT, BadgeType.IMAGE].map((type) => {
            const active = contentType === type;
            return (
              <Box
                key={type}
                component={fieldsDisabled ? "div" : "button"}
                type={fieldsDisabled ? undefined : "button"}
                onClick={
                  fieldsDisabled ? undefined : () => setValue("type", type as BadgeType.TEXT | BadgeType.IMAGE, { shouldDirty: true })
                }
                sx={{
                  border: "none",
                  bgcolor: active ? "#EFF6FF" : "#FFFFFF",
                  color: active ? "#1D4ED8" : "#6B7280",
                  py: 1,
                  ...TYPOGRAPHY_STYLES.sm.medium,
                  cursor: fieldsDisabled ? "default" : "pointer",
                  textAlign: "center",
                }}
              >
                {type}
              </Box>
            );
          })}
        </Box>

        {contentType === BadgeType.TEXT ? (
          <Stack gap={2} sx={{ pointerEvents: fieldsDisabled ? "none" : "auto" }}>
            <Controller
              name="backgroundColor"
              control={control}
              render={({ field }) => (
                <ColorPaletteField label="Màu nền" value={field.value || ""} onChange={field.onChange} disabled={fieldsDisabled} />
              )}
            />
            <Controller
              name="textColor"
              control={control}
              render={({ field }) => (
                <ColorPaletteField label="Màu chữ" value={field.value || ""} onChange={field.onChange} disabled={fieldsDisabled} />
              )}
            />
            <Controller
              name="displayText"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Nội dung hiển thị"
                  placeholder="Vui lòng nhập nội dung hiển thị"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  disabled={fieldsDisabled}
                  error={Boolean(fieldState.error)}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </Stack>
        ) : null}

        {contentType === BadgeType.IMAGE ? (
          <Controller
            name="image"
            control={control}
            render={({ field, fieldState }) => (
              <TextFieldUpload
                label="Ảnh label"
                value={field.value}
                onChange={(next) => field.onChange(next)}
                onPickFile={
                  fieldsDisabled
                    ? undefined
                    : async (file) => {
                        try {
                          const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
                          setValue("image", asset?.publicUrl ?? "", { shouldDirty: true, shouldValidate: true });
                        } catch (err) {
                          showSnackbar({ message: getErrorMessage(err), type: SnackbarType.ERROR });
                        }
                      }
                }
                onFileReject={(reason) => showSnackbar({ message: reason, type: SnackbarType.ERROR })}
                disabled={fieldsDisabled}
                error={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
                accept="image/*"
                previewMode="image"
                hintText="Hỗ trợ mọi định dạng ảnh (tối đa 5MB)."
              />
            )}
          />
        ) : null}
      </Stack>

      <Stack gap={1} sx={{ pointerEvents: fieldsDisabled ? "none" : "auto" }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: "#374151" }}>Vị trí mặc định</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#6B7280" }}>
          Bên trong ảnh sản phẩm hoặc góc phải dưới phần thông tin giá
        </Typography>
        <Controller
          name="defaultPosition"
          control={control}
          render={({ field }) => renderPositionGrid(field.value ?? "", fieldsDisabled, (position) => field.onChange(position))}
        />
      </Stack>
    </Stack>
  );
};
