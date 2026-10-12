import dayjs from 'dayjs';
import type { IOrder } from '../../../apis/order';
import { ORDER_STATUS_LABELS } from '../../constant/order/order.constants';
import { formatDate, formatTime } from '../date-format.util';

export type OrderDetailTimelineItem = {
  key: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  changedByName?: string | null;
};

export function buildOrderDetailTimelineItems(order: IOrder): OrderDetailTimelineItem[] {
  const history = order.statusHistory;
  if (history?.length) {
    return history.map((h) => ({
      key: `${h.createdAt}-${h.toStatus}`,
      // Mã trạng thái (Completed…) → nhãn tiếng Việt; mã chưa có nhãn thì giữ nguyên.
      title: (ORDER_STATUS_LABELS as Record<string, string>)[String(h.toStatus ?? '').trim()] || String(h.toStatus ?? '').trim() || '—',
      dateLabel: dayjs(h.createdAt).isValid() ? formatDate(h.createdAt) : '—',
      timeLabel: dayjs(h.createdAt).isValid() ? formatTime(h.createdAt) : '--:--',
      changedByName: h.changedByName || null,
    }));
  }
  return [
    {
      key: 'created',
      title: 'Đơn được tạo',
      dateLabel: formatDate(order.createdAt),
      timeLabel: formatTime(order.createdAt),
    },
  ];
}
