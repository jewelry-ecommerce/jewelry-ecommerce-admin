import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';

import FilterListRounded from '@mui/icons-material/FilterListRounded';

import { Ticket01 } from '@untitledui/icons';

import useSWR from 'swr';

import { Box, ButtonBase, ClickAwayListener, Stack, Typography } from '@mui/material';

import { OrderType } from '@/trading-ui/adapters/library';

import { categoryApi, collectionApi, productSkuSearchApi, type WmsSkuSearchListItem } from '../../../../apis';

import { CategoryStatus } from '../../../../apis/category/category.enum';

import { CollectionStatus } from '../../../../apis/collection/collection.enum';

import { resolveWmsSkuDisplayName, resolveWmsSkuImageUrl, resolveWmsSkuPriceMinor } from '../../../../apis/product/sku-search.util';

import { resolveTenantBrandProductDefaultImageSrc } from '../../../../common/config/runtime-config';

import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

import { CustomButton } from '../../../../components/button';

import { DataTablePagination } from '../../../../components/data-table';

import { SearchInput } from '../../../../components/form';

import { HighlightStatusToggle } from '../../../../components/switch/highlight-status-toggle.component';

import { StackAlignJustCenter, StackRowAlignCenter } from '../../../../components/styled';

import { formatVnd } from '../../components/promotion-runtime-evaluate-panel/promotion-simulation.helpers';

import { useSandboxSimulation } from '../../components/promotion-runtime-evaluate-panel/sandbox-simulation.context';

import { countActiveSandboxCartSkuFilters, emptySandboxCartSkuFilters, SandboxCartSkuFilterDialog, type SandboxCartSkuFilters } from './sandbox-cart-sku-filter-dialog.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';

const SKU_PAGE_SIZE = 20;

const QUICK_SEARCH_TAKE = 10;

const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

const PRODUCT_CARD_SX = {
  border: '1px solid #E5E7EB',

  borderRadius: '10px',

  bgcolor: '#FFFFFF',

  overflow: 'hidden',

  display: 'flex',

  flexDirection: 'column',

  height: '100%',
} as const;

const PRODUCT_IMAGE_SX = {
  width: '100%',

  aspectRatio: '1 / 1',

  bgcolor: '#F3F4F6',

  objectFit: 'contain',
} as const;

const QUICK_SEARCH_DROPDOWN_SX = {
  position: 'absolute',

  top: 'calc(100% + 4px)',

  left: 0,

  right: 0,

  zIndex: 20,

  border: '1px solid #E5E7EB',

  borderRadius: '10px',

  bgcolor: '#FFFFFF',

  boxShadow: '0 8px 24px rgba(16, 24, 40, 0.12)',

  maxHeight: 320,

  overflowY: 'auto',
} as const;

interface SandboxProductPickerProps {
  /** When true, user is in cart mode — quick-add search + Voucher. When false, product grid + Bộ lọc. */
  hideGrid?: boolean;

  selectedDraftId: string;

  onAddSku: (item: WmsSkuSearchListItem) => void;

  onOpenVoucherModal: () => void;
}

const SandboxProductCard = ({ item, onAdd }: { item: WmsSkuSearchListItem; onAdd: (item: WmsSkuSearchListItem) => void }) => {
  const skuCode = String(item.skuCode ?? '').trim();

  const imageUrl = resolveWmsSkuImageUrl(item);

  const name = resolveWmsSkuDisplayName(item, skuCode);

  const priceMinor = resolveWmsSkuPriceMinor(item);

  const selectable = Boolean(skuCode && item.id);

  return (
    <Box sx={PRODUCT_CARD_SX}>
      <Box component="img" src={imageUrl || productDefaultImageSrc} alt="image-product" sx={PRODUCT_IMAGE_SX} />

      <Stack sx={{ p: 1.25, gap: 0.75, flex: 1 }}>
        <Typography
          sx={{
            ...TYPOGRAPHY_STYLES.base.semibold,

            color: '#101828',

            display: '-webkit-box',

            WebkitLineClamp: 2,

            WebkitBoxOrient: 'vertical',

            overflow: 'hidden',
          }}
        >
          {name}
        </Typography>

        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828', mt: 'auto' }}>{formatVnd(priceMinor)}</Typography>

        <CustomButton
          fullWidth
          variant="outline"
          disabled={!selectable}
          startIcon={<AddShoppingCartOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => onAdd(item)}
          sx={{ textTransform: 'none', borderColor: '#D0D5DD', color: '#101828' }}
        >
          Thêm vào giỏ
        </CustomButton>
      </Stack>
    </Box>
  );
};

