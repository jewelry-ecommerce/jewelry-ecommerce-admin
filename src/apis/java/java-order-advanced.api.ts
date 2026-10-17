import { backendRequest, BackendHttpError } from '@/apis/backend-request';
import { toJavaEntityIds } from './java-v7-routes';
import { javaOrderView } from '@/trading-ui/apis/order/order-java.adapter';
import { PaymentMethod } from '@/trading-ui/apis/order/order.enum';
import type { ICreateOrderApiRequest, ICreateOrderResponse, IOrder, IUpdateOrderRequest, IDuplicateOrderRequest, IConfirmOrderPaymentRequest, IOrderCustomerByPhoneItem } from '@/trading-ui/apis/order/order.interface';

const JAVA_ORDERS = 'admin/orders';
type WireOrder = Parameters<typeof javaOrderView>[0];
export async function javaOrderCustomersByPhone(phone: string): Promise<IOrderCustomerByPhoneItem[]> {
  try {
    const customer = await backendRequest<{ customerId: number | string; phone: string; fullName?: string }>('admin/promotions/customer-audience/by-phone?phone=' + encodeURIComponent(phone));
    return [{ id: String(customer.customerId), phone: customer.phone, firstName: customer.fullName }];
  } catch (error) {
    if (error instanceof BackendHttpError && error.status === 404) return [];
    throw error;
  }
}
export async function javaCreateAdminOrder(body: ICreateOrderApiRequest): Promise<ICreateOrderResponse> {
  const order = javaOrderView(await backendRequest<WireOrder>(JAVA_ORDERS, 'POST', toJavaEntityIds(body)));
  return { success: true, orderId: order.id, orderCode: order.orderCode, paymentMethod: PaymentMethod.COD };
}
export async function javaUpdateAdminOrder(id: string, body: IUpdateOrderRequest): Promise<{ success: true; data: IOrder }> {
  const payload = { ...body, provinceCode: Number(body.provinceCode) > 0 ? body.provinceCode : undefined,
    wardCode: Number(body.wardCode) > 0 ? body.wardCode : undefined };
  const data = javaOrderView(await backendRequest<WireOrder>(JAVA_ORDERS + '/' + encodeURIComponent(id), 'PUT', toJavaEntityIds(payload)));
  return { success: true, data };
}
export async function javaDuplicateAdminOrder(body: IDuplicateOrderRequest): Promise<{ success: true; data: IOrder }> {
  const data = javaOrderView(await backendRequest<WireOrder>(JAVA_ORDERS + '/duplicate', 'POST', toJavaEntityIds(body)));
  return { success: true, data };
}
export async function javaConfirmAdminPayment(id: string, body: IConfirmOrderPaymentRequest): Promise<{ success: true; data: IOrder }> {
  const data = javaOrderView(await backendRequest<WireOrder>(JAVA_ORDERS + '/' + encodeURIComponent(id) + '/confirm-payment', 'PUT', body));
  return { success: true, data };
}
