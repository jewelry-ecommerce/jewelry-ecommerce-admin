import { useEffect, useState } from 'react';
import { ORDER_SHIPPING_ADDRESS_DEBOUNCE_MS, fetchOrderShippingServiceOptions, type NormalizedOrderShippingServiceOption } from '../common/utils/order/order-shipping-service.utils';

interface UseOrderShippingServiceOptionsParams {
  enabled: boolean;
  fromWardCode: number;
  fromAddress: string;
  toWardCode: number;
  toAddress: string;
}

interface UseOrderShippingServiceOptionsResult {
  options: NormalizedOrderShippingServiceOption[];
  isLoading: boolean;
}

export const useOrderShippingServiceOptions = ({ enabled, fromWardCode, fromAddress, toWardCode, toAddress }: UseOrderShippingServiceOptionsParams): UseOrderShippingServiceOptionsResult => {
  const [options, setOptions] = useState<NormalizedOrderShippingServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setOptions([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const mapped = await fetchOrderShippingServiceOptions({
            fromWardIdV2: fromWardCode,
            fromAddressV2: fromAddress.trim(),
            toWardIdV2: toWardCode,
            toAddressV2: toAddress.trim(),
          });
          if (cancelled) return;
          setOptions(mapped);
        } catch {
          if (cancelled) return;
          setOptions([]);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
    }, ORDER_SHIPPING_ADDRESS_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, fromAddress, fromWardCode, toAddress, toWardCode]);

  return { options, isLoading };
};