const QuickSearchRow = ({ item, onSelect }: { item: WmsSkuSearchListItem; onSelect: (item: WmsSkuSearchListItem) => void }) => {
  const skuCode = String(item.skuCode ?? '').trim();

  const imageUrl = resolveWmsSkuImageUrl(item);

  const name = resolveWmsSkuDisplayName(item, skuCode);

  const priceMinor = resolveWmsSkuPriceMinor(item);

  const selectable = Boolean(skuCode && item.id);

  return (
    <ButtonBase
      disabled={!selectable}
      onClick={() => onSelect(item)}
      sx={{
        width: '100%',

        display: 'block',

        borderBottom: '1px solid #F3F4F6',

        p: 1.25,

        textAlign: 'left',

        '&:hover': selectable ? { bgcolor: '#F9FAFB' } : undefined,

        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <StackRowAlignCenter sx={{ gap: 1.25, width: '100%' }}>
        <Box component="img" src={imageUrl || productDefaultImageSrc} alt="" sx={{ width: 44, height: 44, borderRadius: 1, objectFit: 'contain', flexShrink: 0, bgcolor: '#F3F4F6' }} />

        <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }} noWrap>
            {name}
          </Typography>

          {skuCode ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }} noWrap>
              {skuCode}
            </Typography>
          ) : null}
        </Stack>

        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828', flexShrink: 0 }}>{formatVnd(priceMinor)}</Typography>
      </StackRowAlignCenter>
    </ButtonBase>
  );
};

