import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Eye, Package, Plus } from '@untitledui/icons';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { CustomButton } from '../../../../components/button/custom-button';
import type { CmsPageBlockCatalogItem, CmsPageBlockValidationState, CmsPageWizardBlock } from '../cms-page.interface';
import { contentButtonPermission } from '../../content-permission.constants';
import { CmsPageWizardStepActions } from './cms-page-wizard-step-actions.component';
import { EmptyComponent } from '../../../../components/empty';
import { CmsPageWizardBlockRow } from './cms-page-wizard-block-row.component';
import { CmsBlockPreviewDialog } from '../block-preview/cms-block-preview-dialog.component';

export interface CmsPageWizardStepBlocksProps {
  blocks: CmsPageWizardBlock[];
  blockCatalog: CmsPageBlockCatalogItem[];
  blockValidationErrors: CmsPageBlockValidationState;
  hasBlockTypes: boolean;
  sensors: Parameters<typeof DndContext>[0]['sensors'];
  onDragEnd: (event: DragEndEvent) => void;
  onAddBlock: (blockType: CmsPageBlockCatalogItem) => void;
  onOpenCreateBlockType: () => void;
  onToggleBlock: (clientId: string, isActive: boolean) => void;
  onConfigChange: (clientId: string, nextConfig: Record<string, unknown>) => void;
  onQuickCreatePlacement: (clientId: string) => void;
  onRemoveBlock: (clientId: string) => void;
  onBack: () => void;
  onSave: () => void;
  onContinue: () => void;
  loadingSave: boolean;
  loadingContinue: boolean;
  viewMode?: boolean;
}

