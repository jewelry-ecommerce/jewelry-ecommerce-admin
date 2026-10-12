import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderAuditEntityName } from '../../../apis/order';
import type { IRefundProposalCustomerInfo } from '../../../apis/refund-proposal';
import { ROUTE_PATH, getOrderDetailPath } from '@/trading-ui/router/route.path';
import { OrderDetailErrorState, OrderDetailLoadingState } from '../../order/order-detail/parts/order-detail-loading-error.part';
import { OrderAuditLogDrawer } from '../../order/audit-log/order-audit-log.drawer';
import { OrderDetailMoreMenu } from '../../order/order-detail/parts/order-detail-more-menu.part';
import { ORDER_REFUNDS_PAGE_SCOPE } from '../../order/order-permission.constants';
import { useRefundProposalDetail } from '../../../hooks/refund-proposal/use-refund-proposal-detail.hook';
import { RefundProposalDetailCustomerCard } from './parts/refund-proposal-detail-customer-card.part';
import { RefundProposalDetailHeader } from './parts/refund-proposal-detail-header.part';
import { RefundProposalApproveDialog } from './parts/refund-proposal-approve-dialog.part';
import { RefundProposalRejectDialog } from './parts/refund-proposal-detail-reject-dialog.part';
import { RefundProposalDetailRequestCard } from './parts/refund-proposal-detail-request-card.part';
import { RefundProposalDetailSummaryCard } from './parts/refund-proposal-detail-summary-card.part';
import { RefundProposalDetailTimelineCard } from './parts/refund-proposal-detail-timeline-card.part';
import { ensureTimeline } from './refund-proposal-detail.helpers';

const RefundProposalDetailPage = () => {
  const navigate = useNavigate();
  const d = useRefundProposalDetail();
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);

  if (d.isLoading && !d.detail) {
    return <OrderDetailLoadingState />;
  }
  if (!d.detail) {
    return <OrderDetailErrorState message={d.loadError || null} onBackToList={() => navigate(ROUTE_PATH.REFUND_PROPOSAL)} />;
  }

  const detail = d.detail;
  const fallbackFullName = [detail.lastName?.trim(), detail.firstName?.trim()].filter(Boolean).join(' ').trim();
  const fallbackCustomerAddress =
    detail.customerAddress?.trim() || [detail.shippingAddressLine?.trim(), detail.shippingWardName?.trim(), detail.shippingProvinceName?.trim()].filter(Boolean).join(', ');
  const customerInfo: IRefundProposalCustomerInfo = {
    fullName: detail.customer?.fullName?.trim() || fallbackFullName || undefined,
    email: detail.customer?.email?.trim() || detail.contactEmail?.trim() || undefined,
    phone: detail.customer?.phone?.trim() || detail.receiverPhone?.trim() || undefined,
    customerAddress: detail.customer?.customerAddress?.trim() || fallbackCustomerAddress || undefined,
    pickupAddress: detail.customer?.pickupAddress?.trim() || undefined,
    note: detail.customer?.note?.trim() || undefined,
  };
  const phone = customerInfo.phone?.trim();
  const relatedOrderId = detail.originalOrderId || detail.sourceId;

  return (
    <>
      <RefundProposalDetailHeader
        detail={detail}
        approveSubmitting={d.approveSubmitting}
        rejectSubmitting={d.rejectSubmitting}
        onBack={() => navigate(ROUTE_PATH.REFUND_PROPOSAL)}
        onApprove={() => d.setIsApproveDialogOpen(true)}
        onOpenReject={() => d.setIsRejectDialogOpen(true)}
        onOpenMore={(anchor) => setMoreMenuAnchor(anchor)}
      />

      <Box sx={{ pb: 3, px: { xs: 2, md: 3 }, mx: 'auto', width: '100%' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} alignItems="stretch" sx={{ width: '100%' }}>
          <Stack gap={2} sx={{ flex: 1, minWidth: 0 }}>
            <RefundProposalDetailCustomerCard customer={customerInfo} customerNote={detail.detailNote} onCallCustomer={phone ? () => window.open(`tel:${phone}`, '_self') : undefined} />
            <RefundProposalDetailRequestCard detail={detail} onOpenRelatedOrder={relatedOrderId ? () => navigate(getOrderDetailPath(relatedOrderId)) : undefined} />
          </Stack>

          <Stack gap={2} sx={{ width: { xs: '100%', lg: 380 }, flexShrink: 0 }}>
            <RefundProposalDetailSummaryCard detail={detail} />
            <RefundProposalDetailTimelineCard entries={ensureTimeline(detail)} />
          </Stack>
        </Stack>
      </Box>

      <OrderDetailMoreMenu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
        onOpenHistory={() => setAuditDrawerOpen(true)}
        permissionScope={ORDER_REFUNDS_PAGE_SCOPE}
        viewHistoryActionCode="view_history"
        viewHistoryApiCode="api_oms_get_refund_proposals_audit_logs"
      />

      <OrderAuditLogDrawer
        open={auditDrawerOpen}
        orderId={detail.id}
        entityName={OrderAuditEntityName.ORDER_REFUND}
        subtitle="Theo dõi toàn bộ thay đổi của yêu cầu hoàn tiền"
        onClose={() => setAuditDrawerOpen(false)}
      />

      <RefundProposalApproveDialog
        open={d.isApproveDialogOpen}
        submitting={d.approveSubmitting}
        onClose={() => d.setIsApproveDialogOpen(false)}
        onConfirm={(attachmentUrl) => void d.handleApprove(attachmentUrl)}
      />

      <RefundProposalRejectDialog open={d.isRejectDialogOpen} submitting={d.rejectSubmitting} onClose={() => d.setIsRejectDialogOpen(false)} onConfirm={(note) => void d.handleReject(note)} />
    </>
  );
};

export default RefundProposalDetailPage;
