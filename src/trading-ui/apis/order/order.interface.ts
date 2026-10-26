import {
  type OrderCancellationReason,
  type OrderReturnReason,
  type OrderReturnReasonCategory,
  type OrderReturnStatus,
  type OrderReturnType,
  type OrderStatus,
  type PaymentStatus,
  type OrderSource,
  type PaymentMethod,
  type ReturnFaultParty,
  type ShippingMethod,
  type OrderType,
  type OrderSortBy,
  type OrderTimeFilter,
  type OrderPurpose,
  type OrderKind,
  type OrderAuditEntityName,
} from './order.enum';
import type { DiscoverPromotionVouchersResponseDto, ValidatePromotionVoucherCodeResponseDto } from '../promotion/promotion.interface';

export type OrderErrorLog = string | Record<string, string | null | undefined> | null | undefined;

export interface CustomerDisplayPrice {
  currency: 'VND';
  compareAtPriceAfterTaxMinor: number | null;
  sellingPriceAfterTaxMinor: number;
  discountPercent: number | null;
  hasDiscount: boolean;
}
// ==================== Order Item ====================
export interface IOrderItem {
  returnedQuantity?: number;
  id: string;
  orderId?: string;
  variationId: string;
  productId?: string;
  categoryName?: string | null;
  productName?: string;
  variationName: string;
  skuCode: string;
  image: string;
  unitPrice?: string | number;
  salePrice?: string | number;
  quantity: number;
  lineTotal?: string | number;
  discountAmount?: string | number;
  finalAmount?: string | number;
  customerDisplayPrice?: CustomerDisplayPrice;
  attributes?: unknown[];
  lineType?: string;
  parentOrderItemId?: string | null;
  packagingRelationId?: string | null;
  setLineId?: string | null;
  setId?: string | null;
  setSpuId?: string | null;
}

export type IOrderSetLineComponent = Omit<IOrderItem, 'id'> & {
  id?: string;
  isKey?: boolean;
};

export interface IOrderSetLine {
  type: 'SET';
  lineId: string;
  setLineId: string;
  setId: string;
  setSpuId?: string | null;
  code?: string | null;
  name: string;
  slug?: string | null;
  image?: string | null;
  status?: string | null;
  quantity: number;
  subtotalMinor: string | number;
  originalSubtotalMinor?: string | number | null;
  discountMinor?: string | number | null;
  customerDisplayPrice?: CustomerDisplayPrice;
  components: IOrderSetLineComponent[];
}

export interface IOrderItemLine {
  type: 'ITEM';
  id: string;
}

export type IOrderLine = IOrderItemLine | IOrderSetLine;

export interface IOrderListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string | null;
  trackingCode: string;
  orderCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  isAllowCheck?: boolean;
  source: OrderSource;
  errorLog?: OrderErrorLog;
  shippingMethod?: ShippingMethod;
  shippingCarrier?: string;
  contactEmail?: string;
  shippingAddressSnapshot?: IShippingAddress | null;
  vatInvoice?: IVatInvoiceSnapshot | null;
  isDataValid?: boolean;
  subtotal?: string | number;
  discountTotal?: string | number;
  grandTotal?: string | number | null;
  items: IOrderItem[];
  shippingTrackingUrl?: string;
  statusHistory?: IStatusHistory[];
  refundFund?: IOrderRefundFund | null;
  tenantCode?: string;
  warehouseName?: string | null;
  metadata?: {
    pos?: {
      cashierId?: string | null;
      cashierName?: string | null;
      storeCode?: string | null;
      shiftId?: string | null;
      deviceId?: string | null;
      sellers?: Array<{ id: string; code: string; name: string }>;
      sellerUserIds?: string[];
    } | null;
  } | null;
}

// ==================== Order Counter Payment ====================
/** Khoản thu tại quầy POS (OMS GET order/orders/:id/counter-payment) — CASH: tiền khách đưa + tiền thừa; CARD_POS_PAYOO: mã chuẩn chi. */
export interface IOrderCounterPayment {
  id: string;
  orderId: string;
  orderCode: string;
  method: 'CASH' | 'CARD_POS_PAYOO';
  amountDue: number;
  cashTendered: number | null;
  changeAmount: number | null;
  approvalCode: string | null;
  recordedByName: string | null;
  recordedAt: string;
}

// ==================== Order Notes ====================
/** `order` = ghi chú đơn, `internal` = ghi chú nội bộ (chỉ nhân viên xem). */
export type OrderNoteType = 'order' | 'internal';

