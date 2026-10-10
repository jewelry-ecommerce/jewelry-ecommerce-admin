import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import * as yup from "yup";
import { STYLE } from "@/trading-ui/adapters/library";
import { badgeApi, BadgePosition, BadgeStatus, BadgeTemplateBadgeType, BadgeType } from "@/trading-ui/apis/badge";
import { EmptyComponent } from "@/components/empty/empty.component";
import { LoadingComponent } from "@/components/loading/loading.component";
import { getLabelContentUpdatePath, ROUTE_PATH } from "@/router/route.path";
import { LabelFormPageHeader } from "../../components";
import { contentLabelListButtonPermission } from "@/trading-ui/pages/content-display/content-permission.constants";
import { LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR, LABEL_CONTENT_DEFAULT_TEXT_COLOR } from "../label-content.constants";
import type { LabelContentTemplateFormValues } from "../label-content.interface";
import { hasLabelDesignPreview, LABEL_LIBRARY_BADGE_TYPE_VALUES, mapBadgeTemplateToFormValues } from "../label-content.utils";
import { LabelContentFormView } from "../components/label-content-form-view.component";

const labelContentViewFormSchema = yup
  .object({
    badgeType: yup
      .string()
      .oneOf([...LABEL_LIBRARY_BADGE_TYPE_VALUES])
      .required(),
    name: yup.string().required(),
    status: yup.string().oneOf([BadgeStatus.ACTIVE, BadgeStatus.INACTIVE, BadgeStatus.DRAFT]).required(),
    type: yup.mixed<BadgeType.TEXT | BadgeType.IMAGE>().oneOf([BadgeType.TEXT, BadgeType.IMAGE]).required(),
    displayText: yup.string().default(""),
    image: yup.string().default(""),
    backgroundColor: yup.string().default(LABEL_CONTENT_DEFAULT_BACKGROUND_COLOR),
    textColor: yup.string().default(LABEL_CONTENT_DEFAULT_TEXT_COLOR),
    defaultPosition: yup.mixed<BadgePosition | "">().required(),
  })
  .required() as yup.ObjectSchema<LabelContentTemplateFormValues>;

const LabelContentDetailPage = () => {
  const { labelId = "" } = useParams<{ labelId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!labelId) {
      void navigate(ROUTE_PATH.LABEL_CONTENT_LIST, { replace: true });
    }
  }, [labelId, navigate]);

  const detailSwr = useSWR(
    labelId ? (["badge-template", "detail", labelId] as const) : null,
    () => badgeApi.getDetailBadgeTemplate(labelId),
    {
      revalidateOnFocus: false,
    },
  );

  const detail = detailSwr.data;

  const { control, reset, watch, setValue } = useForm<LabelContentTemplateFormValues>({
    resolver: yupResolver(labelContentViewFormSchema),
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
    reset(mapBadgeTemplateToFormValues(detail));
  }, [detail, reset]);

  const previewValues = watch();
  const showPreview = Boolean(detail) && hasLabelDesignPreview(previewValues);

  if (!labelId) {
    return <EmptyComponent />;
  }

  if (detailSwr.isLoading && !detail) {
    return <LoadingComponent />;
  }

  if (!detail) {
    return <EmptyComponent />;
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
            variant="view"
            title="Xem chi tiết Label"
            onBack={() => navigate(ROUTE_PATH.LABEL_CONTENT_LIST)}
            onEdit={() => navigate(getLabelContentUpdatePath(labelId))}
            editPermission={contentLabelListButtonPermission("label_content_edit", "Chỉnh sửa label", "api_cms_page_update")}
            buttonPermission={contentLabelListButtonPermission}
          />

          <LabelContentFormView viewMode showPreview={showPreview} control={control} watch={watch} setValue={setValue} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LabelContentDetailPage;
