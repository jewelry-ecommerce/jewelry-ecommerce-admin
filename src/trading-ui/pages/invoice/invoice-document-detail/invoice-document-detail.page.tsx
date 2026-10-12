import { Box, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { getOrderDetail } from '../../../apis/order';
import { useInvoiceDocumentDetail } from '../../../hooks/invoice-documents/use-invoice-document-detail.hook';
import { ROUTE_PATH, getOrderDetailPath, getReturnExchangeDetailPath } from '@/trading-ui/router/route.path';
import { OrderDetailErrorState, OrderDetailLoadingState } from '../../order/order-detail/parts/order-detail-loading-error.part';
import { InvoiceDocumentDetailCustomerCard } from './parts/invoice-document-detail-customer-card.part';
import { InvoiceDocumentDetailHeader } from './parts/invoice-document-detail-header.part';
import { InvoiceDocumentDetailInfoCard } from './parts/invoice-document-detail-info-card.part';
import { InvoiceDocumentDetailSummaryCard } from './parts/invoice-document-detail-summary-card.part';
import { InvoiceDocumentDetailVatCard } from './parts/invoice-document-detail-vat-card.part';

const InvoiceDocumentDetailPage = () => {
  const navigate = useNavigate();
  const d = useInvoiceDocumentDetail();

  const orderId = d.detail?.orderId?.trim();
  const { data: order, isLoading: isLoadingOrder } = useSWR(orderId ? ['invoice-document-related-order', orderId] : null, async () => await getOrderDetail(orderId!), { revalidateOnFocus: false });

  if (d.isLoading && !d.detail) {
    return <OrderDetailLoadingState />;
  }

  if (!d.detail) {
    return <OrderDetailErrorState message={d.loadError || null} onBackToList={() => navigate(ROUTE_PATH.INVOICE)} />;
  }

  const detail = d.detail;
  const phone = detail.customerPhone?.trim();
  const orderReturnId = detail.orderReturnId?.trim();
  const linkUrl = detail.linkUrl?.trim();

  const openDocumentLink = linkUrl ? () => window.open(linkUrl, '_blank', 'noopener,noreferrer') : undefined;

  return (
    <>
      <InvoiceDocumentDetailHeader detail={detail} onBack={() => navigate(ROUTE_PATH.INVOICE)} onOpenDocumentLink={openDocumentLink} />

      <Box sx={{ pb: 3, px: { xs: 2, md: 3 }, mx: 'auto', width: '100%' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} alignItems="stretch" sx={{ width: '100%' }}>
          <Stack gap={2} sx={{ flex: 1, minWidth: 0 }}>
            <InvoiceDocumentDetailCustomerCard detail={detail} onCallCustomer={phone ? () => window.open(`tel:${phone}`, '_self') : undefined} />
            <InvoiceDocumentDetailInfoCard
              detail={detail}
              onOpenRelatedOrder={orderId ? () => navigate(getOrderDetailPath(orderId)) : undefined}
              onOpenRelatedReturn={orderReturnId ? () => navigate(getReturnExchangeDetailPath(orderReturnId)) : undefined}
              onOpenDocumentLink={openDocumentLink}
            />
            <InvoiceDocumentDetailVatCard vatInvoice={order?.vatInvoice} isLoadingOrder={isLoadingOrder} />
          </Stack>

          <Stack gap={2} sx={{ width: { xs: '100%', lg: 380 }, flexShrink: 0 }}>
            <InvoiceDocumentDetailSummaryCard detail={detail} />
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default InvoiceDocumentDetailPage;
