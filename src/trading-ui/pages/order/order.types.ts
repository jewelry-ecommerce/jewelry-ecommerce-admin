import { type IStatusHistory, type OrderErrorLog, type OrderSource, type OrderStatus as ApiOrderStatus, type OrderTimeFilter, type PaymentMethod as ApiPaymentMethod, type PaymentStatus, type ShippingMethod } from '../../apis/order';
import type { IOrderReturnQuoteResponse } from '../../apis/order/order.interface';

export type OrderStatus = ApiOrderStatus;
export type OrderPaymentMethod = ApiPaymentMethod;

export type UnsupportedOrderStatusFilter = 'express' | 'shippingCombined' | 'returnCombined';

export type OrderStatusFilter = 'all' | OrderStatus | UnsupportedOrderStatusFilter;

// prettier-ignore
export type OrderTimeOptionValue =
  OrderTimeFilter.TODAY | OrderTimeFilter.YESTERDAY | OrderTimeFilter.CUSTOM | OrderTimeFilter.LAST_7_DAYS | OrderTimeFilter.LAST_30_DAYS | OrderTimeFilter.THIS_MONTH | OrderTimeFilter.LAST_MONTH;

export type OrderFilterOptionValue = 'website' | 'cod' | 'priority-confirmation' | 'vip-customer';

export interface OrderAdvancedFilters {
  source: OrderSource | '';
  paymentStatus: PaymentStatus | '';
  warehouseId: string;
  createdById: string;
  skuCode: string;
  provinceName: string;
  dateField: 'createdAt' | 'deliveredAt';
}

export type OrderSortField = 'orderCode' | 'createdAt' | 'source' | 'customer' | 'product' | 'quantity' | 'brand' | 'totalAmount';

export type SortDirection = 'asc' | 'desc';

export interface CustomerInfo {
  id: string;
  primaryText: string;
  secondaryText: string;
  phone: string;
  maskedPhone: string;
  email: string;
}

export interface OrderShippingAddress {
  id: string;
  firstName: string;
  lastName: string;
  receiverPhone: string;
  provinceCode: number | null;
  provinceName: string;
  wardCode: number | null;
  wardName: string;
  addressLine: string;
}

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  imageUrl?: string;
  thumbnailTone: string;
  thumbnailAccent: string;
}

export interface Order {
  id: string;
  orderCode: string;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string | null;
  source: OrderSource;
  shippingMethod?: ShippingMethod;
  shippingCarrier?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: OrderPaymentMethod | undefined;
  isAllowCheck: boolean;
  isDataValid?: boolean;
  errorLog?: OrderErrorLog;
  customer: CustomerInfo;
  shippingAddress: OrderShippingAddress;
  subtotal: string | number | null;
  discountTotal: string | number | null;
  /** Tổng thanh toán (BE) — dùng cho list / export. */
  grandTotal: string | number | null;
  items: OrderItem[];
  shippingTrackingUrl: string;
  brand: string;
  statusHistory?: IStatusHistory[];
  warehouseName?: string | null;
  posMetadata?: {
    cashierId?: string | null;
    cashierName?: string | null;
    storeCode?: string | null;
    shiftId?: string | null;
    deviceId?: string | null;
    sellers?: Array<{ id: string; code: string; name: string }>;
  } | null;
}

export interface OrderStatusOption {
  value: OrderStatusFilter;
  label: string;
  highlighted?: boolean;
}

export type ReturnExchangeFlowStep = 1 | 2 | 3;
export type ReturnExchangeOption = { value: string; label: string };

export type ReturnableOrderLine = {
  lineId: string;
  productId: string;
  productName: string;
  sku: string;
  variantId: string;
  imageUrl: string;
  quantityPurchased: number;
  priceSnapshot: number;
};

export type ReturnItem = {
  lineId: string;
  productId: string;
  variantId: string;
  sku: string;
  quantity: number;
  priceSnapshot: number;
  productName: string;
  imageUrl: string;
};

export type ExchangeItem = {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  quantity: number;
  priceSnapshot: number;
  imageUrl: string;
  isSameProductExchange: boolean;
};

export type ReturnExchangeOrderSummary = {
  orderCode: string;
  customerName: string;
  paymentMethod?: ApiPaymentMethod;
  paymentStatus?: PaymentStatus;
  lines: ReturnableOrderLine[];
};

export type ReturnExchangeBankInfo = {
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
};

export interface ReturnItemValue {
  lineId: string;
  productName: string;
  sku: string;
  quantity: number;
  priceSnapshot: number;
  imageUrl: string;
}

export interface ExchangeItemValue {
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  priceSnapshot: number;
  imageUrl: string;
}

export interface ReturnExchangeShippingServiceOption {
  value: string;
  label: string;
  fee?: number;
  estimatedDateLabel?: string;
  estimatedDeliveryAt?: string;
  method: ShippingMethod;
}

export interface ReturnExchangeWarehouseOption {
  value: string;
  label: string;
  code?: string;
  addressLine: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  phone: string;
}

export interface ReturnExchangeStepConfirmPartProps {
  exchangeOnly?: boolean;
  quote?: IOrderReturnQuoteResponse | null;
  quoteLoading?: boolean;
  quoteError?: boolean;
  returnItems: ReturnItemValue[];
  exchangeItems: ExchangeItemValue[];
  returnReasonOptions: ReturnExchangeOption[];
  requestTypeOptions: ReturnExchangeOption[];
  priceDiff: number;
  returnReason: string;
  requestType: string;
  returnReasonError?: string;
  requestTypeError?: string;
  evidenceImageUrls: string[];
  evidenceImageUrlsError?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountHolderError?: string;
  bankAccountNumberError?: string;
  bankNameError?: string;
  bankBranchError?: string;
  shouldShowBankFields?: boolean;
  pickupAddress: {
    warehouseId: string;
    warehouseCode?: string;
    warehouseName: string;
    addressLine: string;
    provinceCode: number;
    provinceName: string;
    phone: string;
    wardCode: number;
    wardName: string;
  };
  shippingAddress: {
    lastName: string;
    firstName: string;
    receiverPhone: string;
    wardCode: number;
    wardName: string;
    addressLine: string;
    provinceCode: number;
    provinceName: string;
  };
  shippingMethod: ShippingMethod;
  shippingCarrier: string;
  carrierServiceId: number;
  warehouseOptions: ReturnExchangeWarehouseOption[];
  shippingServiceLoading: boolean;
  shippingServiceOptions: ReturnExchangeShippingServiceOption[];
  returnShippingFee: number;
  returnShippingFeeLoading: boolean;
  shipperNote: string;
  internalNote: string;
  onChangeReturnReason: (value: string) => void;
  onChangeRequestType: (value: string) => void;
  onChangeEvidenceImageUrls: (value: string[]) => void;
  onChangeBankAccountHolder?: (value: string) => void;
  onChangeBankAccountNumber?: (value: string) => void;
  onChangeBankName?: (value: string) => void;
  onChangeBankBranch?: (value: string) => void;
  onChangePickupWarehouseId: (warehouseId: string) => void;
  onChangePickupAddress: (value: ReturnExchangeStepConfirmPartProps['pickupAddress']) => void;
  onChangeShippingAddress: (value: ReturnExchangeStepConfirmPartProps['shippingAddress']) => void;
  onChangeShippingMethod: (value: ShippingMethod) => void;
  onChangeCarrierServiceId: (value: number) => void;
  onChangeShipperNote: (value: string) => void;
  onChangeInternalNote: (value: string) => void;
}
