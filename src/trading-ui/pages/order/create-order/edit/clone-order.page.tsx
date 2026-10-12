import { ArrowBackRounded, CloseRounded, MoreVert, SaveOutlined } from '@mui/icons-material';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { OrderStatus } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { useCloneOrderPage } from '../../../../hooks/use-clone-order-page.hook';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import { STYLE } from '@/trading-ui/adapters/library';
import { CreateOrderVariantDialog } from '../create-order-variant-dialog';
import { MANUAL_ORDER_OPTIONS, ORDER_SOURCE_OPTIONS, SHIPPING_CARRIER_OPTIONS } from '../../../../common/constant/order/create-order.constants';
import { EditOrderProductPickerPart } from './edit-order-product-picker.part';
import { EditOrderShippingReadonlyPart } from './edit-order-shipping-readonly.part';
import { EditOrderSummaryAside } from './edit-order-summary-aside.part';
import { CreateOrderFormPart } from '../parts/create-order-form.part';
// code này được thêm vởi quân phạm
import { CreateOrderPaymentLinkDialogPart } from '../parts/create-order-payment-link-dialog.part';
// code này được thêm vởi quân phạm
import { OrderAuditLogDrawer } from '../../audit-log/order-audit-log.drawer';
import { OrderDetailMoreMenu } from '../../order-detail/parts/order-detail-more-menu.part';

const PAGE_BG = '#F5F5F5';

const CloneOrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  if (!orderId) return <Navigate to={ROUTE_PATH.ORDER} replace />;
  return <CloneOrderPageContent orderId={orderId} />;
};

