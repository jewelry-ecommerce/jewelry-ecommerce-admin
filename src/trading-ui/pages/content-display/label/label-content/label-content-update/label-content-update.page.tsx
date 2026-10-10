import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import * as yup from "yup";
import { STYLE } from "@/trading-ui/adapters/library";
import { badgeApi, BadgePosition, BadgeStatus, BadgeTemplateBadgeType, BadgeType } from "@/trading-ui/apis/badge";
import { ROUTE_PATH } from "@/router/route.path";
import { LabelFormPageHeader } from "../../components";
import { getErrorMessage } from "@/trading-ui/common/utils";
import { useSnackbar, SnackbarType } from "@/hooks/use-snackbar.hook";
import { LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR, LABEL_CONTENT_DEFAULT_TEXT_COLOR } from "../label-content.constants";
import type { LabelContentTemplateFormValues } from "../label-content.interface";
import {
  buildUpdateBadgeTemplatePayload,
  hasLabelDesignPreview,
  LABEL_LIBRARY_BADGE_TYPE_VALUES,
  mapBadgeTemplateToFormValues,
} from "../label-content.utils";
import { contentLabelListButtonPermission } from "@/trading-ui/pages/content-display/content-permission.constants";
import { LabelContentFormView } from "../components/label-content-form-view.component";

const labelContentUpdateFormSchema = yup
  .object({
    badgeType: yup
      .string()
      .oneOf([...LABEL_LIBRARY_BADGE_TYPE_VALUES])
      .required("Vui lòng chọn loại Label"),
    name: yup.string().trim().required("Vui lòng nhập tên Label"),
    status: yup.string().oneOf([BadgeStatus.ACTIVE, BadgeStatus.INACTIVE, BadgeStatus.DRAFT]).required("Vui lòng chọn trạng thái"),
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

const pickTemplateComparable = (v: LabelContentTemplateFormValues) => {
  const type = v.type;
  return {
    badgeType: v.badgeType,
    name: (v.name ?? "").trim(),
    type,
    displayText: type === BadgeType.TEXT ? (v.displayText ?? "").trim() : "",
    image: type === BadgeType.IMAGE ? (v.image ?? "").trim() : "",
    backgroundColor: v.backgroundColor?.trim() || LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR,
    textColor: v.textColor?.trim() || LABEL_CONTENT_DEFAULT_TEXT_COLOR,
    defaultPosition: v.defaultPosition || BadgePosition.TOP_LEFT,
  };
};

const LabelContentUpdatePage = () => {
  const { labelId = "" } = useParams<{ labelId: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [submitting, setSubmitting] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<LabelContentTemplateFormValues | null>(null);

  useEffect(() => {
    if (!labelId) {
      void navigate(ROUTE_PATH.LABEL_CONTENT_LIST, { replace: true });
    }
  }, [labelId, navigate]);

  const goList = () => {
    void navigate(ROUTE_PATH.LABEL_CONTENT_LIST);
  };

  const detailSwr = useSWR(
    labelId ? (["badge-template", "detail", labelId] as const) : null,
    () => badgeApi.getDetailBadgeTemplate(labelId),
    { revalidateOnFocus: false },
  );

  const detail = detailSwr.data;
  const inputsDisabled = detail?.status === BadgeStatus.ACTIVE;

  const { control, handleSubmit, reset, watch, setValue } = useForm<LabelContentTemplateFormValues>({
    resolver: yupResolver(labelContentUpdateFormSchema),
    mode: "onSubmit",
    defaultValues: {
      badgeType: BadgeTemplateBadgeType.CAMPAIGN,
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

  useEffect(() => {
    if (!detail) return;
    const v = mapBadgeTemplateToFormValues(detail);
    reset(v);
    setInitialSnapshot(v);
  }, [detail, reset]);

  const previewValues = watch();
  const showPreview = Boolean(detail) && hasLabelDesignPreview(previewValues);

  const onSubmit: SubmitHandler<LabelContentTemplateFormValues> = async (values) => {
    if (!labelId || !initialSnapshot) return;
    const infoChanged = JSON.stringify(pickTemplateComparable(values)) !== JSON.stringify(pickTemplateComparable(initialSnapshot));
    const statusChanged = values.status !== initialSnapshot.status;

    if (!infoChanged && !statusChanged) {
      showSnackbar({ message: "Không có thay đổi.", type: SnackbarType.SUCCESS });
      return;
    }

    setSubmitting(true);
    try {
      if (infoChanged) {
        await badgeApi.patchBadgeTemplate(labelId, buildUpdateBadgeTemplatePayload(values));
      }
      if (statusChanged) {
        await badgeApi.patchBadgeTemplateStatus(labelId, { status: values.status as BadgeStatus });
      }
      showSnackbar({ message: "Cập nhật thành công.", type: SnackbarType.SUCCESS });
      await detailSwr.mutate();
      void navigate(ROUTE_PATH.LABEL_CONTENT_LIST);
    } catch (err) {
      showSnackbar({ message: getErrorMessage(err), type: SnackbarType.ERROR });
    } finally {
      setSubmitting(false);
    }
  };

  if (!detail) {
    return null;
  }

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
            title="Chỉnh sửa Label"
            onBack={goList}
            onCancel={goList}
            onSave={() => void handleSubmit(onSubmit)()}
            loading={submitting}
            disabled={submitting || detailSwr.isLoading}
            buttonPermission={contentLabelListButtonPermission}
          />

          <LabelContentFormView
            showPreview={showPreview}
            inputsDisabled={inputsDisabled}
            control={control}
            watch={watch}
            setValue={setValue}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LabelContentUpdatePage;
