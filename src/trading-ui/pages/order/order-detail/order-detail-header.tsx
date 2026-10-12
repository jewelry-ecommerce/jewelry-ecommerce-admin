 
import { Cancel, ContentCopy, LocalShipping, MoreVert } from '@mui/icons-material';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { CheckCircleBroken } from '@untitledui/icons';
import type { MouseEvent, ReactNode } from 'react';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '@/trading-ui/adapters/library';
import { OrderStatus, type PaymentStatus } from '../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { getPaymentStatusChipSx } from '../../../common/utils/payment-status-chip.utils';
import type { PageButtonPermissionProps } from '../../../permissions/page-button-permission.utils';
import { CustomButton, PermissionIconButton } from '../../../components/button';
import { DetailPageBackBar } from '../../../components/page-header';
import { type getOrderActionVisibility, type OrderErrorLogEntry } from './order-detail.helpers';
import { PAGE_PADDING_X } from './order-detail-header.constants';
import { HeaderBlockingAlert } from './parts/order-detail-header-blocking-alert.part';

type Visibility = ReturnType<typeof getOrderActionVisibility>;

type StatusChipPalette = { bgcolor: string; color: string; borderColor: string };

const DEFAULT_ORDER_STATUS_CHIP: StatusChipPalette = { bgcolor: '#FFFAEB', color: '#B54708', borderColor: '#FEDF89' };

/** Màu chip trạng thái đơn trên header; trạng thái chưa khai báo giữ màu vàng mặc định. */
const ORDER_STATUS_CHIP: Partial<Record<OrderStatus, StatusChipPalette>> = {
  [OrderStatus.COMPLETED]: { bgcolor: '#ECFDF3', color: '#027A48', borderColor: '#ABEFC6' },
  [OrderStatus.DELIVERED]: { bgcolor: '#ECFDF3', color: '#027A48', borderColor: '#ABEFC6' },
  [OrderStatus.CANCELLED]: { bgcolor: '#F2F4F7', color: '#475467', borderColor: '#EAECF0' },
  [OrderStatus.REFUNDED]: { bgcolor: '#F2F4F7', color: '#475467', borderColor: '#EAECF0' },
  [OrderStatus.RETURNED]: { bgcolor: '#F2F4F7', color: '#475467', borderColor: '#EAECF0' },
  [OrderStatus.DELIVERY_FAILED]: { bgcolor: '#FEF3F2', color: '#B42318', borderColor: '#FECDCA' },
  [OrderStatus.CONFIRMED]: { bgcolor: '#EFF8FF', color: '#175CD3', borderColor: '#B2DDFF' },
  [OrderStatus.PICKING]: { bgcolor: '#EFF8FF', color: '#175CD3', borderColor: '#B2DDFF' },
  [OrderStatus.PACKED]: { bgcolor: '#EFF8FF', color: '#175CD3', borderColor: '#B2DDFF' },
  [OrderStatus.SHIPPING]: { bgcolor: '#EFF8FF', color: '#175CD3', borderColor: '#B2DDFF' },
  [OrderStatus.IN_TRANSIT]: { bgcolor: '#EFF8FF', color: '#175CD3', borderColor: '#B2DDFF' },
};

