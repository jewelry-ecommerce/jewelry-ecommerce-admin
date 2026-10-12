import {
  type RefundProposalOriginalPaymentMethod,
  type RefundProposalPaymentChannel,
  type RefundProposalReason,
  type RefundProposalSortBy,
  type RefundProposalSortOrder,
  type RefundProposalSourceType,
  type RefundProposalStatus,
} from './refund-proposal.enum';

/** Dòng SKU trong đề xuất hoàn tiền. */
export interface IRefundProposalLine {
  id?: string;
  sku?: string;
  /** Một số endpoint trả `skuCode` thay cho `sku`. */
  skuCode?: string;
  productName?: string;
  variationName?: string;
  image?: string | null;
  unitGrossPrice: string | number;
  quantity: number;
  /** unitGrossPrice * quantity */
  lineAmount: string | number;
}

/** Dòng SKU trả về của BE khi `sourceType = RMA` — cùng SKU shape, khác alias. */
export interface IRefundProposalReturnSkuLine {
  image?: string | null;
  skuCode: string;
  skuDisplayName?: string;
  productName?: string;
  variationName?: string;
  returnQuantity: number;
  originalUnitPrice: string | number;
  lineAmount: string | number;
}

/** Bản tóm tắt lệnh đề xuất — dùng trong list (US-10). */
export interface IRefundProposalListItem {
  id: string;
  proposalCode: string;
  sourceType: RefundProposalSourceType;
  /** RMA id hoặc Order id tuỳ `sourceType`. */
  sourceId: string;
  /** Mã hiển thị (RMA code hoặc orderCode) — legacy. */
  sourceCode?: string;
  /** Mã đơn nguồn theo BE mới (Seva-ID con). */
  sourceDisplayCode?: string | null;
  /** Order gốc liên kết với proposal (cả CANCEL và RMA đều có). */
  originalOrderId?: string;
  originalOrderCode?: string;
  /** Phương thức thanh toán gốc — dùng cho cột "Phương thức hoàn tiền". */
  originalPaymentMethod?: string;
  originalPaymentMethodLabel?: string;
  paymentChannel?: RefundProposalPaymentChannel;
  totalRefundAmount: string | number;
  estimatedTotalRefundAmount?: string | number;
  netPaidAmount?: string | number;
  /** Status mới của BE. */
  proposalStatus?: RefundProposalStatus;
  /** Legacy alias. */
  status?: RefundProposalStatus;
  reason?: RefundProposalReason;
  detailNote?: string | null;
  bankAccountHolder?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  /** Snapshot khách hàng mới BE trả trực tiếp trên proposal. */
  firstName?: string | null;
  lastName?: string | null;
  contactEmail?: string | null;
  shippingAddressLine?: string | null;
  shippingWardName?: string | null;
  shippingProvinceName?: string | null;
  shippingProvinceCode?: number | null;
  shippingWardCode?: string | null;
  customerAddress?: string | null;
  receiverPhone?: string | null;
  returnSkuLines?: IRefundProposalReturnSkuLine[];
  lines?: IRefundProposalLine[];
  /** Thương hiệu/Brand — phục vụ filter nâng cao US-10 BR-10. */
  brand?: string;
  createdAt?: string;
  updatedAt?: string;
  createdByName?: string;
  /** Thông báo lỗi gần nhất khi `status = Failed`. */
  errorMessage?: string | null;
}

/** Snapshot khách hàng — hiển thị trong card "Thông tin khách hàng". */
export interface IRefundProposalCustomerInfo {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  customerAddress?: string | null;
  /** Địa chỉ kho giao/nhận. */
  pickupAddress?: string | null;
  note?: string | null;
}

/** Tài chính chi tiết — kê khai theo design. */
export interface IRefundProposalFinancialSummary {
  /** Giá trị thực thu gốc. */
  netRevenue?: string | number | null;
  /** Doanh thu khác - No Refund. */
  otherRevenueNoRefund?: string | number | null;
  /** Điểm loyalty nhận được. */
  loyaltyPoints?: number | null;
}

/** Một mốc trong timeline xử lý hoàn tiền. */
export interface IRefundProposalTimelineEntry {
  id?: string;
  /** ISO datetime. */
  occurredAt: string;
  title: string;
  description?: string | null;
  /** Đường dẫn bằng chứng giao hàng / tài liệu kèm. */
  evidenceUrl?: string | null;
  evidenceLabel?: string | null;
  /** Trạng thái mốc — completed (xanh) / current (vàng) / pending (xám). */
  state?: 'completed' | 'current' | 'pending';
}