function CloneOrderPageContent({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  const d = useCloneOrderPage({ sourceOrderId: orderId });
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);

  const cloneProductPickerSlot = d.editProductPickerOpen ? (
    <EditOrderProductPickerPart
      productQuery={d.productQuery}
      onProductQueryChange={d.setProductQuery}
      catalog={d.catalog}
      catalogLoading={d.catalogLoading}
      selectedProductIds={d.selectedProductIds}
      onSelectProduct={d.handleSelectProductFromEditPicker}
    />
  ) : undefined;

  const primaryDisabled = d.clonePrimaryDisabled;

  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        bgcolor: PAGE_BG,
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {d.prefillLoading ? <LinearProgress sx={{ height: 2, flexShrink: 0 }} /> : null}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1px solid #E5E7EB',
          bgcolor: '#FFFFFF',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ gap: 2, minWidth: 0 }}>
          <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ minWidth: 0, flex: '1 1 auto' }}>
            <PermissionIconButton
              type="button"
              aria-label="Quay lại danh sách"
              onClick={() => navigate(ROUTE_PATH.ORDER)}
              edge="start"
              sx={{
                color: '#111827',
                mt: 0.25,
                p: 0.75,
                flexShrink: 0,
                '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.06)' },
              }}
            >
              <ArrowBackRounded sx={{ fontSize: 22 }} />
            </PermissionIconButton>
            <Box sx={{ minWidth: 0, pt: 0.25 }}>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 20, sm: 22 },
                  fontWeight: 800,
                  color: '#111827',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              >
                Đơn hàng sao chép
              </Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280', mt: 0.25, fontSize: 14, lineHeight: 1.45 }}>
                Kiểm tra và điều chỉnh thông tin trước khi tạo đơn mới từ bản sao.
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 1,
              flexShrink: 0,
              ml: 'auto',
              maxWidth: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              py: 0.25,
              WebkitOverflowScrolling: 'touch',
              '& .MuiButton-root': {
                width: 'fit-content',
                minWidth: 'fit-content !important',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              },
            }}
          >
            <PermissionIconButton
              type="button"
              size="small"
              aria-label="Thao tác khác"
              onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
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
            <CustomButton
              fullWidth={false}
              variant="outline"
              startIcon={<CloseRounded sx={{ fontSize: 18 }} />}
              onClick={() => navigate(ROUTE_PATH.ORDER)}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                color: '#111827',
                borderColor: '#D1D5DB',
                borderWidth: 1.5,
                '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' },
              }}
            >
              Hủy
            </CustomButton>
            <CustomButton
              fullWidth={false}
              variant="primary"
              disabled={primaryDisabled}
              startIcon={<SaveOutlined sx={{ fontSize: 18 }} />}
              onClick={() => void d.handleCreateOrder()}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                bgcolor: '#111827',
                color: '#FFFFFF',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0B1220', boxShadow: 'none' },
                '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
              }}
            >
              Lưu thay đổi
            </CustomButton>
          </Box>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          px: { xs: 2, md: 3 },
          pb: 2,
          pt: 2,
        }}
      >
        <CreateOrderFormPart
          control={d.control}
          pickCustomerFromPhoneLookup={d.pickCustomerFromPhoneLookup}
          manualOrderOptions={MANUAL_ORDER_OPTIONS}
          orderSourceOptions={ORDER_SOURCE_OPTIONS}
          paymentMethodOptions={d.paymentMethodFieldOptions}
          provinceOptions={d.provinceOptions}
          wardOptions={d.wardOptions}
          shippingCarrierOptions={SHIPPING_CARRIER_OPTIONS}
          shippingServiceOptions={d.shippingServiceOptions}
          shippingServiceLoading={d.shippingServiceLoading}
          shippingServiceFetchFailed={d.shippingServiceFetchFailed}
          onSyncShippingServices={d.handleSyncShippingServices}
          warehouseOptions={d.warehouseOptions}
          onProvinceChange={d.handleProvinceChange}
          onWardChange={d.handleWardChange}
          cartLines={d.cartLines}
          lineCountLabel={d.lineCountLabel}
          onRequestRemoveCartLine={d.removeCartLineByKey}
          onCommitCartLineQuantity={d.commitCartLineQuantity}
          cartQuantitySyncingLineKey={d.cartQuantitySyncingLineKey}
          subtotal={d.subtotal}
          shippingFee={d.shippingFee}
          grandTotal={d.grandTotal}
          submitting={d.submitting || d.prefillLoading}
          onCancel={() => navigate(ROUTE_PATH.ORDER)}
          onCreateOrder={() => void d.handleCreateOrder()}
          primaryActionLabel="Lưu thay đổi"
          formLayout="edit"
          onAddProduct={() => d.setEditProductPickerOpen((prev) => !prev)}
          editProductPickerOpen={d.editProductPickerOpen}
          editProductPickerSlot={cloneProductPickerSlot}
          editShippingReadonly={
            d.editOrderDetail ? (
              <EditOrderShippingReadonlyPart
                shippingMethod={d.editOrderDetail.shippingMethod}
                trackingCode={d.editOrderDetail.trackingCode}
                trackingUrl={d.editOrderDetail.shippingTrackingUrl}
                orderPending={d.editOrderDetail.status === OrderStatus.PENDING}
              />
            ) : null
          }
        />
        <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0, alignSelf: { xs: 'stretch', lg: 'flex-start' } }}>
          <EditOrderSummaryAside
            subtotal={d.subtotal}
            shippingFee={d.shippingFee}
            discountTotal={d.discountTotal}
            preDiscountTotal={d.preDiscountTotal}
            grandTotal={d.grandTotal}
            amountReceived={d.amountReceived}
            baselineSubtotal={d.editBaselineSubtotal}
            baselineShippingFee={d.editBaselineShippingFee}
            baselineDiscountTotal={d.editBaselineDiscountTotal}
            voucher={d.createOrderVoucher}
          />
        </Box>
      </Box>

      <CreateOrderVariantDialog
        open={Boolean(d.variantProduct)}
        productId={d.variantProduct?.id ?? null}
        productName={d.variantProduct?.name}
        productImage={d.variantProduct?.image}
        packagingRelations={d.variantProduct?.packagingRelations}
        onClose={() => d.setVariantProduct(null)}
        onAddToOrder={d.handleAddLine}
      />
      {/* code này được thêm vởi quân phạm */}
      <CreateOrderPaymentLinkDialogPart paymentLink={d.createdPaymentLink} onClose={d.handleCloseCreatedPaymentLink} />
      {/* code này được thêm vởi quân phạm */}
      <OrderDetailMoreMenu anchorEl={moreMenuAnchor} open={Boolean(moreMenuAnchor)} onClose={() => setMoreMenuAnchor(null)} onOpenHistory={() => setAuditDrawerOpen(true)} />
      <OrderAuditLogDrawer open={auditDrawerOpen} orderId={orderId} onClose={() => setAuditDrawerOpen(false)} />
    </Box>
  );
}

export default CloneOrderPage;
