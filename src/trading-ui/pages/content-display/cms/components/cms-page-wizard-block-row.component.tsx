import { Box, Collapse, Stack, Typography } from '@mui/material';
import React, { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KeyboardArrowDownRounded } from '@mui/icons-material';
import { Trash01 } from '@untitledui/icons';
import { CustomButton } from '../../../../components/button/custom-button';
import { PermissionIconButton } from '../../../../components/button/permission-icon-button';
import { contentButtonPermission } from '../../content-permission.constants';
import { SwitchComponent } from '../../../../components/switch/switch.component';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRowAlignCenter } from '../../../../components/styled';
import type { CmsPageWizardBlock } from '../cms-page.interface';
import type { CmsBlockSchemaValidationErrors } from '../utils/cms-block-schema.utils';
import IconDrag02 from '../../../../assets/icon/icon-drag-02';
import { CmsSchemaDefinitionForm } from './cms-schema-definition-form.component';
import { CmsPageWizardProductListConfig } from './product-list-config/cms-page-wizard-product-list-config.component';
import { CmsPageWizardImageGalleryConfig } from './image-gallery-config/cms-page-wizard-image-gallery-config.component';
import { CMS_PRODUCT_LIST_BLOCK_CODE } from '../utils/cms-product-list-block.utils';
import { CMS_IMAGE_GALLERY_BLOCK_CODE } from '../utils/cms-image-gallery-block.utils';
import { CmsPageWizardBannerPlacementSummary } from './cms-page-wizard-banner-placement-summary.component';

export interface CmsPageWizardBlockRowProps {
  block: CmsPageWizardBlock;
  index: number;
  collapseAllSignal?: number;
  validationErrors?: CmsBlockSchemaValidationErrors;
  onToggle: (clientId: string, isActive: boolean) => void;
  onRemove: (clientId: string) => void;
  onConfigChange: (clientId: string, nextConfig: Record<string, unknown>) => void;
  onQuickCreatePlacement: (clientId: string) => void;
  viewMode?: boolean;
}

export const CmsPageWizardBlockRow: React.FC<CmsPageWizardBlockRowProps> = ({
  block,
  index,
  collapseAllSignal,
  validationErrors,
  onToggle,
  onRemove,
  onConfigChange,
  onQuickCreatePlacement,
  viewMode = false,
}) => {
  const [expanded, setExpanded] = useState(true);
  const prevCollapseAllSignalRef = useRef(collapseAllSignal);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.clientId, disabled: viewMode });
  const placementCode = typeof block.config?.placementCode === 'string' ? block.config.placementCode.trim() : '';
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };

  const headingTitle = block.title?.trim() || 'Khối nội dung';
  const desc = block.description?.trim();
  const showDescription = Boolean(desc && desc !== headingTitle);

  useEffect(() => {
    if (collapseAllSignal !== undefined && prevCollapseAllSignalRef.current !== undefined && collapseAllSignal !== prevCollapseAllSignalRef.current) {
      setExpanded(false);
    }
    prevCollapseAllSignalRef.current = collapseAllSignal;
  }, [collapseAllSignal]);

  return (
    <Stack
      ref={setNodeRef}
      style={style}
      gap={1.25}
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        px: 1.5,
        py: 1.25,
        bgcolor: '#FFF',
        boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.04)',
      }}
    >
      <StackRowAlignCenter>
        {!viewMode ? (
          <Box
            {...attributes}
            {...listeners}
            aria-label="Kéo để sắp xếp"
            sx={{
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              color: '#9CA3AF',
              pr: 1,
            }}
          >
            <IconDrag02 />
          </Box>
        ) : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
            {headingTitle} #{index + 1}
          </Typography>
          {showDescription ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280' }}>{desc}</Typography> : null}
        </Box>
        <PermissionIconButton
          size="small"
          aria-label={expanded ? 'Thu gọn khối' : 'Mở rộng khối'}
          onClick={() => setExpanded((prev) => !prev)}
          {...contentButtonPermission('toggle_block', expanded ? 'Thu gọn khối' : 'Mở rộng khối', 'api_cms_page_detail')}
          sx={{ color: '#667085', ml: 0.5 }}
        >
          <KeyboardArrowDownRounded
            sx={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </PermissionIconButton>
        <SwitchComponent value={block.isActive} disabled={viewMode} onChange={(event) => onToggle(block.clientId, Boolean(event?.target?.value))} />
        {!viewMode ? (
          <CustomButton
            type="button"
            variant="outline"
            fullWidth={false}
            onClick={() => onRemove(block.clientId)}
            aria-label="Xóa khối"
            sx={{ minWidth: 40, px: 0.5, py: 0.5, ml: 1 }}
            {...contentButtonPermission('remove_block', 'Xóa khối', 'api_cms_page_update')}
          >
            <Trash01 size={18} />
          </CustomButton>
        ) : null}
      </StackRowAlignCenter>

      <Collapse in={expanded}>
        <Box sx={{ pl: viewMode ? 0 : 4 }}>
          {block.blockTypeCode === CMS_PRODUCT_LIST_BLOCK_CODE ? (
            <CmsPageWizardProductListConfig
              schema={block.schemaDefinition}
              value={block.config}
              errors={validationErrors}
              onChange={(nextConfig) => onConfigChange(block.clientId, nextConfig)}
              disabled={viewMode}
            />
          ) : block.blockTypeCode === CMS_IMAGE_GALLERY_BLOCK_CODE ? (
            <CmsPageWizardImageGalleryConfig
              schema={block.schemaDefinition}
              value={block.config}
              errors={validationErrors}
              onChange={(nextConfig) => onConfigChange(block.clientId, nextConfig)}
              disabled={viewMode}
            />
          ) : (
            <CmsSchemaDefinitionForm
              schema={block.schemaDefinition}
              value={block.config}
              errors={validationErrors}
              onChange={(nextConfig) => onConfigChange(block.clientId, nextConfig)}
              disabled={viewMode}
              blockTypeCode={block.blockTypeCode}
            />
          )}

          {block.blockTypeCode === 'BANNER' ? (
            <React.Fragment>
              {placementCode ? <CmsPageWizardBannerPlacementSummary placementCode={placementCode} /> : null}
              {!viewMode ? (
                <CustomButton
                  type="button"
                  variant="outline"
                  fullWidth={false}
                  onClick={() => onQuickCreatePlacement(block.clientId)}
                  sx={{ mt: 1.25 }}
                  {...contentButtonPermission('banner_placement', placementCode ? 'Chỉnh sửa nội dung banner' : 'Tạo nội dung banner', 'api_banner_create')}
                >
                  {placementCode ? 'Chỉnh sửa nội dung banner' : 'Tạo nội dung banner'}
                </CustomButton>
              ) : null}
            </React.Fragment>
          ) : null}
        </Box>
      </Collapse>
    </Stack>
  );
};
