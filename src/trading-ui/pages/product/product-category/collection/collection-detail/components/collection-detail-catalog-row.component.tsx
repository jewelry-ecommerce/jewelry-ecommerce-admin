import { Box, Stack, Typography } from '@mui/material';
import type { Product } from '../../../../../../apis/product/product.entities';
import { TYPOGRAPHY_STYLES } from '../../../../../../common/constant/typography.constant';
import { CheckboxComponent } from '../../../../../../components/check-box/check-box.element';
import { StackRowAlignCenter, StackRowAlignJustCenter } from '../../../../../../components/styled';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../../product-spu/product-status-labels.util';
import { COLLECTION_CATALOG_THUMB_PX } from '../collection-detail.constant';
import { getProductCategoryName, getProductPriceLabel, getProductVariantCount } from '../utils/collection-detail.util';

const catalogRowSx = {
  gap: 2,
  padding: '12px',
  border: '1px solid #E5E7EB',
  borderRadius: '10px',
  bgcolor: '#FFFFFF',
};

const catalogThumbImageSx = {
  width: COLLECTION_CATALOG_THUMB_PX,
  height: COLLECTION_CATALOG_THUMB_PX,
  borderRadius: '8px',
  objectFit: 'contain',
  display: 'block',
};

export interface CollectionDetailCatalogRowProps {
  product: Product;
  checked: boolean;
  disabled?: boolean;
  onToggleChecked: (checked: boolean) => void;
}

const COLLECTION_CATALOG_DISABLED_HINT = 'Đã có trong bộ sưu tập';

export const CollectionDetailCatalogRow = ({ product, checked, disabled = false, onToggleChecked }: CollectionDetailCatalogRowProps) => {
  const categoryName = getProductCategoryName({ category: product.category });
  const variantCount = getProductVariantCount({ variations: product.variations, skuCount: product.skuCount });
  const priceLabel = getProductPriceLabel({
    variations: product.variations,
    defaultVariationId: product.defaultVariationId,
  });
  const thumb = COLLECTION_CATALOG_THUMB_PX;

  return (
    <StackRowAlignCenter
      sx={{
        ...catalogRowSx,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <CheckboxComponent size="medium" checked={checked} disabled={disabled} onChange={(_, next) => onToggleChecked(next)} />

      <StackRowAlignJustCenter width={thumb} height={thumb} borderRadius="8px" bgcolor="#F2F4F7" sx={{ overflow: 'hidden', flexShrink: 0 }}>
        <Box component="img" src={product.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC} sx={catalogThumbImageSx} />
      </StackRowAlignJustCenter>

      <Stack sx={{ flex: 1, minWidth: 0, gap: 1 }}>
        <Stack sx={{ gap: 0 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
            {product.name}
          </Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }} noWrap>
            {categoryName} • {variantCount} biến thể
            {disabled ? ` • ${COLLECTION_CATALOG_DISABLED_HINT}` : ''}
          </Typography>
        </Stack>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>{priceLabel}</Typography>
      </Stack>
    </StackRowAlignCenter>
  );
};