/** Một ghi chú đơn — chỉ thêm, không sửa/xóa. */
export interface IOrderNote {
  id: string;
  orderId: string;
  orderCode: string;
  type: OrderNoteType;
  content: string;
  authorId: string | null;
  authorType: string | null;
  authorName: string | null;
  warehouseId: string | null;
  createdAt: string;
}

// ==================== Shipping Address ====================
/** Snapshot thông tin xuất hóa đơn VAT — đồng bộ checkout / `orders.vatInvoice`. */
export interface IVatInvoiceSnapshot {
  companyName: string;
  companyAddress: string;
  taxCode: string;
  email: string;
}

export interface IShippingAddress {
  id?: string;
  firstName?: string;
  lastName?: string;
  receiverPhone?: string;
  email?: string | null;
  provinceCode: number | null;
  provinceName?: string;
  wardCode: number | null;
  wardName?: string;
  addressLine?: string;
}

/** Snapshot địa chỉ kho giao/nhận trên đơn hàng. */
export interface IOrderPickupAddressSnapshot {
  warehouseId?: string;
  warehouseCode?: string;
  warehouseName?: string;
  addressLine?: string;
  provinceCode?: number;
  provinceName?: string;
  phone?: string;
  wardCode?: number;
  wardName?: string;
}

// ==================== Status History ====================
export interface IStatusHistory {
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedById?: string | null;
  changedByType?: string | null;
  changedByName?: string | null;
  note?: string;
  createdAt: string;
}

// ==================== Promotion ====================
export interface IPromotion {
  id?: string;
  code?: string;
  discountAmount?: string | number;
  orderItemId?: string | null;
  appliedQuantity?: number | null;
  regularQuantity?: number | null;
  quotaExceededQuantity?: number | null;
  promotionUnitPriceMinor?: string | number | null;
  regularUnitPriceMinor?: string | number | null;
  quotaPolicyId?: string | null;
  quotaPolicyType?: string | null;
  quotaRemainingBefore?: number | null;
  quotaRemainingAfter?: number | null;
  [key: string]: unknown;
}

// ==================== Order Metadata ====================
/** BE trả về trong `metadata.cancellation` khi đơn đã hủy. */
export interface IOrderCancellationMetadata {
  note?: string | null;
  /** Giá trị enum `OrderCancellationReason` dạng raw string (vd: "Other"). */
  reason?: string | null;
  cancelId?: string | null;
  cancelledAt?: string | null;
}

export interface IOrderMetadata {
  cancellation?: IOrderCancellationMetadata | null;
  ghnSortCode?: string | null;
  exchangeFromOrderReturnId?: string | null;
  exchangeFromOrderReturnCode?: string | null;
  exchangeGhnClientOrderCode?: string | null;
  exchangeGhnInsuranceValueVnd?: string | number | null;
  campaignId?: string | null;
  fromPreOrder?: boolean;
  preOrderId?: string | null;
  preOrderCode?: string | null;
  inventorySource?: {
    type?: string;
    preOrderId?: string;
    preOrderCode?: string | null;
  } | null;
  pos?: {
    cashierId?: string | null;
    cashierName?: string | null;
    storeCode?: string | null;
    shiftId?: string | null;
    deviceId?: string | null;
    sellers?: Array<{ id: string; code: string; name: string }>;
    sellerUserIds?: string[];
  } | null;
}

export interface IOrderRefundFund {
  hasRefundProposal: boolean;
  isMoneyRefunded: boolean;
  proposalId?: string | null;
  proposalCode?: string | null;
  proposalStatus?: string | null;
  totalRefundAmount?: string | number | null;
}

// ==================== Order ====================
export interface IOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string | null;
  orderCode: string;
  customerId?: string | null;
  contactEmail?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  source: OrderSource;
  shippingMethod?: ShippingMethod;
  shippingAddressSnapshot?: IShippingAddress | null;
  /** Cột trên đơn — đơn POS (nhận tại cửa hàng) không có `shippingAddressSnapshot` nên đọc từ đây. */
  firstName?: string | null;
  lastName?: string | null;
  receiverPhone?: string | null;
  pickupAddressSnapshot?: IOrderPickupAddressSnapshot | null;
  shippingFee?: string | number;
  subtotal?: string | number;
  discountTotal?: string | number;
  taxTotal?: string | number;
  grandTotal?: string | number;
  /** Số tiền COD thu hộ (BE trả về trên chi tiết đơn). */
  codAmount?: string | number | null;
  note?: string;
  notePayment?: string | null;
  vatInvoice?: IVatInvoiceSnapshot | null;
  errorLog?: OrderErrorLog;
  items: IOrderItem[];
  lines?: IOrderLine[];
  statusHistory?: IStatusHistory[];
  promotions?: IPromotion[];
  /** Mã vận đơn (3PL / vận chuyển). */
  trackingCode?: string | null;
  shippingTrackingUrl?: string;
  purpose?: OrderPurpose;
  orderKind?: OrderKind;
  amountReceived?: string;
  paymentTransactionId?: string;
  refundFund?: IOrderRefundFund | null;
  metadata?: IOrderMetadata | null;
  /** Doanh thu khác (No Refund) — số tiền thừa không hoàn khi đổi hàng. */
  otherRevenueNoRefund?: string | number | null;
  warehouseName?: string | null;
}

