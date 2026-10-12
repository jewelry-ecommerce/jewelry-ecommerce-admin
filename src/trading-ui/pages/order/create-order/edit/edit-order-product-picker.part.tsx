import { Box, Collapse, Paper, Stack, Typography } from '@mui/material';
import { memo } from 'react';
import type { IOrderCatalogProduct } from '../../../../apis/order';
import { CustomButton } from '../../../../components/button';
import { orderListButtonPermission } from '../../order-permission.constants';
import { SearchInput } from '../../../../components/form';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import type { CreateOrderCatalogPickContext } from '../create-order.interface';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';

const formatPrice = (amount: number | string | null | undefined): string => {
  if (amount == null || !Number.isFinite(Number(amount))) {
    return '—';
  }
  return `${Number(amount).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫`;
};

export interface EditOrderProductPickerPartProps {
  productQuery: string;
  onProductQueryChange: (value: string) => void;
  catalog: IOrderCatalogProduct[];
  catalogLoading: boolean;
  selectedProductIds: string[];
  onSelectProduct: (ctx: CreateOrderCatalogPickContext) => void;
}

export const EditOrderProductPickerPart = memo(function EditOrderProductPickerPart({
  productQuery,
  onProductQueryChange,
  catalog,
  catalogLoading,
  selectedProductIds,
  onSelectProduct,
}: EditOrderProductPickerPartProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2.5,
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        bgcolor: '#F9FAFB',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2, pt: 2, pb: 2 }}>
        <Collapse in timeout={240} appear>
          <Box sx={{ pb: 1.5 }}>
            <SearchInput placeholder="Tìm theo tên sản phẩm, SKU, mã vạch..." value={productQuery} onChange={(e) => onProductQueryChange(e.target.value)} />
          </Box>
        </Collapse>
        <Collapse in timeout={280} appear>
          <Box
            sx={{
              maxHeight: 320,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              pr: 0.25,
            }}
          >
            <Stack gap={1}>
              {catalog.map((product) => {
                const noVariants = (product.totalVariations ?? 0) === 0;
                const noStock = product.totalSellableStock !== undefined && product.totalSellableStock <= 0;
                const unavailable = noVariants || noStock;
                const isSelected = selectedProductIds.includes(product.id);
                const skuHint = product.skuCode;
                const displayPrice = product.customerDisplayPrice?.sellingPriceAfterTaxMinor ?? product.minSellingPriceAfterTaxMinor;
                const compareAtPrice = product.customerDisplayPrice != null ? product.customerDisplayPrice.compareAtPriceAfterTaxMinor : (product.minCompareAtPriceAfterTaxMinor ?? null);

                return (
                  <Paper
                    key={product.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: '8px',
                      bgcolor: '#FFFFFF',
                      borderColor: '#E5E7EB',
                      boxShadow: 'none',
                      opacity: unavailable ? 0.55 : 1,
                      transition: 'background-color 0.2s ease, border-color 0.2s ease',
                      '&:hover': { bgcolor: '#F8FAFC', borderColor: '#D1D5DB' },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexWrap: 'nowrap', width: '100%', minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '8px',
                          bgcolor: '#F3F4F6',
                          flexShrink: 0,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box component="img" src={product.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, fontWeight: 600, color: '#111827', lineHeight: 1.35 }}>{product.name}</Typography>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mt: 0.25 }}>SKU: {skuHint}</Typography>
                        <Stack direction="row" alignItems="baseline" gap={1.5} sx={{ mt: 0.75 }} flexWrap="wrap">
                          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, fontWeight: 700, color: '#111827' }}>{formatPrice(displayPrice)}</Typography>
                          {compareAtPrice != null && compareAtPrice > displayPrice ? (
                            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#94A3B8', textDecoration: 'line-through' }}>{formatPrice(compareAtPrice)}</Typography>
                          ) : null}
                        </Stack>
                      </Box>
                      <Box sx={{ flex: '0 0 auto', flexShrink: 0, alignSelf: 'center' }}>
                        <CustomButton
                          fullWidth={false}
                          variant={isSelected ? 'outline' : 'primary'}
                          disabled={unavailable}
                          onClick={() => onSelectProduct({ id: product.id, name: product.name, image: product.image, packagingRelations: product.packagingRelations })}
                          {...orderListButtonPermission(isSelected ? 'pick_variant' : 'pick_product', isSelected ? 'Thêm biến thể vào đơn hàng' : 'Chọn sản phẩm cho đơn hàng', 'api_order_update')}
                          sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            minWidth: 88,
                            width: 'auto',
                            px: 2,
                            bgcolor: isSelected ? '#FFFFFF' : '#F3F4F6',
                            color: isSelected ? '#111827' : '#111827',
                            borderColor: '#D1D5DB',
                            boxShadow: 'none',
                            '&:hover': {
                              bgcolor: isSelected ? '#F3F4F6' : '#F3F4F6',
                              borderColor: '#9CA3AF',
                              boxShadow: 'none',
                            },
                            '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
                          }}
                        >
                          {isSelected ? 'Thêm biến thể' : 'Chọn'}
                        </CustomButton>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
            {!catalogLoading && catalog.length === 0 ? (
              <Typography align="center" color="text.secondary" fontSize={13} sx={{ py: 3 }}>
                Không có sản phẩm phù hợp.
              </Typography>
            ) : null}
            {catalogLoading ? (
              <Typography align="center" color="text.secondary" fontSize={13} sx={{ py: 2 }}>
                Đang tìm...
              </Typography>
            ) : null}
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
});
