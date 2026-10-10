import { useState } from "react";
import useSWR from "swr";
import { Alert, Stack } from "@mui/material";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { DialogComponent } from "@/trading-ui/components/dialog/dialog.component";
import { CmsPageWizardDialogPlacementBuilder } from "@/trading-ui/pages/content-display/cms/components/cms-page-wizard-dialog-placement-builder.component";
import { bannerApi } from "@/trading-ui/apis/banner/banner.api";
import { createCmsBannerPlacement } from "./cms-banner-placement.service";
import { CmsBannerList } from "./cms-banner-list.component";
function useBannerPage() {
  const [search, setSearch] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { data, error: loadError, mutate } = useSWR(["cms-banner-placements"], () => bannerApi.getPlacementList({ isPagination: false }));
  async function remove() {
    if (!deletingId) return;
    try {
      await bannerApi.deletePlacement(deletingId);
      setDeletingId(null);
      await mutate();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể xóa vị trí banner.");
    }
  }
  const rows = (data?.list || []).filter((row) => (row.code + row.name).toLowerCase().includes(search.trim().toLowerCase()));
  return {
    rows,
    search,
    setSearch,
    editingCode,
    setEditingCode,
    deletingId,
    setDeletingId,
    error: error || loadError?.message,
    mutate,
    remove,
  };
}
function BannerDialogs({ state }: { state: ReturnType<typeof useBannerPage> }) {
  return (
    <>
      {state.editingCode !== null ? (
        <CmsPageWizardDialogPlacementBuilder
          open
          initialPlacementCode={state.editingCode || undefined}
          onClose={() => {
            state.setEditingCode(null);
            void state.mutate();
          }}
          onCreatePlacementDraft={createCmsBannerPlacement}
          onUsePlacementCode={() => void state.mutate()}
        />
      ) : null}
      <DialogComponent
        open={state.deletingId !== null}
        onClose={() => state.setDeletingId(null)}
        title="Xóa vị trí banner"
        buttonLeft={{ content: "Hủy", onClick: () => state.setDeletingId(null) }}
        buttonRight={{ content: "Xóa", onClick: state.remove }}
      >
        Vị trí bị xóa sẽ không còn hiển thị trên các trang CMS đang dùng mã này.
      </DialogComponent>
    </>
  );
}
export default function CmsBannerPage() {
  const state = useBannerPage();
  return (
    <WrapperComponent label="Banner">
      <Stack gap={2} sx={{ flex: 1, minHeight: 0 }}>
        {state.error ? <Alert severity="error">{state.error}</Alert> : null}
        <CmsBannerList
          rows={state.rows}
          search={state.search}
          setSearch={state.setSearch}
          create={() => state.setEditingCode("")}
          edit={state.setEditingCode}
          remove={state.setDeletingId}
        />
        <BannerDialogs state={state} />
      </Stack>
    </WrapperComponent>
  );
}
