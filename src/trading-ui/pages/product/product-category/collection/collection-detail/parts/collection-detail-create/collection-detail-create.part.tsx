import { Box, CircularProgress, InputAdornment, Stack, TextField } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import { CheckCircleBroken, SearchMd } from '@untitledui/icons';

import type { Product } from '../../../../../../../apis/product/product.entities';
import type { ProductListResponseDto } from '../../../../../../../apis/product/product.interface';
import { useDebouncedValue } from '../../../../../../../common/utils/order/create-order.utils';
import { getAdminProductList } from '../../../../../../../apis/product/product.api';
import { DialogComponent } from '../../../../../../../components/dialog';
import { productCollectionButtonPermission } from '../../../../../product-permission.constants';
import { EmptyComponent } from '../../../../../../../components/empty/empty.component';
import { LoadingComponent } from '../../../../../../../components/loading/loading.component';
import { StackRowAlignCenter } from '../../../../../../../components/styled';
import { CollectionDetailCatalogRow } from '../../components/collection-detail-catalog-row.component';
import { COLLECTION_ADD_PRODUCT_LIST_TITLE, COLLECTION_ADD_PRODUCT_PAGE_SIZE, COLLECTION_ADD_PRODUCT_SEARCH_DEBOUNCE_MS, DIALOG_GUTTER_PX, searchFieldSx } from '../../collection-detail.constant';

const addProductDialogToolbarRowSx = {
  flexShrink: 0,
  width: `calc(100% + ${DIALOG_GUTTER_PX * 2}px)`,
  maxWidth: `calc(100% + ${DIALOG_GUTTER_PX * 2}px)`,
  mx: `-${DIALOG_GUTTER_PX}px`,
  padding: `0 ${DIALOG_GUTTER_PX}px ${DIALOG_GUTTER_PX}px`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderBottom: '1px solid #E5E7EB',
  },
};

// const filterButtonLabelRootSx = {
//   display: 'inline-flex',
//   alignItems: 'center',
//   gap: 0.75,
//   verticalAlign: 'middle',
// };

// const filterButtonBadgeSx = {
//   display: 'inline-flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   minWidth: 20,
//   height: 20,
//   px: '5px',
//   borderRadius: '10px',
//   bgcolor: '#DBEAFE',
//   color: '#1447E6',
//   ...TYPOGRAPHY_STYLES.sm.regular,
// };

// const filterButtonOutlinedSx = {
//   padding: '10px 16px',
//   borderRadius: '10px',
//   borderColor: '#D1D5DC',
//   color: '#364153',
//   textTransform: 'none',
// };

const listLoadMoreSx = {
  display: 'flex',
  justifyContent: 'center',
  py: 1.5,
  minHeight: 40,
};

const getAddProductListKey = (pageIndex: number, previousPageData: ProductListResponseDto | null, debouncedSearch: string, open: boolean): readonly [string, string, number] | null => {
  if (!open) return null;

  if (previousPageData) {
    const pagination = previousPageData.pagination;
    const loadedCount = (pageIndex + 1) * COLLECTION_ADD_PRODUCT_PAGE_SIZE;
    const hasNext = pagination?.hasNextPage ?? (previousPageData.list.length >= COLLECTION_ADD_PRODUCT_PAGE_SIZE && loadedCount < previousPageData.total);
    if (!hasNext) return null;
  }

  return ['product/admin/products', debouncedSearch, pageIndex + 1] as const;
};

export interface CollectionDetailCreatePartProps {
  open: boolean;
  existingProductIds?: readonly string[];
  onClose: () => void;
  onConfirmAddProducts: (products: Product[]) => void | Promise<void>;
}

