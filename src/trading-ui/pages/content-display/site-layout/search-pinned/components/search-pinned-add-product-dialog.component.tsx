import { Box, CircularProgress, Radio, Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { OrderType } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { productApi, type Product } from '../../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { DialogComponent } from '../../../../../components/dialog';
import { contentSearchPinnedButtonPermission } from '../../../content-permission.constants';
import { SearchInput } from '../../../../../components/form';
import { StackRowAlignCenter } from '../../../../../components/styled';
import type { LabelDisplaySelectedProduct } from '../../../label/label-display/label-display.interface';

export interface SearchPinnedAddProductDialogProps {
  open: boolean;
  onClose: () => void;
  initialSelected: LabelDisplaySelectedProduct[];
  onApply: (next: LabelDisplaySelectedProduct[]) => void;
}

const mapProductToSelected = (product: Product): LabelDisplaySelectedProduct | null => {
  const productId = String(product.id ?? '').trim();
  if (!productId) return null;

  const defaultVariation = product.variations?.find((item) => item.id === product.defaultVariationId) ?? product.variations?.[0];
  const productVariantId = defaultVariation?.id ?? product.defaultVariationId ?? productId;

  return {
    productId,
    productVariantId,
    skuCode: (product.spuCode ?? '').trim() || productId,
    slug: product.slug,
    name: (product.name ?? '').trim() || product.spuCode,
    imageUrl: product.image?.trim() || defaultVariation?.medias?.[0]?.url?.trim() || '',
  };
};

export const SearchPinnedAddProductDialog = ({ open, onClose, initialSelected, onApply }: SearchPinnedAddProductDialogProps) => {
  if (!open) return null;

  return <SearchPinnedAddProductDialogContent onClose={onClose} initialSelected={initialSelected} onApply={onApply} />;
};

const SearchPinnedAddProductDialogContent = ({ onClose, initialSelected, onApply }: Omit<SearchPinnedAddProductDialogProps, 'open'>) => {
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(initialSelected[0]?.productId ?? '');

  const { data, isLoading } = useSWR(
    ['search-pinned-admin-product-list', search] as const,
    () =>
      productApi.getAdminProductList({
        orderType: OrderType.DESC,
        orderBy: 'updatedAt',
        search: search.trim() || undefined,
        isPagination: false,
      }),
    { revalidateOnFocus: false },
  );

  const rows = useMemo(() => (data?.list ?? []).map(mapProductToSelected).filter((item): item is LabelDisplaySelectedProduct => Boolean(item)), [data?.list]);

  const handleApply = useCallback(() => {
    const picked = rows.find((row) => row.productId === selectedProductId);
    onApply(picked ? [picked] : []);
    onClose();
  }, [onApply, onClose, rows, selectedProductId]);

  return (
    <DialogComponent
      open
      onClose={onClose}
      title="Thêm sản phẩm"
      maxWidth="sm"
      buttonLeft={{
        content: 'Huỷ',
        variant: 'outlined',
        onClick: onClose,
        ...contentSearchPinnedButtonPermission('search_pinned_pick_cancel', 'Hủy chọn sản phẩm ghim', 'api_product_search_pinned_update'),
      }}
      buttonRight={{
        content: 'Áp dụng',
        variant: 'contained',
        onClick: handleApply,
        ...contentSearchPinnedButtonPermission('search_pinned_pick_apply', 'Áp dụng chọn sản phẩm ghim', 'api_product_search_pinned_update'),
      }}
    >
      <Stack spacing={2} sx={{ minHeight: 0, maxHeight: 'min(60vh, 520px)', display: 'flex', flexDirection: 'column' }}>
        <SearchInput debounceMs={320} placeholder="Tìm theo tên sản phẩm, mã sản phẩm..." onDebouncedChange={setSearch} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, flexShrink: 0 }} />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467', flexShrink: 0 }}>Chọn 1 sản phẩm</Typography>
        <Stack sx={{ flex: 1, minHeight: 0, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 2 }}>
          {isLoading ? (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={20} />
            </Stack>
          ) : rows.length === 0 ? (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Không tìm thấy sản phẩm phù hợp.</Typography>
            </Stack>
          ) : (
            rows.map((product) => {
              const checked = selectedProductId === product.productId;

              return (
                <StackRowAlignCenter
                  key={product.productId}
                  gap={1.5}
                  onClick={() => setSelectedProductId(product.productId)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #F3F4F6',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    bgcolor: checked ? '#F9FAFB' : '#FFFFFF',
                    '&:last-of-type': { borderBottom: 'none' },
                  }}
                >
                  <Radio size="small" checked={checked} sx={{ mt: 0.5 }} />
                  {product.imageUrl ? (
                    <Box component="img" src={product.imageUrl} alt={product.name} sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} />
                  ) : (
                    <Box sx={{ width: 48, height: 48, bgcolor: '#F3F4F6', borderRadius: 1, flexShrink: 0 }} />
                  )}
                  <Stack sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>{product.name}</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280' }}>Mã sản phẩm: {product.skuCode}</Typography>
                  </Stack>
                </StackRowAlignCenter>
              );
            })
          )}
        </Stack>
      </Stack>
    </DialogComponent>
  );
};
