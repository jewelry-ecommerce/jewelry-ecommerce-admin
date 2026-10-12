// Payment Status Enums
export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  PARTIAL = 'Partial',
  /** COD — đã thu một phần (BE). */
  PARTIAL_PAID_COD = 'PartialPaidCod',
  FAILED = 'Failed',
  /** Đã hoàn tiền */
  REFUNDED = 'Refunded',
}

// // Order Source Enums
// export enum OrderSource {
//   ADMIN = 'Admin',
//   WEBSITE = 'Website',
//   //   MOBILE = 'Mobile',
//   /** Từ ứng dụng di động */
//   APP = 'App',
//   /** Từ TikTok Shop */
//   TIKTOK = 'TikTok',
//   /** Từ Shopee */
//   SHOPEE = 'Shopee',
// }

// Payment Method Enums
export enum PaymentMethod {
  /** Thanh toán khi nhận hàng — OMS xử lý trực tiếp, không qua payment-service */
  COD = 'COD',
  /** QR Code (ngân hàng / ví) */
  QR_CODE = 'QR_CODE',
  /** Thẻ quốc tế Visa/Master/JCB */
  CREDIT_CARD = 'CREDIT_CARD',
  /** Ví điện tử (Apple Pay / Samsung Pay) — Payoo tự detect thiết bị */
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  /** Ví MoMo */
  MOMO_WALLET = 'MOMO_WALLET',
  /** Thanh toán qua ZaloPay */
  ZALO_PAY = 'ZALO_PAY',
  /** Alias backend legacy */
  ZALOPAY = 'ZALOPAY',
  /** Trả góp */
  INSTALLMENT = 'INSTALLMENT',
  /** Chuyển khoản (legacy) */
  BANK_TRANSFER = 'BANK_TRANSFER',
  /** Thẻ ATM (legacy) */
  ATM_CARD = 'ATM_CARD',
  /** VNPAY (legacy) */
  VNPAY = 'VNPAY',
  /** Tiền mặt (POS) */
  CASH = 'CASH',
}

export enum ShippingMethod {
  /** Tiêu chuẩn — giao 1–3 ngày */
  STANDARD = 'Standard',
  /** Khách nhận tại store — không qua vận chuyển */
  STORE_PICKUP = 'StorePickup',
}

// Order Sort By Enums
export enum OrderSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ORDER_CODE = 'orderCode',
  TOTAL_AMOUNT = 'grandTotal',
}

// Order Type Enums (Sort Order)
export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Order Time Filter Enums
export enum OrderTimeFilter {
  TODAY = 'Today',
  YESTERDAY = 'Yesterday',
  LAST_7_DAYS = 'Last7Days',
  LAST_30_DAYS = 'Last30Days',
  LAST_90_DAYS = 'Last90Days',
  THIS_MONTH = 'ThisMonth',
  LAST_MONTH = 'LastMonth',
  CUSTOM = 'Custom',
}

export enum OrderStatus {
  /** Đơn hàng vừa tạo, chờ xác nhận */
  PENDING = 'Pending',
  /** Đã xác nhận, đang chuẩn bị hàng */
  CONFIRMED = 'Confirmed',
  /** Đang nhặt hàng từ kho */
  PICKING = 'Picking',
  /** Đã đóng gói, chờ lấy */
  PACKED = 'Packed',
  /** Đã lấy hàng, trong quá trình giao */
  SHIPPING = 'Shipping',
  /** Đang vận chuyển đến khách */
  IN_TRANSIT = 'InTransit',
  /** Đã giao thành công */
  DELIVERED = 'Delivered',
  /** Giao thất bại, chờ xử lý */
  DELIVERY_FAILED = 'DeliveryFailed',
  /** Chờ xử lý trả hàng */
  RETURN_PROCESSING = 'ReturnProcessing',
  /** Đã hoàn trả */
  RETURNED = 'Returned',
  /** Đã hoàn tiền */
  REFUNDED = 'Refunded',
  /** Đã hoàn thành (hết thời gian khiếu nại) */
  COMPLETED = 'Completed',
  /** Đã hủy */
  CANCELLED = 'Cancelled',
}

export enum OrderPurpose {
  /** Đơn hàng đặt thêm */
  ADDITIONAL = 'Additional',
  /** Đơn hàng bù */
  COMPENSATION = 'Compensation',
  /** Đơn hàng cửa hàng */
  STORE = 'Store',
  /** Đơn bán lẻ */
  RETAIL = 'Retail',
  /** Quà tặng */
  GIFT = 'Gift',
  /** Đổi trả */
  RETURN = 'Return',
}

/** Lý do hủy đơn — khớp payload API POST .../orders/{id}/cancel */
export enum OrderCancellationReason {
  CHANGE_MIND = 'ChangeMind',
  WRONG_ORDER_INFO = 'WrongOrderInfo',
  FOUND_CHEAPER_ELSEWHERE = 'FoundCheaperElsewhere',
  SHIPPING_TOO_LONG = 'ShippingTooLong',
  DUPLICATE_ORDER = 'DuplicateOrder',
  PAYMENT_ISSUE = 'PaymentIssue',
  OTHER = 'Other',
}

/**
 * Nguồn tạo đơn — phân loại theo kênh bán & vận hành.
 */