export const CollectionDetailCreatePart = ({ open, existingProductIds = [], onClose, onConfirmAddProducts }: CollectionDetailCreatePartProps) => {
  const [pickSearch, setPickSearch] = useState('');
  const debouncedPickSearch = useDebouncedValue(pickSearch.trim(), COLLECTION_ADD_PRODUCT_SEARCH_DEBOUNCE_MS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const listScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    (pageIndex, previousPageData) => getAddProductListKey(pageIndex, previousPageData, debouncedPickSearch, open),
    ([, search, page]) =>
      getAdminProductList({
        search: search || undefined,
        page,
        take: COLLECTION_ADD_PRODUCT_PAGE_SIZE,
        isPagination: true,
      }),
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const products = useMemo(() => data?.flatMap((page) => page.list) ?? [], [data]);
  const existingProductIdSet = useMemo(() => new Set(existingProductIds), [existingProductIds]);

  const isLoadingMore = isValidating && size > 0 && data != null && data.length < size;
  const isInitialLoading = isLoading && products.length === 0;

  const hasMore = useMemo(() => {
    if (!data?.length) return false;
    const lastPage = data[data.length - 1];
    if (!lastPage) return false;
    const pagination = lastPage.pagination;
    if (pagination != null) return pagination.hasNextPage;
    return lastPage.list.length >= COLLECTION_ADD_PRODUCT_PAGE_SIZE && products.length < lastPage.total;
  }, [data, products.length]);

  const resetFlow = useCallback(() => {
    setPickSearch('');
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    if (!open) resetFlow();
  }, [open, resetFlow]);

  useEffect(() => {
    if (!open || !hasMore || isLoadingMore) return;

    const root = listScrollRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void setSize((current) => current + 1);
        }
      },
      { root, rootMargin: '120px', threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasMore, isLoadingMore, setSize, products.length]);

  const togglePickId = useCallback(
    (id: string, checked: boolean) => {
      if (existingProductIdSet.has(id)) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    [existingProductIdSet],
  );

  const handleConfirmAddCheckedProducts = useCallback(() => {
    if (selectedIds.size === 0) return;
    const selectedProducts = [...selectedIds].map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
    if (selectedProducts.length === 0) return;
    void onConfirmAddProducts(selectedProducts);
    onClose();
  }, [onClose, onConfirmAddProducts, selectedIds, products]);

  if (!open) return null;

  const hasCheckedProducts = selectedIds.size > 0;

  // const filterButtonLabel = (
  //   <Typography component="span" sx={filterButtonLabelRootSx}>
  //     <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#344054' }}>
  //       Bộ lọc
  //     </Typography>
  //     <Typography component="span" sx={filterButtonBadgeSx}>
  //       {DEFAULT_FILTER_BADGE_COUNT}
  //     </Typography>
  //   </Typography>
  // );

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{ sx: { maxWidth: '720px', height: '700px' } }}
      title={COLLECTION_ADD_PRODUCT_LIST_TITLE}
      buttonLeft={{
        variant: 'outlined',
        content: 'Hủy',
        onClick: onClose,
      }}
      buttonRight={{
        variant: 'contained',
        content: 'Thêm',
        onClick: handleConfirmAddCheckedProducts,
        disabled: !hasCheckedProducts,
        startIcon: <CheckCircleBroken size={18} />,
        ...productCollectionButtonPermission('edit', 'Thêm sản phẩm vào bộ sưu tập', 'api_collection_update'),
      }}
    >
      <Stack sx={{ gap: 3, height: '100%', minHeight: 0 }}>
        <StackRowAlignCenter gap={1.5} sx={addProductDialogToolbarRowSx}>
          <TextField
            size="small"
            fullWidth
            placeholder="Tìm theo tên sản phẩm, mã biến thể, ..."
            value={pickSearch}
            onChange={(e) => setPickSearch(e.target.value)}
            sx={searchFieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchMd size={18} color="#98A2B3" />
                </InputAdornment>
              ),
            }}
          />
          {/* <ButtonElement
            variant="outlined"
            fullWidth={false}
            startIcon={<FilterFunnel02 size={18} color="#98A2B3" />}
            onClick={() => undefined}
            content={filterButtonLabel}
            sx={filterButtonOutlinedSx}
          /> */}
        </StackRowAlignCenter>

        <Stack ref={listScrollRef} sx={{ flex: 1, minHeight: 0, overflow: 'auto', gap: 1.5, pr: 0.5 }}>
          {isInitialLoading ? (
            <LoadingComponent />
          ) : products.length === 0 ? (
            <EmptyComponent />
          ) : (
            <>
              {products.map((product) => {
                const disabled = existingProductIdSet.has(product.id);
                return (
                  <CollectionDetailCatalogRow
                    key={product.id}
                    product={product}
                    checked={selectedIds.has(product.id)}
                    disabled={disabled}
                    onToggleChecked={(checked) => togglePickId(product.id, checked)}
                  />
                );
              })}
              {hasMore || isLoadingMore ? (
                <Box ref={loadMoreSentinelRef} sx={listLoadMoreSx}>
                  {isLoadingMore ? <CircularProgress size={24} sx={{ color: '#6B7280' }} /> : null}
                </Box>
              ) : null}
            </>
          )}
        </Stack>
      </Stack>
    </DialogComponent>
  );
};
