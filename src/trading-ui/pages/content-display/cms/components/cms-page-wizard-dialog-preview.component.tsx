import { Box, Typography } from '@mui/material';
import React from 'react';
import { DialogComponent } from '../../../../components/dialog/dialog.component';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRow } from '../../../../components/styled';
import { CustomButton } from '../../../../components/button/custom-button';

import type { CmsPageWizardBlock } from '../cms-page.interface';

export interface CmsPageWizardDialogPreviewProps {
  open: boolean;
  onClose: () => void;
  name: string;
  slug: string;
  blocks: CmsPageWizardBlock[];
}

export const CmsPageWizardDialogPreview: React.FC<CmsPageWizardDialogPreviewProps> = ({ open, onClose, name, slug, blocks }) => {
  return (
    <DialogComponent title={`Xem trước trang: ${name || '—'}`} open={open} onClose={onClose} maxWidth="md">
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 2 }}>Đường dẫn: /{slug || '—'}</Typography>
      <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        <Box sx={{ bgcolor: '#F3F4F6', px: 1.5, py: 0.75, typography: 'caption', color: '#6B7280' }}>https://example.com/{slug || '...'}</Box>
        <Box sx={{ p: 2, maxHeight: 360, overflow: 'auto' }}>
          {blocks.map((b) => (
            <Box key={b.clientId} sx={{ mb: 2 }}>
              {b.blockTypeCode === 'BANNER' && (
                <Box
                  sx={{
                    height: 120,
                    bgcolor: '#E5E7EB',
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Typography color="text.secondary">Vùng xem trước banner</Typography>
                </Box>
              )}
              {b.blockTypeCode === 'PRODUCT_GRID' && (
                <StackRow>
                  {[1, 2, 3, 4].map((i) => (
                    <Box key={i} sx={{ flex: 1, height: 80, bgcolor: '#E5E7EB', borderRadius: 1, ml: i === 0 ? 0 : 1 }} />
                  ))}
                </StackRow>
              )}
              {b.blockTypeCode === 'VIDEO' && (
                <Box
                  sx={{
                    height: 160,
                    bgcolor: '#111',
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Typography sx={{ color: '#fff', fontSize: 12 }}>Vùng xem trước video</Typography>
                </Box>
              )}
              {!['BANNER', 'PRODUCT_GRID', 'VIDEO'].includes(b.blockTypeCode) && (
                <Box sx={{ py: 2, px: 1, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium }}>{b.blockTypeCode}</Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
      <StackRow sx={{ justifyContent: 'flex-end' }}>
        <CustomButton type="button" variant="outline" fullWidth={false} onClick={onClose} sx={{ px: 3 }}>
          Đóng
        </CustomButton>
      </StackRow>
    </DialogComponent>
  );
};
