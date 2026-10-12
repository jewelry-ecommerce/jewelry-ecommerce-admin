import { RefundProposalSourceType, RefundProposalStatus, type IRefundProposalListItem } from '../../../apis/refund-proposal';
import { getPaymentMethodDisplay } from '../../order/order-detail/order-detail.helpers';

/** Trạng thái thực tế của lệnh đề xuất — BE mới trả `proposalStatus`, fallback `status`. */
export const getRefundProposalStatus = (row: IRefundProposalListItem): RefundProposalStatus => (row.proposalStatus ?? row.status ?? RefundProposalStatus.REQUESTED) as RefundProposalStatus;

/** Mã đơn nguồn hiển thị ở cột "Mã đơn hàng". */
export const getRefundProposalOrderCode = (row: IRefundProposalListItem): string => row.originalOrderCode || row.sourceCode || row.sourceDisplayCode || '—';

/** Sub-text dưới mã đơn hàng (ví dụ Seva-ID con / nguồn web). */
export const getRefundProposalOrderSubText = (row: IRefundProposalListItem): string =>
  (row.sourceDisplayCode && row.sourceDisplayCode !== row.originalOrderCode ? row.sourceDisplayCode : '') || row.brand || '';

/** Nhãn phương thức hoàn tiền — ưu tiên label BE đã localize, fallback qua getPaymentMethodDisplay. */
export const getRefundProposalPaymentLabel = (row: IRefundProposalListItem): string =>
  row.originalPaymentMethodLabel || (row.originalPaymentMethod ? getPaymentMethodDisplay(row.originalPaymentMethod) : '') || row.paymentChannel || '—';

/** Source type chuẩn — phòng BE trả lowercase. */
export const getRefundProposalSourceType = (row: IRefundProposalListItem): RefundProposalSourceType => (row.sourceType ?? RefundProposalSourceType.CANCEL) as RefundProposalSourceType;
