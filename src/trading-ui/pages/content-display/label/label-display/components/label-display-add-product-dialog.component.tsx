import { Box, Checkbox, Radio, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { OrderType } from '@/trading-ui/adapters/library';
import useSWRInfinite from 'swr/infinite';
import { productSkuSearchApi, type WmsSkuSearchListItem } from '@/apis/java/java-label-picker.api';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../../../common/config/runtime-config';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { PAGE_TAKE_DEFAULT } from '../../../../../common/constant/page-take.constant';
import { DialogComponent } from '../../../../../components/dialog';
import { contentLabelDisplayButtonPermission } from '../../../content-permission.constants';
import { SearchInput } from '../../../../../components/form';
import { StackRowAlignCenter } from '../../../../../components/styled';
import { useInfiniteScroll } from '../../../../../hooks/use-infinite-scroll.hook';
import type { LabelDisplaySelectedProduct } from '../label-display.interface';
import { LoadingComponent } from '../../../../../components/loading/loading.component';

export interface LabelDisplayAddProductDialogProps {
  open: boolean;
  onClose: () => void;
  initialSelected: LabelDisplaySelectedProduct[];
  onApply: (next: LabelDisplaySelectedProduct[]) => void;
  /** Chỉ chọn 1 sản phẩm (radio). Mặc định: chọn nhiều (checkbox). */
  singleSelect?: boolean;
  useSearch?: boolean;
  categoryIds?: string[];
  collectionIds?: string[];
}

const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

const resolveSkuImageUrl = (item: WmsSkuSearchListItem): string => {
  const fromRoot = item.image?.trim();
  if (fromRoot) return fromRoot;
  const fromMedia = item.medias?.[0]?.url?.trim() ?? item.medias?.[0]?.path?.trim();
  return fromMedia ?? '';
};

const mapSkuToSelected = (item: WmsSkuSearchListItem): LabelDisplaySelectedProduct | null => {
  const productId = String(item.product?.id ?? '').trim();
  const productVariantId = String(item.id ?? '').trim();
  if (!productId || !productVariantId) return null;

  const skuCode = String(item.skuCode ?? '').trim();
  const name = String(item.name ?? item.product?.name ?? '').trim() || skuCode || productVariantId;

  return {
    productVariantId,
    productId,
    skuCode: skuCode || productVariantId,
    slug: String(item.slug ?? '').trim() || undefined,
    name,
    imageUrl: resolveSkuImageUrl(item),
  };
};

export const LabelDisplayAddProductDialog = ({ open, onClose, initialSelected, onApply, singleSelect = false, useSearch = false, categoryIds, collectionIds }: LabelDisplayAddProductDialogProps) => {
  if (!open) return null;
  return (
    <LabelDisplayAddProductDialogContent
      onClose={onClose}
      initialSelected={initialSelected}
      onApply={onApply}
      singleSelect={singleSelect}
      useSearch={useSearch}
      categoryIds={categoryIds}
      collectionIds={collectionIds}
    />
  );
};

interface LabelDisplayAddProductDialogContentProps {
  onClose: () => void;
  initialSelected: LabelDisplaySelectedProduct[];
  onApply: (next: LabelDisplaySelectedProduct[]) => void;
  singleSelect: boolean;
  useSearch: boolean;
  categoryIds?: string[];
  collectionIds?: string[];
}

const LabelDisplayAddProductDialogContent = ({ onClose, initialSelected, onApply, singleSelect, useSearch, categoryIds, collectionIds }: LabelDisplayAddProductDialogContentProps) => {
  const [search, setSearch] = useState('');
  const [selectedMap, setSelectedMap] = useState<Map<string, LabelDisplaySelectedProduct>>(() => new Map(initialSelected.map((product) => [product.productVariantId, product])));



  const scopeEmpty = (categoryIds != null && categoryIds.length === 0) || (collectionIds != null && collectionIds.length === 0);

  const categoryKey = categoryIds?.join(',') || '';
  const collectionKey = collectionIds?.join(',') || '';

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    (pageIndex) => (scopeEmpty ? null : ([useSearch ? 'admin-sku-search' : 'admin-sku-list', search, categoryKey, collectionKey, pageIndex + 1] as const)),
    async ([, keyword, cats, cols, page]) => {
      const searchKeyword = keyword.trim() || undefined;
      const payload = {
        orderType: OrderType.DESC,
        orderBy: 'updatedAt',
        search: searchKeyword,
        isPagination: true,
        page,
        take: PAGE_TAKE_DEFAULT.take,
      };

      if (useSearch) {
        return productSkuSearchApi.searchAdminSkus({ ...payload, categoryIds: cats ? cats.split(',') : undefined, collectionIds: cols ? cols.split(',') : undefined });
      }
      return productSkuSearchApi.getAdminSkus(payload);
    },
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setSize(1);
  }, [search, categoryKey, collectionKey, setSize]);

  const rows = useMemo<WmsSkuSearchListItem[]>(() => data?.flatMap((page) => page.list) ?? [], [data]);
  const hasMore = rows.length < (data?.[0]?.total ?? 0);

  const { onScroll } = useInfiniteScroll({
    hasMore,
    isValidating,
    onLoadMore: () => setSize(size + 1),
  });

  const toggleSku = useCallback(
    (item: WmsSkuSearchListItem, checked: boolean) => {
      const mapped = mapSkuToSelected(item);
      if (!mapped) return;
      setSelectedMap((prev) => {
        if (singleSelect) {
          if (!checked) return new Map();
          return new Map([[mapped.productVariantId, mapped]]);
        }
        const next = new Map(prev);
        if (checked) next.set(mapped.productVariantId, mapped);
        else next.delete(mapped.productVariantId);
        return next;
      });
    },
    [singleSelect],
  );

  const selectSku = useCallback(
    (item: WmsSkuSearchListItem) => {
      toggleSku(item, true);
    },
    [toggleSku],
  );

  const handleApply = useCallback(() => {
    onApply(Array.from(selectedMap.values()));
    onClose();
  }, [onApply, onClose, selectedMap]);

  return (
    <DialogComponent
      open
      onClose={onClose}
      title="Thêm biến thể"
      maxWidth="sm"
      buttonLeft={{
        content: 'Huỷ',
        variant: 'outlined',
        onClick: onClose,
        ...contentLabelDisplayButtonPermission('label_display_add_product_cancel', 'Hủy chọn sản phẩm label display', 'api_cms_page_update'),
      }}
      buttonRight={{
        content: 'Áp dụng',
        variant: 'contained',
        onClick: handleApply,
        ...contentLabelDisplayButtonPermission('label_display_add_product_apply', 'Áp dụng chọn sản phẩm label display', 'api_cms_page_update'),
      }}
    >
      <Stack spacing={2} sx={{ minHeight: 0, maxHeight: 'min(60vh, 520px)', display: 'flex', flexDirection: 'column' }}>
        <SearchInput
          debounceMs={320}
          placeholder="Tìm theo tên biến thể, mã biến thể, mã vạch..."
          onDebouncedChange={setSearch}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, flexShrink: 0 }}
        />

        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467', flexShrink: 0 }}>{singleSelect ? 'Chọn 1 biến thể' : `Đã chọn: ${selectedMap.size} biến thể`}</Typography>

        <Stack
          onScroll={onScroll}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            border: '1px solid #E5E7EB',
            borderRadius: 2,
          }}
        >
          {isLoading ? (
            <LoadingComponent size="small" color="#6B7280" sx={{ py: 4 }} />
          ) : rows.length === 0 ? (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Không tìm thấy biến thể phù hợp.</Typography>
            </Stack>
          ) : (
            <>
              {rows.map((item) => {
                const mapped = mapSkuToSelected(item);
                const selectable = Boolean(mapped);
                const checked = mapped ? selectedMap.has(mapped.productVariantId) : false;
                const imageUrl = mapped?.imageUrl ?? resolveSkuImageUrl(item);
                const displayName = mapped?.name ?? item.name;
                const skuLabel = mapped?.skuCode ?? item.skuCode;
                const stock = typeof item.stock === 'number' ? item.stock : Number(item.stock ?? 0);
                const stockKnown = Number.isFinite(stock);
                const isOutOfStock = stockKnown && stock <= 0;

                return (
                  <StackRowAlignCenter
                    key={item.id}
                    gap={1.5}
                    onClick={() => {
                      if (!selectable) return;
                      if (singleSelect) selectSku(item);
                      else toggleSku(item, !checked);
                    }}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid #F3F4F6',
                      alignItems: 'flex-start',
                      opacity: selectable ? (isOutOfStock ? 0.7 : 1) : 1,
                      cursor: selectable ? 'pointer' : 'default',
                      '&:last-of-type': { borderBottom: 'none' },
                      '&:hover': selectable ? { bgcolor: '#F9FAFB' } : undefined,
                    }}
                  >
                    {singleSelect ? (
                      <Radio size="small" checked={checked} disabled={!selectable} tabIndex={-1} disableRipple sx={{ mt: 0.5, pointerEvents: 'none' }} />
                    ) : (
                      <Checkbox size="small" checked={checked} disabled={!selectable} tabIndex={-1} disableRipple sx={{ mt: 0.5, pointerEvents: 'none' }} />
                    )}
                    <Box
                      component="img"
                      src={imageUrl || productDefaultImageSrc}
                      alt="img-sku"
                      onError={(event) => {
                        (event.currentTarget as HTMLImageElement).src = productDefaultImageSrc;
                      }}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        objectFit: 'contain',
                        flexShrink: 0,
                        bgcolor: '#F3F4F6',
                      }}
                    />
                    <Stack sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', fontWeight: 600 }}>{displayName}</Typography>
                      <StackRowAlignCenter gap={1}>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Mã biến thể: {skuLabel}</Typography>
                        {stockKnown ? (
                          <Typography
                            sx={{
                              ...TYPOGRAPHY_STYLES.sm.medium,
                              color: isOutOfStock ? '#B42318' : '#027A48',
                            }}
                          >
                            {isOutOfStock ? 'Hết hàng' : `Còn ${stock}`}
                          </Typography>
                        ) : null}
                      </StackRowAlignCenter>
                    </Stack>
                  </StackRowAlignCenter>
                );
              })}
              {isValidating && size > 1 && (
                <Box sx={{ py: 2 }}>
                  <LoadingComponent size="small" color="#6B7280" />
                </Box>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </DialogComponent>
  );
};
