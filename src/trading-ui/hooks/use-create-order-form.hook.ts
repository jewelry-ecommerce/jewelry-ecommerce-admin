import { useForm } from 'react-hook-form';
import { isJavaBackend } from '@/common/config/app.config';
import type { CreateOrderFormValues } from '../pages/order/create-order/create-order.interface';
import { OrderPurpose, OrderSource } from '../apis/order/order.enum';
import { WAREHOUSE_OPTIONS } from '../common/constant/order/create-order.constants';

const FORM_DEFAULT_VALUES: CreateOrderFormValues = {
  crmSearch: '',
  firstName: '',
  receiverPhone: '',
  contactEmail: '',
  warehouseId: String(WAREHOUSE_OPTIONS[0]?.value ?? ''),
  source: OrderSource.MANUAL,
  purpose: OrderPurpose.ADDITIONAL,
  provinceCode: '',
  wardCode: '',
  addressLine: '',
  shippingCarrier: 'ghn',
  shippingService: 'fast',
  paymentMethod: '',
  notePayment: '',
  note: '',
  internalNote: '',
  paymentReceivedAmount: '',
  transactionRef: '',
};

/**
 * Không watch() toàn form — mỗi ký tự sẽ khiến cả page re-render (input lag).
 * Dùng useWatch theo field hoặc getValues() khi submit.
 */
export const useCreateOrderForm = () =>
  useForm<CreateOrderFormValues>({
    defaultValues: isJavaBackend() ? { ...FORM_DEFAULT_VALUES, warehouseId: '', shippingCarrier: '', shippingService: '', provinceName: '', wardName: '' } : FORM_DEFAULT_VALUES,
    mode: 'onChange',
    /** Giảm nháy lỗi/validate UI; formState chỉ subscribe trong CreateOrderFormPart, không ở page. */
    delayError: 250,
  });
