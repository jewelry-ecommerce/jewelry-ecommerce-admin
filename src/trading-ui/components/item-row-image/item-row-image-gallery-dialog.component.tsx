import { Box, Stack, Typography } from '@mui/material';
import React from 'react';
import { COLOR, STYLE } from '@/trading-ui/adapters/library';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { DialogComponent } from '../dialog/dialog.component';

export interface ItemImageGalleryDialogProps {
  open: boolean;
  onClose: () => void;
  itemId?: string;
  itemName?: string;
  headerTitle?: string;
  fallbackThumbnailUrl?: string;
}

export const ItemImageGalleryDialog: React.FC<ItemImageGalleryDialogProps> = ({ open, onClose, itemName, headerTitle = 'Ảnh mặt hàng', fallbackThumbnailUrl }) => {
  const imageUrls = fallbackThumbnailUrl ? [fallbackThumbnailUrl] : [];

  return (
    <DialogComponent title={headerTitle} open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Stack>
        {itemName ? <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: COLOR.NEUTRAL[800], textAlign: 'center' }}>{itemName}</Typography> : null}

        {imageUrls.length === 0 ? (
          <Typography sx={{ color: COLOR.NEUTRAL[600], textAlign: 'center', py: 4 }}>Mặt hàng chưa có ảnh.</Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" useFlexGap justifyContent="center">
            {imageUrls.map((url, idx) => (
              <Box
                key={`${url}-${idx}`}
                component="img"
                src={url}
                alt={itemName ? `${itemName} ${idx + 1}` : `Ảnh ${idx + 1}`}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 500,
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: STYLE.BORDER_RADIUS_ELEMENT,
                  border: `1px solid ${COLOR.NEUTRAL[200]}`,
                  backgroundColor: COLOR.NEUTRAL[50],
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </DialogComponent>
  );
};