/** Chi tiết đầy đủ — dùng ở US-11. */
export interface IRefundProposalDetail extends IRefundProposalListItem {
  /** Mã giao dịch gốc Payoo. */
  originalTransactionId?: string | null;
  /** Refund_Transaction_ID trả về từ Payoo khi `status = Refunded`. */
  providerRefundId?: string | null;
  /** Ảnh biên lai chuyển khoản (đơn COD). */
  attachmentUrl?: string | null;
  auditTrail?: IRefundProposalAuditEntry[];
  /** Đường dẫn HĐ điều chỉnh giảm bên Fast. */
  adjustmentInvoiceUrl?: string | null;
  adjustmentInvoiceCode?: string | null;
  /** Snapshot khách hàng/địa chỉ. */
  customer?: IRefundProposalCustomerInfo;
  /** Tài chính kê khai. */
  financialSummary?: IRefundProposalFinancialSummary;
  /** Timeline xử lý hoàn tiền (US-11 §3). */
  timeline?: IRefundProposalTimelineEntry[];
  /** Lịch sử trạng thái proposal BE trả về ở một số môi trường. */
  history?: IRefundProposalHistoryEntry[];
}

export interface IRefundProposalAuditEntry {
  id: string;
  createdAt: string;
  actorName: string;
  action: string;
  note?: string;
}

export interface IRefundProposalHistoryEntry {
  id: string;
  fromStatus?: RefundProposalStatus | string | null;
  fromStatusLabel?: string | null;
  toStatus?: RefundProposalStatus | string | null;
  toStatusLabel?: string | null;
  changedById?: string | null;
  changedByType?: string | null;
  note?: string | null;
  createdAt: string;
}

/** Query check eligibility (US-08 §5). */
export interface IRefundProposalEligibilityQuery {
  sourceType: RefundProposalSourceType;
  sourceId: string;
}

/** Preview proposal trả về khi `eligible: true` (US-08 §5 AC1). */
export interface IRefundProposalEligibilityPreview {
  /** Luôn `"(preview)"` cho đến khi user confirm tạo proposal. */
  proposalCode: string;
  sourceType: RefundProposalSourceType;
  proposalStatus: RefundProposalStatus;
  originalPaymentMethod: RefundProposalOriginalPaymentMethod;
  estimatedTotalRefundAmount: string | number;
  returnSkuLines?: IRefundProposalReturnSkuLine[];
  /** @deprecated giữ alias để legacy consumer còn parse được. */
  paymentChannel?: RefundProposalPaymentChannel;
  /** @deprecated alias cũ của `estimatedTotalRefundAmount`. */
  totalRefundAmount?: string | number;
  /** @deprecated dùng `returnSkuLines`. */
  lines?: IRefundProposalLine[];
}

export type IRefundProposalEligibilityResponse =
  | { eligible: true; preview: IRefundProposalEligibilityPreview }
  | {
      eligible: false;
      message: string;
      existingProposalId?: string;
      existingProposalCode?: string;
    };

/** Body POST `/refund-proposals` (US-08 §6). */
export interface ICreateRefundProposalRequest {
  sourceType: RefundProposalSourceType;
  sourceId: string;
  reason: RefundProposalReason;
  /** Bắt buộc khi `reason = OTHER`. */
  detailNote?: string;
  /** Tên khách hàng từ dữ liệu đơn nguồn (theo contract BE mới). */
  firstName?: string;
  /** Email liên hệ khách hàng từ đơn nguồn. */
  contactEmail?: string;
  /** Địa chỉ giao hàng chi tiết từ đơn nguồn. */
  shippingAddressLine?: string;
  shippingWardName?: string;
  shippingProvinceName?: string;
  shippingProvinceCode?: number;
  shippingWardCode?: string;
  /** Địa chỉ đầy đủ đã ghép chuỗi để BE lưu snapshot tiện tra cứu. */
  customerAddress?: string;
  receiverPhone?: string;
  /** Bắt buộc khi `paymentChannel = COD`. */
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
}

/** Query GET `/refund-proposals` (US-10 §7). */
export interface IRefundProposalListQuery {
  status?: RefundProposalStatus;
  paymentChannel?: RefundProposalPaymentChannel;
  sourceType?: RefundProposalSourceType;
  brand?: string;
  /** Search theo proposalCode/orderCode/RMA code. */
  search?: string;
  take?: number;
  page?: number;
  orderBy?: RefundProposalSortBy;
  orderType?: RefundProposalSortOrder;
}

