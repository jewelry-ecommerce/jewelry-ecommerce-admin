import { CheckRounded, TrendingUpRounded } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Divider, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { IOrder } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatCurrency, parseAmount } from '../../../../common/utils/number.utils';
import { getPaymentStatusChipSx } from '../../../../common/utils/payment-status-chip.utils';
import type { OrderDetailTimelineItem } from '../../../../common/utils/order/order-detail-timeline.utils';
import { getPreOrderOrderDetailPath } from '@/trading-ui/router/route.path';
import {
  getOrderSourceLabel,
  getPaymentMethodDisplay,
  isExchangeReleasedOrder,
  isPosOrder,
  ORDER_DETAIL_COLORS,
  resolveExchangeReleasedPaymentBreakdown,
  // parseOrderAmount,
} from '../order-detail.helpers';
import { OrderDetailCounterPaymentRows } from './order-detail-counter-payment-rows.part';
import { OrderDetailPosInfo } from './order-detail-pos-info.part';
import { OrderDetailColumn, OrderDetailRow } from './order-detail-row-column.part';
import { OrderKind } from '../../../../apis/order/order.enum';

export interface OrderDetailSidebarProps {
  order: IOrder;
  payLabel: string;
  subtotal: number;
  discount: number;
  ship: number;
  grand: number;
  timelineItems: OrderDetailTimelineItem[];
}

