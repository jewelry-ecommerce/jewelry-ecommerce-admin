import { useEffect, useMemo, useState } from 'react';
import { quoteOrderPricingContext } from '../../apis/order';
import type { PaymentMethod } from '../../apis/order/order.enum';
import { ORDER_SHIPPING_ADDRESS_DEBOUNCE_MS } from '../../common/utils/order/order-shipping-service.utils';
import { buildOrderItemsFromCartLines } from '../../common/utils/order/create-order.utils';
import { parseOrderPricingQuoteResponse, type OrderPricingQuoteTotals } from '../../common/utils/order/order-pricing-quote.util';
import type { CartLine } from '../../pages/order/create-order/create-order.interface';

export interface UseOrderPricingQuoteArgs {
  enabled: boolean;
  cartLines: CartLine[];
  couponCodes: string[];
  paymentMethod: PaymentMethod;
  shippingFee: number;
}

export function useOrderPricingQuote({ enabled, cartLines, couponCodes, paymentMethod, shippingFee }: UseOrderPricingQuoteArgs) {
  const [quote, setQuote] = useState<OrderPricingQuoteTotals | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const items = useMemo(() => buildOrderItemsFromCartLines(cartLines), [cartLines]);
  const normalizedCouponCodes = useMemo(() => Array.from(new Set(couponCodes.map((code) => code.trim()).filter(Boolean))), [couponCodes]);
  const quoteSignature = useMemo(
    () =>
      JSON.stringify({
        items,
        couponCodes: normalizedCouponCodes,
        paymentMethod,
        shippingFee,
      }),
    [items, normalizedCouponCodes, paymentMethod, shippingFee],
  );

  useEffect(() => {
    if (!enabled || items.length === 0) {
      setQuote(null);
      setIsQuoting(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsQuoting(true);
        try {
          const response = await quoteOrderPricingContext({
            items,
            ...(normalizedCouponCodes.length > 0 ? { couponCodes: normalizedCouponCodes } : {}),
            paymentMethod,
            shippingFee,
          });
          if (!cancelled) {
            setQuote(parseOrderPricingQuoteResponse(response));
          }
        } catch {
          if (!cancelled) {
            setQuote(null);
          }
        } finally {
          if (!cancelled) {
            setIsQuoting(false);
          }
        }
      })();
    }, ORDER_SHIPPING_ADDRESS_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, items, normalizedCouponCodes, paymentMethod, quoteSignature, shippingFee]);

  return { quote, isQuoting };
}
