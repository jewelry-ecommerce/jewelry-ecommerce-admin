import { RefundProposalPaymentChannel, RefundProposalReason, RefundProposalSourceType, RefundProposalStatus } from '../../../apis/refund-proposal';

/** Tab nhanh trên danh sách (US-10 AC1 + §4). */
export type RefundProposalQuickStatus = 'ALL' | RefundProposalStatus;

export const REFUND_PROPOSAL_STATUS_TABS: Array<{ value: RefundProposalQuickStatus; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: RefundProposalStatus.REQUESTED, label: 'Chờ duyệt' },
  { value: RefundProposalStatus.APPROVED, label: 'Đã duyệt' },
  { value: RefundProposalStatus.REFUNDED, label: 'Hoàn tiền thành công' },
  { value: RefundProposalStatus.FAILED, label: 'Hoàn tiền thất bại' },
  { value: RefundProposalStatus.REJECTED, label: 'Từ chối' },
];

export const REFUND_PROPOSAL_STATUS_LABELS: Record<RefundProposalStatus, string> = {
  [RefundProposalStatus.REQUESTED]: 'Chờ duyệt',
  [RefundProposalStatus.APPROVED]: 'Đã duyệt',
  [RefundProposalStatus.REFUNDED]: 'Hoàn tiền thành công',
  [RefundProposalStatus.FAILED]: 'Hoàn tiền thất bại',
  [RefundProposalStatus.REJECTED]: 'Từ chối',
};

/** Pill màu theo trạng thái — match thiết kế list page. */
export const REFUND_PROPOSAL_STATUS_PILL_SX: Record<RefundProposalStatus, { color: string; backgroundColor: string }> = {
  [RefundProposalStatus.REQUESTED]: { color: '#B54708', backgroundColor: '#FFFAEB' },
  [RefundProposalStatus.APPROVED]: { color: '#1849A9', backgroundColor: '#EFF4FF' },
  [RefundProposalStatus.REFUNDED]: { color: '#027A48', backgroundColor: '#ECFDF3' },
  [RefundProposalStatus.FAILED]: { color: '#B42318', backgroundColor: '#FEF3F2' },
  [RefundProposalStatus.REJECTED]: { color: '#475467', backgroundColor: '#EFF1F4' },
};

/** Nguồn đơn — đổi/trả (cyan) và đơn huỷ (cam) theo thiết kế list. */
export const REFUND_PROPOSAL_SOURCE_LABELS: Record<RefundProposalSourceType, string> = {
  [RefundProposalSourceType.RMA]: 'Đơn đổi/trả',
  [RefundProposalSourceType.CANCEL]: 'Đơn huỷ',
};

export const REFUND_PROPOSAL_SOURCE_PILL_SX: Record<RefundProposalSourceType, { color: string; backgroundColor: string }> = {
  [RefundProposalSourceType.RMA]: { color: '#0E7490', backgroundColor: '#ECFEFF' },
  [RefundProposalSourceType.CANCEL]: { color: '#C2410C', backgroundColor: '#FFF7ED' },
};

export const REFUND_PROPOSAL_PAYMENT_LABELS: Record<RefundProposalPaymentChannel, string> = {
  [RefundProposalPaymentChannel.PAYOO]: 'Payoo (Tự động)',
  [RefundProposalPaymentChannel.COD]: 'Chuyển khoản (Thủ công)',
};

export const REFUND_PROPOSAL_REASON_LABELS: Record<RefundProposalReason, string> = {
  [RefundProposalReason.DEFECTIVE_PRODUCT]: 'Hàng lỗi nhà sản xuất',
  [RefundProposalReason.CUSTOMER_CHANGED_MIND]: 'Khách đổi ý không mua nữa',
  [RefundProposalReason.WRONG_PRODUCT_DELIVERED]: 'Giao sai sản phẩm',
  [RefundProposalReason.OTHER]: 'Khác',
};

/** Chỉ Approve khi đang `Requested` — BR-09-01. */
export const canApproveRefundProposal = (status: RefundProposalStatus | string | undefined): boolean => status === RefundProposalStatus.REQUESTED;

/** Reject hợp lệ khi `Requested` hoặc `Failed` — BR-09-04. */
export const canRejectRefundProposal = (status: RefundProposalStatus | string | undefined): boolean => status === RefundProposalStatus.REQUESTED || status === RefundProposalStatus.FAILED;
