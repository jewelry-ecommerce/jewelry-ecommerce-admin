import type { IOrderReturnQuoteResponse } from '../../../apis/order/order.interface';
import { formatCurrency } from '../../../common/utils/number.utils';

const unavailable = '—';
const formatQuoteAmount = (amount: number | null | undefined): string => (amount == null ? unavailable : `${formatCurrency(amount)}đ`);

export function getOrderReturnQuoteDisplay(quote: IOrderReturnQuoteResponse | null, loading: boolean, error: boolean) {
  const currentQuote = loading || error ? null : quote;
  const product = currentQuote?.product;
  const shipping = currentQuote?.shipping;
  const difference = product ? product.exchangeMerchandiseTotalMinor - product.returnedMerchandiseSettlementMinor : null;
  const nonRefundable = difference == null ? null : Math.max(0, -difference);
  const pending = loading ? 'Đang tính...' : unavailable;
  return {
    priceDifference: currentQuote ? formatQuoteAmount(difference) : pending,
    returnAmount: currentQuote ? formatQuoteAmount(product?.returnedMerchandiseSettlementMinor) : pending,
    compensation: currentQuote ? formatQuoteAmount(product?.merchandiseTopUpMinor) : pending,
    otherRevenue: currentQuote ? `${formatQuoteAmount(nonRefundable)}${nonRefundable ? ' (không hoàn tiền)' : ''}` : pending,
    returnShipping: currentQuote ? formatQuoteAmount(shipping?.returnInboundShippingFeeMinor) : pending,
    loyalty: unavailable,
    pickupCod: unavailable,
    shippingHint: currentQuote
      ? `Phí giao hàng đổi: ${formatQuoteAmount(shipping?.exchangeOutboundTotalFeeMinor)}. Phần phí giao đổi khách trả: ${formatQuoteAmount(shipping?.customerPayableShippingMinor)}.`
      : error
        ? 'Chưa thể lấy báo giá. Vui lòng kiểm tra thông tin và thử lại.'
        : 'Chọn lý do, hàng và địa chỉ để xem báo giá đổi hàng.',
    differenceHint: currentQuote ? `Giá trị hàng đổi: ${formatQuoteAmount(product?.exchangeMerchandiseTotalMinor)}.` : '',
  };
}
