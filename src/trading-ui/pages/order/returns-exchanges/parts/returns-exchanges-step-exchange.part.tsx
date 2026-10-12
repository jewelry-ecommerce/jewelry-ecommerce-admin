import { AddRounded, CloseRounded, RemoveRounded } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import { PermissionIconButton } from '../../../../components/button';
import { orderReturnsButtonPermission } from '../../order-permission.constants';
import { Archive, FlipBackward } from '@untitledui/icons';
import { StackRowAlignCenter } from '@/trading-ui/adapters/library';
import { useState } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatCurrency } from '../../../../common/utils/number.utils';
import { CustomButton } from '../../../../components/button';
import { ReturnExchangeItemRow } from '../../../../components/order/return-exchange-item-row.component';
import type { ReturnableOrderLine } from '../../order.types';
import { ReturnExchangeSelectExchangeInlinePart } from './returns-exchanges-select-exchange-inline.part';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';

interface ReturnItemValue {
  lineId: string;
  productName: string;
  sku: string;
  quantity: number;
  priceSnapshot: number;
  imageUrl: string;
}

interface ExchangeItemValue {
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  priceSnapshot: number;
  imageUrl: string;
}

const sxReturnBox = {
  width: '100%',
  border: '1px solid #E4E7EC',
  borderRadius: 1.5,
  p: 1.5,
  bgcolor: '#FFFFFF',
};

const sxExchangeOuter = {
  width: '100%',
  border: '1px solid #E4E7EC',
  borderRadius: 1.5,
  p: 1.5,
  bgcolor: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column' as const,
  alignSelf: 'stretch',
};

const sxSelectedExchangeBlock = {
  width: '100%',
  mt: 1.5,
};

export interface ReturnExchangeStepExchangePartProps {
  returnItems: ReturnItemValue[];
  exchangeItems: ExchangeItemValue[];
  searchKeyword: string;
  selectCatalog: ReturnableOrderLine[];
  onChangeSearchKeyword: (value: string) => void;
  onSelectCatalogLine: (line: ReturnableOrderLine) => void;
  onRemoveExchangeItem: (index: number) => void;
  hasMoreCatalog?: boolean;
  isLoadingMoreCatalog?: boolean;
  onLoadMoreCatalog?: () => void;
}

