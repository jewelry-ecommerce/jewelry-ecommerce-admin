import { Box, Checkbox, CircularProgress, FormControlLabel, IconButton, Stack, Typography } from '@mui/material';
import { Trash01 } from '@untitledui/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OrderType } from '@/trading-ui/adapters/library';
import useSWRInfinite from 'swr/infinite';
import { PreOrderProductSourceType, preOrderCampaignApi, type QueryPreOrderCampaignSkuSearchDto } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../components/button';
import { SearchInput } from '../../../../components/form';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import {
  PRE_ORDER_SKU_PICKER_LIST_MAX_HEIGHT,
  PRE_ORDER_SKU_PICKER_PAGE_SIZE,
  PRE_ORDER_SKU_PICKER_SEARCH_DEBOUNCE_MS,
  PRE_ORDER_CAMPAIGN_SKU_SEARCH_PRODUCT_STATUSES,
} from '../pre-order-campaign.constants';
import type { PreOrderSelectedSku } from '../pre-order-campaign.interface';
import { mapCampaignSkuSearchItemToSelected } from '../pre-order-campaign.utils';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';

type PreOrderCampaignSkuPickerPanelProps = {
  productSourceType: PreOrderProductSourceType | '';
  productSourceRefs: string[];
  startAt: string | null;
  endAt: string | null;
  badgeTemplateId: string;
  selectedSkus: PreOrderSelectedSku[];
  disabled?: boolean;
  onChange: (skus: PreOrderSelectedSku[]) => void;
};

type CatalogPage = {
  list: PreOrderSelectedSku[];
  total: number;
  pagination?: { hasNextPage?: boolean };
};

/** Bỏ field chỉ dùng UI catalog trước khi đưa vào danh sách đã chọn / payload. */
const toSelectableSku = (sku: PreOrderSelectedSku): PreOrderSelectedSku => {
  const next: PreOrderSelectedSku = { ...sku };
  delete next.disabled;
  delete next.disabledMessage;
  return next;
};

type SkuSearchFilter = {
  badgeTemplateId: string;
  activeFrom: string;
  activeTo: string;
};

const UUID_LIKE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const listPanelSx = {
  flex: 1,
  minWidth: 0,
  border: '1px solid #E5E7EB',
  borderRadius: 2,
  overflow: 'hidden',
  bgcolor: '#FFF',
  display: 'flex',
  flexDirection: 'column',
} as const;

const listScrollSx = {
  maxHeight: PRE_ORDER_SKU_PICKER_LIST_MAX_HEIGHT,
  overflowY: 'auto',
  flex: 1,
} as const;

const listLoadMoreSx = {
  display: 'flex',
  justifyContent: 'center',
  py: 1.5,
  minHeight: 40,
} as const;

const sanitizeRefs = (refs: string[]) => [...new Set(refs.map((id) => String(id).trim()).filter((id) => UUID_LIKE_PATTERN.test(id)))];

const isScopedSource = (productSourceType: PreOrderProductSourceType | '') => productSourceType === PreOrderProductSourceType.COLLECTION || productSourceType === PreOrderProductSourceType.CATEGORY;

const resolveSkuSearchFilter = (startAt: string | null, endAt: string | null, badgeTemplateId: string): SkuSearchFilter | null => {
  const templateId = badgeTemplateId.trim();
  const activeFrom = startAt?.trim() ?? '';
  const activeTo = endAt?.trim() ?? '';
  if (!templateId || !activeFrom || !activeTo) return null;
  return { badgeTemplateId: templateId, activeFrom, activeTo };
};

const buildCampaignSkuSearchDto = (params: {
  productSourceType: PreOrderProductSourceType | '';
  productSourceRefs: string[];
  filter: SkuSearchFilter;
  keyword: string;
  page: number;
}): QueryPreOrderCampaignSkuSearchDto => {
  const refs = sanitizeRefs(params.productSourceRefs);
  return {
    orderBy: 'createdAt',
    orderType: OrderType.DESC,
    page: params.page,
    take: PRE_ORDER_SKU_PICKER_PAGE_SIZE,
    isPagination: true,
    search: params.keyword || undefined,
    badgeTemplateId: params.filter.badgeTemplateId,
    activeFrom: params.filter.activeFrom,
    activeTo: params.filter.activeTo,
    productStatuses: [...PRE_ORDER_CAMPAIGN_SKU_SEARCH_PRODUCT_STATUSES],
    ...(params.productSourceType === PreOrderProductSourceType.COLLECTION ? { collectionIds: refs } : params.productSourceType === PreOrderProductSourceType.CATEGORY ? { categoryIds: refs } : {}),
  };
};

