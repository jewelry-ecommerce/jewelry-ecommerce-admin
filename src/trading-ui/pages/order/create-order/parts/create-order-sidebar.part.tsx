 
import { Box, Collapse, Paper, Stack, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { SearchInput } from '../../../../components/form';
import { type CreateOrderSidebarPartProps } from '../create-order.interface';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';

const formatPriceSidebar = (amount: number | null | undefined): string => {
  if (amount == null || !Number.isFinite(Number(amount))) {
    return '—';
  }
  return `${Number(amount).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ`;
};

export const CreateOrderSidebarPart = ({ productQuery, onProductQueryChange, catalog, catalogLoading, selectedProductIds: _selectedProductIds, onToggleProduct }: CreateOrderSidebarPartProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: '100%', md: 447 },
        maxWidth: '100%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ px: 2, pb: 2, pt: 2 }}>
        <Collapse in timeout={240} appear>
          <Box sx={{ flexShrink: 0, pb: 1.5 }}>
            <SearchInput placeholder="Tìm sản phẩm theo tên hoặc SKU..." value={productQuery} onChange={(e) => onProductQueryChange(e.target.value)} />
          </Box>
        </Collapse>
        <Collapse in timeout={280} appear>
          <Box
            sx={{
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              maxHeight: 'calc(100vh - 190px)',
              WebkitOverflowScrolling: 'touch',
              pr: 0.25,
            }}
          >
            <Stack gap={1}>
              {catalog.map((product) => {
                const nameFirstWord = product.name.trim().split(/\s+/)[0] ?? 'Sản phẩm';
                const noVariants = (product.totalVariations ?? 0) === 0;
                const noStock = product.totalSellableStock !== undefined && product.totalSellableStock <= 0;
                const unavailable = noVariants || noStock;
                const displayPrice = product.customerDisplayPrice?.sellingPriceAfterTaxMinor ?? product.minSellingPriceAfterTaxMinor;
                const compareAtPrice = product.customerDisplayPrice != null ? product.customerDisplayPrice.compareAtPriceAfterTaxMinor : (product.minCompareAtPriceAfterTaxMinor ?? null);
                return (
                  <Stack
                    key={product.id}
                    direction="row"
                    alignItems="flex-start"
                    gap={1.25}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      boxShadow: 'none',
                      opacity: unavailable ? 0.5 : 1,
                      transition: 'border-color 0.15s, background-color 0.15s, opacity 0.2s',
                      border: '1px solid #E5E7EB',
                      cursor: unavailable ? 'not-allowed' : 'pointer',
                      pointerEvents: unavailable ? 'none' : undefined,
                      '&:hover': unavailable ? {} : { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                    }}
                    onClick={unavailable ? undefined : () => onToggleProduct({ id: product.id, name: product.name, image: product.image })}
                  >
                    <Box
                      sx={{
                        width: '64px',
                        height: '64px',
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
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          ...TYPOGRAPHY_STYLES.base.medium,
                          lineHeight: 1.35,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        sx={{
                          ...TYPOGRAPHY_STYLES.sm.medium,
                          color: '#6A7282',
                          mt: 0.5,
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                      >
                        {nameFirstWord} • {product.totalVariations} biến thể
                      </Typography>
                      <Stack direction="row" alignItems="baseline" gap={1.25} sx={{ mt: 0.75 }} flexWrap="wrap">
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, fontWeight: 600, color: '#101828' }}>{formatPriceSidebar(displayPrice)}</Typography>
                        {compareAtPrice != null && compareAtPrice > displayPrice ? (
                          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#94A3B8', textDecoration: 'line-through' }}>{formatPriceSidebar(compareAtPrice)}</Typography>
                        ) : null}
                      </Stack>
                      {noStock && <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, mt: 0.5, color: '#B42318', fontWeight: 600 }}>Hết hàng</Typography>}
                      {noVariants && !noStock && <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, mt: 0.5, color: '#B45309', fontWeight: 600 }}>Không có biến thể</Typography>}
                      {product.packagingRelations?.length ? (
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, mt: 0.5, color: '#1E3A8A' }}>Có bao bì đi kèm ({product.packagingRelations.length})</Typography>
                      ) : null}
                    </Box>
                  </Stack>
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
};