export const ReturnExchangeStepExchangePart = ({
  returnItems,
  exchangeItems,
  searchKeyword,
  selectCatalog,
  onChangeSearchKeyword,
  onSelectCatalogLine,
  onRemoveExchangeItem,
  hasMoreCatalog = false,
  isLoadingMoreCatalog = false,
  onLoadMoreCatalog,
}: ReturnExchangeStepExchangePartProps) => {
  const [isExchangePickerOpen, setIsExchangePickerOpen] = useState(true);

  return (
    <Stack
      direction="column"
      gap={1.5}
      sx={{
        mt: 2,
        alignSelf: 'stretch',
        borderRadius: 2,
        p: 1.5,
      }}
    >
      <Box sx={sxReturnBox}>
        <StackRowAlignCenter gap={1} sx={{ mb: 2 }}>
          <FlipBackward size={16} />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Sản phẩm trả</Typography>
        </StackRowAlignCenter>
        <Stack gap={1}>
          {returnItems.map((item) => (
            <ReturnExchangeItemRow
              key={item.lineId}
              imageUrl={item.imageUrl}
              productName={item.productName}
              sku={item.sku}
              quantity={item.quantity}
              priceSnapshot={item.priceSnapshot}
              textMaxWidth={480}
            />
          ))}
        </Stack>
      </Box>

      <Box sx={sxExchangeOuter}>
        <Accordion
          expanded={isExchangePickerOpen}
          onChange={(_, expanded) => setIsExchangePickerOpen(expanded)}
          disableGutters
          elevation={0}
          sx={{ border: 'none', boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: '#FFFFFF' }}
        >
          <AccordionSummary
            sx={{
              px: 0,
              py: 0,
              minHeight: 'unset',
              '& .MuiAccordionSummary-content': { m: 0 },
              '& .MuiAccordionSummary-content.Mui-expanded': { m: 0 },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
              <StackRowAlignCenter gap={1}>
                <Archive size={16} color="#6B7280" />
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Sản phẩm đổi</Typography>
              </StackRowAlignCenter>
              <CustomButton
                fullWidth={false}
                variant="outline"
                startIcon={isExchangePickerOpen ? <CloseRounded sx={{ fontSize: 16 }} /> : <AddRounded sx={{ fontSize: 16 }} />}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsExchangePickerOpen((prev) => !prev);
                }}
                {...orderReturnsButtonPermission('exchange_add_product', isExchangePickerOpen ? 'Đóng chọn sản phẩm đổi' : 'Thêm sản phẩm đổi', 'api_order_return_create')}
                sx={{
                  minWidth: 92,
                  px: 1.25,
                  py: 0.625,
                  borderRadius: '10px',
                  textTransform: 'none',
                  borderColor: '#111827',
                  ...TYPOGRAPHY_STYLES.base.regular,
                }}
              >
                {isExchangePickerOpen ? 'Đóng' : 'Thêm sản phẩm'}
              </CustomButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, pt: 2 }}>
            <ReturnExchangeSelectExchangeInlinePart
              searchKeyword={searchKeyword}
              catalog={selectCatalog}
              onChangeSearchKeyword={onChangeSearchKeyword}
              onSelectItem={onSelectCatalogLine}
              hasMore={hasMoreCatalog}
              isLoadingMore={isLoadingMoreCatalog}
              onLoadMore={onLoadMoreCatalog}
            />
          </AccordionDetails>
        </Accordion>

        <Box sx={sxSelectedExchangeBlock}>
          {exchangeItems.length === 0 ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.regular, color: '#737373' }}>Chưa có sản phẩm nào</Typography>
          ) : (
            <Stack gap={1}>
              {exchangeItems.map((item, idx) => (
                <Stack key={`${item.variantId}-${idx}`} direction="row" justifyContent="space-between" alignItems="center" sx={{ border: '1px solid #EAECF0', borderRadius: 1.5, p: 1 }}>
                  <Stack direction="row" gap={1} alignItems="center">
                    <Box component="img" src={item.imageUrl || PRODUCT_SPU_DEFAULT_IMAGE_SRC} alt={item.productName} sx={{ width: 64, height: 64, borderRadius: 1, objectFit: 'cover' }} />
                    <Stack sx={{ minWidth: 0, maxWidth: 280 }} gap={0}>
                      <Typography
                        sx={{
                          ...TYPOGRAPHY_STYLES.base.semibold,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.productName}
                      </Typography>
                      <Typography
                        sx={{
                          ...TYPOGRAPHY_STYLES.sm.regular,
                          color: '#667085',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        SKU: {item.sku}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={0.75} sx={{ width: 'auto' }}>
                    <Stack direction="row" alignItems="center" sx={{ bgcolor: '#F9FAFB', borderRadius: 1.5 }}>
                      <PermissionIconButton size="small" disabled onClick={() => {}}>
                        <RemoveRounded fontSize="small" />
                      </PermissionIconButton>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, minWidth: 32, textAlign: 'center' }}>{item.quantity}</Typography>
                      <PermissionIconButton size="small" disabled onClick={() => {}}>
                        <AddRounded fontSize="small" />
                      </PermissionIconButton>
                    </Stack>
                    <Stack alignItems="flex-end" gap={0}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{formatCurrency(item.priceSnapshot)} ₫</Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>thành tiền</Typography>
                    </Stack>
                    <PermissionIconButton onClick={() => onRemoveExchangeItem(idx)} size="small">
                      <CloseRounded fontSize="small" sx={{ color: '#99A1AF' }} />
                    </PermissionIconButton>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Stack>
  );
};