// ==================== List Order Request ====================
export interface IOrderListRequest {
  page: number;
  take: number;
  search?: string;
  orderType?: OrderType;
  orderBy?: OrderSortBy;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  shippingMethod?: ShippingMethod;
  orderTimeFilter?: OrderTimeFilter;
  startDate?: string;
  endDate?: string;
  provinceName?: string;
  warehouseId?: string;
  source?: OrderSource;
  skuCode?: string;
  createdById?: string;
  dateField?: 'createdAt' | 'deliveredAt';
}

// ==================== List Order Response ====================
export interface IOrderListSummary {
  ALL?: number;
  [OrderStatus.PENDING]?: number;
  [OrderStatus.CONFIRMED]?: number;
  [OrderStatus.PICKING]?: number;
  [OrderStatus.PACKED]?: number;
  [OrderStatus.SHIPPING]?: number;
  [OrderStatus.IN_TRANSIT]?: number;
  [OrderStatus.DELIVERED]?: number;
  [OrderStatus.DELIVERY_FAILED]?: number;
  [OrderStatus.RETURN_PROCESSING]?: number;
  [OrderStatus.RETURNED]?: number;
  [OrderStatus.REFUNDED]?: number;
  [OrderStatus.COMPLETED]?: number;
  [OrderStatus.CANCELLED]?: number;
}

export interface IOrderListResponse {
  total: number;
  list: IOrderListItem[];
  summary: IOrderListSummary;
}

// ==================== Manual order catalog (GET order/orders/products) ====================
export interface IOrderPackagingRelation {
  relationId: string;
  quantity: number;
  includedPriceAfterTax: string;
  isRequired: boolean;
  isDefault: boolean;
  canCustomerChoose: boolean;
  packagingVariationId: string;
  packagingName: string;
  packagingSkuCode: string;
  image?: string | null;
}

export interface IOrderCatalogProduct {
  id: string;
  slug?: string;
  name: string;
  image: string;
  imageHover?: string;
  minSellingPriceAfterTaxMinor: number;
  minCompareAtPriceAfterTaxMinor?: number | null;
  customerDisplayPrice?: CustomerDisplayPrice;
  cheapestVariationId: string;
  totalVariations: number;
  /** Tổng tồn bán được (gộp biến thể). `0` → không cho chọn SP. */
  totalSellableStock?: number;
  categoryName?: string;
  skuCode?: string;
  packagingRelations?: IOrderPackagingRelation[];
}

export interface IOrderProductCatalogResponse {
  total: number;
  list: IOrderCatalogProduct[];
}

export interface IOrderProductCatalogQuery {
  page: number;
  take: number;
  orderBy?: OrderSortBy;
  orderType?: OrderType;
  search?: string;
}

export interface IMyOrderListQuery extends IOrderProductCatalogQuery {
  status?: OrderStatus;
}

/** GET order/orders/product/{productId}/variations — danh sách biến thể (mảng). */
export interface IOrderProductVariationMedia {
  url: string;
  sortOrder: number;
}

export interface IOrderProductVariationAttribute {
  attributeCode: string;
  attributeName: string;
  displayType: string;
  value: string;
  image?: string | null;
  code: string;
}

export interface IOrderProductVariationListItem {
  id: string;
  skuCode: string;
  slug: string;
  name: string;
  price: string;
  unitPrice?: string | number;
  salePrice?: string | number;
  compareAtPriceAfterTaxMinor?: string | number | null;
  sellingPriceAfterTaxMinor?: string | number | null;
  customerDisplayPrice?: CustomerDisplayPrice;
  stock: number;
  status: string;
  medias: IOrderProductVariationMedia[];
  attributes: IOrderProductVariationAttribute[];
  weightGram?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  packagingRelations?: IOrderPackagingRelation[];
}

/** Chi tiết SP + biến thể — dùng khi thêm vào giỏ (modal). */
export interface IOrderProductVariation {
  id: string;
  skuCode: string;
  unitPrice?: number;
  salePrice: number;
  customerDisplayPrice?: CustomerDisplayPrice;
  stockQuantity: number;
  weightLabel?: string | null;
  colorLabel?: string | null;
  sizeLabel?: string | null;
  variationValue?: string[] | null;
  /** Ảnh đại diện biến thể (medias[0] từ API variations). */
  imageUrl?: string | null;
  weightGram?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  packagingRelations?: IOrderPackagingRelation[];
}

