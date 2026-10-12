import type { IRefundProposalDetail, IRefundProposalTimelineEntry } from '../../../apis/refund-proposal';
import { RefundProposalStatus } from '../../../apis/refund-proposal';
import { formatDate, formatTime, formatDateTime } from '../../../common/utils/date-format.util';
import { formatCurrency, parseAmount } from '../../../common/utils/number.utils';
import { getRefundProposalStatus, getRefundProposalOrderCode } from '../refund-proposal-list/refund-proposal-list.helpers';

export const formatRefundVnd = (value: string | number | null | undefined): string => `${formatCurrency(parseAmount(value))} đ`;

export const formatRefundCreatedAt = (value?: string): string => formatDateTime(value) || '—';

/** Cặp ngày + giờ cho timeline (cột phải). */
export const splitDateTimeForTimeline = (value?: string) => ({
  date: value ? formatDate(value) : '—',
  time: value ? formatTime(value) : '',
});

/** Chip "Loại yêu cầu" — luôn hiển thị "Hoàn tiền" (đối tượng của module). */
export const REFUND_PROPOSAL_TYPE_PILL = {
  label: 'Hoàn tiền',
  color: '#B54708',
  backgroundColor: '#FFFAEB',
};

/** Có hiển thị thanh "Thao tác nhanh" không (US-09 AC1/AC2). */
export const showQuickActionBar = (status: RefundProposalStatus | undefined) => status === RefundProposalStatus.REQUESTED || status === RefundProposalStatus.FAILED;

/** Lấy mã đơn liên quan (Order/RMA) để hiển thị + link. */
export const getRelatedOrderCode = (detail: IRefundProposalDetail | undefined): string => (detail ? getRefundProposalOrderCode(detail) : '—');

/** Status chip ở header. */
export const getRefundProposalHeaderStatus = (detail: IRefundProposalDetail | undefined) => (detail ? getRefundProposalStatus(detail) : RefundProposalStatus.REQUESTED);

/** Fallback timeline khi BE chưa trả `timeline` — sinh tối thiểu 1 mốc theo `createdAt`. */
export const ensureTimeline = (detail: IRefundProposalDetail | undefined): IRefundProposalTimelineEntry[] => {
  if (detail?.timeline?.length) return detail.timeline;
  if (!detail?.createdAt) return [];
  return [{ occurredAt: detail.createdAt, title: 'Yêu cầu hoàn tiền được tạo', state: 'completed' }];
};
