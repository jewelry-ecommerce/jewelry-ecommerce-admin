import { WarningAmberRounded } from '@mui/icons-material';
import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { IOrder, IOrderProductDetail } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatCurrency } from '../../../../common/utils/number.utils';
import { StackAlignEnd, StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled/stack.style';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';
import {
  buildOrderPromotionSummaryLines,
  getOrderLooseItems,
  getOrderSetLines,
  isExchangeReleasedOrder,
  mergeOrderItemsBySkuCode,
  ORDER_DETAIL_COLORS,
  resolveExchangeReleasedPaymentBreakdown,
  resolveOrderDisplayLineTotal,
  resolveOrderItemSalePrice,
  resolveOrderItemUnitPrice,
  resolveOrderPromotionQuantityNote,
} from '../order-detail.helpers';
import { OrderDetailSetItem } from './order-detail-set-item.part';

const ORDER_ITEM_THUMB_SIZE = 48;
const SUMMARY_LABEL_SX = { ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' };
const SUMMARY_VALUE_SX = { ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' };

export interface OrderDetailItemsCardProps {
  order: IOrder;
  productDetails: Map<string, IOrderProductDetail>;
  shippingFeeWarning: boolean;
  onPreviewImage: (url: string) => void;
  subtotal: number;
  discount: number;
  ship: number;
  grand: number;
}

export function OrderDetailItemsCard({ order, productDetails, shippingFeeWarning, onPreviewImage, subtotal, discount, ship, grand }: OrderDetailItemsCardProps) {
  const setLines = useMemo(() => getOrderSetLines(order), [order.lines]);
  const displayItems = useMemo(() => mergeOrderItemsBySkuCode(getOrderLooseItems(order)), [order.items, order.lines]);
  const promotionLines = useMemo(() => buildOrderPromotionSummaryLines(order.promotions), [order.promotions]);
  const promotionLinesTotal = promotionLines.reduce((sum, line) => sum + line.amount, 0);
  const totalPromotion = discount > 0 ? discount : promotionLinesTotal;
  // Phần khuyến mãi không thuộc voucher nào đã liệt kê (vd. giảm giá khác) — để các dòng cộng đúng bằng tổng.
  const otherPromotion = promotionLines.length ? Math.max(0, totalPromotion - promotionLinesTotal) : 0;
  const isExchangeReleased = isExchangeReleasedOrder(order);
  const exchangePayment = isExchangeReleased ? resolveExchangeReleasedPaymentBreakdown(order) : null;

  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#111827', mb: 2 }}>Danh sách sản phẩm</Typography>
        <Stack divider={<Divider flexItem />}>
          {setLines.map((line) => (
            <OrderDetailSetItem key={line.lineId} line={line} productDetails={productDetails} onPreviewImage={onPreviewImage} />
          ))}
          {displayItems.map((item) => {
            const lineTotal = resolveOrderDisplayLineTotal(item);
            const thumb = item.image || productDetails.get(item.productId || '')?.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC;
            const quantityNote = resolveOrderPromotionQuantityNote(order.items, order.promotions, item.skuCode, item.quantity);
            const unitPrice = resolveOrderItemUnitPrice(item);
            const salePrice = resolveOrderItemSalePrice(item);
            return (
              <StackRowAlignCenter key={item.skuCode || item.id} sx={{ gap: 1.5, alignItems: 'flex-start', py: 1.25 }}>
                <Box
                  sx={{
                    width: ORDER_ITEM_THUMB_SIZE,
                    height: ORDER_ITEM_THUMB_SIZE,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'zoom-in',
                    border: '1px solid #E5E7EB',
                    bgcolor: '#F8FAFC',
                  }}
                  onClick={() => onPreviewImage(thumb)}
                >
                  <Box component="img" src={thumb} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{item.productName || item.variationName || 'Sản phẩm'}</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mt: 0.25 }}>SKU: {item.skuCode}</Typography>
                  <Stack direction="row" alignItems="baseline" gap={0.75} sx={{ mt: 0.25, flexWrap: 'wrap' }}>
                    {unitPrice > salePrice ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#94A3B8', textDecoration: 'line-through' }}>{formatCurrency(unitPrice)} đ</Typography> : null}
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: '#111827' }}>{formatCurrency(salePrice)} đ</Typography>
                  </Stack>
                  {quantityNote ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#047857', mt: 0.25 }}>{quantityNote}</Typography> : null}
                </Box>
                <StackAlignEnd gap={0.5} justifyContent="flex-end">
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, textAlign: 'right' }}>SL: {item.quantity}</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.bold, textAlign: 'right' }}>{formatCurrency(lineTotal)} đ</Typography>
                </StackAlignEnd>
              </StackRowAlignCenter>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack gap={1}>
          <StackRowAlignCenterJustBetween>
            <Typography sx={SUMMARY_LABEL_SX}>Tạm tính</Typography>
            <Typography sx={SUMMARY_VALUE_SX}>{formatCurrency(subtotal)} đ</Typography>
          </StackRowAlignCenterJustBetween>
          {totalPromotion > 0 ? (
            <StackRowAlignCenterJustBetween>
              <Typography sx={SUMMARY_LABEL_SX}>Tổng khuyến mãi</Typography>
              <Typography sx={SUMMARY_VALUE_SX}>-{formatCurrency(totalPromotion)} đ</Typography>
            </StackRowAlignCenterJustBetween>
          ) : null}
          {promotionLines.map((line) => (
            <StackRowAlignCenterJustBetween key={line.key} sx={{ pl: 1 }}>
              <Typography sx={SUMMARY_LABEL_SX}>• {line.label}</Typography>
              <Typography sx={SUMMARY_VALUE_SX}>-{formatCurrency(line.amount)} đ</Typography>
            </StackRowAlignCenterJustBetween>
          ))}
          {otherPromotion > 0 ? (
            <StackRowAlignCenterJustBetween sx={{ pl: 1 }}>
              <Typography sx={SUMMARY_LABEL_SX}>• Giảm giá khác</Typography>
              <Typography sx={SUMMARY_VALUE_SX}>-{formatCurrency(otherPromotion)} đ</Typography>
            </StackRowAlignCenterJustBetween>
          ) : null}
          <StackRowAlignCenterJustBetween>
            <Typography sx={SUMMARY_LABEL_SX}>Phí vận chuyển</Typography>
            <StackRowAlignCenter>
              {shippingFeeWarning ? <WarningAmberRounded sx={{ fontSize: 18, color: ORDER_DETAIL_COLORS.warning }} /> : null}
              <Typography sx={SUMMARY_VALUE_SX}>{formatCurrency(ship)} đ</Typography>
            </StackRowAlignCenter>
          </StackRowAlignCenterJustBetween>
          {shippingFeeWarning ? <Typography sx={{ fontSize: 12, color: ORDER_DETAIL_COLORS.warning }}>Phí ship thực tế cao hơn đơn hàng (so với API vận chuyển).</Typography> : null}
          {exchangePayment ? (
            <>
              <Divider />
              <StackRowAlignCenterJustBetween>
                <Typography sx={SUMMARY_LABEL_SX}>Khấu trừ từ đơn gốc</Typography>
                <Typography sx={SUMMARY_VALUE_SX}>{formatCurrency(exchangePayment.originalOrderDeduction)} đ</Typography>
              </StackRowAlignCenterJustBetween>
              <StackRowAlignCenterJustBetween>
                <Typography sx={SUMMARY_LABEL_SX}>Thu thêm (COD)</Typography>
                <Typography sx={SUMMARY_VALUE_SX}>{formatCurrency(exchangePayment.additionalCod)} đ</Typography>
              </StackRowAlignCenterJustBetween>
              <StackRowAlignCenterJustBetween>
                <Typography sx={SUMMARY_LABEL_SX}>Doanh thu khác</Typography>
                <Typography sx={SUMMARY_VALUE_SX}>{formatCurrency(exchangePayment.otherRevenue)} đ</Typography>
              </StackRowAlignCenterJustBetween>
            </>
          ) : null}
          <Divider />
          <StackRowAlignCenterJustBetween>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#111827' }}>Tổng thanh toán</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.bold, color: '#111827' }}>{formatCurrency(grand)} đ</Typography>
          </StackRowAlignCenterJustBetween>
        </Stack>
      </CardContent>
    </Card>
  );
}
