import { Box, Stack, Typography } from '@mui/material';
import type { IOrderPackagingRelation } from '../../../../apis/order';
import { formatVnd } from '../../../../common/utils/order/create-order.utils';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';

export interface OrderPackagingRelationsProps {
  relations: IOrderPackagingRelation[];
  merchandiseQuantity?: number;
  compact?: boolean;
}

export const OrderPackagingRelations = ({ relations, merchandiseQuantity = 1, compact = false }: OrderPackagingRelationsProps) => {
  if (!relations.length) return null;

  return (
    <Box sx={{ mt: compact ? 1 : 1.5 }}>
      <Typography sx={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: '#111827', mb: 0.75 }}>Bao bì đi kèm</Typography>
      <Stack spacing={0.75}>
        {relations.map((relation) => {
          const qty = Math.max(1, relation.quantity) * Math.max(1, merchandiseQuantity);
          const price = Number(relation.includedPriceAfterTax) || 0;
          return (
            <Stack
              key={relation.relationId}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                p: compact ? 1 : 1.25,
                borderRadius: 1.5,
                border: '1px solid #E5E7EB',
                bgcolor: '#F9FAFB',
              }}
            >
              <Box
                component="img"
                src={relation.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC}
                alt={relation.packagingName || relation.packagingSkuCode}
                sx={{
                  width: compact ? 36 : 44,
                  height: compact ? 36 : 44,
                  borderRadius: 1,
                  objectFit: 'cover',
                  bgcolor: '#F3F4F6',
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Box sx={{ px: 0.75, py: 0.15, borderRadius: 999, bgcolor: '#DBEAFE', color: '#1E3A8A', fontSize: 11, fontWeight: 700 }}>{relation.isRequired ? 'Đi kèm' : 'Tùy chọn'}</Box>
                  <Typography sx={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: '#111827' }} noWrap>
                    {relation.packagingName || relation.packagingSkuCode}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: 11, color: '#64748B', mt: 0.25 }}>x{qty}</Typography>
              </Box>
              <Typography sx={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: '#111827', flexShrink: 0 }}>{formatVnd(price * qty)}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};