export function OrderDetailSidebar({ order, payLabel, subtotal, discount, ship, grand, timelineItems }: OrderDetailSidebarProps) {
  const isExchangeReleased = isExchangeReleasedOrder(order);
  const exchangePayment = isExchangeReleased ? resolveExchangeReleasedPaymentBreakdown(order) : null;
  const preOrderCode = order.metadata?.preOrderCode?.trim() || order.metadata?.inventorySource?.preOrderCode?.trim() || '';
  const preOrderId = order.metadata?.inventorySource?.preOrderId?.trim() || order.metadata?.preOrderId?.trim() || '';
  const isFromPreOrder = Boolean(order.metadata?.fromPreOrder) || Boolean(preOrderCode);
  // const normalizedAmountReceived = Math.max(parseOrderAmount(order.amountReceived), 0);

  return (
    <Box
      sx={{
        width: { xs: '100%', lg: 400 },
        minWidth: { lg: 400 },
        maxWidth: { lg: 400 },
        flexShrink: 0,
      }}
    >
      <Stack>
        <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
          <CardContent>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#111827', mb: 2 }}>Thông tin đơn hàng</Typography>
            <Stack gap={1.25}>
              {isFromPreOrder ? <OrderDetailColumn label="Loại đơn" value="Hàng đặt trước" /> : null}
              {preOrderCode ? (
                <Stack gap={0.25}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Mã đơn đặt trước</Typography>
                  {preOrderId ? (
                    <Link component={RouterLink} to={getPreOrderOrderDetailPath(preOrderId)} underline="hover" sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#155DFC', width: 'fit-content' }}>
                      {preOrderCode}
                    </Link>
                  ) : (
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{preOrderCode}</Typography>
                  )}
                </Stack>
              ) : null}
              {isPosOrder(order) ? (
                <OrderDetailPosInfo order={order} />
              ) : (
                <>
                  <OrderDetailColumn label="Kênh" value={getOrderSourceLabel(order.source)} />
                  <OrderDetailColumn label="Nguồn" value="—" />
                  <OrderDetailColumn label="Nhân viên phụ trách" value="—" />
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
          <CardContent>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#111827', mb: 2 }}>Thông tin thanh toán</Typography>
            <Stack gap={0.75}>
              <OrderDetailRow label="Phương thức" value={getPaymentMethodDisplay(order.paymentMethod)} />
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Trạng thái</Typography>
                <Chip size="small" label={payLabel} sx={getPaymentStatusChipSx(order.paymentStatus)} />
              </Stack>
              <OrderDetailCounterPaymentRows order={order} />
              <Divider />
              {/* <OrderDetailRow label="Đã thanh toán trước đó" value={`${formatCurrency(normalizedAmountReceived)} đ`} />
              <Divider /> */}
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#1F2937', mb: '2px' }}>Chi tiết tài chính</Typography>
              <Stack direction="row" justifyContent="space-between" gap={1.25} sx={{ mb: '6px' }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>Tổng sản phẩm</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#101828' }}>{formatCurrency(subtotal)} đ</Typography>
              </Stack>
              {ship > 0 ? (
                <Stack direction="row" justifyContent="space-between" gap={1.25} sx={{ mb: '6px' }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>Phí vận chuyển</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#101828' }}>{formatCurrency(ship)} đ</Typography>
                </Stack>
              ) : null}
              {discount > 0 ? (
                <Stack direction="row" justifyContent="space-between" gap={1.25} sx={{ mb: '6px' }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>Tổng khuyến mãi</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#B42318' }}>-{formatCurrency(discount)} đ</Typography>
                </Stack>
              ) : null}
              {exchangePayment ? (
                <>
                  <Divider sx={{ mt: 1.25, mb: 1 }} />
                  <Stack direction="row" justifyContent="space-between" gap={1.25} sx={{ mb: '6px' }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>Khấu trừ từ đơn gốc</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#101828' }}>{formatCurrency(exchangePayment.originalOrderDeduction)} đ</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" gap={1.25} sx={{ mb: '6px' }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>Thu thêm (COD)</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#101828' }}>{formatCurrency(exchangePayment.additionalCod)} đ</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" gap={1.25} sx={{ mb: '6px' }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>Doanh thu khác</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#101828' }}>{formatCurrency(exchangePayment.otherRevenue)} đ</Typography>
                  </Stack>
                </>
              ) : null}
              <Divider sx={{ mt: 1.25 }} />
              <Stack direction="row" justifyContent="space-between" gap={1.25} mb="14px">
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Tổng cần thu</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.md.bold, color: '#101828' }}>{formatCurrency(exchangePayment ? exchangePayment.additionalCod : grand)} đ</Typography>
              </Stack>
              {!isExchangeReleased && order.amountReceived && order.amountReceived !== '0' ? (
                <Stack direction="row" justifyContent="space-between" gap={1.25}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#4A5565' }}>Đã nhận</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.md.bold, color: ORDER_DETAIL_COLORS.success }}>{formatCurrency(order.amountReceived)} đ</Typography>
                </Stack>
              ) : null}
              {order.orderKind === OrderKind.RECALL && order.amountReceived && order.amountReceived !== '0' ? (
                <Box
                  sx={{
                    mt: 0.75,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 1.5,
                    border: '1px solid #FED7AA',
                    backgroundColor: '#FFF7ED',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.25}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <TrendingUpRounded sx={{ color: '#F97316', fontSize: 30 }} />
                      <Typography
                        sx={{
                          ...TYPOGRAPHY_STYLES.md.semibold,
                          color: '#7C2D12',
                          lineHeight: 1.1,
                        }}
                      >
                        Còn thiếu
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        ...TYPOGRAPHY_STYLES.md.bold,
                        color: '#F04438',
                      }}
                    >
                      {`${formatCurrency(Math.max(0, grand - parseAmount(order.amountReceived)))} đ`}
                    </Typography>
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
          <CardContent>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#1F2937', mb: 2 }}>Timeline xử lý</Typography>
            <Stack
              spacing={0}
              sx={{
                maxHeight: 576,
                overflowY: 'auto',
                pr: 0.5,
              }}
              gap={0}
            >
              {timelineItems.map((step, index) => (
                <Stack key={step.key} direction="row" alignItems="flex-start" gap={1.5} sx={{ position: 'relative', pb: 3 }}>
                  <Stack alignItems="center" sx={{ minWidth: 34, position: 'relative', alignSelf: 'stretch' }}>
                    {index < timelineItems.length - 1 ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: '50%',
                          top: 34,
                          bottom: -24,
                          width: 2,
                          transform: 'translateX(-50%)',
                          bgcolor: '#EAECF0',
                        }}
                      />
                    ) : null}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: '#DCFCE7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckRounded sx={{ fontSize: 20, color: '#00A63E' }} />
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ flex: 1, pt: 0.5, minWidth: 0 }}>
                    <Stack spacing={0.25} sx={{ pr: 1.5, minWidth: 0 }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#1F2937' }}>{step.title}</Typography>
                    </Stack>
                    <Box sx={{ textAlign: 'right', minWidth: 98 }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6A7282' }}>{step.dateLabel}</Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#99A1AF' }}>{step.timeLabel}</Typography>
                    </Box>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
