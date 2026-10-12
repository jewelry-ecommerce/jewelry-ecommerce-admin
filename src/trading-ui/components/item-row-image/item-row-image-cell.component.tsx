import { Box } from '@mui/material';
import React, { useState } from 'react';
import { COLOR, STYLE } from '@/trading-ui/adapters/library';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../pages/product/product-spu/product-spu.constant';
import { ItemImageGalleryDialog } from './item-row-image-gallery-dialog.component';

export interface ItemRowImageCellProps {
  itemId?: string;
  itemName?: string;
  thumbnailUrl?: string;
  /** `compact` — ô ảnh nhỏ hơn cho bảng dày (mặc định giữ layout cũ). */
  variant?: 'default' | 'compact';
}

const sizeTokens = {
  default: { box: 60, icon: 32 },
  compact: { box: 44, icon: 22 },
} as const;

export const ItemRowImageCell: React.FC<ItemRowImageCellProps> = ({ itemId, itemName, thumbnailUrl, variant = 'default' }) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const displayThumbnailUrl = !imageError && thumbnailUrl ? thumbnailUrl : PRODUCT_SPU_DEFAULT_IMAGE_SRC;
  const { box } = sizeTokens[variant];

  const openGallery = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemId) setGalleryOpen(true);
  };

  return (
    <>
      <Box
        component="img"
        src={displayThumbnailUrl}
        alt={itemName || 'Item image'}
        onClick={openGallery}
        onError={() => {
          if (!imageError) setImageError(true);
        }}
        sx={{
          width: box,
          height: box,
          flexShrink: 0,
          objectFit: 'cover',
          borderRadius: STYLE.BORDER_RADIUS_ELEMENT,
          border: `1px solid ${COLOR.NEUTRAL[300]}`,
          cursor: itemId ? 'pointer' : 'default',
          '&:hover': itemId ? { opacity: 0.92, boxShadow: `0 0 0 2px ${COLOR.NEUTRAL[400]}` } : undefined,
        }}
      />
      {itemId ? <ItemImageGalleryDialog open={galleryOpen} onClose={() => setGalleryOpen(false)} itemId={itemId} itemName={itemName} fallbackThumbnailUrl={displayThumbnailUrl} /> : null}
    </>
  );
};
