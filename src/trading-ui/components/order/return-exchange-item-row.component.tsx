import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { formatCurrency } from '../../common/utils/number.utils';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../pages/product/product-spu/product-spu.constant';

export interface ReturnExchangeItemRowProps {
  imageUrl: string;
  productName: string;
  sku: string;
  quantity: number;
  priceSnapshot: number;
  imageSize?: number;
  textMaxWidth?: number;
  leadingSlot?: ReactNode;
  containerSx?: Record<string, unknown>;
  rightSlot?: ReactNode;
}

export const ReturnExchangeItemRow = ({ imageUrl, productName, sku, quantity, priceSnapshot, imageSize = 48, textMaxWidth = 300, leadingSlot, containerSx, rightSlot }: ReturnExchangeItemRowProps) => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderBottom: '1px solid #F3F4F6', mb: 1, pb: 1, ...containerSx }}>
      <Stack direction="row" gap={1.25} alignItems="center">
        {leadingSlot}
        <Box component="img" src={imageUrl || PRODUCT_SPU_DEFAULT_IMAGE_SRC} alt={productName} sx={{ width: imageSize, height: imageSize, borderRadius: 1, objectFit: 'cover' }} />
        <Stack
          sx={{
            alignItems: 'flex-start',
            justifyContent: 'center',
            minWidth: 0,
            maxWidth: textMaxWidth,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          gap={0}
        >
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.base.semibold,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: textMaxWidth,
            }}
          >
            {productName}
          </Typography>
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.regular,
              color: '#98A2B3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: textMaxWidth,
            }}
          >
            SKU: {sku}
          </Typography>
        </Stack>
      </Stack>

      {rightSlot ?? (
        <Stack alignItems="flex-end" gap={0}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>SL: {quantity}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{formatCurrency(priceSnapshot)} ₫</Typography>
        </Stack>
      )}
    </Stack>
  );
};