export interface IOrderProductDetail {
  id: string;
  name: string;
  image: string;
  imageHover?: string;
  /** VD: "Nhẫn • Bạc 925" */
  subtitle?: string;
  variations: IOrderProductVariation[];
}

export interface ICustomerLookupResult {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  receiverPhone: string;
  contactEmail?: string;
  tierLabel?: string;
  orderCount?: number;
  lastOrderAt?: string;
  provinceCode?: number;
  provinceName?: string;
  wardCode?: number;
  wardName?: string;
  addressLine?: string;
}

/** GET order/orders/customers/by-phone — phần tử mảng trả về */
export interface IOrderCustomerByPhoneItem {
  id: string;
  email?: string | null;
  phone: string;
  firstName?: string | null;
  // lastName?: string | null;
  provinceCode?: number | null;
  provinceName?: string | null;
  wardCode?: number | null;
  wardName?: string | null;
  addressLine?: string | null;
  address?: {
    id?: string;
    customerId?: string;
    addressLine?: string | null;
    wardCode?: number | null;
    wardName?: string | null;
    provinceCode?: number | null;
    provinceName?: string | null;
  } | null;
}

export interface IOrderShippingServicesRequest {
  shopId: number;
  fromWardIdV2: number;
  fromAddressV2: string;
  toWardIdV2: number;
  toAddressV2: string;
  totalWeightGrams: number;
}

/** Kho xuất hàng OMS trả cho đơn (`GET orders/warehouses`) — mã tỉnh/phường là mã GHN. */
export interface IOrderWarehouse {
  warehouseId?: string;
  warehouseCode?: string;
  warehouseName: string;
  phone: string;
  addressLine: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
}

export interface IOrderShippingServiceItem {
  serviceId?: number;
  serviceTypeId?: number;
  shortName?: string;
  serviceName?: string;
  service_id?: number;
  service_type_id?: number;
  short_name?: string;
  service_name?: string;
  expectedDeliveryTime?: string;
  leadtime?:
    | number
    | {
        leadtime?: number;
        leadtime_order?: {
          from_estimate_date?: string;
          to_estimate_date?: string;
        };
      };
  expected_delivery_time?: string;
  totalFee?: number;
  fee?: number;
  total_fee?: number;
}

export interface ICalculateOrderShippingFeeItem {
  id?: number;
  name: string;
  code?: string;
  quantity: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  convert_weight?: number;
  calculate_weight?: number;
  image_ids?: string[];
}

export interface ICalculateOrderShippingFeeRequest {
  shopId?: number;
  serviceId: number;
  serviceTypeId?: number;
  fromWardIdV2?: number;
  fromAddressV2?: string;
  toWardIdV2?: number;
  toAddressV2?: string;
  height: number;
  length: number;
  width: number;
  weight: number;
  insuranceValue?: number;
  coupon?: string;
  items?: ICalculateOrderShippingFeeItem[];
}

export interface ICalculateOrderShippingFeeResponse {
  totalFee?: number;
  total_fee?: number;
  fee?: number;
  serviceId?: number;
  serviceTypeId?: number;
  expectedDeliveryTime?: string;
  expected_delivery_time?: string;
  leadtime?: number;
  [key: string]: unknown;
}

/** POST order/orders/pricing-context/quote — báo giá tạm tính khi tạo đơn thủ công. */
export interface IAdminOrderV2Context {
  contextVersion: 2;
  receiverPhone: string;
  items: Array<{
    variationId: string;
    quantity: number;
  }>;
  wardCode?: number;
  addressLine: string;
  couponCodes?: string[];
  firstName?: string;
  provinceCode?: number;
  provinceName?: string;
  wardName?: string;
  shippingMethod?: ShippingMethod;
}

export interface ILegacyOrderPricingContextQuoteRequest {
  items: Array<{
    variationId: string;
    quantity: number;
  }>;
  couponCodes?: string[];
  paymentMethod: PaymentMethod;
  shippingFee: number;
}

export interface IAdminOrderPricingContextQuoteRequest extends IAdminOrderV2Context {
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
}

export type IOrderPricingContextQuoteRequest = ILegacyOrderPricingContextQuoteRequest | IAdminOrderPricingContextQuoteRequest;

