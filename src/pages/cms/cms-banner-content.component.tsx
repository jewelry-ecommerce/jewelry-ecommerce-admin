import { useState } from "react";
import useSWR from "swr";
import { bannerApi } from "@/trading-ui/apis/banner/banner.api";
import { SelectInput } from "@/trading-ui/components/form/select-input";
import { CustomButton } from "@/trading-ui/components/button/custom-button";
import { CmsPageWizardDialogPlacementBuilder } from "@/trading-ui/pages/content-display/cms/components/cms-page-wizard-dialog-placement-builder.component";
import { CmsPageWizardBannerPlacementSummary } from "@/trading-ui/pages/content-display/cms/components/cms-page-wizard-banner-placement-summary.component";
import { createCmsBannerPlacement } from "./cms-banner-placement.service";
interface Props {
  placementCode?: string;
  disabled: boolean;
  error?: string;
  onChange: (code: string) => void;
}
interface BuilderProps {
  open: boolean;
  placementCode?: string;
  close: () => void;
  apply: (code: string) => void;
}
function BannerBuilderDialog({ open, placementCode, close, apply }: BuilderProps) {
  if (!open) return null;
  return <CmsPageWizardDialogPlacementBuilder open initialPlacementCode={placementCode}
    onClose={close} onCreatePlacementDraft={createCmsBannerPlacement} onUsePlacementCode={apply} />;
}
export function CmsBannerContent({ placementCode, disabled, error, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const { data, mutate } = useSWR(["cms-banner-placements"], () => bannerApi.getPlacementList({ isPagination: false }));
  const options = (data?.list || []).map((placement) => ({ value: placement.code, label: placement.name + " (" + placement.code + ")" }));
  if (placementCode && !options.some((option) => option.value === placementCode))
    options.push({ value: placementCode, label: placementCode });
  return (
    <>
      <SelectInput
        label="Vị trí hiển thị banner"
        value={placementCode || ""}
        options={options}
        disabled={disabled}
        error={Boolean(error)}
        errorMessage={error}
        placeholder="Chọn vị trí đã tạo"
        onChange={(event) => onChange(event.target.value)}
      />
      {placementCode ? <CmsPageWizardBannerPlacementSummary placementCode={placementCode} /> : null}
      <CustomButton type="button" variant="outline" fullWidth={false} disabled={disabled} onClick={() => setOpen(true)} sx={{ mt: 1.25 }}>
        {placementCode ? "Chỉnh sửa nội dung banner" : "Tạo nội dung banner"}
      </CustomButton>
      <BannerBuilderDialog open={open} placementCode={placementCode} close={() => setOpen(false)}
        apply={code => { onChange(code); void mutate(); }} />
    </>
  );
}
