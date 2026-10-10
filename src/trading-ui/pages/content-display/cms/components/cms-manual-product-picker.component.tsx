import { DeleteOutlineRounded } from '@mui/icons-material';
import { Box, Checkbox, CircularProgress, Stack, Typography } from '@mui/material';
import { Plus } from '@untitledui/icons';
import React, { useCallback, useMemo, useState } from 'react';
import { OrderType } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { productApi, type Product } from '../../../../apis';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../../common/config/runtime-config';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { ButtonIconContentComponent, PermissionIconButton } from '../../../../components/button';
import { contentButtonPermission } from '../../content-permission.constants';
import { DialogComponent } from '../../../../components/dialog';
import { SearchInput } from '../../../../components/form';
import { StackRowAlignCenter } from '../../../../components/styled';
import { PRODUCT_CAROUSEL_MAX_MANUAL_PRODUCTS } from '../utils/cms-product-carousel-block.utils';

export type CmsManualProductListItem = {
  productId: string;
  spuCode: string;
  name: string;
  imageUrl: string;
};

export interface CmsManualProductPickerProps {
  productIds: string[];
  onChange: (nextProductIds: string[]) => void;
  disabled?: boolean;
  maxItems?: number;
  error?: string;
}

const getProductImageUrl = (product: Product): string => product.image?.trim() || product.imageHover?.trim() || '';

const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

const mapProductToListItem = (product: Product): CmsManualProductListItem | null => {
  const productId = product.id?.trim();
  if (!productId) return null;

  return {
    productId,
    spuCode: product.spuCode?.trim() || productId,
    name: product.name?.trim() || product.spuCode?.trim() || productId,
    imageUrl: getProductImageUrl(product),
  };
};

const orderProductsByIds = (products: CmsManualProductListItem[], productIds: string[]): CmsManualProductListItem[] => {
  const byId = new Map(products.map((item) => [item.productId, item]));
  return productIds.map((id) => byId.get(id)).filter((item): item is CmsManualProductListItem => Boolean(item));
};

const CmsManualProductDialog: React.FC<{
  open: boolean;
  maxItems: number;
  initialSelectedIds: string[];
  onClose: () => void;
  onApply: (nextProductIds: string[]) => void;
}> = ({ open, maxItems, initialSelectedIds, onClose, onApply }) => {
  if (!open) return null;

  return <CmsManualProductDialogContent maxItems={maxItems} initialSelectedIds={initialSelectedIds} onClose={onClose} onApply={onApply} />;
};

const CmsManualProductDialogContent: React.FC<{
  maxItems: number;
  initialSelectedIds: string[];
  onClose: () => void;
  onApply: (nextProductIds: string[]) => void;
}> = ({ maxItems, initialSelectedIds, onClose, onApply }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const trimmedSearch = search.trim();

  const { data: browseData, isLoading: isBrowseLoading } = useSWR(
    !trimmedSearch ? (['cms-manual-product-browse'] as const) : null,
    () =>
      productApi.getAdminProductList({
        orderType: OrderType.DESC,
        orderBy: 'updatedAt',
        isPagination: false,
      }),
    { revalidateOnFocus: false },
  );

  const { data: searchData, isLoading: isSearchLoading } = useSWR(
    trimmedSearch ? (['cms-manual-product-search', trimmedSearch] as const) : null,
    () =>
      productApi.getAdminProductList({
        orderType: OrderType.DESC,
        orderBy: 'updatedAt',
        search: trimmedSearch,
        isPagination: false,
      }),
    { revalidateOnFocus: false },
  );

  const sourceProducts = useMemo(() => trimmedSearch ? (searchData?.list ?? []) : (browseData?.list ?? []), [trimmedSearch, searchData?.list, browseData?.list]);
  const isLoading = trimmedSearch ? isSearchLoading : isBrowseLoading;
  const rows = useMemo(() => sourceProducts.map(mapProductToListItem).filter((item): item is CmsManualProductListItem => Boolean(item)), [sourceProducts]);

  const toggleProduct = useCallback(
    (productId: string, checked: boolean) => {
      setSelectedIds((current) => {
        if (checked) {
          if (current.includes(productId) || current.length >= maxItems) return current;
          return [...current, productId];
        }
        return current.filter((id) => id !== productId);
      });
    },
    [maxItems],
  );

  const handleApply = useCallback(() => {
    onApply(selectedIds.slice(0, maxItems));
    onClose();
  }, [maxItems, onApply, onClose, selectedIds]);

  return (
    <DialogComponent
      open
      onClose={onClose}
      title="Thêm sản phẩm"
      maxWidth="sm"
      buttonLeft={{ content: 'Hủy', variant: 'outlined', onClick: onClose }}
      buttonRight={{ content: 'Áp dụng', variant: 'contained', onClick: handleApply }}
    >
      <Stack spacing={2} sx={{ minHeight: 0, maxHeight: 'min(60vh, 520px)', display: 'flex', flexDirection: 'column' }}>
        <SearchInput debounceMs={320} placeholder="Tìm theo tên sản phẩm, mã sản phẩm..." onDebouncedChange={setSearch} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, flexShrink: 0 }} />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467', flexShrink: 0 }}>
          Đã chọn: {selectedIds.length}/{maxItems} sản phẩm
        </Typography>
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
              const checked = selectedIds.includes(product.productId);
              const rowDisabled = !checked && selectedIds.length >= maxItems;

              return (
                <StackRowAlignCenter
                  key={product.productId}
                  gap={1.5}
                  onClick={() => {
                    if (rowDisabled) return;
                    toggleProduct(product.productId, !checked);
                  }}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #F3F4F6',
                    alignItems: 'flex-start',
                    cursor: rowDisabled ? 'default' : 'pointer',
                    '&:last-of-type': { borderBottom: 'none' },
                    '&:hover': rowDisabled ? undefined : { bgcolor: '#F9FAFB' },
                  }}
                >
                  <Checkbox size="small" checked={checked} disabled={rowDisabled} tabIndex={-1} disableRipple sx={{ mt: 0.5 }} />
                  <Box
                    component="img"
                    src={product.imageUrl || productDefaultImageSrc}
                    alt=""
                    sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'contain', flexShrink: 0, bgcolor: '#F3F4F6' }}
                  />
                  <Stack sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', fontWeight: 600 }}>{product.name}</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Mã sản phẩm: {product.spuCode}</Typography>
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