export interface IOrderPricingContextQuotePricing {
  subtotal?: string | number;
  shippingFee?: string | number;
  baseShippingFee?: string;
  shippingDiscount?: string;
  declaredValueFee?: string | number;
  discountTotal?: string | number;
  taxTotal?: string | number;
  grandTotal?: string | number;
  linePromotionSpend?: string | number;
  cartPromotionSpend?: string | number;
  totalPromotionSpend?: string | number;
}

export interface IOrderPricingCouponOutcome {
  normalizedCouponCode: string;
  status: string;
  reasonCodes?: string[];
}

export interface IOrderPricingShippingBreakdown {
  baseFeeMinor?: string;
  discountMinor?: string;
  customerFeeMinor?: string;
  shippingCarrier?: string;
  carrierServiceId?: number;
}

export interface IOrderPricingContextQuoteItem {
  variationId: string;
  productId?: string;
  productName?: string;
  variationName?: string;
  skuCode?: string;
  image?: string | null;
  unitPrice?: string | number;
  salePrice?: string | number;
  quantity?: number;
  lineTotal?: string | number;
  discountAmount?: string | number;
  finalAmount?: string | number;
  lineType?: string;
  pricingMode?: string;
  customerDisplayPrice?: {
    currency?: string;
    compareAtPriceAfterTaxMinor?: string | number | null;
    sellingPriceAfterTaxMinor?: string | number;
    discountPercent?: number | null;
    hasDiscount?: boolean;
  };
}

export interface IOrderPricingContextQuoteResponse {
  pricingEvaluationId?: string;
  couponCodes?: string[];
  couponOutcomes?: IOrderPricingCouponOutcome[];
  shipping?: IOrderPricingShippingBreakdown;
  paymentMethod?: PaymentMethod | string;
  items?: IOrderPricingContextQuoteItem[];
  pricing?: IOrderPricingContextQuotePricing;
  warnings?: string[];
}

export type IAdminOrderVoucherDiscoverRequest = IAdminOrderV2Context;

export interface IAdminOrderVoucherValidateRequest extends IAdminOrderV2Context {
  code: string;
}

export type IAdminOrderVoucherDiscoverResponse = DiscoverPromotionVouchersResponseDto;
export type IAdminOrderVoucherValidateResponse = ValidatePromotionVoucherCodeResponseDto;

