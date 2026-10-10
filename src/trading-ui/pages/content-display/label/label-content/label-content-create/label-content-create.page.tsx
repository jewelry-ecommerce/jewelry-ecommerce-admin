import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { STYLE } from "@/trading-ui/adapters/library";
import { badgeApi, BadgePosition, BadgeStatus, BadgeType } from "@/trading-ui/apis/badge";
import { TYPOGRAPHY_STYLES } from "@/trading-ui/common/constant/typography.constant";
import { ROUTE_PATH } from "@/router/route.path";
import { contentLabelListButtonPermission } from "@/trading-ui/pages/content-display/content-permission.constants";
import { LabelFormPageHeader } from "../../components";
import { LabelContentPreview } from "../components/label-preview.component";
import { SelectInput, TextInput } from "@/trading-ui/components/form";
import { StackRow } from "@/trading-ui/components/styled";
import { getErrorMessage } from "@/trading-ui/common/utils";
import { useSnackbar, SnackbarType } from "@/hooks/use-snackbar.hook";
import { LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR, LABEL_CONTENT_DEFAULT_TEXT_COLOR } from "../label-content.constants";
import type { LabelContentTemplateFormValues } from "../label-content.interface";
import {
  buildCreateBadgeTemplatePayload,
  hasLabelDesignPreview,
  LABEL_LIBRARY_BADGE_TYPE_OPTIONS,
  LABEL_LIBRARY_BADGE_TYPE_VALUES,
} from "../label-content.utils";
import { LabelContentDesignFields } from "../components/label-content-design-fields.component";
import { LabelWebsiteStatusToggle } from "../../components";

const labelContentCreateFormSchema = yup
  .object({
    badgeType: yup
      .string()
      .oneOf([...LABEL_LIBRARY_BADGE_TYPE_VALUES])
      .required("Vui lòng chọn loại Label"),
    name: yup.string().trim().required("Vui lòng nhập tên Label"),
    status: yup.mixed<BadgeStatus | "">().oneOf([BadgeStatus.ACTIVE, BadgeStatus.INACTIVE, ""]).required("Vui lòng chọn trạng thái"),
    type: yup.mixed<BadgeType.TEXT | BadgeType.IMAGE>().oneOf([BadgeType.TEXT, BadgeType.IMAGE]).required(),
    displayText: yup.string().when("type", {
      is: BadgeType.TEXT,
      then: (schema) => schema.trim().required("Vui lòng nhập nội dung hiển thị"),
      otherwise: (schema) => schema.strip().optional(),
    }),
    image: yup.string().when("type", {
      is: BadgeType.IMAGE,
      then: (schema) => schema.trim().required("Vui lòng tải ảnh"),
      otherwise: (schema) => schema.optional(),
    }),
    backgroundColor: yup.string().default(LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR),
    textColor: yup.string().default(LABEL_CONTENT_DEFAULT_TEXT_COLOR),
    defaultPosition: yup
      .mixed<BadgePosition | "">()
      .oneOf([
        BadgePosition.TOP_LEFT,
        BadgePosition.TOP_RIGHT,
        BadgePosition.CENTER_LEFT,
        BadgePosition.CENTER_RIGHT,
        BadgePosition.BOTTOM_LEFT,
        BadgePosition.BOTTOM_CENTER,
        BadgePosition.BOTTOM_RIGHT,
        BadgePosition.PRICE_LINE,
        "",
      ])
      .required(),
  })
  .required() as yup.ObjectSchema<LabelContentTemplateFormValues>;

const LabelContentCreatePage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const goList = () => {
    void navigate(ROUTE_PATH.LABEL_CONTENT_LIST);
  };

  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<LabelContentTemplateFormValues>({
    resolver: yupResolver(labelContentCreateFormSchema),
    mode: "onSubmit",
    defaultValues: {
      badgeType: "",
      name: "",
      status: BadgeStatus.ACTIVE,
      type: BadgeType.TEXT,
      displayText: "",
      image: "",
      backgroundColor: LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR,
      textColor: LABEL_CONTENT_DEFAULT_TEXT_COLOR,
      defaultPosition: BadgePosition.TOP_LEFT,
    },
  });

  const previewValues = watch();
  const showPreview = hasLabelDesignPreview(previewValues);

  const onSubmit: SubmitHandler<LabelContentTemplateFormValues> = async (data) => {
    setSubmitting(true);
    try {
      await badgeApi.postBadgeTemplate(buildCreateBadgeTemplatePayload(data));
      showSnackbar({ message: "Tạo label thành công.", type: SnackbarType.SUCCESS });
      void navigate(ROUTE_PATH.LABEL_CONTENT_LIST);
    } catch (err) {
      showSnackbar({ message: getErrorMessage(err), type: SnackbarType.ERROR });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: "border-box",
        minHeight: 0,
      }}
    >
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Stack sx={{ height: "100%", minHeight: 0, flex: 1, gap: 0 }}>
          <LabelFormPageHeader
            title="Tạo Label"
            onBack={goList}
            onCancel={goList}
            onSave={() => void handleSubmit(onSubmit)()}
            loading={submitting}
            disabled={submitting}
            buttonPermission={contentLabelListButtonPermission}
          />

          <StackRow sx={{ flex: 1, minHeight: 0, alignItems: "stretch", p: 3 }}>
            <Stack
              component="form"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
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
                          onActiveChange={(nextActive) => field.onChange(nextActive ? BadgeStatus.ACTIVE : BadgeStatus.INACTIVE)}
                        />
                      )}
                    />
                  </Stack>
                </Stack>
                <LabelContentDesignFields control={control} watch={watch} setValue={setValue} />
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
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LabelContentCreatePage;
