import { JavaOrderActions } from './parts/java-order-actions.part';
import { isJavaBackend } from '@/common/config/app.config';
import { Box, Stack } from '@mui/material';
import { useMemo, useState } from 'react';
import { PaymentMethod } from '../../../apis/order';
import { RefundProposalPaymentChannel, RefundProposalSourceType } from '../../../apis/refund-proposal';
import { CancelOrderDialog } from '../components/cancel-order-dialog';
import { CancelOrderWithRefundDialog } from '../../refund-proposal/components/cancel-order-with-refund-dialog.part';
import { ORDER_EDIT_PAGE_ALLOWED_STATUSES } from '../../../common/constant/order/order.constants';
import { canCreateReturnExchangeRequest } from '../../../common/utils/order/order-return-exchange.utils';
import { getOrderStatusLabel } from '../../../common/utils/order/order.utils';
import { OrderDetailHeader } from './order-detail-header';
import { buildOrderDetailTimelineItems } from '../../../common/utils/order/order-detail-timeline.utils';
import { OrderAuditLogDrawer } from '../audit-log/order-audit-log.drawer';
import {
  getFulfillmentShippingLabel,
  getOrderActionVisibility,
  getOrderCustomerContact,
  getOrderSourceLabel,
  getPaymentStatusLabel,
  parseOrderAmount,
  shouldShowCancelWithRefund,
} from './order-detail.helpers';
import { OrderDetailImagePreviewDialog } from './parts/order-detail-image-preview-dialog.part';
import { OrderDetailErrorState, OrderDetailLoadingState } from './parts/order-detail-loading-error.part';
import { OrderDetailMainColumn } from './parts/order-detail-main-column.part';
import { OrderDetailMoreMenu } from './parts/order-detail-more-menu.part';
import { OrderDetailSidebar } from './parts/order-detail-sidebar.part';
import { useOrderDetailPage } from './use-order-detail.hook';
import { formatDateTime } from '../../../common/utils';
import { CreateOrderPaymentLinkDialogPart } from '../create-order/parts/create-order-payment-link-dialog.part';
import { RefundProposalCreateDialog } from '../../refund-proposal/components/refund-proposal-create-dialog.part';

