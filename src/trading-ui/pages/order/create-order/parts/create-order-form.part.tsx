import { Box, Stack } from '@mui/material';
import { isJavaBackend } from '@/common/config/app.config';
import * as React from 'react';
import type { ReactNode } from 'react';
import { useFormState, type Control } from 'react-hook-form';
import type { IOrderCustomerByPhoneItem } from '../../../../apis/order';
import type { CartLine, CreateOrderFormValues, FieldOption, ShippingServiceOption, WarehouseOption } from '../create-order.interface';
import { CreateOrderFormCartPart } from './create-order-form-cart.part';
import { CreateOrderFormCustomerPart } from './create-order-form-customer.part';
import { CreateOrderFormPaymentPart } from './create-order-form-payment.part';
import { CreateOrderFormShippingPart } from './create-order-form-shipping.part';
import type { AdminOrderVoucherSectionProps } from './admin-order-voucher-section.component';
import { CreateOrderFormSummaryPart, type OrderShippingSummary } from './create-order-form-summary.part';

export interface CreateOrderFormPartProps {
  control: Control<CreateOrderFormValues>;
  pickCustomerFromPhoneLookup: (item: IOrderCustomerByPhoneItem, normalized: string) => void;
  manualOrderOptions: FieldOption[];
  orderSourceOptions: FieldOption[];
  paymentMethodOptions: FieldOption[];
  provinceOptions: FieldOption[];
  wardOptions: FieldOption[];
  shippingCarrierOptions: FieldOption[];
  shippingServiceOptions: ShippingServiceOption[];
  shippingServiceLoading?: boolean;
  shippingServiceFetchFailed?: boolean;
  onSyncShippingServices?: () => void;
  warehouseOptions?: WarehouseOption[];
  omsManagedShipping?: boolean;
  onProvinceChange: (rawValue: string | number, onChange: (value: number | '') => void) => void;
  onWardChange: (rawValue: string | number, onChange: (value: number | '') => void) => void;
  cartLines: CartLine[];
  lineCountLabel: string;
  onRequestRemoveCartLine: (lineKey: string) => void;
  onCommitCartLineQuantity: (lineKey: string, nextQuantity: number) => void;
  cartQuantitySyncingLineKey: string | null;
  subtotal: number | null;
  shippingFee: number | null;
  discountTotal?: number | null;
  grandTotal: number | null;
  shippingBreakdown?: OrderShippingSummary;
  pricingPending?: boolean;
  pricingError?: string | null;
  pricingReady?: boolean;
  submitting: boolean;
  onCancel: () => void;
  onCreateOrder: () => void;
  primaryActionLabel?: string;
  voucher?: AdminOrderVoucherSectionProps;
  formLayout?: 'create' | 'edit';
  onAddProduct?: () => void;
  editProductPickerOpen?: boolean;
  editShippingReadonly?: ReactNode;
  /** Khối chọn sản phẩm khi chỉnh sửa đơn */
  editProductPickerSlot?: ReactNode;
}