export type OrderDetailHeaderProps = {
  additionalActions?: ReactNode;
  orderCode: string;
  headerTitlePrefix?: string;
  createdAtLabel: string;
  sourceLabel: string;
  orderStatusLabel: string;
  /** Có thì chip trạng thái đơn đổi màu theo trạng thái; không có thì giữ màu vàng. */
  orderStatus?: OrderStatus;
  payLabel: string;
  paymentStatus: PaymentStatus;
  /** Ẩn chip trạng thái thanh toán (trang đã hiện trạng thái ở thẻ thanh toán). */
  hidePaymentStatusChip?: boolean;
  visibility: Visibility;
  blockingErrorEntries?: OrderErrorLogEntry[];
  showCreateReturnExchange: boolean;
  onBack: () => void;
  onCopyOrderCode: () => void;
  onOpenMoreMenu: (event: MouseEvent<HTMLElement>) => void;
  onConfirmPayment?: () => void;
  showCheckPayment?: boolean;
  checkPaymentSubmitting?: boolean;
  onCheckPayment?: () => void;
  showRetryPayment?: boolean;
  retryPaymentSubmitting?: boolean;
  onRetryPayment?: () => void;
  showCreateRefund?: boolean;
  createRefundSubmitting?: boolean;
  onCreateRefund?: () => void;
  onDispatchOrder?: () => void;
  dispatchOrderSubmitting?: boolean;
  onCodShortfall: () => void;
  onCancelOrder: () => void;
  quickActionLabels?: { dispatchOrder?: string; confirmPayment?: string; cancelOrder?: string };
  hideHeaderStatusChips?: boolean;
  showMoreMenuButton?: boolean;
  backPermission?: PageButtonPermissionProps;
  copyPermission?: PageButtonPermissionProps;
  moreMenuPermission?: PageButtonPermissionProps;
  confirmPermission?: PageButtonPermissionProps;
  cancelPermission?: PageButtonPermissionProps;
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function HeaderOrderInfo(props: {
  orderCode: string;
  headerTitlePrefix?: string;
  createdAtLabel: string;
  sourceLabel: string;
  orderStatusLabel: string;
  orderStatus?: OrderStatus;
  payLabel: string;
  paymentStatus: PaymentStatus;
  hidePaymentStatusChip?: boolean;
  onCopyOrderCode: () => void;
  onOpenMoreMenu: (e: MouseEvent<HTMLElement>) => void;
  showMoreMenuButton: boolean;
  hideHeaderStatusChips?: boolean;
  copyPermission?: Partial<PageButtonPermissionProps>;
  moreMenuPermission?: Partial<PageButtonPermissionProps>;
}) {
  const {
    orderCode,
    headerTitlePrefix,
    createdAtLabel,
    sourceLabel,
    orderStatusLabel,
    orderStatus,
    payLabel,
    paymentStatus,
    hidePaymentStatusChip,
    onCopyOrderCode,
    onOpenMoreMenu,
    showMoreMenuButton,
    hideHeaderStatusChips,
    copyPermission,
    moreMenuPermission,
  } = props;
  const statusChip = (orderStatus && ORDER_STATUS_CHIP[orderStatus]) || DEFAULT_ORDER_STATUS_CHIP;

  return (
    <StackRowAlignCenterJustBetween>
      <Box sx={{ minWidth: 0 }}>
        <StackRowAlignCenter spacing={0.5} flexWrap="wrap">
          <Typography component="h1" sx={{ color: '#101828', ...TYPOGRAPHY_STYLES['2xl'].bold }}>
            {headerTitlePrefix ?? 'Đơn hàng'} {orderCode}
          </Typography>
          <PermissionIconButton
            size="small"
            onClick={onCopyOrderCode}
            aria-label="Sao chép mã đơn"
            {...copyPermission}
            sx={{ width: 30, height: 30, color: '#98A2B3', '&:hover': { bgcolor: '#F2F4F7', color: '#4A5565' } }}
          >
            <ContentCopy sx={{ fontSize: 16 }} />
          </PermissionIconButton>
        </StackRowAlignCenter>
        <Typography sx={{ mt: 0.25, color: '#6B7280', ...TYPOGRAPHY_STYLES.base.regular }}>
          Tạo lúc {createdAtLabel} • {sourceLabel}
        </Typography>
      </Box>
      <StackRowAlignCenter spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
        {hideHeaderStatusChips ? null : (
          <>
            <Chip
              label={orderStatusLabel}
              size="small"
              sx={{
                height: 28,
                borderRadius: '999px',
                bgcolor: statusChip.bgcolor,
                color: statusChip.color,
                border: `1px solid ${statusChip.borderColor}`,
                ...TYPOGRAPHY_STYLES.sm.medium,
                '& .MuiChip-label': { px: 1.25 },
              }}
            />
            {hidePaymentStatusChip ? null : (
              <Chip
                label={payLabel}
                size="small"
                sx={{
                  height: 28,
                  borderRadius: '999px',
                  ...getPaymentStatusChipSx(paymentStatus),
                  ...TYPOGRAPHY_STYLES.sm.medium,
                  '& .MuiChip-label': { px: 1.25 },
                }}
              />
            )}
          </>
        )}
        {showMoreMenuButton ? (
          <PermissionIconButton
            size="small"
            onClick={onOpenMoreMenu}
            aria-label="Thao tác khác"
            {...moreMenuPermission}
            sx={{
              width: 36,
              height: 36,
              border: '1px solid #D0D5DD',
              borderRadius: '10px',
              color: '#344054',
              bgcolor: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
              '&:hover': { bgcolor: '#F9FAFB', borderColor: '#98A2B3' },
            }}
          >
            <MoreVert sx={{ fontSize: 20 }} />
          </PermissionIconButton>
        ) : null}
      </StackRowAlignCenter>
    </StackRowAlignCenterJustBetween>
  );
}

const QUICK_BTN_SX = {
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

function HeaderQuickActions(props: {
  visibility: Visibility;
  blockingErrorEntries?: OrderErrorLogEntry[];
  showCheckPayment?: boolean;
  checkPaymentSubmitting?: boolean;
  onCheckPayment?: () => void;
  showRetryPayment?: boolean;
  retryPaymentSubmitting?: boolean;
  onRetryPayment?: () => void;
  showCreateRefund?: boolean;
  createRefundSubmitting?: boolean;
  onCreateRefund?: () => void;
  onDispatchOrder?: () => void;
  dispatchOrderSubmitting?: boolean;
  onConfirmPayment?: () => void;
  onCancelOrder: () => void;
  quickActionLabels?: { dispatchOrder?: string; confirmPayment?: string; cancelOrder?: string };
  confirmPermission?: Partial<PageButtonPermissionProps>;
  cancelPermission?: Partial<PageButtonPermissionProps>;
}) {
  const {
    visibility: v,
    blockingErrorEntries,
    showCheckPayment = false,
    checkPaymentSubmitting = false,
    onCheckPayment,
    showRetryPayment = false,
    retryPaymentSubmitting = false,
    onRetryPayment,
    showCreateRefund = false,
    createRefundSubmitting = false,
    onCreateRefund,
    onDispatchOrder,
    dispatchOrderSubmitting = false,
    onConfirmPayment = () => {},
    onCancelOrder = () => {},
    quickActionLabels,
    confirmPermission,
    cancelPermission,
  } = props;
  const showDispatchOrder = Boolean(onDispatchOrder) && v.showConfirmOrder && (blockingErrorEntries?.length ?? 0) === 0;

  if (!showDispatchOrder && !v.showConfirmPayment && !showCheckPayment && !showRetryPayment && !showCreateRefund && !v.showCodShortfall && !v.showCancelOrder) {
    return null;
  }
  return (
    <Box sx={{ px: PAGE_PADDING_X, py: 1.5, bgcolor: '#EEF4FF', borderTop: '1px solid #EAECF0' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} gap={1.25}>
        <Typography sx={{ color: '#1C398E', ...TYPOGRAPHY_STYLES.base.medium, whiteSpace: 'nowrap' }}>Thao tác nhanh:</Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {showDispatchOrder ? (
            <CustomButton
              fullWidth={false}
              variant="primary"
              startIcon={<LocalShipping sx={{ fontSize: 18 }} />}
              onClick={onDispatchOrder}
              disabled={dispatchOrderSubmitting}
              menuCode="order"
              tabCode="list"
              actionCode="ship"
              actionLabel="Gửi lệnh giao hàng"
              apiCode="api_order_ship"
              unauthorizedMode="hide"
              sx={QUICK_BTN_SX}
            >
              {quickActionLabels?.dispatchOrder || 'Gửi lệnh giao hàng'}
            </CustomButton>
          ) : null}
          {showCheckPayment ? (
            <CustomButton
              fullWidth={false}
              variant="primary"
              startIcon={<CheckCircleBroken size={18} />}
              onClick={onCheckPayment}
              disabled={checkPaymentSubmitting || !onCheckPayment}
              menuCode="order"
              tabCode="list"
              actionCode="check_paid"
              actionLabel="Đối soát thanh toán"
              apiCode="api_order_check_paid"
              unauthorizedMode="hide"
              sx={QUICK_BTN_SX}
            >
              Đối soát thanh toán
            </CustomButton>
          ) : null}
          {showRetryPayment ? (
            <CustomButton
              fullWidth={false}
              variant="primary"
              onClick={onRetryPayment}
              disabled={retryPaymentSubmitting || !onRetryPayment}
              menuCode="order"
              tabCode="list"
              actionCode="retry_payment"
              actionLabel="Thanh toán lại"
              apiCode={['api_order_payment_status', 'api_order_retry_payment']}
              unauthorizedMode="hide"
              sx={QUICK_BTN_SX}
            >
              Thanh toán lại
            </CustomButton>
          ) : null}
          {showCreateRefund ? (
            <CustomButton
              fullWidth={false}
              variant="primary"
              onClick={onCreateRefund}
              disabled={createRefundSubmitting || !onCreateRefund}
              menuCode="order"
              tabCode="refunds"
              actionCode="create"
              actionLabel="Hoàn tiền"
              apiCode="api_refund_proposal_create"
              unauthorizedMode="hide"
              sx={QUICK_BTN_SX}
            >
              Hoàn tiền
            </CustomButton>
          ) : null}
          {v.showConfirmPayment ? (
            <CustomButton fullWidth={false} variant="primary" startIcon={<CheckCircleBroken size={18} />} onClick={onConfirmPayment} {...confirmPermission} unauthorizedMode="hide" sx={QUICK_BTN_SX}>
              {quickActionLabels?.confirmPayment}
            </CustomButton>
          ) : null}
          {v.showCancelOrder ? (
            <CustomButton
              fullWidth={false}
              variant="primary"
              startIcon={<Cancel sx={{ fontSize: 18 }} />}
              onClick={onCancelOrder}
              {...cancelPermission}
              unauthorizedMode="hide"
              sx={{
                ...QUICK_BTN_SX,
                p: '6px 12px',
                bgcolor: '#DC2626',
                '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
              }}
            >
              {quickActionLabels?.cancelOrder || 'Hủy đơn'}
            </CustomButton>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function OrderDetailHeader(props: OrderDetailHeaderProps) {
  const {
    orderCode,
    headerTitlePrefix,
    createdAtLabel,
    sourceLabel,
    orderStatusLabel,
    orderStatus,
    payLabel,
    paymentStatus,
    hidePaymentStatusChip,
    visibility,
    blockingErrorEntries,
    showCreateReturnExchange,
    onBack,
    onCopyOrderCode,
    onOpenMoreMenu,
    onDispatchOrder,
    dispatchOrderSubmitting = false,
    onConfirmPayment,
    showCheckPayment = false,
    checkPaymentSubmitting = false,
    onCheckPayment,
    showRetryPayment = false,
    retryPaymentSubmitting = false,
    onRetryPayment,
    showCreateRefund = false,
    createRefundSubmitting = false,
    onCreateRefund,
    onCancelOrder,
    quickActionLabels,
    hideHeaderStatusChips,
    showMoreMenuButton = true,
    backPermission,
    copyPermission,
    moreMenuPermission,
    confirmPermission,
    cancelPermission,
  } = props;
void showCreateReturnExchange;

  const resolvedBackPermission = backPermission;
  const resolvedCopyPermission = copyPermission;
  const resolvedMoreMenuPermission = moreMenuPermission;
  const resolvedConfirmPermission = confirmPermission;
  const resolvedCancelPermission = cancelPermission;

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
        <Box
          sx={{
            overflow: 'hidden',
            border: '1px solid #EAECF0',
            bgcolor: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
          }}
        >
          <DetailPageBackBar onBack={onBack} barSx={{ px: PAGE_PADDING_X }} {...(resolvedBackPermission ?? {})} />
          <Box sx={{ px: PAGE_PADDING_X, pt: { xs: 1.75, md: 1.5 }, pb: { xs: 2, md: 1.75 } }}>
            <HeaderOrderInfo
              orderCode={orderCode}
              headerTitlePrefix={headerTitlePrefix}
              createdAtLabel={createdAtLabel}
              sourceLabel={sourceLabel}
              orderStatusLabel={orderStatusLabel}
              orderStatus={orderStatus}
              payLabel={payLabel}
              paymentStatus={paymentStatus}
              hidePaymentStatusChip={hidePaymentStatusChip}
              onCopyOrderCode={onCopyOrderCode}
              onOpenMoreMenu={onOpenMoreMenu}
              showMoreMenuButton={showMoreMenuButton}
              hideHeaderStatusChips={hideHeaderStatusChips}
              copyPermission={resolvedCopyPermission}
              moreMenuPermission={resolvedMoreMenuPermission}
            />
          </Box>
          {props.additionalActions && <Stack direction="row" sx={{ px: PAGE_PADDING_X, pb: 1.5 }}>{props.additionalActions}</Stack>}
          <HeaderQuickActions
            visibility={visibility}
            blockingErrorEntries={blockingErrorEntries}
            showCheckPayment={showCheckPayment}
            checkPaymentSubmitting={checkPaymentSubmitting}
            onCheckPayment={onCheckPayment}
            showRetryPayment={showRetryPayment}
            retryPaymentSubmitting={retryPaymentSubmitting}
            onRetryPayment={onRetryPayment}
            showCreateRefund={showCreateRefund}
            createRefundSubmitting={createRefundSubmitting}
            onCreateRefund={onCreateRefund}
            onDispatchOrder={onDispatchOrder}
            dispatchOrderSubmitting={dispatchOrderSubmitting}
            onConfirmPayment={onConfirmPayment}
            onCancelOrder={onCancelOrder}
            quickActionLabels={quickActionLabels}
            confirmPermission={resolvedConfirmPermission}
            cancelPermission={resolvedCancelPermission}
          />
          <HeaderBlockingAlert blockingErrorEntries={blockingErrorEntries} />
        </Box>
      </Box>
    </Box>
  );
}
