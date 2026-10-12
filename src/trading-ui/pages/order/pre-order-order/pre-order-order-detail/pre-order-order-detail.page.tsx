import { CancelOutlined, CheckRounded, ContentCopyOutlined, CreditCardOutlined, EditOutlined, HistoryOutlined, MoreVert, PhoneOutlined, SendOutlined } from '@mui/icons-material';
import { Alert, Avatar, Box, Card, CardContent, Divider, InputAdornment, Link, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { preOrderOrderApi, type PreOrderOrderItem } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDateTime, getErrorMessage } from '../../../../common/utils';
import { formatCurrency, parseAmount } from '../../../../common/utils/number.utils';
import { CustomButton, PermissionIconButton } from '../../../../components/button';
import { DetailPageBackBar } from '../../../../components/page-header';
import { StatusPill } from '../../../../components/status-pill';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { usePermissionContext } from '@/permissions/use-permission-context.hook';
import { getPreOrderOrderUpdatePath, ROUTE_PATH } from '@/trading-ui/router/route.path';
import { CancelOrderDialog } from '../../components/cancel-order-dialog';
import { OrderAuditLogDrawer } from '../../audit-log/order-audit-log.drawer';
import { PAGE_PADDING_X } from '../../order-detail/order-detail-header.constants';
import { getOrderSourceLabel, getPaymentMethodDisplay } from '../../order-detail/order-detail.helpers';
import { OrderDetailErrorState, OrderDetailLoadingState } from '../../order-detail/parts/order-detail-loading-error.part';
import { getPreOrderOrderStatusLabel, PRE_ORDER_ORDER_STATUS_PILL_CONFIG } from '../pre-order-order.constants';
import { preOrderOrderButtonPermission } from '../pre-order-order-permission.constants';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';
import {
  canCancelPreOrderOrder,
  canEditPreOrderOrder,
  canInlineEditPreOrderPhone,
  canMovePreOrderOrderToAwaitingPayment,
  canResendPreOrderOrderZns,
  canSendPreOrderOrderZns,
  formatAwaitingPaymentCountdown,
  formatPreOrderAddress,
  getPreOrderCustomerDisplayName,
  getPreOrderCustomerEmail,
  mergePreOrderOrderItemsBySkuCode,
  normalizePreOrderOrderStatus,
} from '../pre-order-order.utils';
import { PreOrderOrderStatus } from '../../../../apis/pre-order-order';
import { StackRowAlignCenterJustBetween } from '@/trading-ui/adapters/library';

/** Đồng bộ với header chi tiết đơn hàng OMS (order-detail-header). */
const QUICK_ACTION_PRIMARY_SX = {
  height: 32,
  p: '4px 12px',
  borderRadius: '10px',
  bgcolor: '#2563EB',
  color: '#FFFFFF',
  ...TYPOGRAPHY_STYLES.base.medium,
  textTransform: 'none' as const,
  boxShadow: 'none',
  '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
};

const QUICK_ACTION_DANGER_SX = {
  ...QUICK_ACTION_PRIMARY_SX,
  p: '6px 12px',
  bgcolor: '#DC2626',
  '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
};

/** Mock UI: cam đặc rgba(251, 101, 20, 1) + chữ trắng. */
const QUICK_ACTION_AWAITING_PAYMENT_SX = {
  ...QUICK_ACTION_PRIMARY_SX,
  bgcolor: 'rgba(251, 101, 20, 1)',
  color: '#FFFFFF',
  borderColor: 'transparent',
  '&:hover': { bgcolor: 'rgba(230, 90, 16, 1)', boxShadow: 'none' },
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 }}>{label}</Typography>
    {children}
  </Box>
);

const MoneyRow = ({ label, value, emphasize, danger }: { label: string; value: string; emphasize?: boolean; danger?: boolean }) => (
  <Stack direction="row" justifyContent="space-between" gap={1.25} sx={{ mb: '6px' }}>
    <Typography sx={{ ...(emphasize ? TYPOGRAPHY_STYLES.base.semibold : TYPOGRAPHY_STYLES.base.regular), color: emphasize ? '#111827' : '#4A5565' }}>{label}</Typography>
    <Typography sx={{ ...(emphasize ? TYPOGRAPHY_STYLES.md.bold : TYPOGRAPHY_STYLES.base.regular), color: danger ? '#B42318' : '#101828' }}>{value}</Typography>
  </Stack>
);