// ==================== Create Order Request ====================
export interface ICreateOrderRequest {
  contextVersion?: 2;
  items: Array<{
    variationId: string;
    quantity: number;
  }>;
  receiverPhone: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  firstName: string;
  lastName?: string;
  paymentMethod: PaymentMethod;
  couponCodes?: string[];
  pricingEvaluationId?: string;
  expectedGrandTotalMinor?: string;
  idempotencyKey?: string;
  // code này được thêm vởi quân phạm
  returnUrl?: string;
  // code này được thêm vởi quân phạm
  shippingMethod?: ShippingMethod;
  note?: string;
  notePayment?: string;
  contactEmail?: string;
  source: OrderSource;
  paymentStatus?: PaymentStatus;
  promotionIds?: string[];
  /** Loại đơn thủ công: Đặt thêm, Đơn bù, ... (BRD) */
  purpose?: OrderPurpose;
  orderKind?: OrderKind;
  shippingCarrier?: string;
  carrierServiceId?: number;
  shippingFee?: number;
  estimatedDeliveryAt?: string;
  vatInvoice?: IVatInvoiceSnapshot | null;
  pickupAddress?: {
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
}

export interface IAdminCreateOrderV2Request extends IAdminOrderV2Context {
  contextVersion: 2;
  firstName: string;
  paymentMethod: PaymentMethod;
  couponCodes: string[];
  pricingEvaluationId: string;
  expectedGrandTotalMinor: string;
  idempotencyKey: string;
  returnUrl?: string;
  note?: string;
  notePayment?: string;
  contactEmail?: string;
  source: OrderSource;
  purpose?: OrderPurpose;
  orderKind?: OrderKind;
}

export type ICreateOrderApiRequest = ICreateOrderRequest | IAdminCreateOrderV2Request;

// code này được thêm vởi quân phạm
export interface ICreateOrderResponse {
  success?: boolean;
  orderId: string;
  orderCode: string;
  paymentMethod?: PaymentMethod;
  paymentId?: string | null;
  paymentUrl?: string | null;
  paymentLinkExpiresAt?: string | null;
  error?: string | null;
}
// code này được thêm vởi quân phạm

// ==================== Update Order Request ====================
export interface IUpdateOrderRequest {
  items?: Array<{
    variationId: string;
    quantity: number;
  }>;
  receiverPhone?: string;
  provinceCode?: number | null;
  provinceName?: string;
  wardCode?: number | null;
  wardName?: string;
  addressLine?: string;
  firstName?: string;
  lastName?: string;
  paymentMethod?: PaymentMethod;
  shippingMethod?: ShippingMethod;
  note?: string;
  notePayment?: string;
  contactEmail?: string;
  source?: OrderSource;
  paymentStatus?: PaymentStatus;
  promotionIds?: string[];
  status?: OrderStatus;
  purpose?: OrderPurpose;
  orderKind?: OrderKind;
  shippingCarrier?: string;
  carrierServiceId?: number;
  shippingFee?: number;
  estimatedDeliveryAt?: string;
  vatInvoice?: IVatInvoiceSnapshot | null;
  pickupAddress?: {
    warehouseId: string;
    warehouseName: string;
    addressLine: string;
    provinceCode: number;
    provinceName: string;
    phone: string;
    wardCode: number;
    wardName: string;
  };
}

// ==================== Cancel Order Request ====================
export interface ICancelOrderRequest {
  cancellationReason: OrderCancellationReason;
  note?: string;
}

// ==================== Duplicate Order Request ====================
export interface IDuplicateOrderRequest {
  sourceOrderId: string;
  replaceSourceAfterDuplicate?: boolean;
  cancellationReason?: OrderCancellationReason;
  cancellationNote?: string;
}

// ==================== Confirm Payment Request ====================
export interface IConfirmOrderPaymentRequest {
  // paymentId: string;
  // amountReceived: number;
  note: string;
}

export interface IOrderPaymentStatusResponse {
  orderId?: string;
  orderCode?: string;
  /** `check-paid`: trạng thái cổng (`PAID`, `FAILED`…); endpoint khác có thể là `OrderStatus`. */
  status?: OrderStatus | string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentUrl?: string | null;
  error?: string | null;
  paymentRetryCount?: number;
  maxPaymentRetries?: number;
  /** POST `check-paid` */
  paid?: boolean;
  paymentId?: string;
  paidAt?: string;
  provider?: string;
  providerOrderNo?: string;
  providerStatus?: string;
  checkedWithProvider?: boolean;
  synced?: boolean;
  checkedAt?: string;
}

export interface IRetryOrderPaymentRequest {
  paymentMethod?: PaymentMethod;
  returnUrl?: string;
}

export interface ILookupOrderRequest {
  phone: string;
  orderCode?: string;
}

export interface ILookupOrderResponseItem {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
  grandTotal?: number | string;
}

export interface ICreateOrderReturnRequest {
  orderId: string;
  type: OrderReturnType;
  reason: OrderReturnReason;
  returnItems: Array<{
    orderItemId: string;
    quantity: number;
  }>;
  exchangeItems: Array<{
    variationId: string;
    quantity: number;
  }>;
  pickupAddress?: {
    warehouseId: string;
    warehouseName: string;
    addressLine: string;
    provinceCode: number;
    provinceName: string;
    phone: string;
    wardCode: number;
    wardName: string;
  };
  shippingAddress?: {
    lastName: string;
    firstName: string;
    receiverPhone: string;
    wardCode: number;
    wardName: string;
    addressLine: string;
    provinceCode: number;
    provinceName: string;
  };
  shippingMethod?: ShippingMethod;
  shippingCarrier?: string;
  carrierServiceId?: number;
  returnShippingFee?: number | null;
  estimatedDeliveryAt?: string;
  shipperNote?: string;
  refundBankAccountHolder?: string;
  refundBankAccountNumber?: string;
  refundBankName?: string;
  refundBankBranch?: string;
  /** @deprecated dùng refundBank* fields */
  bankAccountHolder?: string;
  /** @deprecated dùng refundBank* fields */
  bankAccountNumber?: string;
  /** @deprecated dùng refundBank* fields */
  bankName?: string;
  /** @deprecated dùng refundBank* fields */
  bankBranch?: string;
  note?: string;
  evidenceImageUrls?: string[];
}

export interface IOrderReturnQuoteReference {
  pricingEvaluationId: string;
  fingerprint: string;
  exchangeMerchandiseTotalMinor: number;
  shipping: {
    declaredValueFeeMinor: number;
    shippingFeeMinor: number;
    totalFeeMinor: number;
    customerPayableShippingMinor: number;
  };
}

export type IAdminOrderReturnQuoteRequest = Pick<
  ICreateOrderReturnRequest,
  'orderId' | 'reason' | 'returnItems' | 'exchangeItems' | 'pickupAddress' | 'shippingAddress' | 'shippingMethod' | 'shippingCarrier' | 'carrierServiceId'
> & { type?: OrderReturnType; returnId?: string };

export type IAdminOrderReturnCommitRequest = Omit<
  ICreateOrderReturnRequest,
  'returnShippingFee' | 'refundBankAccountHolder' | 'refundBankAccountNumber' | 'refundBankName' | 'refundBankBranch' | 'bankAccountHolder' | 'bankAccountNumber' | 'bankName' | 'bankBranch'
> & { pricingQuote: IOrderReturnQuoteReference };

export interface IOrderReturnQuoteResponse {
  success: boolean;
  quoteReference: IOrderReturnQuoteReference;
  product: {
    returnedMerchandiseSettlementMinor: number;
    exchangeMerchandiseTotalMinor: number;
    merchandiseTopUpMinor: number;
  };
  shipping: {
    returnInboundShippingFeeMinor: number | null;
    exchangeOutboundShippingFeeMinor: number | null;
    exchangeOutboundTotalFeeMinor: number | null;
    customerPayableShippingMinor: number | null;
  };
}

export interface IAdminOrderReturnCommitResponse {
  success: boolean;
  orderReturnCode: string;
  shipmentQueued?: boolean;
}

export interface IRejectOrderReturnRequest {
  note: string;
}

export interface IOrderReturnListRequest {
  page: number;
  take: number;
  search?: string;
  orderType?: OrderType;
  orderBy?: 'createdAt' | 'updatedAt' | 'returnCode' | 'priceDifference';
  orderTimeFilter?: OrderTimeFilter;
  status?: OrderReturnStatus;
  type?: OrderReturnType;
  reason?: OrderReturnReason;
  reasonCategory?: OrderReturnReasonCategory;
  startDate?: string;
  endDate?: string;
  orderId?: string;
}

export interface IOrderReturnLineItem {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  orderReturnId: string;
  orderItemId?: string;
  variationId?: string;
  productId?: string;
  productName: string;
  variationName: string;
  skuCode: string;
  image?: string;
  unitPrice?: string | number;
  salePrice: string | number;
  quantity: number;
  lineTotal: string | number;
  customerDisplayPrice?: CustomerDisplayPrice;
  weightGram?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
}

export interface IOrderReturnCreatedByUser {
  id: string;
  userType: 'employee' | 'customer' | string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  employeeCode?: string | null;
  status?: string | null;
}

export interface IOrderReturnListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  tenantCode?: string | null;
  returnCode: string;
  originalOrderId?: string;
  originalOrderCode?: string;
  /** @deprecated giữ tương thích code cũ */
  orderId: string;
  /** @deprecated giữ tương thích code cũ */
  orderCode: string;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  receiverPhone?: string | null;
  source?: string | null;
  status: OrderReturnStatus | string;
  type: OrderReturnType | string;
  reason: OrderReturnReason | string;
  reasonCategory?: OrderReturnReasonCategory | string | null;
  returnShippingFeePayer?: string | null;
  exchangeShippingFeePayer?: string | null;
  returnFaultParty?: ReturnFaultParty | string | null;
  originalOrderAmountReceived?: string | number | null;
  note?: string | null;
  returnTotal: string | number;
  exchangeTotal: string | number;
  priceDifference: string | number;
  otherRevenueNoRefund?: string | number | null;
  returnPickupCodTotal?: string | number | null;
  returnInboundShippingFee?: string | number | null;
  returnInboundShippingFeeNominal?: string | number | null;
  returnInboundShippingMethod?: ShippingMethod | string | null;
  returnInboundShippingCarrier?: string | null;
  returnInboundCarrierServiceId?: number | null;
  returnInboundShipperNote?: string | null;
  returnPickupTrackingCode?: string | null;
  exchangeFulfillmentOrderId?: string | null;
  exchangeShipmentTrackingCode?: string | null;
  exchangeOutboundShippingFee?: string | number | null;
  exchangeMerchandiseTopUpAmount?: string | number | null;
  exchangeDeliveryCodTotal?: string | number | null;
  exchangeOutboundShippingMethod?: ShippingMethod | string | null;
  exchangeOutboundShippingCarrier?: string | null;
  exchangeOutboundCarrierServiceId?: number | null;
  exchangeOutboundShipperNote?: string | null;
  loyaltyPointsReceived?: number | null;
  totalRefundAmount?: string | number | null;
  paymentMethod?: PaymentMethod | string | null;
  evidenceImageUrls?: string[];
  pickupAddressSnapshot?: ICreateOrderRequest['pickupAddress'];
  shippingAddressSnapshot?: ICreateOrderReturnRequest['shippingAddress'];
  trackingCode?: string | null;
  resolvedById?: string | null;
  resolvedByName?: string | null;
  createdByUser?: IOrderReturnCreatedByUser | null;
  refundBankAccountHolder?: string | null;
  refundBankAccountNumber?: string | null;
  refundBankName?: string | null;
  refundBankBranch?: string | null;
  /** @deprecated dùng refundBank* fields */
  bankAccountHolder?: string | null;
  /** @deprecated dùng refundBank* fields */
  bankAccountNumber?: string | null;
  /** @deprecated dùng refundBank* fields */
  bankName?: string | null;
  /** @deprecated dùng refundBank* fields */
  bankBranch?: string | null;
  originalOrderTrackingCode?: string | null;
  resolvedAt?: string | null;
  resolvedNote?: string | null;
  reasonReject?: string | null;
  recallTrackingCode?: string | null; // backward-compatible alias
  returnItems: IOrderReturnLineItem[];
  exchangeItems: IOrderReturnLineItem[];
}

