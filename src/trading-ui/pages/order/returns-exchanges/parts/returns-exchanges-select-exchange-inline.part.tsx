import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { SearchInput } from '../../../../components/form';
import { CustomButton } from '../../../../components/button';

import { formatCurrency } from '../../../../common/utils/number.utils';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import type { ReturnableOrderLine } from '../../order.types';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';

export interface ReturnExchangeSelectExchangeInlinePartProps {
  searchKeyword: string;
  catalog: ReturnableOrderLine[];
  onChangeSearchKeyword: (value: string) => void;
  onSelectItem: (line: ReturnableOrderLine) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

const sxPanelRoot = {
  display: 'flex',
  height: 408,
  boxSizing: 'border-box' as const,
  padding: '17px 17px 1px 17px',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  gap: '12px',
  alignSelf: 'stretch',
  width: '100%',
  minWidth: 0,
  borderRadius: '10px',
  border: '1px solid #E5E7EB',
  bgcolor: '#FFFFFF',
  overflow: 'hidden',
};

export const ReturnExchangeSelectExchangeInlinePart = ({
  searchKeyword,
  catalog,
  onChangeSearchKeyword,
  onSelectItem,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: ReturnExchangeSelectExchangeInlinePartProps) => {
  const listScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore || !onLoadMore) return;

    const root = listScrollRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { root, rootMargin: '120px', threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, catalog.length]);

  return (
    <Box sx={sxPanelRoot}>
      <Box sx={{ width: '100%', flexShrink: 0 }}>
        <SearchInput fullWidth placeholder="Tìm theo tên sản phẩm, SKU, mã vạch..." value={searchKeyword} onChange={(e) => onChangeSearchKeyword(e.target.value)} />
      </Box>
      <Box ref={listScrollRef} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', width: '100%', pr: 0.5, alignSelf: 'stretch' }}>
        <Stack gap={1.25}>
          {catalog.map((item) => (
            <Stack key={item.lineId} direction="row" justifyContent="space-between" alignItems="center" sx={{ border: '1px solid #EAECF0', borderRadius: 1.5, p: 1.25, bgcolor: '#FFFFFF' }}>
              <Stack direction="row" gap={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                <Box component="img" src={item.imageUrl || PRODUCT_SPU_DEFAULT_IMAGE_SRC} alt={item.productName} sx={{ width: 64, height: 64, borderRadius: 1, flexShrink: 0, objectFit: 'cover' }} />
                <Stack gap={0} sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{item.productName}</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#98A2B3' }}>SKU: {item.sku}</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{formatCurrency(item.priceSnapshot)}₫</Typography>
                </Stack>
              </Stack>
              <CustomButton
                fullWidth={false}
                sx={{
                  minWidth: 88,
                  px: 1.5,
                  py: 0.75,
                  flexShrink: 0,
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#F3F4F6',
                  color: '#111827',
                  ...TYPOGRAPHY_STYLES.base.regular,
                  '&:hover': {
                    backgroundColor: '#E5E7EB',
                    color: '#111827',
                  },
                }}
                onClick={() => onSelectItem(item)}
              >
                Chọn
              </CustomButton>
            </Stack>
          ))}
          {hasMore || isLoadingMore ? (
            <Box ref={loadMoreSentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 1.5, minHeight: 40 }}>
              {isLoadingMore ? <CircularProgress size={20} /> : null}
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
};