export interface IRefundProposalListResponse {
  list: IRefundProposalListItem[];
  total: number;
  /** Đếm bản ghi theo từng trạng thái — dùng badge tab. */
  summary?: Partial<Record<RefundProposalStatus | 'ALL', number>>;
}

/** Body US-09: hủy/reject lệnh đề xuất. */
export interface IRejectRefundProposalRequest {
  note: string;
}

/** Body US-09: phê duyệt lệnh hoàn tiền — đính kèm chứng từ. */
export interface IApproveRefundProposalRequest {
  attachmentUrl: string;
}

/** Body POST `/refund-proposals/orders/:orderId/execute-payment-refund`. */
export interface IExecutePaymentRefundRequest {
  attachmentUrls: string[];
  note?: string;
}

/** Body US-11: xác nhận đã chuyển khoản (đơn COD) — đính kèm biên lai. */
export interface IConfirmRefundProposalManualRequest {
  attachmentUrl: string;
  note?: string;
}

/**
 * Trạng thái refund Payoo trả về từ Payment Service.
 * Spec ghi `SUCCESS` nhưng BE production trả `SUCCEEDED` — chấp nhận cả 2.
 */
export type RefundExecutionStatus = 'SUCCEEDED' | 'SUCCESS' | 'FAILED' | 'PENDING' | 'PROCESSING';

/** Response internal execute Payoo refund (US-08 §9). */
export interface IExecuteRefundResponse {
  refundId: string;
  /** Payment ID liên kết của Payoo. */
  paymentId?: string;
  refundStatus: RefundExecutionStatus;
  amount: number;
  /** Số tiền thực tế đã hoàn trong lần gọi này. */
  refundedAmountActual?: number;
  /** Tổng số tiền đã hoàn (tích luỹ qua nhiều lần). */
  refundedAmount?: number;
  /** Trạng thái payment sau refund (PAID / PARTIALLY_REFUNDED / REFUNDED). */
  paymentStatus?: string;
  /** BE phản hồi loại nguồn refund (ORDER_CANCEL / ORDER_RMA / ...). */
  sourceType?: string;
  sourceId?: string;
  providerRefundId?: string;
  remainingRefundableAmount?: number;
  /** Refund đang được xử lý bất đồng bộ — không phải lỗi. */
  isProcessing?: boolean;
  errorMessage?: string;
}

/** Helper: refund được coi là thành công khi BE trả SUCCESS/SUCCEEDED. */
export const isRefundExecutionSucceeded = (status: RefundExecutionStatus | string | undefined): boolean => {
  const normalized = status?.trim().toUpperCase() ?? '';
  return normalized === 'SUCCEEDED' || normalized === 'SUCCESS';
};

/** Unwrap `{ data }` nếu gateway bọc payload execute-payment-refund. */
export const normalizeExecuteRefundResponse = (raw: unknown): IExecuteRefundResponse => {
  const payload = ((raw as { data?: unknown })?.data ?? raw) as Record<string, unknown>;
  const refundStatusRaw = payload.refundStatus ?? payload.status;
  const refundStatus = typeof refundStatusRaw === 'string' ? refundStatusRaw : 'FAILED';
  const amountRaw = payload.amount;
  const amount = typeof amountRaw === 'number' ? amountRaw : Number(amountRaw ?? 0);

  return {
    refundId: String(payload.refundId ?? ''),
    paymentId: typeof payload.paymentId === 'string' ? payload.paymentId : undefined,
    refundStatus: refundStatus as RefundExecutionStatus,
    amount: Number.isFinite(amount) ? amount : 0,
    refundedAmountActual: typeof payload.refundedAmountActual === 'number' ? payload.refundedAmountActual : undefined,
    refundedAmount: typeof payload.refundedAmount === 'number' ? payload.refundedAmount : undefined,
    paymentStatus: typeof payload.paymentStatus === 'string' ? payload.paymentStatus : undefined,
    sourceType: typeof payload.sourceType === 'string' ? payload.sourceType : undefined,
    sourceId: typeof payload.sourceId === 'string' ? payload.sourceId : undefined,
    providerRefundId: typeof payload.providerRefundId === 'string' ? payload.providerRefundId : undefined,
    remainingRefundableAmount: typeof payload.remainingRefundableAmount === 'number' ? payload.remainingRefundableAmount : undefined,
    isProcessing: Boolean(payload.isProcessing),
    errorMessage: typeof payload.errorMessage === 'string' ? payload.errorMessage : undefined,
  };
};

/** Params cho endpoint internal #6 — tra refund theo `idempotencyKey`. */
export interface IGetRefundByIdempotencyKeyParams {
  orderId: string;
  idempotencyKey: string;
}