export interface IOrderReturnStatusHistoryItem {
  id: string;
  orderReturnId: string;
  fromStatus: OrderReturnStatus | string | null;
  toStatus: OrderReturnStatus | string;
  changedById?: string | null;
  changedByType?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface IOrderReturnDetailResponse extends IOrderReturnListItem {
  shippingMethod?: ShippingMethod;
  shippingCarrier?: string | null;
  carrierServiceId?: number | null;
  shipperNote?: string | null;
  returnShippingFee?: number | null;
  returnFaultParty?: ReturnFaultParty | null;
  loyaltyPointsReceived?: number | null;
  evidenceImageUrls?: string[];
  /** Đơn gốc (khi BE trả kèm trong chi tiết yêu cầu đổi trả). */
  originalOrder?: IOrder;
  orderReturnStatusHistory?: IOrderReturnStatusHistoryItem[];
}

export interface IUpdateOrderReturnRequest {
  pricingQuote?: IOrderReturnQuoteReference;
  type?: OrderReturnType;
  reason?: OrderReturnReason;
  note?: string;
  evidenceImageUrls?: string[];
  status?: OrderReturnStatus;
  paymentMethod?: PaymentMethod;
  trackingCode?: string;
  returnShippingFee?: number | null;
  returnFaultParty?: ReturnFaultParty | null;
  originalOrderAmountReceived?: number | null;
  loyaltyPointsReceived?: number | null;
  receiverPhone?: string;
  lastName?: string;
  firstName?: string;
  pickupAddress?: ICreateOrderRequest['pickupAddress'];
  shippingAddress?: ICreateOrderReturnRequest['shippingAddress'];
  shippingMethod?: ShippingMethod;
  shippingCarrier?: string;
  carrierServiceId?: number;
  estimatedDeliveryAt?: string;
  shipperNote?: string;
  refundBankAccountHolder?: string;
  refundBankAccountNumber?: string;
  refundBankName?: string;
  refundBankBranch?: string;
  /** @deprecated dùng refundBank* fields */
  bankAccountHolder?: string;
  /** @deprecated dùng refundBank* fields */
  bankAccountNumber?: string;
  /** @deprecated dùng refundBank* fields */
  bankName?: string;
  /** @deprecated dùng refundBank* fields */
  bankBranch?: string;
  returnItems?: ICreateOrderReturnRequest['returnItems'];
  exchangeItems?: ICreateOrderReturnRequest['exchangeItems'];
}

export interface IResolveOrderReturnRequest {
  note?: string;
}

export interface IOrderAuditLogListRequest {
  orderBy?: 'createdAt' | 'updatedAt';
  orderType?: OrderType;
  page?: number;
  take?: number;
  orderTimeFilter?: OrderTimeFilter;
  startDate?: string;
  endDate?: string;
  entityName: OrderAuditEntityName;
  entityId: string;
}

export interface IOrderAuditLogChange {
  field?: string | null;
  oldValue?: string | number | null;
  newValue?: string | number | null;
}

export interface IOrderAuditLogActor {
  id?: string | null;
  name?: string | null;
  roleName?: string | null;
}

export interface IOrderAuditLogItem {
  id: string;
  action?: string | null;
  actionType?: string | null;
  source?: string | null;
  message?: string | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  actor?: IOrderAuditLogActor | null;
  changes?: IOrderAuditLogChange[] | null;
  [key: string]: unknown;
}

export interface IOrderAuditLogListResponse {
  list: IOrderAuditLogItem[];
  total: number;
  page: number;
  take: number;
}

export interface IOrderReturnListResponse {
  list: IOrderReturnListItem[];
  total: number;
  page: number;
  take: number;
  /** Summary count theo trạng thái/nhóm do BE trả về (vd: ALL, Pending, AwaitingPickup, Exchange...). */
  summary?: Record<string, number>;
}

// ==================== API Response ====================
export interface IApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
