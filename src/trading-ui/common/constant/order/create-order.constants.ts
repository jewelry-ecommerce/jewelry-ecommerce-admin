import { OrderPurpose, OrderSource, type OrderStatus, PaymentMethod } from '../../../apis/order/order.enum';
import { type FieldOption } from '../../../pages/order/create-order/create-order.interface';
export {
  DEFAULT_MOCK_SHIPPING_FEE,
  PROVINCE_SHIPPING_FEE_MOCK_BY_CODE,
  SHIPPING_CARRIER_OPTIONS,
  // SHIPPING_SERVICE_MOCK_OPTIONS,
  WAREHOUSE_OPTIONS,
  resolveMockShippingFeeByProvince,
} from '../../../pages/order/create-order/shipping-mock.data';

/** Đồng bộ SL khi tăng: quá thời gian này → toast «Kết nối gián đoạn» + rollback (Ngoại lệ 2). */
export const CART_LINE_SYNC_TIMEOUT_MS = 3000;

const MANUAL_ORDER_TYPES = [
  { value: OrderPurpose.ADDITIONAL, label: 'Đặt thêm' },
  { value: OrderPurpose.COMPENSATION, label: 'Đơn bù' },
  { value: OrderPurpose.STORE, label: 'Đơn cửa hàng' },
  { value: OrderPurpose.RETAIL, label: 'Đơn bán lẻ' },
  { value: OrderPurpose.GIFT, label: 'Quà tặng' },
  { value: OrderPurpose.RETURN, label: 'Đổi trả' },
] as const;

export const DEFAULT_SHIPPING_FEE = 25000;

export const PAYMENT_METHOD_OPTIONS: FieldOption[] = [
  { value: PaymentMethod.COD, label: 'Thanh toán khi nhận hàng (COD)' },
  { value: PaymentMethod.QR_CODE, label: 'QR Code (Ngân hàng / Ví)' },
];

export const PAYMENT_METHOD_OPTIONS_EDIT: FieldOption[] = [
  { value: PaymentMethod.COD, label: 'Thanh toán khi nhận hàng (COD)' },
  { value: PaymentMethod.QR_CODE, label: 'QR Code (Ngân hàng / Ví)' },
];

export const MANUAL_ORDER_OPTIONS: FieldOption[] = MANUAL_ORDER_TYPES.map((o) => ({
  value: o.value,
  label: o.label,
}));

const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  [OrderSource.SHOPEE]: 'Shopee',
  [OrderSource.TIKTOK]: 'Tiktok Shop',
  [OrderSource.LAZADA]: 'Lazada',
  [OrderSource.FACEBOOK]: 'Facebook',
  [OrderSource.INSTAGRAM]: 'Instagram',
  [OrderSource.ZALO]: 'Zalo',
  [OrderSource.WEBSITE]: 'Website',
  [OrderSource.APP]: 'Ứng dụng',
  [OrderSource.STORE_POS]: 'Store POS (Cửa hàng)',
  [OrderSource.STORE_SHIP_FROM_STORE]: 'Store Ship from Store (Giao hàng tại cửa hàng)',
  [OrderSource.MANUAL]: 'Manual (Tạo thủ công)',
  [OrderSource.AFFILIATE]: 'Affiliate (Tiếp thị liên kết)',
  [OrderSource.LIVE_STREAM]: 'Livestream',
  // [OrderSource.ADMIN]: 'Admin',
};

export const ORDER_SOURCE_OPTIONS: FieldOption[] = Object.values(OrderSource).map((source) => ({
  value: source,
  label: ORDER_SOURCE_LABELS[source],
}));

export const getOrderStatusPillSx = (status: OrderStatus) => {
  switch (status) {
    case 'Pending':
      return { color: '#B54708', backgroundColor: '#FFFAEB' };
    case 'Confirmed':
      return { color: '#155EEF', backgroundColor: '#EFF8FF' };
    case 'Picking':
    case 'Packed':
      return { color: '#7A5AF8', backgroundColor: '#F4F3FF' };
    case 'Shipping':
    case 'InTransit':
      return { color: '#175CD3', backgroundColor: '#EFF8FF' };
    case 'Delivered':
      return { color: '#027A48', backgroundColor: '#ECFDF3' };
    case 'DeliveryFailed':
    case 'Cancelled':
      return { color: '#B42318', backgroundColor: '#FEF3F2' };
    case 'ReturnProcessing':
    case 'Returned':
    case 'Refunded':
      return { color: '#B93815', backgroundColor: '#FFF6ED' };
    case 'Completed':
      return { color: '#027A48', backgroundColor: '#ECFDF3' };
    default:
      return { color: '#344054', backgroundColor: '#F2F4F7' };
  }
};