export const CreateOrderFormPart = ({
  control,
  pickCustomerFromPhoneLookup,
  manualOrderOptions,
  orderSourceOptions,
  paymentMethodOptions,
  provinceOptions,
  wardOptions,
  shippingCarrierOptions,
  shippingServiceOptions,
  shippingServiceLoading = false,
  shippingServiceFetchFailed = false,
  onSyncShippingServices,
  warehouseOptions = [],
  omsManagedShipping = isJavaBackend(),
  onProvinceChange,
  onWardChange,
  cartLines,
  lineCountLabel,
  onRequestRemoveCartLine,
  onCommitCartLineQuantity,
  cartQuantitySyncingLineKey,
  subtotal,
  shippingFee,
  discountTotal,
  grandTotal,
  shippingBreakdown,
  pricingPending,
  pricingError,
  pricingReady,
  submitting,
  onCancel,
  onCreateOrder,
  primaryActionLabel,
  voucher,
  formLayout = 'create',
  onAddProduct,
  editProductPickerOpen = false,
  editShippingReadonly,
  editProductPickerSlot,
}: CreateOrderFormPartProps) => {
  const { errors, isValid } = useFormState({ control });
  const formValid = isValid && cartLines.length > 0;

  const isEdit = formLayout === 'edit';

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        height: { xs: 'auto', md: '100%' },
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        pr: { md: 0.25 },
        display: 'flex',
        justifyContent: 'center',
        pt: isEdit ? 0 : 2,
      }}
    >
      <Stack sx={{ width: '100%', maxWidth: isEdit ? '100%' : 760 }}>
        {isEdit ? (
          <React.Fragment>
            <CreateOrderFormCustomerPart
              control={control}
              errors={errors}
              pickCustomerFromPhoneLookup={pickCustomerFromPhoneLookup}
              manualOrderOptions={manualOrderOptions}
              orderSourceOptions={orderSourceOptions}
            />
            <CreateOrderFormShippingPart
              control={control}
              errors={errors}
              provinceOptions={provinceOptions}
              wardOptions={wardOptions}
              shippingCarrierOptions={shippingCarrierOptions}
              shippingServiceOptions={shippingServiceOptions}
              shippingServiceLoading={shippingServiceLoading}
              shippingServiceFetchFailed={shippingServiceFetchFailed}
              onSyncShippingServices={onSyncShippingServices}
              warehouseOptions={warehouseOptions}
              omsManaged={omsManagedShipping}
              onProvinceChange={onProvinceChange}
              onWardChange={onWardChange}
            />
            <CreateOrderFormCartPart
              cartLines={cartLines}
              lineCountLabel={lineCountLabel}
              cartQuantitySyncingLineKey={cartQuantitySyncingLineKey}
              onRequestRemoveCartLine={onRequestRemoveCartLine}
              onCommitCartLineQuantity={onCommitCartLineQuantity}
              formLayout="edit"
              onAddProduct={onAddProduct}
              productPickerOpen={editProductPickerOpen}
              productPickerSlot={editProductPickerSlot}
            />
            {/* <CreateOrderFormPaymentPart control={control} paymentMethodOptions={paymentMethodOptions} formLayout="edit" /> */}
            {editShippingReadonly}
            {/* <CreateOrderFormInternalNotePart control={control} /> */}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <CreateOrderFormCartPart
              cartLines={cartLines}
              lineCountLabel={lineCountLabel}
              cartQuantitySyncingLineKey={cartQuantitySyncingLineKey}
              onRequestRemoveCartLine={onRequestRemoveCartLine}
              onCommitCartLineQuantity={onCommitCartLineQuantity}
              formLayout="create"
            />
            <CreateOrderFormCustomerPart
              control={control}
              errors={errors}
              pickCustomerFromPhoneLookup={pickCustomerFromPhoneLookup}
              manualOrderOptions={manualOrderOptions}
              orderSourceOptions={orderSourceOptions}
            />
            <CreateOrderFormShippingPart
              control={control}
              errors={errors}
              provinceOptions={provinceOptions}
              wardOptions={wardOptions}
              shippingCarrierOptions={shippingCarrierOptions}
              shippingServiceOptions={shippingServiceOptions}
              shippingServiceLoading={shippingServiceLoading}
              shippingServiceFetchFailed={shippingServiceFetchFailed}
              onSyncShippingServices={onSyncShippingServices}
              warehouseOptions={warehouseOptions}
              omsManaged={omsManagedShipping}
              onProvinceChange={onProvinceChange}
              onWardChange={onWardChange}
            />
            <CreateOrderFormPaymentPart control={control} paymentMethodOptions={paymentMethodOptions} formLayout="create" />
            <CreateOrderFormSummaryPart
              subtotal={subtotal}
              shippingFee={shippingFee}
              discountTotal={discountTotal}
              grandTotal={grandTotal}
              shippingBreakdown={shippingBreakdown}
              pricingPending={pricingPending}
              pricingError={pricingError}
              pricingReady={pricingReady}
              submitting={submitting}
              formValid={formValid}
              onCancel={onCancel}
              onCreateOrder={onCreateOrder}
              primaryActionLabel={primaryActionLabel}
              voucher={voucher}
            />
          </React.Fragment>
        )}
      </Stack>
    </Box>
  );
};
