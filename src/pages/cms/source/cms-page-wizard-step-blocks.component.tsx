// Two-column catalog/content and drag-and-drop markup ported from trading-admin CMS.
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Eye, Package } from "./cms-source-icons";
import { TYPOGRAPHY_STYLES } from "@/trading-ui/common/constant/typography.constant";
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/trading-ui/components/styled";
import { CustomButton } from "@/trading-ui/components/button/custom-button";
import { EmptyComponent } from "@/components/empty/empty.component";
import type { CmsPageBlockCatalogItem, CmsPageBlockValidationState, CmsPageWizardBlock } from "./cms-source-block.interface";
import type { CmsDemoConfig } from "@/apis/cms-demo/cms-demo.interface";
import { CmsPageWizardStepActions } from "./cms-page-wizard-step-actions.component";
import { CmsPageWizardBlockRow } from "./cms-page-wizard-block-row.component";
import { CmsBlockPreviewDialog } from "./cms-source-block-preview.component";
export interface CmsPageWizardStepBlocksProps {
  blocks: CmsPageWizardBlock[];
  blockCatalog: CmsPageBlockCatalogItem[];
  blockValidationErrors: CmsPageBlockValidationState;
  hasBlockTypes: boolean;
  sensors: Parameters<typeof DndContext>[0]["sensors"];
  onDragEnd: (event: DragEndEvent) => void;
  onAddBlock: (type: CmsPageBlockCatalogItem) => void;
  onOpenCreateBlockType: () => void;
  onToggleBlock: (id: string, value: boolean) => void;
  onConfigChange: (id: string, config: CmsDemoConfig) => void;
  onQuickCreatePlacement: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onBack: () => void;
  onSave: () => void;
  onContinue: () => void;
  loadingSave: boolean;
  loadingContinue: boolean;
  viewMode?: boolean;
}
function CatalogItem({
  item,
  disabled,
  add,
  preview,
}: {
  item: CmsPageBlockCatalogItem;
  disabled?: boolean;
  add: () => void;
  preview: () => void;
}) {
  return (
    <StackRow gap={1} alignItems="stretch">
      <CustomButton
        type="button"
        variant="outline"
        fullWidth
        onClick={add}
        disabled={disabled}
        sx={{ flex: 1, py: 1.25, alignItems: "flex-start", textAlign: "left", flexDirection: "column", borderColor: "#D1D5DB" }}
      >
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: "#101828" }}>{item.name}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#6B7280", mt: 0.25 }} noWrap>
          {item.description}
        </Typography>
      </CustomButton>
      <CustomButton
        type="button"
        variant="outline"
        fullWidth={false}
        aria-label={"Xem trước " + item.name}
        onClick={preview}
        sx={{ minWidth: 40, px: 1, py: 1.25, borderColor: "#D1D5DB", flexShrink: 0 }}
      >
        <Eye size={16} />
      </CustomButton>
    </StackRow>
  );
}
function BlockCatalog({ props, preview }: { props: CmsPageWizardStepBlocksProps; preview: (item: CmsPageBlockCatalogItem) => void }) {
  return (
    <Box
      sx={{
        flex: { xs: 1, md: "0 0 40%" },
        minWidth: { md: 360 },
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        p: 1.5,
        bgcolor: "#FAFAFA",
      }}
    >
      <StackRowAlignCenter sx={{ mb: 1.5 }}>
        <Package size={18} color="#6B7280" />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: "#101828", ml: 1 }}>Loại khối</Typography>
      </StackRowAlignCenter>
      <Box sx={{ border: "1px solid #D1FAE5", bgcolor: "#ECFDF3", borderRadius: 2, p: 1.25, mb: 1.5 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: "#027A48" }}>Luồng banner nhanh</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#027A48", mt: 0.5 }}>
          1) Tạo vị trí hiển thị trên hệ thống banner 2) lấy mã vị trí 3) gán vào khối banner bên phải.
        </Typography>
      </Box>
      <Stack gap={1}>
        {props.blockCatalog.map((item) => (
          <CatalogItem
            key={item.code}
            item={item}
            disabled={props.viewMode}
            add={() => props.onAddBlock(item)}
            preview={() => preview(item)}
          />
        ))}
      </Stack>
    </Box>
  );
}
function ContentHeading({ disabled, onCollapse }: { disabled: boolean; onCollapse: () => void }) {
  return (
    <StackRowAlignCenterJustBetween sx={{ mb: 2 }}>
      <StackRowAlignCenter>
        <Package size={22} color="#6B7280" />
        <Box sx={{ pl: 1 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: "#101828" }}>Nội dung trang</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#6B7280" }}>
            Kéo thả để sắp xếp và điền cấu hình cho từng khối.
          </Typography>
        </Box>
      </StackRowAlignCenter>
      <CustomButton variant="outline" onClick={onCollapse} disabled={disabled} sx={{ px: 1.25, py: 0.5 }}>
        Thu gọn tất cả
      </CustomButton>
    </StackRowAlignCenterJustBetween>
  );
}
function BlockContent({ props, collapse, onCollapse }: { props: CmsPageWizardStepBlocksProps; collapse: number; onCollapse: () => void }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <ContentHeading disabled={!props.blocks.length} onCollapse={onCollapse} />
      {!props.blocks.length ? (
        <EmptyComponent title="Chưa có khối nội dung" description="Chọn loại khối bên trái để thêm vào trang." />
      ) : (
        <DndContext
          sensors={props.viewMode ? [] : props.sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={props.onDragEnd}
        >
          <SortableContext items={props.blocks.map((block) => block.clientId)} strategy={verticalListSortingStrategy}>
            <Stack gap={0}>
              {props.blocks.map((block, index) => (
                <Box key={block.clientId} sx={{ mt: index === 0 ? 0 : 1.5 }}>
                  <CmsPageWizardBlockRow
                    key={collapse}
                    block={block}
                    index={index}
                    collapseAllSignal={collapse}
                    validationErrors={props.blockValidationErrors[block.clientId]}
                    onToggle={props.onToggleBlock}
                    onConfigChange={props.onConfigChange}
                    onQuickCreatePlacement={props.onQuickCreatePlacement}
                    onRemove={props.onRemoveBlock}
                    viewMode={props.viewMode}
                  />
                </Box>
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      )}
    </Box>
  );
}
export function CmsPageWizardStepBlocks(props: CmsPageWizardStepBlocksProps) {
  const [collapse, setCollapse] = useState(0);
  const [preview, setPreview] = useState<CmsPageBlockCatalogItem | null>(null);
  return (
    <>
      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "#E5E7EB", boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          <StackRow gap={2} alignItems="stretch">
            <BlockCatalog props={props} preview={setPreview} />
            <BlockContent props={props} collapse={collapse} onCollapse={() => setCollapse(Date.now())} />
          </StackRow>
        </CardContent>
      </Card>
      <CmsPageWizardStepActions
        leftLabel="Quay lại"
        onLeft={props.onBack}
        onSave={props.onSave}
        onContinue={props.onContinue}
        loadingSave={props.loadingSave}
        loadingContinue={props.loadingContinue}
        viewMode={props.viewMode}
      />
      <CmsBlockPreviewDialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        blockCode={preview?.code || ""}
        blockName={preview?.name || ""}
      />
    </>
  );
}
