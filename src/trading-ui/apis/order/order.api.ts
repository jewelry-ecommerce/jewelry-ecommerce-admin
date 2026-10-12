import type { AxiosRequestConfig } from 'axios';
import { isJavaBackend } from '@/common/config/app.config';
import { getJavaSourceOrderList,getJavaSourceOrderDetail,cancelJavaSourceOrder,shipJavaSourceOrder } from './order-java.adapter';
import { axiosRequest } from '../../common/config/axios.config';
import { axiosNoAuthRequest } from '../../common/config/axios-no-auth.config';
import {
  type IOrderWarehouse,
  type ICalculateOrderShippingFeeRequest,
  type ICalculateOrderShippingFeeResponse,
  type IOrderPricingContextQuoteRequest,
  type IOrderPricingContextQuoteResponse,
  type IOrder,
  type IOrderListRequest,
  type IOrderListResponse,
  type ICreateOrderApiRequest,
  // code này được thêm vởi quân phạm
  type ICreateOrderResponse,
  // code này được thêm vởi quân phạm
  type IUpdateOrderRequest,
  type ICancelOrderRequest,
  type IConfirmOrderPaymentRequest,
  type ICreateOrderReturnRequest,
  type IAdminOrderReturnQuoteRequest,
  type IAdminOrderReturnCommitRequest,
  type IAdminOrderReturnCommitResponse,
  type IOrderReturnQuoteResponse,
  type IRejectOrderReturnRequest,
  type IOrderReturnListRequest,
  type IOrderReturnListResponse,
  type IApiResponse,
  type IOrderProductCatalogQuery,
  type IOrderProductCatalogResponse,
  type IOrderProductDetail,
  type IOrderCustomerByPhoneItem,
  type IOrderProductVariationListItem,
  type IDuplicateOrderRequest,
  type ILookupOrderRequest,
  type ILookupOrderResponseItem,
  type IMyOrderListQuery,
  type IOrderPaymentStatusResponse,
  type IResolveOrderReturnRequest,
  type IRetryOrderPaymentRequest,
  type IOrderAuditLogListRequest,
  type IOrderReturnDetailResponse,
  type IOrderShippingServiceItem,
  type IOrderShippingServicesRequest,
  type IUpdateOrderReturnRequest,
  type IAdminOrderVoucherDiscoverRequest,
  type IAdminOrderVoucherDiscoverResponse,
  type IAdminOrderVoucherValidateRequest,
  type IAdminOrderVoucherValidateResponse,
} from './order.interface';
import type { DiscoverOrderPromotionVouchersRequestDto, DiscoverPromotionVouchersResponseDto } from '../promotion/promotion.interface';
import { OrderSortBy, OrderType } from './order.enum';
import type { IOrderCounterPayment, IOrderNote, OrderNoteType } from './order.interface';

import { getJavaOrderProducts, getJavaOrderProductDetail, getJavaOrderProductVariations } from './order-java-catalog.adapter';
const ORDERS_BASE_PATH = 'order/orders';
const ORDER_RETURNS_BASE_PATH = 'order/order-returns';
const ADMIN_PROMOTION_VOUCHERS_BASE_PATH = 'order/admin/promotion-vouchers';

export const getOrderList = async (request?: IOrderListRequest): Promise<IOrderListResponse> =>
  isJavaBackend()?getJavaSourceOrderList(request):request ? await axiosRequest.post(`${ORDERS_BASE_PATH}/list`, request) : await axiosRequest.post(`${ORDERS_BASE_PATH}/list`);

/** Danh sách đơn cơ bản cho guest — POST order/orders/list/basic */
export const getGuestOrderList = async (request: IOrderListRequest): Promise<IOrderListResponse> => await axiosRequest.post(`${ORDERS_BASE_PATH}/list/basic`, request);

/** Danh sách đơn của user hiện tại — GET order/orders/me */
export const getMyOrderList = async (params?: IMyOrderListQuery): Promise<IOrderListResponse> =>
  await axiosRequest.get(`${ORDERS_BASE_PATH}/me`, {
    params: params
      ? {
          ...params,
          orderBy: params.orderBy ?? OrderSortBy.UPDATED_AT,
          orderType: params.orderType ?? OrderType.DESC,
          ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        }
      : undefined,
  });

export const getOrderDetail = async (orderId: string, config?: AxiosRequestConfig): Promise<IOrder> => isJavaBackend()?getJavaSourceOrderDetail(orderId):await axiosRequest.get(`${ORDERS_BASE_PATH}/${orderId}`, config);

