import { Alert, Stack } from "@mui/material";
import { useState } from "react";
import useSWR from "swr";
import { CustomButton } from "@/components/button/custom-button.component";
import { badgeApi, BadgeCampaignStatus, BadgeStatus, BadgeTemplateBadgeType, type BadgeFlowDetail } from "@/trading-ui/apis/badge";
import { LabelDisplayFormView } from "@/trading-ui/pages/content-display/label/label-display/components/label-display-form-view.component";
import { labelFlowState, labelFlowPayload, type LabelFlowState } from "./java-label-flow.state";
import { javaCreateBadgeFlow, javaUpdateBadgeFlow } from "@/apis/java/java-badge-flow.api";
function useLabelEditor(initial?: BadgeFlowDetail) {
  const [state, setState] = useState(() => labelFlowState(initial)), [busy, setBusy] = useState(false), [error, setError] = useState("");
  function update<K extends keyof LabelFlowState>(key: K, value: LabelFlowState[K]) { setState(previous => ({ ...previous, [key]: value })); }
  async function save(onSaved: () => void) {
    if (busy) return; setBusy(true); setError("");
    try {
      const payload = labelFlowPayload(state);
      if (initial) await javaUpdateBadgeFlow(initial.id, payload, state.status);
      else await javaCreateBadgeFlow(payload);
      onSaved();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Không thể lưu cấu hình."); }
    finally { setBusy(false); }
  }
  return { state, update, busy, error, save };
}
export function JavaLabelFlowForm({ initial, onSaved, onClose }: { initial?: BadgeFlowDetail; onSaved: () => void; onClose: () => void }) {
  const editor = useLabelEditor(initial), state = editor.state, update = editor.update;
  const templates = useSWR(["java-flow-templates", state.badgeType], () => badgeApi.getListBadgeTemplate({ isPagination: false, status: BadgeStatus.ACTIVE, badgeType: state.badgeType }));
  return <Stack gap={2}>
    {(editor.error || templates.error) && <Alert severity="error">{editor.error || (templates.error instanceof Error ? templates.error.message : "Không thể tải mẫu nhãn.")}</Alert>}
    <LabelDisplayFormView campaignName={state.name} onCampaignNameChange={value => update("name", value)}
      activeFrom={state.start} onActiveFromChange={value => update("start", value)} activeTo={state.end} onActiveToChange={value => update("end", value)}
      campaignStatus={state.status} onCampaignStatusChange={value => update("status", value)} selectedBadgeType={state.badgeType}
      onBadgeTypeChange={value => { update("badgeType", value); update("labelIds", []); }}
      selectedLabelIds={state.labelIds} onLabelsChange={value => update("labelIds", value.slice(-1))}
      labelSelectOptions={(templates.data?.list ?? []).map(row => ({ value: row.id, label: row.name }))}
      selectedTemplates={(templates.data?.list ?? []).filter(row => state.labelIds.includes(row.id))} maxLabelTemplates={1}
      isOutOfStock={state.badgeType === BadgeTemplateBadgeType.OUT_OF_STOCK} inputsDisabled={editor.busy}
      scopeAll={state.scope === "all"} scopePromotion={state.scope === "promotion"} scopeCategory={state.scope === "category"}
      scopeCollection={state.scope === "collection"} scopeProduct={state.scope === "product"}
      onToggleAll={() => update("scope", "all")} onTogglePromotion={() => update("scope", "promotion")} onToggleCategory={() => update("scope", "category")}
      onToggleCollection={() => update("scope", "collection")} onToggleProduct={() => update("scope", "product")}
      selectedCategories={state.categories} onCategoriesChange={value => update("categories", value)}
      selectedCollections={state.collections} onCollectionsChange={value => update("collections", value)}
      selectedProducts={state.products} onProductsChange={value => update("products", value)}
      selectedPromotions={state.promotions} onPromotionsChange={value => update("promotions", value)} />
    <Stack direction="row" justifyContent="flex-end" gap={1}>
      <CustomButton variant="outline" disabled={editor.busy} onClick={onClose}>Đóng</CustomButton>
      <CustomButton variant="primary" disabled={editor.busy || templates.isLoading} onClick={() => void editor.save(onSaved)}>
        {state.status === BadgeCampaignStatus.ACTIVE ? "Lưu và kích hoạt" : "Lưu cấu hình"}
      </CustomButton>
    </Stack>
  </Stack>;
}
