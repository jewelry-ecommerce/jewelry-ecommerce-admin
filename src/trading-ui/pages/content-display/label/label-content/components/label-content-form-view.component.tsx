import { Box, Stack, Typography } from "@mui/material";
import type { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { BadgeStatus, BadgeType } from "@/trading-ui/apis/badge";
import { TYPOGRAPHY_STYLES } from "@/trading-ui/common/constant/typography.constant";
import { SelectInput, TextInput } from "@/trading-ui/components/form";
import { StackRow } from "@/components/styled/stack.style";
import { LabelWebsiteStatusToggle } from "../../components";
import type { LabelContentTemplateFormValues } from "../label-content.interface";
import { LABEL_LIBRARY_BADGE_TYPE_OPTIONS } from "../label-content.utils";
import { LabelContentDesignFields } from "./label-content-design-fields.component";
import { LabelContentPreview } from "./label-preview.component";

type LabelContentFormViewProps = {
  viewMode?: boolean;
  showPreview: boolean;
  inputsDisabled?: boolean;
  control: Control<LabelContentTemplateFormValues>;
  watch: UseFormWatch<LabelContentTemplateFormValues>;
  setValue: UseFormSetValue<LabelContentTemplateFormValues>;
};

export const LabelContentFormView = ({
  viewMode = false,
  showPreview,
  inputsDisabled = false,
  control,
  watch,
  setValue,
}: LabelContentFormViewProps) => {
  const previewValues = watch();
  const fieldsDisabled = viewMode || inputsDisabled;

  return (
    <StackRow sx={{ flex: 1, minHeight: 0, alignItems: "stretch", p: 3 }}>
      <Stack
        sx={{
          flex: { xs: "1 1 auto", md: "8 1 0%" },
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <StackRow sx={{ flex: 1, height: "auto" }}>
          <Stack
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              bgcolor: "#FFFFFF",
              p: 2,
              gap: 3,
              flex: 1,
            }}
          >
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: "#101828" }}>Thông tin Label</Typography>

            <Stack gap={2}>
              <Controller
                name="badgeType"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectInput
                    label="Loại Label"
                    name={field.name}
                    value={field.value}
                    requiredMark
                    placeholder="Chọn loại label"
                    options={LABEL_LIBRARY_BADGE_TYPE_OPTIONS}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={Boolean(fieldState.error)}
                    errorMessage={fieldState.error?.message}
                    disabled={fieldsDisabled}
                    fullWidth
                    size="small"
                  />
                )}
              />
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    requiredMark
                    label="Tên Label"
                    placeholder="Nhập tên Label"
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
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <LabelWebsiteStatusToggle
                    active={field.value === BadgeStatus.ACTIVE}
                    name={field.name}
                    disabled={viewMode}
                    onActiveChange={(nextActive) => field.onChange(nextActive ? BadgeStatus.ACTIVE : BadgeStatus.INACTIVE)}
                  />
                )}
              />
            </Stack>
          </Stack>

          <LabelContentDesignFields control={control} watch={watch} setValue={setValue} viewMode={viewMode} disabled={inputsDisabled} />
        </StackRow>
      </Stack>

      <Box
        sx={{
          flex: { xs: "1 1 auto", md: "2 1 0%" },
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <LabelContentPreview
          visible={showPreview}
          type={previewValues.type ?? BadgeType.TEXT}
          displayText={previewValues.displayText ?? ""}
          image={previewValues.image ?? ""}
          backgroundColor={previewValues.backgroundColor ?? ""}
          textColor={previewValues.textColor ?? ""}
          defaultPosition={previewValues.defaultPosition ?? ""}
        />
      </Box>
    </StackRow>
  );
};
