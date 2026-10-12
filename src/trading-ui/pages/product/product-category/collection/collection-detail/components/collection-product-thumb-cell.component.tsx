import { ImageElement } from '@/trading-ui/adapters/library';

import type { Product } from '../../../../../../apis/product/product.entities';
import { StackRowAlignJustCenter } from '../../../../../../components/styled';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../../product-spu/product-spu.constant';

const TABLE_PRODUCT_THUMB_PX = 48;

const thumbImageSx = {
  width: TABLE_PRODUCT_THUMB_PX,
  height: TABLE_PRODUCT_THUMB_PX,
  borderRadius: '8px',
  objectFit: 'contain',
  display: 'block',
} as const;

export interface CollectionProductThumbCellProps {
  product: Pick<Product, 'image' | 'name'>;
}

export const CollectionProductThumbCell = ({ product }: CollectionProductThumbCellProps) => (
  <StackRowAlignJustCenter width={TABLE_PRODUCT_THUMB_PX} height={TABLE_PRODUCT_THUMB_PX} borderRadius="8px" bgcolor="#F2F4F7" sx={{ overflow: 'hidden', flexShrink: 0, mx: 'auto' }}>
    <ImageElement url={product.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC} sx={thumbImageSx} />
  </StackRowAlignJustCenter>
);