/** Ghi chú của đơn (cũ trước mới sau) — GET order/orders/{orderId}/notes?type=order|internal */
export const getOrderNotes = async (orderId: string, type?: OrderNoteType): Promise<IOrderNote[]> =>
  await axiosRequest.get(`${ORDERS_BASE_PATH}/${orderId}/notes`, { params: type ? { type } : undefined });

/** Thêm ghi chú (chỉ thêm, không sửa/xóa) — POST order/orders/{orderId}/notes */
export const addOrderNote = async (orderId: string, body: { content: string; type?: OrderNoteType }): Promise<IOrderNote> => await axiosRequest.post(`${ORDERS_BASE_PATH}/${orderId}/notes`, body);

/** Khoản thu tại quầy POS (tiền mặt / thẻ Payoo) — GET order/orders/{orderId}/counter-payment; đơn chưa thu → 404 */
export const getOrderCounterPayment = async (orderId: string): Promise<IOrderCounterPayment> => await axiosRequest.get(`${ORDERS_BASE_PATH}/${orderId}/counter-payment`);

/** Chi tiết đơn theo mã (ngữ cảnh “của tôi”) — GET order/orders/me/{orderCode} */
export const getMyOrderByOrderCode = async (orderCode: string): Promise<IOrder> => await axiosRequest.get(`${ORDERS_BASE_PATH}/me/${encodeURIComponent(orderCode)}`);

/** Danh sách sản phẩm khi tạo đơn thủ công — GET order/orders/products */
export const getOrderProducts = async (params: IOrderProductCatalogQuery): Promise<IOrderProductCatalogResponse> =>
  isJavaBackend()?getJavaOrderProducts(params):await axiosRequest.get('order/orders/products', {
    params: {
      ...params,
      orderBy: params.orderBy ?? OrderSortBy.UPDATED_AT,
      orderType: params.orderType ?? OrderType.DESC,
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    },
  });

/** Chi tiết SP + biến thể — điều chỉnh path nếu backend khác. */
export const getOrderProductDetail = async (productId: string): Promise<IOrderProductDetail> => isJavaBackend()?getJavaOrderProductDetail(productId):await axiosRequest.get(`${ORDERS_BASE_PATH}/products/${productId}`);

/** Danh sách biến thể theo product id — GET order/orders/product/{productId}/variations */
export const getOrderProductVariations = async (productId: string): Promise<IOrderProductVariationListItem[]> => isJavaBackend()?getJavaOrderProductVariations(productId):await axiosRequest.get(`${ORDERS_BASE_PATH}/product/${productId}/variations`);

/** GET order/orders/customers/by-phone?phone=0xxxxxxxxx */
export const getOrderCustomersByPhone = async (phone: string): Promise<IOrderCustomerByPhoneItem[]> => {
  const data: unknown = await axiosRequest.get(`${ORDERS_BASE_PATH}/customers/by-phone`, {
    params: { phone },
  });

  return Array.isArray(data) ? (data as IOrderCustomerByPhoneItem[]) : [];
};

/** Lấy danh sách dịch vụ vận chuyển khả dụng cho đơn thủ công */
export const getOrderShippingServices = async (request: IOrderShippingServicesRequest): Promise<IOrderShippingServiceItem[]> => {
  const data: unknown = await axiosRequest.post(`${ORDERS_BASE_PATH}/services/with-leadtime`, request);

  if (Array.isArray(data)) return data as IOrderShippingServiceItem[];
  if (data && typeof data === 'object' && 'data' in data) {
    const nested = (data as { data?: unknown }).data;
    return Array.isArray(nested) ? (nested as IOrderShippingServiceItem[]) : [];
  }

  return [];
};

/** Lấy danh sách dịch vụ vận chuyển khả dụng (swagger mới) */
export const getOrderAvailableServices = async (request: IOrderShippingServicesRequest): Promise<IOrderShippingServiceItem[]> => {
  const data: unknown = await axiosRequest.post(`${ORDERS_BASE_PATH}/services`, request);
  return Array.isArray(data) ? (data as IOrderShippingServiceItem[]) : [];
};

/** Kho xuất hàng cho đơn Admin — OMS lấy từ WMS và đã đổi mã tỉnh/phường sang mã GHN. */
export const getOrderWarehouses = async (): Promise<IOrderWarehouse[]> => {
  const data: unknown = await axiosRequest.get(`${ORDERS_BASE_PATH}/warehouses`);

  if (Array.isArray(data)) return data as IOrderWarehouse[];
  if (data && typeof data === 'object' && 'data' in data) {
    const nested = (data as { data?: unknown }).data;
    return Array.isArray(nested) ? (nested as IOrderWarehouse[]) : [];
  }

  return [];
};