export const SandboxProductPicker = ({ hideGrid = false, selectedDraftId, onAddSku, onOpenVoucherModal }: SandboxProductPickerProps) => {
  const isCartMode = hideGrid;

  const { selectedVoucherCodes } = useSandboxSimulation();

  const [searchInput, setSearchInput] = useState('');

  const [searchKeyword, setSearchKeyword] = useState('');

  const [page, setPage] = useState(1);

  const [filterByDraftTarget, setFilterByDraftTarget] = useState(false);

  const [skuFilters, setSkuFilters] = useState<SandboxCartSkuFilters>(emptySandboxCartSkuFilters);

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const [quickSearchOpen, setQuickSearchOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const hasDraft = Boolean(selectedDraftId.trim());

  const draftFilterId = hasDraft && filterByDraftTarget ? selectedDraftId : null;

  const activeFilterCount = countActiveSandboxCartSkuFilters(skuFilters);

  const filterLabel = activeFilterCount > 0 ? `Bộ lọc (${activeFilterCount})` : 'Bộ lọc';

  useEffect(() => {
    if (!isCartMode) {
      setQuickSearchOpen(false);
    }
  }, [isCartMode]);

  const { data: categoryListRes } = useSWR(['sandbox-product-picker-category-tree'] as const, () => categoryApi.getCategoryTree({ compact: true, status: CategoryStatus.ACTIVE }), {
    revalidateOnFocus: false,
  });

  const { data: collectionListRes } = useSWR(
    ['sandbox-product-picker-collection-filter'] as const,
    () => collectionApi.getCollectionList({ orderType: OrderType.ASC, orderBy: 'name', isPagination: false, status: CollectionStatus.ACTIVE }),
    { revalidateOnFocus: false },
  );

  const categoryOptions = useMemo(() => (categoryListRes ?? []).map((category) => ({ value: category.id, label: category.name })), [categoryListRes]);

  const collectionOptions = useMemo(() => (collectionListRes?.list ?? []).map((collection) => ({ value: collection.id, label: collection.name })), [collectionListRes?.list]);

  const buildSkuQuery = useCallback(
    (currentPage: number, keyword: string, take: number, includeAdvancedFilters: boolean) => ({
      orderType: OrderType.DESC,

      orderBy: 'updatedAt' as const,

      page: currentPage,

      take,

      isPagination: true,

      search: keyword || undefined,

      ...(includeAdvancedFilters && skuFilters.categoryUuid ? { categoryUuid: skuFilters.categoryUuid } : {}),

      ...(includeAdvancedFilters && skuFilters.collectionUuid ? { collectionUuid: skuFilters.collectionUuid } : {}),

      ...(draftFilterId ? { filterByPromotionDraftTarget: true, promotionDraftId: draftFilterId } : {}),
    }),

    [draftFilterId, skuFilters.categoryUuid, skuFilters.collectionUuid],
  );

  const gridSwrKey = ['sandbox-product-picker-grid', page, searchKeyword, draftFilterId, skuFilters.categoryUuid, skuFilters.collectionUuid] as const;

  const quickSwrKey = isCartMode && quickSearchOpen && searchKeyword.trim() ? (['sandbox-product-picker-quick', searchKeyword, draftFilterId] as const) : null;

  const { data, isLoading } = useSWR(isCartMode ? null : gridSwrKey, ([, currentPage, keyword]) => productSkuSearchApi.getAdminSkus(buildSkuQuery(currentPage, keyword, SKU_PAGE_SIZE, true)), {
    revalidateOnFocus: false,
  });

  const { data: quickData, isLoading: quickLoading } = useSWR(quickSwrKey, ([, keyword]) => productSkuSearchApi.getAdminSkus(buildSkuQuery(1, keyword, QUICK_SEARCH_TAKE, false)), {
    revalidateOnFocus: false,
  });

  const rows = useMemo(() => data?.list ?? [], [data?.list]);

  const quickRows = useMemo(() => quickData?.list ?? [], [quickData?.list]);

  const totalItems = data?.total ?? 0;

  const handleSearchDebounced = useCallback(
    (value: string) => {
      setSearchKeyword(value);

      setPage(1);

      if (isCartMode) {
        setQuickSearchOpen(Boolean(value.trim()));
      }
    },
    [isCartMode],
  );

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);

      if (!value.trim() || !isCartMode) {
        setQuickSearchOpen(false);
      }
    },
    [isCartMode],
  );

  const handleQuickSelect = useCallback(
    (item: WmsSkuSearchListItem) => {
      onAddSku(item);

      setSearchInput('');

      setSearchKeyword('');

      setQuickSearchOpen(false);
    },

    [onAddSku],
  );

  const handleDraftTargetToggle = useCallback((checked: boolean) => {
    setFilterByDraftTarget(checked);

    setPage(1);
  }, []);

  const handleApplySkuFilters = useCallback((nextFilters: SandboxCartSkuFilters) => {
    setSkuFilters(nextFilters);

    setPage(1);
  }, []);

  const handleResetSkuFilters = useCallback(() => {
    setSkuFilters(emptySandboxCartSkuFilters);

    setPage(1);
  }, []);

  const voucherButtonLabel = selectedVoucherCodes.length > 0 ? `Voucher (${selectedVoucherCodes.length})` : 'Voucher';

  const searchField = (
    <SearchInput
      debounceMs={320}
      placeholder="Tìm theo tên sản phẩm hoặc mã biến thể..."
      value={searchInput}
      onChange={(event) => handleSearchInputChange(event.target.value)}
      onDebouncedChange={handleSearchDebounced}
      onFocus={() => {
        if (isCartMode && searchKeyword.trim()) {
          setQuickSearchOpen(true);
        }
      }}
      sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
    />
  );

  return (
    <Stack sx={{ gap: 1.25, height: hideGrid ? 'auto' : '100%', minHeight: 0, flexShrink: hideGrid ? 0 : undefined }}>
      <StackRowAlignCenter sx={{ gap: 1, flexWrap: 'wrap' }}>
        {isCartMode ? (
          <ClickAwayListener onClickAway={() => setQuickSearchOpen(false)}>
            <Box ref={searchContainerRef} sx={{ position: 'relative', flex: 1, minWidth: 200 }}>
              {searchField}

              {quickSearchOpen && searchKeyword.trim() ? (
                <Box sx={QUICK_SEARCH_DROPDOWN_SX}>
                  <Box sx={{ px: 1.25, py: 0.75, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#667085', letterSpacing: '0.04em' }}>SẢN PHẨM KHO (CLICK ĐỂ THÊM TRỰC TIẾP)</Typography>
                  </Box>

                  {quickLoading ? (
                    <StackAlignJustCenter sx={{ py: 2 }}>
                      <LoadingComponent size="small" />
                    </StackAlignJustCenter>
                  ) : quickRows.length === 0 ? (
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', p: 1.5 }}>Không tìm thấy biến thể phù hợp.</Typography>
                  ) : (
                    quickRows.map((item) => <QuickSearchRow key={String(item.id)} item={item} onSelect={handleQuickSelect} />)
                  )}
                </Box>
              ) : null}
            </Box>
          </ClickAwayListener>
        ) : (
          <Box sx={{ flex: 1, minWidth: 200 }}>{searchField}</Box>
        )}

        {isCartMode ? (
          <CustomButton
            fullWidth={false}
            variant="outline"
            startIcon={<Ticket01 size={18} />}
            onClick={onOpenVoucherModal}
            sx={{ flexShrink: 0, textTransform: 'none', borderColor: '#D0D5DD', color: '#101828', whiteSpace: 'nowrap' }}
          >
            {voucherButtonLabel}
          </CustomButton>
        ) : (
          <CustomButton
            fullWidth={false}
            variant="outline"
            startIcon={<FilterListRounded sx={{ fontSize: 18 }} />}
            onClick={() => setFilterDialogOpen(true)}
            sx={{ flexShrink: 0, textTransform: 'none', borderColor: '#D0D5DD', color: '#101828', whiteSpace: 'nowrap' }}
          >
            {filterLabel}
          </CustomButton>
        )}
      </StackRowAlignCenter>

      {!isCartMode ? (
        <HighlightStatusToggle label="Lọc theo phạm vi chương trình khuyến mãi" checked={filterByDraftTarget && hasDraft} disabled={!hasDraft} icon={null} onCheckedChange={handleDraftTargetToggle} />
      ) : null}

      {!isCartMode ? (
        <Stack sx={{ flex: 1, minHeight: 0 }}>
          <Stack sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.25 }}>
            {isLoading ? (
              <StackAlignJustCenter sx={{ py: 4 }}>
                <LoadingComponent size="small" />
              </StackAlignJustCenter>
            ) : rows.length === 0 ? (
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', py: 2 }}>Không tìm thấy biến thể phù hợp.</Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',

                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },

                  gap: 1.5,
                }}
              >
                {rows.map((item) => (
                  <SandboxProductCard key={String(item.id)} item={item} onAdd={onAddSku} />
                ))}
              </Box>
            )}
          </Stack>

          {totalItems > 0 ? (
            <Box sx={{ borderTop: '1px solid #E5E7EB', pt: 1, mt: 1 }}>
              <DataTablePagination
                page={page}
                pageSize={SKU_PAGE_SIZE}
                totalItems={totalItems}
                pageSizeOptions={[SKU_PAGE_SIZE]}
                itemLabel="sản phẩm"
                summaryMode="inline"
                onPageChange={setPage}
                onPageSizeChange={() => undefined}
              />
            </Box>
          ) : null}
        </Stack>
      ) : null}

      {!isCartMode ? (
        <SandboxCartSkuFilterDialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          value={skuFilters}
          categoryOptions={categoryOptions}
          collectionOptions={collectionOptions}
          onApply={handleApplySkuFilters}
          onReset={handleResetSkuFilters}
        />
      ) : null}
    </Stack>
  );
};