const OrderDetailPage = () => {
  const d = useOrderDetailPage();
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [refundCreateDialogOpen, setRefundCreateDialogOpen] = useState(false);

  const actionVisibility = useMemo(() => {
    if (!d.order) return null;
    const hasDispatchEvidence = Boolean(d.order.trackingCode?.trim() || d.order.shippingTrackingUrl?.trim());
    return getOrderActionVisibility(d.order.status, d.order.paymentStatus, d.order.paymentMethod, d.order.errorLog, d.order.orderKind, hasDispatchEvidence);
  }, [d.order]);

  const timelineItems = useMemo(() => (d.order ? buildOrderDetailTimelineItems(d.order) : []), [d.order]);

  if (d.isLoading) {
    return <OrderDetailLoadingState />;
  }

  if (d.loadError || !d.order) {
    return <OrderDetailErrorState message={d.loadError} onBackToList={d.handleBackToList} />;
  }

  const order = d.order;
  const subtotal = parseOrderAmount(order.subtotal);
  const discount = parseOrderAmount(order.discountTotal);
  const ship = parseOrderAmount(order.shippingFee);
  const grand = parseOrderAmount(order.grandTotal);
  const payLabel = getPaymentStatusLabel(order.paymentStatus);
  const orderStatusLabel = getOrderStatusLabel(order.status as never);
  const shipStatusLabel = getFulfillmentShippingLabel(order.status);
  const v = actionVisibility!;
  const canCreateReturnExchange = canCreateReturnExchangeRequest(order);
  const cancelWithRefund = shouldShowCancelWithRefund({
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
  });
  const shippingAddress = order.shippingAddressSnapshot;
  const customerContact = getOrderCustomerContact(order);
  const customerAddress = [shippingAddress?.addressLine, shippingAddress?.wardName, shippingAddress?.provinceName]
    .filter((part) => Boolean(part?.trim()))
    .map((part) => part!.trim())
    .join(', ');

  return (
    <>
      <OrderDetailHeader
        orderCode={order.orderCode}
        createdAtLabel={formatDateTime(order.createdAt)}
        sourceLabel={getOrderSourceLabel(order.source)}
        orderStatusLabel={orderStatusLabel}
        orderStatus={order.status}
        payLabel={payLabel}
        paymentStatus={order.paymentStatus}
        hidePaymentStatusChip
        additionalActions={<JavaOrderActions order={order} onSuccess={d.refetchOrderDetailFresh} />}
        visibility={isJavaBackend()?{...v,showConfirmOrder:false}:v}
        blockingErrorEntries={d.orderErrorLogEntries}
        showCreateReturnExchange={canCreateReturnExchange}
        onBack={d.handleBackToList}
        onCopyOrderCode={d.handleCopyOrderCode}
        onOpenMoreMenu={(e) => setMoreMenuAnchor(e.currentTarget)}
        onDispatchOrder={() => void d.handleDispatchOrder()}
        dispatchOrderSubmitting={d.shipOrderSubmitting}
        showRetryPayment={d.showRetryPayment}
        retryPaymentSubmitting={d.retryPaymentSubmitting}
        onRetryPayment={() => void d.handleRetryPayment()}
        showCheckPayment={d.showCheckPayment}
        checkPaymentSubmitting={d.checkPaymentSubmitting}
        onCheckPayment={() => void d.handleCheckPayment()}
        showCreateRefund={d.showCreateRefund}
        createRefundSubmitting={d.createRefundSubmitting}
        onCreateRefund={() => setRefundCreateDialogOpen(true)}
        onCodShortfall={() => d.stubAction('Chuyển COD phần phiếu')}
        onCancelOrder={() => d.setCancelOrderDialogOpen(true)}
      />

      <Box
        sx={{
          pb: 3,
          px: { xs: 2, md: 3 },
          mx: 'auto',
          width: '100%',
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} alignItems="stretch" sx={{ width: '100%' }}>
          <OrderDetailMainColumn
            order={order}
            productDetails={d.productDetails}
            addressMismatch3pl={d.addressMismatch3pl}
            shippingFeeWarning={d.shippingFeeWarning}
            shipStatusLabel={shipStatusLabel}
            onPreviewImage={d.setImagePreviewUrl}
            subtotal={subtotal}
            discount={discount}
            ship={ship}
            grand={grand}
          />
          <OrderDetailSidebar order={order} payLabel={payLabel} subtotal={subtotal} discount={discount} ship={ship} grand={grand} timelineItems={timelineItems} />
        </Stack>
      </Box>

      <OrderDetailMoreMenu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
        onOpenHistory={() => setAuditDrawerOpen(true)}
        showEditOrder={ORDER_EDIT_PAGE_ALLOWED_STATUSES.includes(order.status)}
        onEditOrder={d.handleEditOrder}
      />

      <OrderAuditLogDrawer open={auditDrawerOpen} orderId={order.id} onClose={() => setAuditDrawerOpen(false)} />

      {cancelWithRefund ? (
        <CancelOrderWithRefundDialog
          open={d.cancelOrderDialogOpen}
          order={order}
          onClose={() => d.setCancelOrderDialogOpen(false)}
          onSuccess={() => {
            d.setCancelOrderDialogOpen(false);
            void d.refetchOrderDetailFresh();
          }}
        />
      ) : (
        <CancelOrderDialog
          open={d.cancelOrderDialogOpen}
          orderCode={order.orderCode}
          submitting={d.cancelOrderSubmitting}
          onClose={() => d.setCancelOrderDialogOpen(false)}
          onConfirm={(payload) => void d.handleConfirmCancelOrder(payload)}
        />
      )}

      <OrderDetailImagePreviewDialog imageUrl={d.imagePreviewUrl} onClose={() => d.setImagePreviewUrl(null)} />

      <CreateOrderPaymentLinkDialogPart paymentLink={d.retryPaymentDialogData} onClose={() => d.setRetryPaymentDialogData(null)} />

      <RefundProposalCreateDialog
        open={refundCreateDialogOpen}
        submitting={d.createRefundSubmitting}
        sourceCode={order.orderCode}
        sourceType={RefundProposalSourceType.CANCEL}
        totalRefundAmount={parseOrderAmount(order.refundFund?.totalRefundAmount ?? order.grandTotal)}
        paymentChannel={order.paymentMethod === PaymentMethod.COD ? RefundProposalPaymentChannel.COD : RefundProposalPaymentChannel.PAYOO}
        customerSnapshot={{
          firstName: shippingAddress?.firstName ?? order.firstName ?? undefined,
          contactEmail: order.contactEmail,
          shippingAddressLine: shippingAddress?.addressLine,
          shippingWardName: shippingAddress?.wardName,
          shippingProvinceName: shippingAddress?.provinceName,
          shippingProvinceCode: shippingAddress?.provinceCode ?? undefined,
          shippingWardCode: shippingAddress?.wardCode != null ? String(shippingAddress?.wardCode).trim() || undefined : undefined,
          customerAddress: customerAddress || undefined,
          receiverPhone: customerContact.phone || undefined,
        }}
        onClose={() => setRefundCreateDialogOpen(false)}
        onConfirm={(payload) => {
          void d.handleCreateRefundFromCancelledOrder(payload).then((ok) => {
            if (ok) setRefundCreateDialogOpen(false);
          });
        }}
      />
    </>
  );
};

export default OrderDetailPage;