/** Tính phí ship dự kiến cho đơn hàng */
export const calculateOrderShippingFee = async (request: ICalculateOrderShippingFeeRequest): Promise<ICalculateOrderShippingFeeResponse> =>
  await axiosRequest.post(`${ORDERS_BASE_PATH}/fee/calculate`, request);

/** Báo giá tạm tính khi tạo đơn thủ công — POST order/orders/pricing-context/quote */
export const quoteOrderPricingContext = async (request: IOrderPricingContextQuoteRequest): Promise<IOrderPricingContextQuoteResponse> =>
  await axiosRequest.post(`${ORDERS_BASE_PATH}/pricing-context/quote`, request);

/** Tìm voucher cho đơn Admin v2 qua OMS. */
export const discoverAdminOrderPromotionVouchers = async (request: IAdminOrderVoucherDiscoverRequest): Promise<IAdminOrderVoucherDiscoverResponse> =>
  await axiosRequest.post(`${ADMIN_PROMOTION_VOUCHERS_BASE_PATH}/discover`, request);

/** Kiểm tra mã voucher cho đơn Admin v2 qua OMS. */
export const validateAdminOrderPromotionVoucherCode = async (request: IAdminOrderVoucherValidateRequest): Promise<IAdminOrderVoucherValidateResponse> =>
  await axiosRequest.post(`${ADMIN_PROMOTION_VOUCHERS_BASE_PATH}/validate-code`, request);

/** Trạng thái thanh toán theo orderCode — không dùng Bearer token. */
export const getOrderPaymentStatus = async (orderCode: string): Promise<IOrderPaymentStatusResponse> =>
  await axiosNoAuthRequest.get(`${ORDERS_BASE_PATH}/${encodeURIComponent(orderCode)}/payment-status`);

/** Tạo lại link thanh toán — không dùng Bearer token. */
export const retryOrderPayment = async (orderCode: string, request: IRetryOrderPaymentRequest): Promise<IApiResponse<IOrderPaymentStatusResponse>> =>
  await axiosNoAuthRequest.post(`${ORDERS_BASE_PATH}/${encodeURIComponent(orderCode)}/retry-payment`, request);

/** Đối soát thanh toán theo orderId */
export const checkOrderPaid = async (orderId: string): Promise<IApiResponse<IOrderPaymentStatusResponse>> => await axiosRequest.post(`${ORDERS_BASE_PATH}/${encodeURIComponent(orderId)}/check-paid`);

/** Tra cứu đơn theo SĐT (client flow) */
export const lookupOrder = async (request: ILookupOrderRequest): Promise<ILookupOrderResponseItem[]> => await axiosRequest.post(`${ORDERS_BASE_PATH}/lookup`, request);

/** Chi tiết đơn sau tra cứu theo orderCode */
export const lookupOrderDetail = async (orderCode: string, request: ILookupOrderRequest): Promise<IOrder | ILookupOrderResponseItem> =>
  await axiosRequest.post(`${ORDERS_BASE_PATH}/lookup/${encodeURIComponent(orderCode)}`, request);

// code này được thêm vởi quân phạm
export const createOrder = async (request: ICreateOrderApiRequest): Promise<ICreateOrderResponse> => await axiosRequest.post(`${ORDERS_BASE_PATH}`, request);
// code này được thêm vởi quân phạm

/** Sao chép đơn — POST order/orders/duplicate */
export const duplicateOrder = async (request: IDuplicateOrderRequest): Promise<IApiResponse<IOrder> | { orderCode?: string; id?: string }> =>
  await axiosRequest.post(`${ORDERS_BASE_PATH}/duplicate`, request);

export const updateOrder = async (orderId: string, request: IUpdateOrderRequest): Promise<IApiResponse<IOrder>> => await axiosRequest.put(`${ORDERS_BASE_PATH}/${orderId}`, request);

/** Hủy đơn — POST order/orders/{orderId}/cancel */
export const cancelOrder = async (orderId: string, request: ICancelOrderRequest): Promise<IApiResponse<IOrder>> => isJavaBackend()?cancelJavaSourceOrder(orderId,request.note??request.cancellationReason):await axiosRequest.post(`${ORDERS_BASE_PATH}/${orderId}/cancel`, request);