const resolveItemSalePrice = (item: PreOrderOrderItem): number => {
  const fromDisplay = item.customerDisplayPrice?.sellingPriceAfterTaxMinor;
  if (typeof fromDisplay === 'number') return fromDisplay / 100;
  return parseAmount(item.salePrice ?? item.unitPrice);
};

const resolveItemComparePrice = (item: PreOrderOrderItem): number | null => {
  const fromDisplay = item.customerDisplayPrice?.compareAtPriceAfterTaxMinor;
  if (typeof fromDisplay === 'number') return fromDisplay / 100;
  const unit = parseAmount(item.unitPrice);
  const sale = parseAmount(item.salePrice);
  if (unit > 0 && sale > 0 && unit !== sale) return unit;
  return null;
};

const PreOrderOrderDetailPage = () => {
  const { preOrderId = '' } = useParams<{ preOrderId: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { hasApiAccess } = usePermissionContext();
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState('');
  const [phoneEditing, setPhoneEditing] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  /** Link đơn hàng hiển thị sau khi Admin chuyển thủ công sang Chờ thanh toán */
  const [manualAwaitingLink, setManualAwaitingLink] = useState<string | null>(null);

  const detailSwr = useSWR(preOrderId ? (['pre-order-order-detail', preOrderId] as const) : null, () => preOrderOrderApi.getPreOrderOrderDetail(preOrderId), {
    revalidateOnFocus: false,
  });

  const order = detailSwr.data;

  const status = normalizePreOrderOrderStatus(order?.status);
  const showSendZns = canSendPreOrderOrderZns(order?.status, order?.znsRetryCount);
  const showResendZns = canResendPreOrderOrderZns(order?.status, order?.znsRetryCount);
  const showCancel = canCancelPreOrderOrder(order?.status);
  const showMoveAwaiting = canMovePreOrderOrderToAwaitingPayment(order?.status, order?.znsRetryCount);
  const showEdit = canEditPreOrderOrder(order?.status);
  const showPhoneEdit = canInlineEditPreOrderPhone(order?.status);

  const MAX_ZNS_RETRY = 3;
  const znsRetryCount = order?.znsRetryCount ?? 0;
  const znsRetryExhausted = znsRetryCount >= MAX_ZNS_RETRY;

  const canSendZns = showSendZns && hasApiAccess('api_pre_order_order_send_zns');
  const canResendZns = showResendZns && hasApiAccess('api_pre_order_order_resend_zns');
  const canMoveAwaiting = showMoveAwaiting && hasApiAccess('api_pre_order_order_move_awaiting_payment');
  const canCancel = showCancel && hasApiAccess('api_pre_order_order_cancel');
  const canOpenEdit = showEdit && hasApiAccess('api_pre_order_order_update');
  const canEditPhone = showPhoneEdit && hasApiAccess('api_pre_order_order_update');
  const hasQuickActions = canSendZns || canResendZns || canMoveAwaiting || canCancel;

  const shouldShowAwaitingCountdown = status === PreOrderOrderStatus.AWAITING_PAYMENT && Boolean(order?.awaitingPaymentExpiresAt);
  const [countdownNowMs, setCountdownNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!shouldShowAwaitingCountdown) return;
    setCountdownNowMs(Date.now());
    const timerId = window.setInterval(() => {
      setCountdownNowMs(Date.now());
    }, 1_000);
    return () => window.clearInterval(timerId);
  }, [shouldShowAwaitingCountdown, order?.awaitingPaymentExpiresAt]);

  const awaitingCountdown = useMemo(() => {
    if (!shouldShowAwaitingCountdown) return null;
    return formatAwaitingPaymentCountdown(order?.awaitingPaymentExpiresAt, countdownNowMs);
  }, [countdownNowMs, order?.awaitingPaymentExpiresAt, shouldShowAwaitingCountdown]);

  const isAwaitingExpired = awaitingCountdown === 'Đã hết hạn';

  const displayItems = useMemo(() => mergePreOrderOrderItemsBySkuCode(order?.items ?? []), [order?.items]);

  const subtotal = parseAmount(order?.subtotal);
  const discount = parseAmount(order?.discountTotal);
  const ship = parseAmount(order?.shippingFee);
  const grand = parseAmount(order?.grandTotal);

  const handleCopy = useCallback(
    async (value: string, successMessage: string) => {
      try {
        await navigator.clipboard.writeText(value);
        showSnackbar({ type: SnackbarType.SUCCESS, message: successMessage });
      } catch {
        showSnackbar({ type: SnackbarType.ERROR, message: 'Không thể sao chép' });
      }
    },
    [showSnackbar],
  );

  const runAction = useCallback(
    async (action: () => Promise<unknown>, successMessage: string) => {
      setActionSubmitting(true);
      try {
        await action();
        showSnackbar({ type: SnackbarType.SUCCESS, message: successMessage });
        await detailSwr.mutate();
      } catch (error) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      } finally {
        setActionSubmitting(false);
      }
    },
    [detailSwr, showSnackbar],
  );

  const VN_PHONE_REGEX = /^(0[3|5|7|8|9])[0-9]{8}$/;

  const handleSavePhone = useCallback(async () => {
    if (!order) return;
    const trimmed = phoneDraft.trim();
    if (!trimmed) {
      setPhoneError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!VN_PHONE_REGEX.test(trimmed)) {
      setPhoneError('SĐT phải đúng định dạng 10 số di động Việt Nam (03x, 05x, 07x, 08x, 09x)');
      return;
    }
    setPhoneError('');
    setPhoneSaving(true);
    try {
      await preOrderOrderApi.updatePreOrderOrderReceiverPhone(order.id, { phone: trimmed });
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã cập nhật số điện thoại' });
      setPhoneEditing(false);
      await detailSwr.mutate();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setPhoneSaving(false);
    }
  }, [detailSwr, order, phoneDraft, showSnackbar]);

  if (detailSwr.isLoading) return <OrderDetailLoadingState />;
  if (detailSwr.error || !order) {
    return <OrderDetailErrorState message={getErrorMessage(detailSwr.error) || 'Không tìm thấy đơn đặt trước'} onBackToList={() => navigate(ROUTE_PATH.PRE_ORDER_ORDER)} />;
  }

  const customerPhone = order.customerPhone || order.shippingAddressSnapshot?.receiverPhone || '';
  const customerAddress = formatPreOrderAddress([order.shippingAddressSnapshot?.addressLine, order.shippingAddressSnapshot?.wardName, order.shippingAddressSnapshot?.provinceName]);
  const warehouseAddress = formatPreOrderAddress([
    order.warehouseSnapshot?.warehouseName,
    order.warehouseSnapshot?.addressLine,
    order.warehouseSnapshot?.wardName,
    order.warehouseSnapshot?.provinceName,
  ]);
  const timeline = [...(order.statusHistory ?? [])].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  const statusKey = status ?? PreOrderOrderStatus.PRE_ORDERED;

  return (
    <>
      <Box sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ overflow: 'hidden', border: '1px solid #EAECF0', bgcolor: '#FFFFFF', boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)' }}>
          <StackRowAlignCenterJustBetween sx={{ px: PAGE_PADDING_X, py: 1.5, gap: 1, borderBottom: '1px solid #E5E7EB' }}>
            <DetailPageBackBar
              label="Quay lại danh sách"
              onBack={() => navigate(ROUTE_PATH.PRE_ORDER_ORDER)}
              barSx={{ px: 0, py: 0, borderBottom: 'none' }}
              {...preOrderOrderButtonPermission('view', 'Quay lại danh sách đơn đặt trước', 'api_pre_order_order_list')}
            />
            <PermissionIconButton
              onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              {...preOrderOrderButtonPermission('open_detail', 'Thêm thao tác đơn đặt trước', 'api_pre_order_order_detail')}
              sx={{ color: '#667085', border: '1px solid #E5E7EB', borderRadius: 2 }}
            >
              <MoreVert />
            </PermissionIconButton>
          </StackRowAlignCenterJustBetween>

          <StackRowAlignCenterJustBetween sx={{ px: PAGE_PADDING_X, pt: { xs: 1.75, md: 1.5 }, pb: { xs: 2, md: 1.75 }, alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
                <Typography component="h1" sx={{ ...TYPOGRAPHY_STYLES['2xl'].bold, color: '#101828' }}>
                  Đơn hàng {order.preOrderCode}
                </Typography>
                <PermissionIconButton
                  size="small"
                  onClick={() => void handleCopy(order.preOrderCode, 'Đã sao chép mã đơn')}
                  aria-label="Sao chép mã đơn"
                  sx={{ width: 30, height: 30, color: '#98A2B3', '&:hover': { bgcolor: '#F2F4F7', color: '#4A5565' } }}
                >
                  <ContentCopyOutlined sx={{ fontSize: 16 }} />
                </PermissionIconButton>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mt: 0.25 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>
                  Tạo lúc {formatDateTime(order.createdAt)}
                  {order.source ? ` • ${getOrderSourceLabel(order.source as never)}` : ''}
                </Typography>
                {awaitingCountdown ? (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: isAwaitingExpired ? '#FEF3F2' : '#FFFAEB',
                      border: `1px solid ${isAwaitingExpired ? '#FECDCA' : '#FEDF89'}`,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        ...TYPOGRAPHY_STYLES.sm.semibold,
                        color: isAwaitingExpired ? '#B42318' : '#B54708',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {isAwaitingExpired ? awaitingCountdown : `Còn ${awaitingCountdown}`}
                    </Typography>
                  </Box>
                ) : null}
              </Stack>
            </Box>

            <StatusPill status={statusKey} config={PRE_ORDER_ORDER_STATUS_PILL_CONFIG} label={getPreOrderOrderStatusLabel(order.status)} />
          </StackRowAlignCenterJustBetween>

          {manualAwaitingLink ? (
            <Alert
              severity="info"
              sx={{ borderRadius: 0, borderTop: '1px solid #BAE6FD' }}
              action={
                <Tooltip title="Copy link">
                  <span>
                    <PermissionIconButton size="small" onClick={() => void handleCopy(manualAwaitingLink, 'Đã sao chép link đơn hàng')} sx={{ color: '#0284C7' }}>
                      <ContentCopyOutlined sx={{ fontSize: 16 }} />
                    </PermissionIconButton>
                  </span>
                </Tooltip>
              }
            >
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium }}>
                Link đơn hàng gửi khách:{' '}
                <Link href={manualAwaitingLink} target="_blank" rel="noopener noreferrer" sx={{ ...TYPOGRAPHY_STYLES.sm.medium }}>
                  {manualAwaitingLink}
                </Link>
              </Typography>
            </Alert>
          ) : null}

          {hasQuickActions ? (
            <Box sx={{ px: PAGE_PADDING_X, py: 1.5, bgcolor: '#EEF4FF', borderTop: '1px solid #EAECF0' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} gap={1.25}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#1C398E', whiteSpace: 'nowrap' }}>Thao tác nhanh:</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {canSendZns ? (
                    <CustomButton
                      fullWidth={false}
                      variant="primary"
                      startIcon={<SendOutlined sx={{ fontSize: 18 }} />}
                      disabled={actionSubmitting}
                      onClick={() => void runAction(() => preOrderOrderApi.sendPreOrderOrderZns(order.id), 'Đã gửi ZNS')}
                      sx={QUICK_ACTION_PRIMARY_SX}
                      {...preOrderOrderButtonPermission('send_zns', 'Gửi ZNS đơn đặt trước', 'api_pre_order_order_send_zns')}
                    >
                      Gửi ZNS
                    </CustomButton>
                  ) : null}
                  {canResendZns ? (
                    <Tooltip title={znsRetryExhausted ? `Đã vượt quá ${MAX_ZNS_RETRY} lần gửi lại. Dùng nút "Chuyển chờ thanh toán".` : `Đã gửi lại ${znsRetryCount}/${MAX_ZNS_RETRY} lần`}>
                      <span>
                        <CustomButton
                          fullWidth={false}
                          variant="primary"
                          startIcon={<SendOutlined sx={{ fontSize: 18 }} />}
                          disabled={actionSubmitting || znsRetryExhausted}
                          onClick={() => void runAction(() => preOrderOrderApi.resendPreOrderOrderZns(order.id), 'Đã gửi lại ZNS')}
                          sx={{ ...QUICK_ACTION_PRIMARY_SX, ...(znsRetryExhausted ? { opacity: 0.4, pointerEvents: 'none' } : {}) }}
                          {...preOrderOrderButtonPermission('resend_zns', 'Gửi lại ZNS đơn đặt trước', 'api_pre_order_order_resend_zns')}
                        >
                          Gửi lại ZNS {znsRetryCount > 0 ? `(${znsRetryCount}/${MAX_ZNS_RETRY})` : ''}
                        </CustomButton>
                      </span>
                    </Tooltip>
                  ) : null}
                  {canMoveAwaiting ? (
                    <CustomButton
                      fullWidth={false}
                      variant="primary"
                      startIcon={<CreditCardOutlined sx={{ fontSize: 18 }} />}
                      disabled={actionSubmitting}
                      onClick={() =>
                        void runAction(() => preOrderOrderApi.movePreOrderOrderToAwaitingPayment(order.id), 'Đã chuyển chờ thanh toán').then(() => {
                          const link = order.websiteOrderUrl ?? '';
                          if (link) setManualAwaitingLink(link);
                        })
                      }
                      sx={QUICK_ACTION_AWAITING_PAYMENT_SX}
                      {...preOrderOrderButtonPermission('move_awaiting_payment', 'Chuyển chờ thanh toán đơn đặt trước', 'api_pre_order_order_move_awaiting_payment')}
                    >
                      Chuyển chờ thanh toán
                    </CustomButton>
                  ) : null}
                  {canCancel ? (
                    <CustomButton
                      fullWidth={false}
                      variant="primary"
                      startIcon={<CancelOutlined sx={{ fontSize: 18 }} />}
                      disabled={actionSubmitting}
                      onClick={() => setCancelOpen(true)}
                      sx={QUICK_ACTION_DANGER_SX}
                      {...preOrderOrderButtonPermission('cancel', 'Hủy đơn đặt trước', 'api_pre_order_order_cancel')}
                    >
                      Hủy đơn
                    </CustomButton>
                  ) : null}
                </Stack>
              </Stack>
            </Box>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ pb: 3, px: PAGE_PADDING_X, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ flex: '1 1 auto', minWidth: 0, width: { xs: '100%', lg: 'auto' } }}>
          <Stack gap={2}>
            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
              <CardContent>
                <StackRowAlignCenterJustBetween gap={1} sx={{ mb: 2 }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#111827' }}>Thông tin khách hàng</Typography>
                  <CustomButton
                    variant="outline"
                    fullWidth={false}
                    size="small"
                    startIcon={<PhoneOutlined sx={{ fontSize: 18 }} />}
                    component={customerPhone ? Link : 'span'}
                    href={customerPhone ? `tel:${customerPhone}` : undefined}
                    disabled={!customerPhone}
                    sx={{ minWidth: 'auto', px: 1.5, borderColor: '#2563EB', color: '#2563EB', borderRadius: 2 }}
                  >
                    Gọi ngay
                  </CustomButton>
                </StackRowAlignCenterJustBetween>
                <Stack gap={1.5}>
                  <Field label="Họ tên">
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{getPreOrderCustomerDisplayName(order)}</Typography>
                  </Field>
                  <Field label="Email">
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{getPreOrderCustomerEmail(order)}</Typography>
                  </Field>
                  <Field label="Địa chỉ kho giao/nhận">
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{warehouseAddress}</Typography>
                  </Field>
                  <Field label="Địa chỉ khách hàng">
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{customerAddress}</Typography>
                  </Field>
                  <Field label="Số điện thoại">
                    {canEditPhone && phoneEditing ? (
                      <Stack gap={0.5}>
                        <Stack direction="row" gap={1} alignItems="flex-start">
                          <TextField
                            size="small"
                            value={phoneDraft}
                            onChange={(e) => {
                              setPhoneDraft(e.target.value);
                              if (phoneError) setPhoneError('');
                            }}
                            error={Boolean(phoneError)}
                            placeholder="09xxxxxxxx"
                            inputProps={{ maxLength: 10 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneOutlined sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ maxWidth: 240 }}
                          />
                          <CustomButton
                            fullWidth={false}
                            variant="primary"
                            disabled={phoneSaving}
                            onClick={() => void handleSavePhone()}
                            sx={{ height: 36, borderRadius: '8px' }}
                            {...preOrderOrderButtonPermission('edit', 'Lưu SĐT đơn đặt trước', 'api_pre_order_order_update')}
                          >
                            Lưu
                          </CustomButton>
                          <CustomButton
                            fullWidth={false}
                            variant="outline"
                            disabled={phoneSaving}
                            onClick={() => {
                              setPhoneEditing(false);
                              setPhoneError('');
                            }}
                            sx={{ height: 36, borderRadius: '8px' }}
                          >
                            Hủy
                          </CustomButton>
                        </Stack>
                        {phoneError ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#DC2626' }}>{phoneError}</Typography> : null}
                      </Stack>
                    ) : (
                      <Stack direction="row" gap={1} alignItems="center">
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{customerPhone || '—'}</Typography>
                        {canEditPhone ? (
                          <CustomButton
                            fullWidth={false}
                            variant="outline"
                            size="small"
                            onClick={() => {
                              setPhoneDraft(customerPhone);
                              setPhoneEditing(true);
                            }}
                            sx={{ height: 32, borderRadius: '8px' }}
                            {...preOrderOrderButtonPermission('edit', 'Sửa SĐT đơn đặt trước', 'api_pre_order_order_update')}
                          >
                            Sửa SĐT
                          </CustomButton>
                        ) : null}
                      </Stack>
                    )}
                  </Field>
                </Stack>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
              <CardContent>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#111827', mb: 2 }}>Danh sách sản phẩm</Typography>
                <Stack divider={<Divider flexItem />}>
                  {displayItems.map((item) => {
                    const sale = resolveItemSalePrice(item);
                    const compare = resolveItemComparePrice(item);
                    const lineTotal = parseAmount(item.lineTotal) || sale * item.quantity;
                    return (
                      <Stack key={item.id} direction="row" gap={1.5} alignItems="flex-start" sx={{ py: 1.25 }}>
                        <Avatar variant="rounded" src={item.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC} sx={{ width: 64, height: 64, bgcolor: '#F3F4F6' }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{item.productName}</Typography>
                          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>{item.skuCode}</Typography>
                          <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#111827' }}>{formatCurrency(sale)} đ</Typography>
                            {compare != null && compare > sale ? (
                              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#9CA3AF', textDecoration: 'line-through' }}>{formatCurrency(compare)} đ</Typography>
                            ) : null}
                          </Stack>
                        </Box>
                        <Stack alignItems="flex-end" gap={0.5}>
                          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>SL: {item.quantity}</Typography>
                          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{formatCurrency(lineTotal)} đ</Typography>
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <MoneyRow label="Tạm tính" value={`${formatCurrency(subtotal)} đ`} />
                {discount > 0 ? <MoneyRow label={order.discountCode ? `Giảm giá (${order.discountCode})` : 'Giảm giá'} value={`-${formatCurrency(discount)} đ`} danger /> : null}
                <MoneyRow label="Phí vận chuyển" value={`${formatCurrency(ship)} đ`} />
                <MoneyRow label="Tổng thanh toán" value={`${formatCurrency(grand)} đ`} emphasize />
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
              <CardContent>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#111827', mb: 2 }}>Thông tin vận chuyển</Typography>
                <Stack gap={1.25}>
                  <Field label="Đơn vị vận chuyển">
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{order.shippingCarrier || '—'}</Typography>
                  </Field>
                  <Field label="Hình thức giao hàng">
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{order.carrierServiceName || order.shippingMethod || '—'}</Typography>
                  </Field>
                </Stack>
              </CardContent>
            </Card>

            {order.customerNote ? (
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <CardContent>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#111827', mb: 1 }}>Ghi chú khách hàng</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#374151' }}>{order.customerNote}</Typography>
                </CardContent>
              </Card>
            ) : null}
          </Stack>
        </Box>

        <Box sx={{ width: { xs: '100%', lg: 400 }, minWidth: { lg: 400 }, maxWidth: { lg: 400 }, flexShrink: 0 }} ref={timelineRef}>
          <Stack gap={2}>
            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
              <CardContent>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#111827', mb: 2 }}>Thông tin đơn hàng</Typography>
                <Stack gap={1.25}>
                  <Field label="Loại đơn">
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>Hàng đặt trước</Typography>
                  </Field>
                  <Field label="Mã đơn OMS">
                    {order.omsOrderCode ? (
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#155DFC' }}>{order.omsOrderCode}</Typography>
                        <PermissionIconButton size="small" onClick={() => void handleCopy(order.omsOrderCode!, 'Đã sao chép mã OMS')} sx={{ color: '#155DFC' }}>
                          <ContentCopyOutlined sx={{ fontSize: 16 }} />
                        </PermissionIconButton>
                      </Stack>
                    ) : (
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>—</Typography>
                    )}
                  </Field>
                  <Field label="Thời gian dự kiến bán hàng">
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{order.expectedStockAt ? formatDateTime(order.expectedStockAt) : '—'}</Typography>
                  </Field>
                  {order.paymentMethod ? (
                    <Field label="Phương thức thanh toán">
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{getPaymentMethodDisplay(order.paymentMethod)}</Typography>
                    </Field>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
              <CardContent>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#1F2937', mb: 2 }}>Timeline xử lý</Typography>
                <Stack gap={0}>
                  {timeline.length === 0 ? (
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#9CA3AF' }}>Chưa có lịch sử xử lý</Typography>
                  ) : (
                    timeline.map((step, index) => (
                      <Stack key={step.id} direction="row" alignItems="flex-start" gap={1.5} sx={{ position: 'relative', pb: 3 }}>
                        <Stack alignItems="center" sx={{ minWidth: 34, position: 'relative', alignSelf: 'stretch' }}>
                          {index < timeline.length - 1 ? <Box sx={{ position: 'absolute', left: '50%', top: 34, bottom: -24, width: 2, transform: 'translateX(-50%)', bgcolor: '#EAECF0' }} /> : null}
                          <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckRounded sx={{ fontSize: 20, color: '#00A63E' }} />
                          </Box>
                        </Stack>
                        <Stack sx={{ flex: 1, pt: 0.5, minWidth: 0 }} gap={0.25}>
                          <Stack direction="row" justifyContent="space-between" gap={1}>
                            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#1F2937' }}>{step.title || getPreOrderOrderStatusLabel(step.status) || 'Cập nhật trạng thái'}</Typography>
                            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282', whiteSpace: 'nowrap' }}>{formatDateTime(step.createdAt)}</Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>

      <Menu anchorEl={moreMenuAnchor} open={Boolean(moreMenuAnchor)} onClose={() => setMoreMenuAnchor(null)}>
        {canOpenEdit ? (
          <MenuItem
            onClick={() => {
              setMoreMenuAnchor(null);
              navigate(getPreOrderOrderUpdatePath(order.id));
            }}
          >
            <EditOutlined sx={{ fontSize: 18, mr: 1, color: '#6B7280' }} />
            Chỉnh sửa
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={() => {
            setMoreMenuAnchor(null);
            setAuditDrawerOpen(true);
          }}
        >
          <HistoryOutlined sx={{ fontSize: 18, mr: 1, color: '#6B7280' }} />
          Lịch sử thao tác
        </MenuItem>
      </Menu>

      <OrderAuditLogDrawer open={auditDrawerOpen} orderId={order.id} onClose={() => setAuditDrawerOpen(false)} />

      <CancelOrderDialog
        open={cancelOpen}
        orderCode={order.preOrderCode}
        title="Huỷ đơn đặt trước"
        description="Hành động này không thể hoàn tác. Vui lòng chọn lý do hủy đơn."
        confirmLabel="Xác nhận hủy"
        submitting={actionSubmitting}
        onClose={() => setCancelOpen(false)}
        onConfirm={(payload) => {
          void runAction(() => preOrderOrderApi.cancelPreOrderOrder(order.id, payload), 'Đã hủy đơn đặt trước').then(() => setCancelOpen(false));
        }}
      />
    </>
  );
};

export default PreOrderOrderDetailPage;
