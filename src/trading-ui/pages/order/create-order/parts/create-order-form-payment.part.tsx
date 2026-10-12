import { Alert, Paper, Stack, Typography } from '@mui/material';
import { memo } from 'react';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { SelectInput, TextInput } from '../../../../components/form';
import { PaymentMethod } from '../../../../apis/order';
import type { CreateOrderFormValues, FieldOption } from '../create-order.interface';
import { ORDER_FORM_CARD_SX, ORDER_FORM_SECTION_TITLE_SX } from './create-order-form.shared';
import IconCard from '../../../../assets/icon/icon-card';

export interface CreateOrderFormPaymentPartProps {
  control: Control<CreateOrderFormValues>;
  paymentMethodOptions: FieldOption[];
  formLayout?: 'create' | 'edit';
}

export const CreateOrderFormPaymentPart = memo(function CreateOrderFormPaymentPart({ control, paymentMethodOptions, formLayout = 'create' }: CreateOrderFormPaymentPartProps) {
  const paymentMethod = useWatch({ control, name: 'paymentMethod' });

  return (
    <Paper elevation={0} sx={ORDER_FORM_CARD_SX}>
      <Typography sx={ORDER_FORM_SECTION_TITLE_SX}>
        <IconCard /> Thanh toán
      </Typography>
      <Stack>
        <Controller
          control={control}
          name="paymentMethod"
          rules={{ required: 'Vui lòng chọn phương thức thanh toán' }}
          render={({ field, fieldState }) => (
            <SelectInput
              requiredMark
              label="Phương thức thanh toán"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value as PaymentMethod | '')}
              placeholder="Chọn phương thức thanh toán"
              options={paymentMethodOptions}
              error={Boolean(fieldState.error)}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        {formLayout === 'edit' ? (
          <Stack direction={{ xs: 'column', sm: 'row' }}>
            <Controller
              control={control}
              name="paymentReceivedAmount"
              render={({ field }) => <TextInput label="Số tiền thực nhận" placeholder="4.000.000" value={field.value} onChange={(e) => field.onChange(e.target.value)} />}
            />
            <Controller
              control={control}
              name="transactionRef"
              render={({ field }) => <TextInput label="Mã giao dịch" placeholder="888BA9999HS" value={field.value} onChange={(e) => field.onChange(e.target.value)} />}
            />
          </Stack>
        ) : null}
        <Controller
          control={control}
          name="notePayment"
          render={({ field }) => (
            <TextInput label="Ghi chú thanh toán" multiline minRows={2} placeholder="Ghi chú về thanh toán..." value={field.value} onChange={(e) => field.onChange(e.target.value)} />
          )}
        />
        {/* code này được thêm vởi quân phạm */}
        {paymentMethod === PaymentMethod.QR_CODE ? (
          <Alert severity="info" sx={{ borderRadius: 1 }}>
            Link thanh toán Payoo và mã QR sẽ được sinh sau khi tạo đơn.
          </Alert>
        ) : null}
        {/* code này được thêm vởi quân phạm */}
      </Stack>
    </Paper>
  );
});
