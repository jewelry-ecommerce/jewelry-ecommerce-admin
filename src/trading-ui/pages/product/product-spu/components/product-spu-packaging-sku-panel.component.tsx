import { Stack, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { AttributeInfoField } from '../../product-attribute/product-attribute-detail/product-attribute-detail.page';
import type { AdminProductDetailDto } from '../../../../apis';
import { PACKAGING_TYPE_OPTIONS, getProductSkuStatusLabelVi } from '../product-spu.constant';

const packagingTypeLabel = (value?: string | null) => PACKAGING_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? value ?? '—';

interface ProductSpuPackagingSkuPanelProps {
  detail: AdminProductDetailDto;
}

export const ProductSpuPackagingSkuPanel = ({ detail }: ProductSpuPackagingSkuPanelProps) => {
  const sku = detail.variations?.[0];
  const profile = sku?.packagingProfile;

  if (!sku) {
    return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Chưa có biến thể bao bì.</Typography>;
  }

  return (
    <Stack gap={2}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Bao bì & hộp có thể được gắn vào nhiều sản phẩm khác hoặc bán lẻ nếu muốn.</Typography>
      <StackRowAlignCenterJustBetween>
        <AttributeInfoField sx={{ gap: 0.5 }} label="Mã biến thể">
          {sku.skuCode}
        </AttributeInfoField>
        <AttributeInfoField sx={{ gap: 0.5 }} label="Trạng thái">
          {getProductSkuStatusLabelVi(sku.status)}
        </AttributeInfoField>
      </StackRowAlignCenterJustBetween>
      <StackRowAlignCenterJustBetween>
        <AttributeInfoField sx={{ gap: 0.5 }} label="Giá bán lẻ">
          {sku.sellingPriceAfterTaxMinor ?? '—'}
        </AttributeInfoField>
        <AttributeInfoField sx={{ gap: 0.5 }} label="Giá đi kèm">
          {profile?.includedPriceAfterTax ?? '—'}
        </AttributeInfoField>
        <AttributeInfoField sx={{ gap: 0.5 }} label="Giá nhập">
          {sku.costPriceAfterTaxMinor ?? '—'}
        </AttributeInfoField>
      </StackRowAlignCenterJustBetween>
      <StackRowAlignCenterJustBetween>
        <AttributeInfoField sx={{ gap: 0.5 }} label="Loại bao bì / hộp">
          {packagingTypeLabel(profile?.packagingType)}
        </AttributeInfoField>
        <AttributeInfoField sx={{ gap: 0.5 }} label="Cân nặng (gram)">
          {sku.weight ?? '—'}
        </AttributeInfoField>
      </StackRowAlignCenterJustBetween>
      <StackRowAlignCenterJustBetween>
        <AttributeInfoField sx={{ gap: 0.5 }} label="Dài (cm)">
          {sku.length ?? '—'}
        </AttributeInfoField>
        <AttributeInfoField sx={{ gap: 0.5 }} label="Rộng (cm)">
          {sku.width ?? '—'}
        </AttributeInfoField>
        <AttributeInfoField sx={{ gap: 0.5 }} label="Cao (cm)">
          {sku.height ?? '—'}
        </AttributeInfoField>
      </StackRowAlignCenterJustBetween>
    </Stack>
  );
};

export default ProductSpuPackagingSkuPanel;