export const CmsManualProductPicker: React.FC<CmsManualProductPickerProps> = ({ productIds, onChange, disabled = false, maxItems = PRODUCT_CAROUSEL_MAX_MANUAL_PRODUCTS, error }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const normalizedIds = useMemo(() => Array.from(new Set(productIds.map((id) => id.trim()).filter(Boolean))), [productIds]);

  const { data: enrichedData, isLoading } = useSWR(
    normalizedIds.length ? (['cms-manual-product-enrich', normalizedIds.join(',')] as const) : null,
    () =>
      productApi.getAdminProductList({
        productIds: normalizedIds.join(','),
        isPagination: false,
      }),
    { revalidateOnFocus: false },
  );

  const displayItems = useMemo(() => {
    const mapped = (enrichedData?.list ?? []).map(mapProductToListItem).filter((item): item is CmsManualProductListItem => Boolean(item));
    return orderProductsByIds(mapped, normalizedIds);
  }, [enrichedData?.list, normalizedIds]);

  const handleRemove = (productId: string) => {
    onChange(normalizedIds.filter((id) => id !== productId));
  };

  return (
    <Stack gap={1}>
      {!disabled ? <ButtonIconContentComponent icon={<Plus size={20} color="#737373" />} content="Thêm sản phẩm" onClick={() => setDialogOpen(true)} /> : null}

      {error ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#B42318' }}>{error}</Typography> : null}

      {isLoading && normalizedIds.length > 0 ? (
        <Stack sx={{ alignItems: 'center', py: 2 }}>
          <CircularProgress size={20} />
        </Stack>
      ) : null}

      <Stack gap={1}>
        {displayItems.map((item) => (
          <StackRowAlignCenter key={item.productId} gap={1} sx={{ border: '1px solid #E5E7EB', borderRadius: 1.5, p: 1, bgcolor: '#FFF' }}>
            <Box component="img" src={item.imageUrl || productDefaultImageSrc} alt="" sx={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 1, bgcolor: '#F3F4F6' }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography noWrap sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
                {item.name}
              </Typography>
              <Typography noWrap sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
                Mã sản phẩm: {item.spuCode}
              </Typography>
            </Box>
            {!disabled ? (
              <PermissionIconButton
                size="small"
                aria-label="Xóa sản phẩm"
                onClick={() => handleRemove(item.productId)}
                {...contentButtonPermission('cms_remove_manual_product', 'Xóa sản phẩm', 'api_cms_page_update')}
              >
                <DeleteOutlineRounded fontSize="small" />
              </PermissionIconButton>
            ) : null}
          </StackRowAlignCenter>
        ))}
      </Stack>

      <CmsManualProductDialog open={dialogOpen} maxItems={maxItems} initialSelectedIds={normalizedIds} onClose={() => setDialogOpen(false)} onApply={onChange} />
    </Stack>
  );
};
