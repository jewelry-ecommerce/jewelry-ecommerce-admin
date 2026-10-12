import type { PaymentMethod, IOrderPackagingRelation } from '../../../apis/order';
import type { IOrderCatalogProduct, IOrderProductVariation } from '../../../apis/order';
import { type OrderPurpose, type OrderSource } from '../../../apis/order/order.enum';

export interface CartLine {
  key: string;
  productId: string;
  productName: string;
  image?: string;
  variation: IOrderProductVariation;
  quantity: number;
}

export interface CreateOrderFormValues {
  crmSearch: string;
  /** Họ và tên đầy đủ */
  firstName: string;
  receiverPhone: string;
  contactEmail: string;
  warehouseId: string;
  source: OrderSource | '';
  purpose: OrderPurpose;
  note: string;
  provinceCode: number | '';
  wardCode: number | '';
  addressLine: string;
  shippingCarrier: string;
  shippingService: string;
  paymentMethod: PaymentMethod | '';
  notePayment: string;
  /** Ghi chú nội bộ (màn chỉnh sửa — gộp vào note khi lưu nếu cần) */
  internalNote: string;
  /** Chỉ hiển thị màn chỉnh sửa — không bắt buộc gửi API */
  paymentReceivedAmount: string;
  transactionRef: string;
}

export interface FieldOption {
  value: string | number;
  label: string;
}

export interface WarehouseOption extends FieldOption {
  /** Mã kho WMS — gửi kèm pickupAddress để OMS lưu đúng kho. */
  code?: string;
  addressLine: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  phone: string;
}

export interface ShippingServiceOption {
  value: string;
  label: string;
  fee: number;
  estimatedDateLabel: string;
  estimatedDeliveryAt?: string;
  serviceId?: number;
  serviceTypeId?: number;
}

export interface CreateOrderCatalogPickContext {
  id: string;
  name: string;
  image?: string;
  packagingRelations?: IOrderPackagingRelation[];
}

export interface CreateOrderSidebarPartProps {
  onBack: () => void;
  productQuery: string;
  onProductQueryChange: (value: string) => void;
  catalog: IOrderCatalogProduct[];
  catalogLoading: boolean;
  selectedProductIds: string[];
  onToggleProduct: (product: CreateOrderCatalogPickContext) => void;
}
