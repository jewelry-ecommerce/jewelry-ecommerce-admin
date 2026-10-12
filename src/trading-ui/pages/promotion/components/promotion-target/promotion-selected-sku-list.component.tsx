import React, { type ReactNode } from 'react';
void React;
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Plus } from '@untitledui/icons';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../../common/config/runtime-config';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { PermissionIconButton, ButtonIconContentComponent } from '../../../../components/button';
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import type { LabelDisplaySelectedProduct } from '../../../content-display/label/label-display/label-display.interface';
import { promotionListButtonPermission } from '../../promotion-permission.constants';

const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

export const getProductScopeKey = (product: LabelDisplaySelectedProduct): string => product.productVariantId || product.skuCode;

export const SkuProductThumbnail = ({ imageUrl, name }: { imageUrl?: string; name: string }) => (
  <Box
    component="img"
    src={imageUrl?.trim() || productDefaultImageSrc}
    alt={name}
    onError={(event) => {
      event.currentTarget.src = productDefaultImageSrc;
    }}
    sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'contain', flexShrink: 0, bgcolor: '#F3F4F6' }}
  />
);

export const PromotionSkuProductList = ({
  products,
  loading,
  onRemove,
  emptyText,
}: {
  products: readonly LabelDisplaySelectedProduct[];
  loading?: boolean;
  onRemove?: (skuId: string) => void;
  emptyText?: string;
}) => {
  if (loading) {
    return (
      <StackRowAlignCenter gap={1}>
        <CircularProgress size={14} />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Đang tải danh sách biến thể...</Typography>
      </StackRowAlignCenter>
    );
  }

  if (products.length === 0) {
    return emptyText ? <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#101828' }}>{emptyText}</Typography> : null;
  }

  return (
    <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: 280, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
      {products.map((product) => (
        <StackRowAlignCenter key={getProductScopeKey(product)} gap={1.5} sx={{ px: 1.5, py: 1.25, borderBottom: '1px solid #F3F4F6', '&:last-of-type': { borderBottom: 'none' } }}>
          <SkuProductThumbnail imageUrl={product.imageUrl} name={product.name} />
          <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
              {product.name}
            </Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }} noWrap>
              Mã biến thể: {product.skuCode}
            </Typography>
          </Stack>
          {onRemove ? (
            <PermissionIconButton
              size="small"
              aria-label="Xóa biến thể"
              onClick={() => onRemove(product.productVariantId || product.skuCode)}
              {...promotionListButtonPermission('edit', 'Xóa biến thể', 'api_promotion_draft_update')}
              sx={{ color: '#667085', flexShrink: 0, '&:hover': { color: '#F04438', bgcolor: '#FEF2F2' } }}
            >
              <CloseOutlinedIcon sx={{ fontSize: 16 }} />
            </PermissionIconButton>
          ) : null}
        </StackRowAlignCenter>
      ))}
    </Stack>
  );
};

export const PromotionSkuPickerSection = ({
  title,
  headerActions,
  selectedCountLabel,
  addButtonLabel,
  onAdd,
  products,
  loading,
  onRemove,
  errorMessage,
  emptyText,
  children,
}: {
  title?: string;
  headerActions?: ReactNode;
  selectedCountLabel: string;
  addButtonLabel?: string;
  onAdd?: () => void;
  products: readonly LabelDisplaySelectedProduct[];
  loading?: boolean;
  onRemove?: (skuId: string) => void;
  errorMessage?: string;
  emptyText?: string;
  children?: ReactNode;
}) => (
  <Stack gap={1.5}>
    <StackRowAlignCenterJustBetween>
      <StackRow gap={1} sx={{ minWidth: 0, flexWrap: 'wrap' }}>
        {title ? <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#6B7280' }}>{title}</Typography> : null}
        {headerActions}
      </StackRow>
      <StackRowAlignCenter gap={0.5} sx={{ flexShrink: 0 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Đã chọn:</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>{selectedCountLabel}</Typography>
      </StackRowAlignCenter>
    </StackRowAlignCenterJustBetween>
    {addButtonLabel && onAdd ? (
      <ButtonIconContentComponent
        icon={<Plus size={20} color="#737373" />}
        content={addButtonLabel}
        onClick={onAdd}
        {...promotionListButtonPermission('edit', addButtonLabel, 'api_promotion_draft_update')}
        sx={{ width: 'fit-content' }}
      />
    ) : null}
    {children}
    <PromotionSkuProductList products={products} loading={loading} onRemove={onRemove} emptyText={emptyText} />
    {errorMessage ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#EF4444' }}>{errorMessage}</Typography> : null}
  </Stack>
);