export const CmsPageWizardStepBlocks: React.FC<CmsPageWizardStepBlocksProps> = ({
  blocks,
  blockCatalog,
  blockValidationErrors,
  hasBlockTypes,
  sensors,
  onDragEnd,
  onAddBlock,
  onOpenCreateBlockType,
  onToggleBlock,
  onConfigChange,
  onQuickCreatePlacement,
  onRemoveBlock,
  onBack,
  onSave,
  onContinue,
  loadingSave,
  loadingContinue,
  viewMode = false,
}) => {
  const [collapseAllSignal, setCollapseAllSignal] = useState<number>(0);
  const [previewBlock, setPreviewBlock] = useState<CmsPageBlockCatalogItem | null>(null);

  return (
    <React.Fragment>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: '#E5E7EB',
          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <StackRow gap={2} alignItems="stretch">
            <Box
              sx={{
                flex: { xs: 1, md: '0 0 40%' },
                minWidth: { md: 360 },
                border: '1px solid #E5E7EB',
                borderRadius: 2,
                p: 1.5,
                bgcolor: '#FAFAFA',
              }}
            >
              <StackRowAlignCenterJustBetween sx={{ mb: 1.5 }}>
                <StackRowAlignCenter>
                  <Package size={18} color="#6B7280" />
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828', ml: 1 }}>Loại khối</Typography>
                </StackRowAlignCenter>
                {!viewMode ? (
                  <CustomButton
                    type="button"
                    variant="outline"
                    fullWidth={false}
                    onClick={onOpenCreateBlockType}
                    sx={{ minWidth: 36, px: 1, py: 0.5 }}
                    aria-label="Tạo loại khối mới"
                    {...contentButtonPermission('create_block_type', 'Tạo loại khối mới', 'api_cms_page_update')}
                  >
                    <Plus size={16} />
                  </CustomButton>
                ) : null}
              </StackRowAlignCenterJustBetween>

              {blockCatalog.some((item) => item.code === 'BANNER') ? (
                <Box sx={{ border: '1px solid #D1FAE5', bgcolor: '#ECFDF3', borderRadius: 2, p: 1.25, mb: 1.5 }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#027A48' }}>Luồng banner nhanh</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#027A48', mt: 0.5 }}>
                    1) Tạo vị trí hiển thị trên hệ thống banner 2) lấy mã vị trí 3) gán vào khối banner bên phải.
                  </Typography>
                </Box>
              ) : null}

              {!hasBlockTypes ? (
                <Box sx={{ border: '1px dashed #D1D5DB', borderRadius: 2, p: 1.5 }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#6B7280' }}>Chưa có loại khối</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#9CA3AF', mt: 0.5 }}>Nhấn dấu + để tạo loại khối ngay ở bước này.</Typography>
                </Box>
              ) : (
                <Stack gap={1}>
                  {blockCatalog.map((item) => (
                    <StackRow key={item.code} gap={1} alignItems="stretch">
                      <CustomButton
                        type="button"
                        variant="outline"
                        fullWidth
                        onClick={() => onAddBlock(item)}
                        disabled={viewMode}
                        {...contentButtonPermission('add_block', `Thêm khối ${item.name}`, 'api_cms_page_update')}
                        sx={{
                          flex: 1,
                          py: 1.25,
                          alignItems: 'flex-start',
                          textAlign: 'left',
                          flexDirection: 'column',
                          borderColor: '#D1D5DB',
                        }}
                      >
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#101828' }}>{item.name}</Typography>
                        {item.description?.trim() ? (
                          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.25 }} noWrap>
                            {item.description}
                          </Typography>
                        ) : null}
                      </CustomButton>
                      <CustomButton
                        type="button"
                        variant="outline"
                        fullWidth={false}
                        aria-label={`Xem trước ${item.name}`}
                        onClick={() => setPreviewBlock(item)}
                        sx={{ minWidth: 40, px: 1, py: 1.25, borderColor: '#D1D5DB', flexShrink: 0 }}
                        {...contentButtonPermission('preview_block_type', `Xem trước ${item.name}`, 'api_cms_page_detail')}
                      >
                        <Eye size={16} />
                      </CustomButton>
                    </StackRow>
                  ))}
                </Stack>
              )}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <StackRowAlignCenterJustBetween sx={{ mb: 2 }}>
                <StackRowAlignCenter>
                  <Package size={22} color="#6B7280" />
                  <Box sx={{ pl: 1 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>Nội dung trang</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Kéo thả để sắp xếp và điền cấu hình cho từng khối.</Typography>
                  </Box>
                </StackRowAlignCenter>
                <CustomButton type="button" variant="outline" fullWidth={false} onClick={() => setCollapseAllSignal(Date.now())} disabled={blocks.length === 0} sx={{ px: 1.25, py: 0.5 }}>
                  Thu gọn tất cả
                </CustomButton>
              </StackRowAlignCenterJustBetween>

              {blocks.length === 0 ? (
                <EmptyComponent />
              ) : (
                <DndContext sensors={viewMode ? [] : sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={viewMode ? () => undefined : onDragEnd}>
                  <SortableContext items={blocks.map((block) => block.clientId)} strategy={verticalListSortingStrategy}>
                    <Stack gap={0}>
                      {blocks.map((block, index) => (
                        <Box key={block.clientId} sx={{ mt: index === 0 ? 0 : 1.5 }}>
                          <CmsPageWizardBlockRow
                            block={block}
                            index={index}
                            collapseAllSignal={collapseAllSignal}
                            validationErrors={blockValidationErrors[block.clientId]}
                            onToggle={onToggleBlock}
                            onConfigChange={onConfigChange}
                            onQuickCreatePlacement={onQuickCreatePlacement}
                            onRemove={onRemoveBlock}
                            viewMode={viewMode}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </SortableContext>
                </DndContext>
              )}
            </Box>
          </StackRow>
        </CardContent>
      </Card>

      <CmsPageWizardStepActions leftLabel="Quay lại" onLeft={onBack} onSave={onSave} onContinue={onContinue} loadingSave={loadingSave} loadingContinue={loadingContinue} viewMode={viewMode} />

      <CmsBlockPreviewDialog open={Boolean(previewBlock)} onClose={() => setPreviewBlock(null)} blockCode={previewBlock?.code ?? ''} blockName={previewBlock?.name ?? ''} />
    </React.Fragment>
  );
};