const getCatalogKey = (
  pageIndex: number,
  previousPageData: CatalogPage | null,
  debouncedSearch: string,
  productSourceType: PreOrderProductSourceType | '',
  scopeKey: string,
  filterKey: string,
): readonly [string, string, string, string, string, number] | null => {
  if (!filterKey) return null;
  if (isScopedSource(productSourceType) && !scopeKey) return null;

  if (previousPageData) {
    const loadedCount = pageIndex * PRE_ORDER_SKU_PICKER_PAGE_SIZE;
    const hasNext = previousPageData.pagination?.hasNextPage ?? (previousPageData.list.length >= PRE_ORDER_SKU_PICKER_PAGE_SIZE && loadedCount < previousPageData.total);
    if (!hasNext) return null;
  }

  return ['pre-order-campaign-sku-picker', productSourceType || 'VARIANT', scopeKey, filterKey, debouncedSearch, pageIndex + 1] as const;
};

const fetchCatalogPage = async (productSourceType: PreOrderProductSourceType | '', productSourceRefs: string[], filter: SkuSearchFilter, keyword: string, page: number): Promise<CatalogPage> => {
  if (isScopedSource(productSourceType) && sanitizeRefs(productSourceRefs).length === 0) {
    return { list: [], total: 0 };
  }

  const response = await preOrderCampaignApi.searchPreOrderCampaignSkus(
    buildCampaignSkuSearchDto({
      productSourceType: productSourceType || PreOrderProductSourceType.VARIANT,
      productSourceRefs,
      filter,
      keyword,
      page,
    }),
  );

  const list = (response.list ?? []).map((item) => mapCampaignSkuSearchItemToSelected(item, 'VARIANT')).filter((item): item is PreOrderSelectedSku => Boolean(item));

  return {
    list,
    total: response.total ?? list.length,
    pagination: response.pagination,
  };
};

const fetchAllMatchingSkus = async (productSourceType: PreOrderProductSourceType | '', productSourceRefs: string[], filter: SkuSearchFilter, keyword: string): Promise<PreOrderSelectedSku[]> => {
  const bySkuCode = new Map<string, PreOrderSelectedSku>();

  for (let page = 1; page <= 50; page += 1) {
    const response = await preOrderCampaignApi.searchPreOrderCampaignSkus(
      buildCampaignSkuSearchDto({
        productSourceType: productSourceType || PreOrderProductSourceType.VARIANT,
        productSourceRefs,
        filter,
        keyword,
        page,
      }),
    );

    for (const item of response.list ?? []) {
      const mapped = mapCampaignSkuSearchItemToSelected(item, 'VARIANT');
      if (mapped && !mapped.disabled) bySkuCode.set(mapped.skuCode, mapped);
    }

    const loaded = response.list?.length ?? 0;
    if (loaded < PRE_ORDER_SKU_PICKER_PAGE_SIZE || bySkuCode.size >= (response.total ?? 0)) break;
  }

  return [...bySkuCode.values()];
};

const SkuThumb = ({ imageUrl }: { imageUrl?: string }) => (
  <Box component="img" src={imageUrl || PRODUCT_SPU_DEFAULT_IMAGE_SRC} alt="" sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', bgcolor: '#F3F4F6', flexShrink: 0 }} />
);

const SkuRowMeta = ({ sku, muted = false }: { sku: PreOrderSelectedSku; muted?: boolean }) => (
  <Stack sx={{ minWidth: 0, flex: 1 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: muted ? '#98A2B3' : '#111827' }} noWrap>
      {sku.productName}
    </Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: muted ? '#D0D5DD' : '#6B7280' }} noWrap>
      SKU: {sku.skuCode}
      {sku.variationName ? ` · ${sku.variationName}` : ''}
    </Typography>
    {muted ? (
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#F04438' }} title={sku.disabledMessage}>
        {sku.disabledMessage?.trim() || 'Không khả dụng'}
      </Typography>
    ) : null}
  </Stack>
);

