import { Box, LinearProgress } from '@mui/material';
import { CustomButton } from '../../../components/button';

import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import { STYLE } from '@/trading-ui/adapters/library';
import { ArrowBackRounded } from '@mui/icons-material';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { CreateOrderSidebarPart } from './parts/create-order-sidebar.part';
import { CreateOrderFormPart } from './parts/create-order-form.part';
// code này được thêm vởi quân phạm
import { CreateOrderPaymentLinkDialogPart } from './parts/create-order-payment-link-dialog.part';
// code này được thêm vởi quân phạm
import { CreateOrderVariantDialog } from './create-order-variant-dialog';
import { MANUAL_ORDER_OPTIONS, ORDER_SOURCE_OPTIONS, SHIPPING_CARRIER_OPTIONS } from '../../../common/constant/order/create-order.constants';
import { useCreateOrderPage } from '../../../hooks/use-create-order-page.hook';

const PAGE_BG = '#F5F5F5';

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const d = useCreateOrderPage();

  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        bgcolor: PAGE_BG,
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {d.prefillLoading ? <LinearProgress sx={{ height: 2, flexShrink: 0 }} /> : null}
      <Box
        sx={{
          display: 'flex',
          px: 2,
          py: 1.5,
          justifyContent: 'space-between',
          alignItems: 'center',
          alignSelf: 'stretch',
          borderBottom: '1px solid #E5E7EB',
          bgcolor: '#FFF',
        }}
      >
        <CustomButton
          fullWidth={false}
          variant="outline"
          startIcon={<ArrowBackRounded sx={{ fontSize: 18 }} />}
          onClick={() => navigate(ROUTE_PATH.ORDER)}
          sx={{
            textTransform: 'none',
            ...TYPOGRAPHY_STYLES.base.medium,
            p: 0,
            minWidth: 0,
            justifyContent: 'flex-start',
            color: '#4A5565',
            width: 'fit-content',
            border: 'none',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#FFF',
              boxShadow: 'none',
            },
          }}
        >
          Quay lại danh sách
        </CustomButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <CreateOrderSidebarPart
          onBack={() => navigate(ROUTE_PATH.ORDER)}
          productQuery={d.productQuery}
          onProductQueryChange={d.setProductQuery}
          catalog={d.catalog}
          catalogLoading={d.catalogLoading}
          selectedProductIds={d.selectedProductIds}
          onToggleProduct={(product) => {
            d.setVariantProduct(product);
          }}
        />
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
          omsManagedShipping
          onProvinceChange={d.handleProvinceChange}
          onWardChange={d.handleWardChange}
          cartLines={d.cartLines}
          lineCountLabel={d.lineCountLabel}
          onRequestRemoveCartLine={d.removeCartLineByKey}
          onCommitCartLineQuantity={d.commitCartLineQuantity}
          cartQuantitySyncingLineKey={d.cartQuantitySyncingLineKey}
          subtotal={d.createOrderPricingSummary.subtotal}
          shippingFee={d.createOrderPricingSummary.shippingFee}
          discountTotal={d.createOrderPricingSummary.discountTotal}
          grandTotal={d.createOrderPricingSummary.grandTotal}
          shippingBreakdown={d.createOrderPricingSummary.shippingBreakdown}
          pricingPending={d.pricingPending}
          pricingError={d.pricingError}
          pricingReady={d.createOrderPricingSummary.pricingReady}
          submitting={d.submitting || d.prefillLoading}
          onCancel={() => navigate(ROUTE_PATH.ORDER)}
          onCreateOrder={() => void d.handleCreateOrder()}
          primaryActionLabel="Tạo đơn hàng"
          voucher={d.createOrderVoucher}
          formLayout="create"
        />
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
    </Box>
  );
};

export default CreateOrderPage;
