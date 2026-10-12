import { CheckRounded, PhoneOutlined } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Divider, Link, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrderReturnStatus, PaymentStatus, approveOrderReturn, getOrderDetail, getOrderReturnDetail, rejectOrderReturn, type IOrder, type IOrderReturnDetailResponse } from '../../../../apis/order';
import { IconPoint } from '../../../../assets/icon';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { copyTextToClipboard, getErrorMessage, getStatusPillSx } from '../../../../common/utils';
import { formatDateTime } from '../../../../common/utils/date-format.util';
import { formatCurrency } from '../../../../common/utils/number.utils';
import { CustomButton } from '../../../../components/button';
import { ORDER_RETURNS_PAGE_SCOPE } from '../../order-permission.constants';
import { PageStateComponent } from '../../../../components/empty';
import { ReturnExchangeItemRow } from '../../../../components/order/return-exchange-item-row.component';
import EvidenceImagePreviewDialog from '../../../../components/upload-image/evidence-image-preview-dialog.component';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { OrderDetailHeader } from '../../order-detail/order-detail-header';
import type { OrderDetailActionVisibility } from '../../order-detail/order-detail.helpers';
import { getOrderSourceLabel, getPaymentStatusLabel } from '../../order-detail/order-detail.helpers';
import { ReturnExchangesApproveDialogPart } from '../parts/returns-exchanges-approve-dialog.part';
import { ReturnExchangesRejectDialogPart } from '../parts/returns-exchanges-reject-dialog.part';
import { OrderAuditLogDrawer } from '../../audit-log/order-audit-log.drawer';
import { OrderDetailMoreMenu } from '../../order-detail/parts/order-detail-more-menu.part';
import { getReturnLineUnitPrice } from '../../../../common/constant/order/order.constants';
import {
  buildReturnTimeline,
  getCustomerName,
  getDisplayAddress,
  getReturnReasonLabel,
  getReturnStatusLabel,
  getReturnTypeLabel,
  resolveReturnExchangeFinancialSummary,
} from './returns-exchanges-detail.helpers';
const ReturnExchangeDetailPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [detail, setDetail] = useState<IOrderReturnDetailResponse | null>(null);
  const [originalOrder, setOriginalOrder] = useState<IOrder | null>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const { showSnackbar } = useSnackbar();
  const detailId = searchParams.get('detailId')?.trim() || '';

  const loadReturnDetail = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!detailId) {
        setDetail(null);
        return;
      }

      if (!opts?.silent) {
        setIsLoading(true);
        setLoadError('');
      }

      try {
        const response = await getOrderReturnDetail(detailId);
        setDetail(response);

        const sourceOrder = response.originalOrder;
        if (sourceOrder) {
          setOriginalOrder(sourceOrder);
          return;
        }

        const originalOrderId = response.originalOrderId?.trim() || response.orderId?.trim() || '';
        if (!originalOrderId) {
          setOriginalOrder(null);
          return;
        }
        const fetchedOrder = await getOrderDetail(originalOrderId);
        setOriginalOrder(fetchedOrder);
      } catch (error) {
        if (!opts?.silent) {
          setLoadError(getErrorMessage(error) || 'Không tải được chi tiết yêu cầu đổi/trả.');
        } else {
          showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
        }
      } finally {
        if (!opts?.silent) setIsLoading(false);
      }
    },
    [detailId, showSnackbar],
  );

  useEffect(() => {
    void loadReturnDetail();
  }, [loadReturnDetail]);

  const closeDetailPage = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('detailId');
        return next;
      },
      { replace: true },
    );
  };

  const isReturnPending = Boolean(detail && (detail.status === OrderReturnStatus.PENDING || String(detail.status ?? '').toLowerCase() === 'pending'));

  const visibility = useMemo((): OrderDetailActionVisibility => {
    return {
      showConfirmOrder: false,
      showCancelOrder: isReturnPending,
      showEditOrder: false,
      showRevokeConfirmation: false,
      showPrintInvoice: false,
      showPrintSlip: false,
      showConfirmPayment: isReturnPending,
      showCodShortfall: false,
      showModifyActions: false,
    };
  }, [isReturnPending]);

  const handleApproveReturn = useCallback(async () => {
    if (!detailId) return;
    setActionSubmitting(true);
    try {
      await approveOrderReturn(detailId, {});
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã duyệt yêu cầu đổi/trả.' });
      setApproveDialogOpen(false);
      await loadReturnDetail({ silent: true });
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setActionSubmitting(false);
    }
  }, [detailId, loadReturnDetail, showSnackbar]);

  const handleRejectReturn = useCallback(
    async (payload: { note: string }) => {
      if (!detailId) return;
      setActionSubmitting(true);
      try {
        await rejectOrderReturn(detailId, { note: payload.note });
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã hủy yêu cầu đổi/trả.' });
        setRejectDialogOpen(false);
        await loadReturnDetail({ silent: true });
      } catch (error) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      } finally {
        setActionSubmitting(false);
      }
    },
    [detailId, loadReturnDetail, showSnackbar],
  );

  if (isLoading) {
    return (
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Đang tải chi tiết yêu cầu đổi/trả...</Typography>
      </Box>
    );
  }

  if (loadError || !detail) {
    return (
      <Box sx={{ px: 3, py: 2.5 }}>
        <PageStateComponent variant="empty" title="Không tải được dữ liệu" description={loadError || 'Vui lòng kiểm tra lại yêu cầu đổi/trả.'} />
      </Box>
    );
  }

  const fallbackPaymentStatus = originalOrder?.paymentStatus ?? PaymentStatus.UNPAID;
  const sidebarTimeline = buildReturnTimeline(detail);
  const rawEvidence = detail.evidenceImageUrls ?? [];
  const displayEvidence = rawEvidence.slice(0, 3);
  const hiddenEvidenceCount = Math.max(rawEvidence.length - 3, 0);
  const customerName = getCustomerName(detail);
  const paymentStatusLabel = originalOrder ? getPaymentStatusLabel(originalOrder.paymentStatus) : '—';
  const returnStatusLabel = getReturnStatusLabel(detail.status);

  const financialSummary = resolveReturnExchangeFinancialSummary(detail);

  const headerOrderCode = detail.returnCode?.trim() || detail.id?.trim() || '—';
  const relatedOrderBannerCode = detail.originalOrderCode?.trim() || detail.orderCode?.trim() || null;
  const headerCreatedAt = formatDateTime(originalOrder?.createdAt || detail.createdAt);
  const headerSource = originalOrder ? getOrderSourceLabel(originalOrder.source) : '—';
  const auditOrderId = originalOrder?.id?.trim() || detail.originalOrderId?.trim() || detail.orderId?.trim() || '';

  return (
    <>
      <OrderDetailHeader
        orderCode={headerOrderCode}
        headerTitlePrefix="Đơn đổi trả"
        createdAtLabel={headerCreatedAt}
        sourceLabel={headerSource}
        orderStatusLabel={returnStatusLabel}
        payLabel={paymentStatusLabel}
        paymentStatus={fallbackPaymentStatus}
        hideHeaderStatusChips
        visibility={visibility}
        showCreateReturnExchange={false}
        onBack={closeDetailPage}
        onCopyOrderCode={() => {
          void copyTextToClipboard(headerOrderCode);
          showSnackbar({ type: SnackbarType.SUCCESS, message: `Đã sao chép mã ${headerOrderCode}` });
        }}
        onOpenMoreMenu={(event) => setMoreMenuAnchor(event.currentTarget)}
        onConfirmPayment={() => setApproveDialogOpen(true)}
        onCodShortfall={() => showSnackbar({ type: SnackbarType.INFO, message: 'Chức năng sẽ cập nhật tiếp.' })}
        onCancelOrder={() => setRejectDialogOpen(true)}
        quickActionLabels={{
          confirmPayment: 'Xác nhận yêu cầu đổi/trả',
          cancelOrder: 'Hủy yêu cầu',
        }}
        showMoreMenuButton={Boolean(auditOrderId)}
      />

      <Box sx={{ pb: 3, px: { xs: 2, md: 3 }, width: '100%' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} alignItems="stretch">
          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <Stack gap={2}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold }}>Thông tin khách hàng</Typography>
                    <CustomButton
                      variant="outline"
                      fullWidth={false}
                      size="small"
                      startIcon={<PhoneOutlined sx={{ fontSize: 18 }} />}
                      component={detail.receiverPhone ? Link : 'span'}
                      href={detail.receiverPhone ? `tel:${detail.receiverPhone}` : undefined}
                      disabled={!detail.receiverPhone}
                      sx={{
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.75,
                        ...TYPOGRAPHY_STYLES.sm.medium,
                        borderColor: '#2563EB',
                        color: '#2563EB',
                        borderRadius: 2,
                      }}
                    >
                      Gọi ngay
                    </CustomButton>
                  </Stack>

                  <Stack gap={1.5}>
                    <InfoField label="Họ tên" value={customerName} />
                    <InfoField label="Email" value={originalOrder?.contactEmail || '—'} />
                    <InfoField label="Địa chỉ kho giao/nhận" value={getDisplayAddress(detail.pickupAddressSnapshot)} />
                    <InfoField label="Địa chỉ khách hàng" value={getDisplayAddress(detail.shippingAddressSnapshot)} />
                    <InfoField label="Số điện thoại" value={detail.receiverPhone || detail.customerPhone || '—'} />
                    <InfoField label="Mã vận đơn" value={detail.returnPickupTrackingCode?.trim() || '—'} />
                    <InfoField label="Ghi chú khách hàng" value={detail.note || '—'} />
                  </Stack>
                </CardContent>
              </Card>

              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <CardContent>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, mb: 2 }}>Yêu cầu đổi/trả hàng</Typography>

                  <Stack gap={1.5}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Mã yêu cầu đổi/trả hàng</Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{detail.returnCode || '—'}</Typography>
                    </Stack>
                    <InfoField label="Loại yêu cầu" value={getReturnTypeLabel(detail.type)} />
                    <InfoField label="Lý do đổi/trả" value={getReturnReasonLabel(detail.reason)} />

                    <Box>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.75 }}>Ảnh bằng chứng</Typography>
                      <Stack direction="row" gap={1}>
                        {displayEvidence.map((image, index) => {
                          const showOverlay = index === 2 && hiddenEvidenceCount > 0;
                          return (
                            <Box
                              key={`${image}-${index}`}
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: 'pointer',
                              }}
                              onClick={() => setPreviewImageIndex(index)}
                            >
                              <Box component="img" src={image} alt={`evidence-${index + 1}`} sx={{ width: 1, height: 1, objectFit: 'cover' }} />
                              {showOverlay ? (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    bgcolor: 'rgba(17, 24, 39, 0.45)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFFFFF',
                                    ...TYPOGRAPHY_STYLES.base.semibold,
                                  }}
                                >
                                  +{hiddenEvidenceCount}
                                </Box>
                              ) : null}
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>

                    <ProductSection title="Sản phẩm trả" items={detail.returnItems} />
                    <ProductSection title="Sản phẩm đổi" items={detail.exchangeItems} />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>

          <Box sx={{ width: { xs: '100%', lg: 400 }, minWidth: { lg: 400 }, maxWidth: { lg: 400 }, flexShrink: 0 }}>
            <Stack gap={2}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <CardContent>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, mb: 2 }}>Thông tin thanh toán</Typography>
                  <Stack gap={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Loại yêu cầu</Typography>
                      <Chip label={getReturnTypeLabel(detail.type)} size="small" sx={{ ...getStatusPillSx(detail.type || ''), ...TYPOGRAPHY_STYLES.sm.medium }} />
                    </Stack>
                    <Divider />
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Chi tiết tài chính</Typography>
                    <MoneyRow label="Giá trị sản phẩm trả lại" value={financialSummary.returnProductTotal} />
                    {financialSummary.showExchangeFinancialRows ? (
                      <>
                        <MoneyRow label="Giá trị sản phẩm đổi mới" value={financialSummary.exchangeProductTotal} />
                        <PriceDifferenceRow value={financialSummary.priceDifference} />
                      </>
                    ) : null}
                    <MoneyRow label="Phí vận chuyển thu hồi" value={financialSummary.returnInboundShippingFee} />
                    <Divider />
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Doanh thu khác</Typography>
                    <MoneyRow label="Doanh thu khác (No Refund)" value={financialSummary.otherRevenueNoRefund} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Điểm Loyalty nhận được</Typography>
                      <Stack direction="row" alignItems="center" gap={0.75}>
                        <IconPoint />
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{financialSummary.loyaltyPointsReceived}</Typography>
                      </Stack>
                    </Stack>
                    <Divider />
                    <MoneyRow label="Tổng thu thêm khi thu hồi (COD)" value={financialSummary.totalPickupCod} emphasize />
                    {financialSummary.showExchangeFinancialRows ? <MoneyRow label="Tổng thu thêm khi giao đơn mới (COD)" value={financialSummary.exchangeDeliveryCodTotal} emphasize /> : null}
                  </Stack>
                </CardContent>
              </Card>

              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <CardContent>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, mb: 2 }}>Timeline xử lý</Typography>
                  <Stack sx={{ maxHeight: 580, overflowY: 'auto', pr: 0.5 }}>
                    {sidebarTimeline.map((item, index) => (
                      <Stack key={item.key} direction="row" alignItems="flex-start" gap={1.5} sx={{ position: 'relative', pb: 3 }}>
                        <Stack alignItems="center" sx={{ minWidth: 34, position: 'relative', alignSelf: 'stretch' }}>
                          {index < sidebarTimeline.length - 1 ? (
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

                        <Stack direction="row" justifyContent="space-between" sx={{ flex: 1, pt: 0.5, minWidth: 0 }}>
                          <Box sx={{ minWidth: 0, pr: 1 }}>
                            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#1F2937' }}>{item.title}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', minWidth: 90 }}>
                            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6A7282' }}>{item.dateLabel}</Typography>
                            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#99A1AF' }}>{item.timeLabel}</Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <OrderDetailMoreMenu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
        permissionScope={ORDER_RETURNS_PAGE_SCOPE}
        viewHistoryApiCode="api_oms_get_orders_audit_logs"
        onOpenHistory={
          auditOrderId
            ? () => {
                setAuditDrawerOpen(true);
              }
            : undefined
        }
      />

      <OrderAuditLogDrawer open={auditDrawerOpen} orderId={auditOrderId} onClose={() => setAuditDrawerOpen(false)} />

      <EvidenceImagePreviewDialog
        images={rawEvidence}
        activeIndex={previewImageIndex}
        onClose={() => setPreviewImageIndex(null)}
        onPrev={() =>
          setPreviewImageIndex((prev) => {
            if (prev == null || rawEvidence.length <= 0) return prev;
            return prev === 0 ? rawEvidence.length - 1 : prev - 1;
          })
        }
        onNext={() =>
          setPreviewImageIndex((prev) => {
            if (prev == null || rawEvidence.length <= 0) return prev;
            return prev === rawEvidence.length - 1 ? 0 : prev + 1;
          })
        }
      />

      <ReturnExchangesApproveDialogPart
        open={approveDialogOpen}
        returnCode={headerOrderCode}
        submitting={actionSubmitting}
        onClose={() => {
          if (actionSubmitting) return;
          setApproveDialogOpen(false);
        }}
        onConfirm={() => void handleApproveReturn()}
      />

      <ReturnExchangesRejectDialogPart
        open={rejectDialogOpen}
        returnCode={headerOrderCode}
        relatedOrderCode={relatedOrderBannerCode}
        submitting={actionSubmitting}
        onClose={() => {
          if (actionSubmitting) return;
          setRejectDialogOpen(false);
        }}
        onConfirm={(payload) => void handleRejectReturn(payload)}
      />
    </>
  );
};

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{value || '—'}</Typography>
    </Box>
  );
}

function ProductSection({ title, items }: { title: string; items: IOrderReturnDetailResponse['returnItems'] }) {
  return (
    <Box sx={{ border: '1px solid #E4E7EC', borderRadius: 1.5, p: 1.5 }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#6B7280', mb: 1.25 }}>{title}</Typography>
      <Stack gap={0.5}>
        {items.length ? (
          items.map((item, index) => (
            <ReturnExchangeItemRow
              key={`${item.id}-${index}`}
              imageUrl={item.image || ''}
              productName={item.productName}
              sku={item.skuCode}
              quantity={item.quantity}
              priceSnapshot={Math.max(getReturnLineUnitPrice(item), 0)}
            />
          ))
        ) : (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#98A2B3' }}>Không có dữ liệu sản phẩm.</Typography>
        )}
      </Stack>
    </Box>
  );
}

function MoneyRow({ label, value, emphasize = false }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
      <Typography
        sx={{
          ...(emphasize ? TYPOGRAPHY_STYLES.base.semibold : TYPOGRAPHY_STYLES.base.regular),
          color: emphasize ? '#101828' : '#6B7280',
          flex: 1,
          minWidth: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          ...(emphasize ? { ...TYPOGRAPHY_STYLES.base.bold, color: '#101828' } : { ...TYPOGRAPHY_STYLES.base.semibold }),
          flexShrink: 0,
          whiteSpace: 'nowrap',
          textAlign: 'right',
        }}
      >
        {formatCurrency(value)}&nbsp;₫
      </Typography>
    </Stack>
  );
}

function PriceDifferenceRow({ value }: { value: number }) {
  const formatted = value < 0 ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value);
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280', flex: 1, minWidth: 0 }}>Chênh lệch giá trị đổi/trả</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, flexShrink: 0, whiteSpace: 'nowrap', textAlign: 'right' }}>{formatted}&nbsp;₫</Typography>
    </Stack>
  );
}

export default ReturnExchangeDetailPage;
