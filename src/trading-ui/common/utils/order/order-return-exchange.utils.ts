 
import { OrderStatus } from '../../../apis/order';

const RETURN_EXCHANGE_WINDOW_DAYS = 15;
const RETURN_EXCHANGE_WINDOW_MS = RETURN_EXCHANGE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
void RETURN_EXCHANGE_WINDOW_MS;

type OrderStatusHistoryItem = {
  toStatus?: OrderStatus;
  createdAt?: string;
};

type ReturnExchangeEligibilityOrder = {
  status: OrderStatus;
  updatedAt?: string;
  deliveredAt?: string | null;
  statusHistory?: OrderStatusHistoryItem[] | null;
};

const parseIsoDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDeliveredSuccessAt = (order: ReturnExchangeEligibilityOrder): Date | null => {
  const deliveredAt = parseIsoDate(order.deliveredAt);
  if (deliveredAt) return deliveredAt;

  const latestDeliveredHistory = [...(order.statusHistory ?? [])].reverse().find((historyItem) => historyItem.toStatus === OrderStatus.DELIVERED);
  const deliveredFromHistory = parseIsoDate(latestDeliveredHistory?.createdAt);
  if (deliveredFromHistory) return deliveredFromHistory;

  // Fallback when list API does not return delivered timestamp/history.
  if (order.status === OrderStatus.DELIVERED) {
    return parseIsoDate(order.updatedAt);
  }

  return null;
};
void getDeliveredSuccessAt;

export const canCreateReturnExchangeRequest = (order: ReturnExchangeEligibilityOrder, _now = new Date()): boolean => {
  if (order.status === OrderStatus.DELIVERED) {
    return true;
  } else {
    return false;
  }

  // const deliveredSuccessAt = getDeliveredSuccessAt(order);
  // if (!deliveredSuccessAt) {
  //   return false;
  // }

  // const elapsedMs = now.getTime() - deliveredSuccessAt.getTime();
  // return elapsedMs >= 0 && elapsedMs <= RETURN_EXCHANGE_WINDOW_MS;
};