/** Thu hồi đơn — POST order/orders/{orderId}/recall */
export const recallOrder = async (orderId: string): Promise<IApiResponse<IOrder>> => await axiosRequest.post(`${ORDERS_BASE_PATH}/${orderId}/recall`);

/** Đi đơn (đẩy sang vận chuyển) — POST order/orders/{orderId}/ship */
export const shipOrder = async (orderId: string): Promise<IApiResponse<IOrder>> => isJavaBackend()?shipJavaSourceOrder(orderId):await axiosRequest.post(`${ORDERS_BASE_PATH}/${orderId}/ship`, {});

/** Xác nhận đơn thu hồi — POST order/orders/{id}/confirm-recall */
export const confirmRecallOrder = async (orderId: string): Promise<IApiResponse<IOrder>> => await axiosRequest.post(`${ORDERS_BASE_PATH}/${orderId}/confirm-recall`);

/** Xác nhận thanh toán thủ công — PUT order/orders/{orderId}/confirm-payment */
export const confirmOrderPayment = async (orderId: string, request: IConfirmOrderPaymentRequest): Promise<IApiResponse<IOrder>> =>
  await axiosRequest.put(`${ORDERS_BASE_PATH}/${orderId}/confirm-payment`, request);

export const deleteOrder = async (orderId: string): Promise<IApiResponse<void>> => await axiosRequest.delete(`${ORDERS_BASE_PATH}/${orderId}`);

/** Audit logs của đơn hàng — GET order/orders/audit-logs */
export const getOrderAuditLogs = async (params: IOrderAuditLogListRequest): Promise<unknown> => {
  return await axiosRequest.get(`${ORDERS_BASE_PATH}/audit-logs`, { params });
};

/** Tạo yêu cầu đổi trả — POST order/order-returns */
export const createOrderReturn = async (request: ICreateOrderReturnRequest): Promise<IApiResponse<unknown>> => await axiosRequest.post(`${ORDER_RETURNS_BASE_PATH}`, request);

export const quoteAdminOrderReturn = async (request: IAdminOrderReturnQuoteRequest): Promise<IOrderReturnQuoteResponse> => await axiosRequest.post(`order/admin/order-returns/quote`, request);

export const commitAdminOrderReturn = async (request: IAdminOrderReturnCommitRequest): Promise<IAdminOrderReturnCommitResponse> => await axiosRequest.post(`order/admin/order-returns/commit`, request);

/** Danh sách yêu cầu đổi trả — POST order/order-returns/list */
export const getOrderReturnList = async (request: IOrderReturnListRequest): Promise<IOrderReturnListResponse> => await axiosRequest.post(`${ORDER_RETURNS_BASE_PATH}/list`, request);

/** Chi tiết yêu cầu đổi trả — GET order/order-returns/{id} */
export const getOrderReturnDetail = async (orderReturnId: string): Promise<IOrderReturnDetailResponse> => await axiosRequest.get(`${ORDER_RETURNS_BASE_PATH}/${orderReturnId}`);

/** Cập nhật toàn bộ yêu cầu đổi trả — PUT order/order-returns/{id} */
export const updateOrderReturn = async (orderReturnId: string, request: IUpdateOrderReturnRequest): Promise<IApiResponse<IOrderReturnDetailResponse>> =>
  await axiosRequest.put(`${ORDER_RETURNS_BASE_PATH}/${orderReturnId}`, request);

/** Duyệt yêu cầu đổi trả — PUT order/order-returns/{id}/approve */
export const approveOrderReturn = async (orderReturnId: string, request: IResolveOrderReturnRequest): Promise<IApiResponse<IOrderReturnDetailResponse>> =>
  await axiosRequest.put(`${ORDER_RETURNS_BASE_PATH}/${orderReturnId}/approve`, request);

/** Từ chối yêu cầu đổi trả — PUT order/order-returns/{id}/reject */
export const rejectOrderReturn = async (orderReturnId: string, request: IRejectOrderReturnRequest): Promise<IApiResponse<unknown>> =>
  await axiosRequest.put(`${ORDER_RETURNS_BASE_PATH}/${orderReturnId}/reject`, request);

/** Discover voucher khi tạo đơn thủ công — POST order/orders/promotion-vouchers/discover */
export const discoverOrderPromotionVouchers = async (request: DiscoverOrderPromotionVouchersRequestDto): Promise<DiscoverPromotionVouchersResponseDto> =>
  await axiosRequest.post(`${ORDERS_BASE_PATH}/promotion-vouchers/discover`, request);