export const PreOrderCampaignSkuPickerPanel = ({
  productSourceType,
  productSourceRefs,
  startAt,
  endAt,
  badgeTemplateId,
  selectedSkus,
  disabled = false,
  onChange,
}: PreOrderCampaignSkuPickerPanelProps) => {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('');
  const [selectingAll, setSelectingAll] = useState(false);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  const scopeRefs = useMemo(() => sanitizeRefs(productSourceRefs), [productSourceRefs]);
  const scopeKey = scopeRefs.join(',');
  const skuSearchFilter = useMemo(() => resolveSkuSearchFilter(startAt, endAt, badgeTemplateId), [startAt, endAt, badgeTemplateId]);
  const filterKey = skuSearchFilter ? `${skuSearchFilter.badgeTemplateId}|${skuSearchFilter.activeFrom}|${skuSearchFilter.activeTo}` : '';
  const needsFilterBeforeCatalog = !skuSearchFilter;
  const needsScopeBeforeCatalog = isScopedSource(productSourceType) && scopeRefs.length === 0;
  const catalogBlocked = needsFilterBeforeCatalog || needsScopeBeforeCatalog;

  const selectedMap = useMemo(() => new Map(selectedSkus.map((sku) => [sku.skuCode, sku])), [selectedSkus]);

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    (pageIndex, previousPageData) => getCatalogKey(pageIndex, previousPageData, debouncedSearch, productSourceType, scopeKey, filterKey),
    ([, , , , keyword, page]) => {
      if (!skuSearchFilter) return Promise.resolve<CatalogPage>({ list: [], total: 0 });
      return fetchCatalogPage(productSourceType, scopeRefs, skuSearchFilter, keyword, page);
    },
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const catalogRows = useMemo(() => data?.flatMap((page) => page.list) ?? [], [data]);
  const selectableCatalogRows = useMemo(() => catalogRows.filter((row) => !row.disabled), [catalogRows]);

  const filteredSelected = useMemo(() => {
    const query = selectedSearch.trim().toLowerCase();
    if (!query) return selectedSkus;
    return selectedSkus.filter((sku) => sku.skuCode.toLowerCase().includes(query) || sku.productName.toLowerCase().includes(query) || (sku.variationName ?? '').toLowerCase().includes(query));
  }, [selectedSearch, selectedSkus]);

  const isLoadingMore = isValidating && size > 0 && data != null && data.length < size;
  const isInitialLoading = !catalogBlocked && isLoading && catalogRows.length === 0;

  const hasMore = useMemo(() => {
    if (!data?.length) return false;
    const lastPage = data[data.length - 1];
    if (!lastPage) return false;
    if (lastPage.pagination != null) return Boolean(lastPage.pagination.hasNextPage);
    return lastPage.list.length >= PRE_ORDER_SKU_PICKER_PAGE_SIZE && catalogRows.length < lastPage.total;
  }, [data, catalogRows.length]);

  const loadedSelectedCount = selectableCatalogRows.filter((row) => selectedMap.has(row.skuCode)).length;
  const allMatchingSelected = selectableCatalogRows.length > 0 && loadedSelectedCount === selectableCatalogRows.length;
  const someMatchingSelected = loadedSelectedCount > 0 && !allMatchingSelected;
  useEffect(() => {
    if (!hasMore || isLoadingMore || disabled || catalogBlocked) return;

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
  }, [disabled, hasMore, isLoadingMore, catalogBlocked, setSize, catalogRows.length]);

  const handleToggleCatalogSku = (sku: PreOrderSelectedSku) => {
    if (disabled) return;
    if (selectedMap.has(sku.skuCode)) {
      onChange(selectedSkus.filter((item) => item.skuCode !== sku.skuCode));
      return;
    }
    if (sku.disabled) return;
    onChange([...selectedSkus, toSelectableSku(sku)]);
  };

  const handleRemoveSelected = (skuCode: string) => {
    if (disabled) return;
    onChange(selectedSkus.filter((item) => item.skuCode !== skuCode));
  };

  const handleToggleSelectAll = async () => {
    if (disabled || !skuSearchFilter || selectableCatalogRows.length === 0 || selectingAll || catalogBlocked) return;

    setSelectingAll(true);
    try {
      const allMatching = (await fetchAllMatchingSkus(productSourceType, scopeRefs, skuSearchFilter, debouncedSearch)).filter((sku) => !sku.disabled);
      const matchingCodes = new Set(allMatching.map((sku) => sku.skuCode));

      if (allMatchingSelected) {
        onChange(selectedSkus.filter((sku) => !matchingCodes.has(sku.skuCode)));
        return;
      }

      const merged = new Map(selectedMap);
      allMatching.forEach((sku) => {
        merged.set(sku.skuCode, toSelectableSku(sku));
      });
      onChange([...merged.values()]);
    } finally {
      setSelectingAll(false);
    }
  };

  const emptyCatalogMessage = needsFilterBeforeCatalog
    ? 'Vui lòng chọn ngày bắt đầu, ngày kết thúc và label trước khi chọn SKU.'
    : needsScopeBeforeCatalog
      ? 'Vui lòng chọn thành phần nguồn trước, rồi chọn SKU bên dưới.'
      : 'Không tìm thấy biến thể phù hợp.';

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} gap={2} sx={{ width: '100%' }}>
      <Box sx={listPanelSx}>
        <Stack gap={1.25} sx={{ p: 1.5, borderBottom: '1px solid #E5E7EB' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#111827' }}>Danh sách chọn</Typography>
          <SearchInput
            debounceMs={PRE_ORDER_SKU_PICKER_SEARCH_DEBOUNCE_MS}
            onDebouncedChange={(value) => setDebouncedSearch(value.trim())}
            placeholder="Tìm theo tên sản phẩm, SKU..."
            disabled={disabled || catalogBlocked}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={allMatchingSelected}
                indeterminate={someMatchingSelected}
                onChange={() => void handleToggleSelectAll()}
                disabled={disabled || catalogBlocked || selectableCatalogRows.length === 0 || selectingAll}
              />
            }
            label={
              <StackRowAlignCenter gap={1}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#374151' }}>Chọn tất cả ({selectableCatalogRows.length})</Typography>
                {selectingAll ? <CircularProgress size={14} /> : null}
              </StackRowAlignCenter>
            }
            sx={{ m: 0 }}
          />
        </Stack>

        <Box ref={listScrollRef} sx={listScrollSx}>
          {isInitialLoading ? (
            <Stack alignItems="center" py={6}>
              <CircularProgress size={28} />
            </Stack>
          ) : catalogRows.length === 0 ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280', p: 3, textAlign: 'center' }}>{emptyCatalogMessage}</Typography>
          ) : (
            <>
              {catalogRows.map((row) => {
                const selected = selectedMap.has(row.skuCode);
                const rowLocked = Boolean(row.disabled);
                const rowInteractive = !disabled && (!rowLocked || selected);
                return (
                  <StackRowAlignCenter
                    key={row.skuCode}
                    gap={1.5}
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderBottom: '1px solid #F3F4F6',
                      cursor: rowInteractive ? 'pointer' : 'not-allowed',
                      opacity: rowLocked && !selected ? 0.55 : 1,
                      bgcolor: selected ? '#EFF6FF' : rowLocked ? '#F9FAFB' : 'transparent',
                      '&:hover': rowInteractive ? { bgcolor: selected ? '#DBEAFE' : '#F9FAFB' } : undefined,
                    }}
                    onClick={() => {
                      if (!rowInteractive) return;
                      handleToggleCatalogSku(row);
                    }}
                  >
                    <Box sx={{ opacity: rowLocked && !selected ? 0.7 : 1, display: 'contents' }}>
                      <SkuThumb imageUrl={row.imageUrl} />
                    </Box>
                    <SkuRowMeta sku={row} muted={rowLocked && !selected} />
                    <CustomButton
                      variant="outline"
                      fullWidth={false}
                      disabled={disabled || selected || rowLocked}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (rowLocked && !selected) return;
                        handleToggleCatalogSku(row);
                      }}
                      sx={{ flexShrink: 0, py: 0.75, px: 1.5, minWidth: 72 }}
                    >
                      {rowLocked && !selected ? 'Khóa' : selected ? 'Đã chọn' : 'Chọn'}
                    </CustomButton>
                  </StackRowAlignCenter>
                );
              })}
              {hasMore ? (
                <Box ref={loadMoreSentinelRef} sx={listLoadMoreSx}>
                  {isLoadingMore ? <CircularProgress size={20} /> : null}
                </Box>
              ) : null}
            </>
          )}
        </Box>
      </Box>

      <Box sx={listPanelSx}>
        <Stack gap={1.25} sx={{ p: 1.5, borderBottom: '1px solid #E5E7EB' }}>
          <StackRowAlignCenterJustBetween>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#111827' }}>Danh sách đã chọn</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Đã chọn: {selectedSkus.length} biến thể</Typography>
          </StackRowAlignCenterJustBetween>
          <SearchInput
            debounceMs={PRE_ORDER_SKU_PICKER_SEARCH_DEBOUNCE_MS}
            onDebouncedChange={(value) => setSelectedSearch(value.trim())}
            placeholder="Tìm theo tên sản phẩm, SKU..."
            disabled={disabled || selectedSkus.length === 0}
          />
        </Stack>

        <Box sx={listScrollSx}>
          {filteredSelected.length === 0 ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280', p: 3, textAlign: 'center' }}>
              {selectedSkus.length === 0 ? 'Chưa có biến thể nào. Chọn từ danh sách bên trái.' : 'Không tìm thấy biến thể phù hợp.'}
            </Typography>
          ) : (
            filteredSelected.map((sku) => (
              <StackRowAlignCenter key={sku.skuCode} gap={1.5} sx={{ px: 2, py: 1.25, borderBottom: '1px solid #F3F4F6' }}>
                <SkuThumb imageUrl={sku.imageUrl} />
                <SkuRowMeta sku={sku} />
                {!disabled ? (
                  <IconButton size="small" aria-label={`Xóa ${sku.skuCode}`} onClick={() => handleRemoveSelected(sku.skuCode)} sx={{ color: '#DC2626', flexShrink: 0 }}>
                    <Trash01 size={18} />
                  </IconButton>
                ) : null}
              </StackRowAlignCenter>
            ))
          )}
        </Box>
      </Box>
    </Stack>
  );
};