export enum OrderSource {
  // —— 1. Sàn thương mại điện tử (API / webhook) ——
  /** Shopee — gian hàng chính hãng hoặc shop thường */
  SHOPEE = 'Shopee',
  /** TikTok Shop — tách riêng để đo vận hành nhanh */
  TIKTOK = 'TikTok',
  /** Lazada */
  LAZADA = 'Lazada',

  // —— 2. Social commerce (CSKH / chat / công cụ hỗ trợ) ——
  /** Facebook Fanpage — tin nhắn, bình luận */
  FACEBOOK = 'Facebook',
  INSTAGRAM = 'Instagram',
  /** Zalo OA hoặc Zalo cá nhân */
  ZALO = 'Zalo',

  // —— 3. Kênh sở hữu (Owned) ——
  /** Website trực tiếp (vd. SevaTrading.vn) */
  WEBSITE = 'Website',
  APP = 'App',

  // —— 4. Cửa hàng vật lý (POS / retail) ——
  /** Mua tại quầy (POS) */
  STORE_POS = 'StorePos',
  /** Xem tại cửa hàng, ship từ kho khác / về nhà */
  STORE_SHIP_FROM_STORE = 'StoreShipFromStore',

  // —— 5. Nội bộ & đối tác ——
  /** Tạo thủ công — quen, tặng, đổi trả */
  MANUAL = 'Manual',
  /** Tiếp thị liên kết — KOL/KOC, CTV */
  AFFILIATE = 'Affiliate',
  /** Chốt đơn từ livestream (đo hiệu quả từng buổi) */
  LIVE_STREAM = 'LiveStream',

  /** Giữ cho dữ liệu cũ; đơn mới dùng MANUAL */
  // ADMIN = 'Admin',
}

export enum OrderKind {
  NORMAL = 'Normal',
  RECALL = 'Recall',
  RETURN = 'Return',
}

export enum OrderReturnType {
  /** @deprecated giữ tương thích data cũ */
  COMPENSATION = 'Compensation',
  EXCHANGE = 'Exchange',
  REFUND = 'Refund',
}

export enum OrderReturnReason {
  // WRONG_ORDER_DELIVERED = 'WrongOrderDelivered',
  // EMPTY_BOX_DELIVERED = 'EmptyBoxDelivered',
  // MISSING_ITEMS_DELIVERED = 'MissingItemsDelivered',
  // WRONG_PRODUCT_DELIVERED = 'WrongProductDelivered',
  // WRONG_FULL_ORDER = 'WrongFullOrder',
  // // EMPTY_BOX = 'EmptyBoxDelivered',
  // MISSING_ITEMS = 'MissingItems',
  // WRONG_PRODUCT = 'WrongProduct',
  // DEFECTIVE_PRODUCT = 'DefectiveProduct',
  // PRODUCT_NOT_AS_DESCRIBED = 'ProductNotAsDescribed',
  // CHANGED_MIND = 'ChangedMind',
  // DIFFERENT_FROM_DESCRIPTION = 'DifferentFromDescription',
  // CHANGE_OF_MIND = 'ChangeOfMind',
  // /** @deprecated giữ tương thích dữ liệu cũ */
  // SUBJECTIVE_ERROR = 'SubjectiveError',
  // /** @deprecated giữ tương thích dữ liệu cũ */
  // OBJECTIVE_ERROR = 'ObjectiveError',
  /** Khách quan — Giao nhầm (sai toàn bộ đơn) */
  WRONG_ORDER_DELIVERED = 'WrongOrderDelivered',
  /** Khách quan — Giao thùng rỗng */
  EMPTY_BOX_DELIVERED = 'EmptyBoxDelivered',
  /** Khách quan — Giao thiếu hàng */
  MISSING_ITEMS_DELIVERED = 'MissingItemsDelivered',
  /** Khách quan — Giao sai sản phẩm */
  WRONG_PRODUCT_DELIVERED = 'WrongProductDelivered',
  /** Khách quan — Hàng bị lỗi (rớt đá, móp…) */
  DEFECTIVE_PRODUCT = 'DefectiveProduct',
  /** Khách quan — Hàng khác với mô tả */
  PRODUCT_NOT_AS_DESCRIBED = 'ProductNotAsDescribed',
  /** Chủ quan — Đổi ý */
  CHANGED_MIND = 'ChangedMind',
}

export enum OrderReturnStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  AWAITING_PICKUP = 'AwaitingPickup',
  COLLECTION_FAILED = 'CollectionFailed',
  COLLECTED = 'Collected',
  INSPECTION = 'Inspection',
  REJECTED = 'Rejected',
  STORED = 'Stored',
  EXCHANGE_RELEASED = 'ExchangeReleased',
  AWAITING_EXCHANGE = 'AwaitingExchange',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  REFUNDED = 'Refunded',
}

export enum OrderReturnReasonCategory {
  OBJECTIVE = 'Objective',
  SUBJECTIVE = 'Subjective',
}

export enum ReturnFaultParty {
  RETAILER = 'Retailer',
  CUSTOMER = 'Customer',
}

export enum OrderErrorType {
  ADDRESS = 'address',
  PAYMENT = 'payment',
  STOCK = 'stock',
  CATALOG = 'catalog',
  OTHER = 'other',
}

export enum OrderAuditEntityName {
  OMS = 'oms',
  ORDER_REFUND = 'order_refund',
  WMS = 'wms',
}
