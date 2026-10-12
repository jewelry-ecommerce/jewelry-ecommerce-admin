import type { IOrderReturnDetailResponse } from '../../../../apis/order';
import { OrderReturnType } from '../../../../apis/order/order.enum';
import { type IOrderReturnStatusHistoryItem } from '../../../../apis/order/order.interface';
import { STATUS_LABELS, RETURN_TYPE_LABELS } from '../../../../common/constant/order/order.constants';
import { formatDate, formatTime } from '../../../../common/utils/date-format.util';
import { parseAmount } from '../../../../common/utils/number.utils';
import { mapOrderReturnReason } from '../../order.constant';

export type ReturnTimelineItem = {
  key: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
};

export type ReturnExchangeFinancialSummary = {
  originalOrderAmountReceived: number;
  returnProductTotal: number;
  exchangeProductTotal: number;
  priceDifference: number;
  returnInboundShippingFee: number;
  otherRevenueNoRefund: number;
  loyaltyPointsReceived: number;
  totalPickupCod: number;
  exchangeDeliveryCodTotal: number;
  showExchangeFinancialRows: boolean;
};

export const getReturnTypeLabel = (type?: string | null): string => {
  if (!type) return '—';
  return RETURN_TYPE_LABELS[type as keyof typeof RETURN_TYPE_LABELS] ?? type;
};

export const getReturnReasonLabel = (reason?: string | null): string => {
  if (!reason) return '—';
  return mapOrderReturnReason(reason as never) ?? reason;
};

export const getReturnStatusLabel = (status?: string | null): string => {
  if (!status) return '—';
  return STATUS_LABELS[status] ?? status;
};

export const getCustomerName = (detail: IOrderReturnDetailResponse): string => {
  const fromShippingSnapshot = [detail.shippingAddressSnapshot?.lastName, detail.shippingAddressSnapshot?.firstName].filter(Boolean).join(' ').trim();
  if (fromShippingSnapshot) return fromShippingSnapshot;

  const fromLegacyFields = [detail.lastName, detail.firstName].filter(Boolean).join(' ').trim();
  return fromLegacyFields || detail.customerName?.trim() || '—';
};

export const getDisplayAddress = (
  address?: {
    addressLine?: string;
    wardName?: string;
    provinceName?: string;
  } | null,
): string => {
  if (!address) return '—';
  const parts = [address.addressLine, address.wardName, address.provinceName].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

const mapTimelineItem = (item: IOrderReturnStatusHistoryItem): ReturnTimelineItem => ({
  key: item.id,
  title: getReturnStatusLabel(item.toStatus),
  dateLabel: formatDate(item.createdAt),
  timeLabel: formatTime(item.createdAt),
});

export const buildReturnTimeline = (detail: IOrderReturnDetailResponse): ReturnTimelineItem[] => {
  const history = [...(detail.orderReturnStatusHistory ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const mapped = history.map(mapTimelineItem);

  return [
    ...mapped,
    {
      key: 'created',
      title: 'Đơn hàng được tạo',
      dateLabel: formatDate(detail.createdAt),
      timeLabel: formatTime(detail.createdAt),
    },
  ];
};

export const parseMoney = (value?: string | number | null): number => parseAmount(value ?? 0);

export const resolveReturnExchangeFinancialSummary = (detail: IOrderReturnDetailResponse): ReturnExchangeFinancialSummary => {
  const returnProductTotal = parseMoney(detail.returnTotal);
  const exchangeProductTotal = parseMoney(detail.exchangeTotal);
  const priceDifferenceFromApi = parseMoney(detail.priceDifference);
  const priceDifference = priceDifferenceFromApi !== 0 ? priceDifferenceFromApi : exchangeProductTotal - returnProductTotal;

  return {
    originalOrderAmountReceived: parseMoney(detail.originalOrderAmountReceived),
    returnProductTotal,
    exchangeProductTotal,
    priceDifference,
    returnInboundShippingFee: parseMoney(detail.returnInboundShippingFee),
    otherRevenueNoRefund: parseMoney(detail.otherRevenueNoRefund),
    loyaltyPointsReceived: Math.max(detail.loyaltyPointsReceived ?? 0, 0),
    totalPickupCod: parseMoney(detail.returnPickupCodTotal ?? detail.returnInboundShippingFee),
    exchangeDeliveryCodTotal: parseMoney(detail.exchangeDeliveryCodTotal),
    showExchangeFinancialRows: detail.type === OrderReturnType.EXCHANGE || exchangeProductTotal > 0,
  };
};
