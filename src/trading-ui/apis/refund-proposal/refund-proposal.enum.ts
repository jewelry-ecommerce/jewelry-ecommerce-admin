/** Nguồn lệnh đề xuất hoàn tiền (US-08 §4.1). */
export enum RefundProposalSourceType {
  RMA = 'RMA',
  CANCEL = 'CANCEL',
}

/** Lý do hoàn tiền (US-08 §4.2). */
export enum RefundProposalReason {
  DEFECTIVE_PRODUCT = 'DEFECTIVE_PRODUCT',
  CUSTOMER_CHANGED_MIND = 'CUSTOMER_CHANGED_MIND',
  WRONG_PRODUCT_DELIVERED = 'WRONG_PRODUCT_DELIVERED',
  OTHER = 'OTHER',
}

/** Trạng thái lệnh đề xuất (US-09/10/11 §4.3). */
export enum RefundProposalStatus {
  REQUESTED = 'Requested',
  APPROVED = 'Approved',
  REFUNDED = 'Refunded',
  FAILED = 'Failed',
  REJECTED = 'Rejected',
}

/**
 * Phương thức thanh toán gốc — chuẩn theo spec mới (US-08 §4.4).
 * Mapping rule (BE): `order.paymentMethod === COD ? COD : PAYOO`.
 */
export enum RefundProposalOriginalPaymentMethod {
  PAYOO = 'PAYOO',
  COD = 'COD',
}

/**
 * @deprecated Đã được đổi tên thành {@link RefundProposalOriginalPaymentMethod} (US-08 §4.4).
 * Giữ alias để các consumer cũ không gãy build.
 */
export enum RefundProposalPaymentChannel {
  PAYOO = 'PAYOO',
  COD = 'COD',
}

export type RefundProposalSortBy = 'createdAt' | 'updatedAt' | 'proposalCode' | 'totalRefundAmount';
export type RefundProposalSortOrder = 'ASC' | 'DESC';
