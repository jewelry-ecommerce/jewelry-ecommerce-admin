// Ported row shell/drag controls from trading-admin; config boundary uses the local typed CMS mock.
import { Box, Collapse, Stack, Typography } from "@mui/material";
import React, { type CSSProperties, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { Trash01 } from "./cms-source-icons";
import { CustomButton } from "@/trading-ui/components/button/custom-button";
import { PermissionIconButton } from "@/trading-ui/components/button/permission-icon-button";
import { contentButtonPermission } from "./cms-source-permission";
import { SwitchComponent } from "./cms-source-form-adapters";
import { TYPOGRAPHY_STYLES } from "@/trading-ui/common/constant/typography.constant";
import { StackRowAlignCenter } from "@/trading-ui/components/styled";
import type { CmsPageWizardBlock } from "./cms-source-block.interface";
import IconDrag02 from "@/trading-ui/assets/icon/icon-drag-02";
import { CmsBlockFields } from "../cms-block-fields.component";
import type { CmsDemoConfig } from "@/apis/cms-demo/cms-demo.interface";

export interface CmsPageWizardBlockRowProps {
  block: CmsPageWizardBlock;
  index: number;
  collapseAllSignal?: number;
  validationErrors?: Record<string, string>;
  onToggle: (clientId: string, isActive: boolean) => void;
  onRemove: (clientId: string) => void;
  onConfigChange: (clientId: string, nextConfig: CmsDemoConfig) => void;
  onQuickCreatePlacement: (clientId: string) => void;
  viewMode?: boolean;
}

function useCmsPageWizardBlockRowViewProps(props: CmsPageWizardBlockRowProps) {
  const { block, index, collapseAllSignal, onToggle, onRemove, onConfigChange, validationErrors, viewMode = false } = props;
  const [expanded, setExpanded] = useState(!collapseAllSignal);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.clientId, disabled: viewMode });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };
  const headingTitle = block.title?.trim() || "Khối nội dung";
  const desc = block.description?.trim();
  const showDescription = Boolean(desc && desc !== headingTitle);
  return {
    block,
    index,
    onToggle,
    onRemove,
    onConfigChange,
    validationErrors,
    viewMode,
    expanded,
    setExpanded,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    style,
    headingTitle,
    desc,
    showDescription,
  };
}

type CmsPageWizardBlockRowViewProps = ReturnType<typeof useCmsPageWizardBlockRowViewProps>;

function CmsBlockDragHandle(props: CmsPageWizardBlockRowViewProps) {
  const { viewMode, attributes, listeners } = props;
  return (
    <>
      {!viewMode ? (
        <Box
          {...attributes}
          {...listeners}
          aria-label="Kéo để sắp xếp"
          sx={{
            cursor: "grab",
            display: "flex",
            alignItems: "center",
            color: "#9CA3AF",
            pr: 1,
          }}
        >
          <IconDrag02 />
        </Box>
      ) : null}
    </>
  );
}

function CmsBlockExpandButton(props: CmsPageWizardBlockRowViewProps) {
  const { expanded, setExpanded } = props;
  return (
    <PermissionIconButton
      size="small"
      aria-label={expanded ? "Thu gọn khối" : "Mở rộng khối"}
      onClick={() => setExpanded((prev) => !prev)}
      {...contentButtonPermission("toggle_block", expanded ? "Thu gọn khối" : "Mở rộng khối", "api_cms_page_detail")}
      sx={{ color: "#667085", ml: 0.5 }}
    >
      <KeyboardArrowDownRounded
        sx={{
          transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.2s ease",
        }}
      />
    </PermissionIconButton>
  );
}

function CmsBlockToolbar(props: CmsPageWizardBlockRowViewProps) {
  const { block, index, onToggle, onRemove, viewMode, headingTitle, desc, showDescription } = props;
  return (
    <StackRowAlignCenter>
      {<CmsBlockDragHandle {...props} />}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: "#101828" }}>
          {headingTitle} #{index + 1}
        </Typography>
        {showDescription ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#6B7280" }}>{desc}</Typography> : null}
      </Box>
      <CmsBlockExpandButton {...props} />
      <SwitchComponent
        value={block.isActive}
        disabled={viewMode}
        onChange={(event) => onToggle(block.clientId, Boolean(event?.target?.value))}
      />
      {!viewMode ? (
        <CustomButton
          type="button"
          variant="outline"
          fullWidth={false}
          onClick={() => onRemove(block.clientId)}
          aria-label="Xóa khối"
          sx={{ minWidth: 40, px: 0.5, py: 0.5, ml: 1 }}
          {...contentButtonPermission("remove_block", "Xóa khối", "api_cms_page_update")}
        >
          <Trash01 size={18} />
        </CustomButton>
      ) : null}
    </StackRowAlignCenter>
  );
}

function CmsBlockFrame(props: CmsPageWizardBlockRowViewProps) {
  const { block, onConfigChange, viewMode, expanded, setNodeRef, style } = props;
  return (
    <Stack
      ref={setNodeRef}
      style={style}
      gap={1.25}
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        px: 1.5,
        py: 1.25,
        bgcolor: "#FFF",
        boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.04)",
      }}
    >
      <CmsBlockToolbar {...props} />

      <Collapse in={expanded}>
        <Box sx={{ pl: viewMode ? 0 : 4 }}>
          <CmsBlockFields block={block} disabled={viewMode} errors={props.validationErrors} onChange={(config) => onConfigChange(block.clientId, config)} />
        </Box>
      </Collapse>
    </Stack>
  );
}

export const CmsPageWizardBlockRow: React.FC<CmsPageWizardBlockRowProps> = (props) => {
  const context = useCmsPageWizardBlockRowViewProps(props);
  return <CmsBlockFrame {...context} />;
};
