import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { quoteOrderPricingContext, type IAdminOrderV2Context } from '../../apis/order';
import type { PaymentMethod } from '../../apis/order/order.enum';
import { createAdminOrderOperationId, getAdminOrderApiErrorMessage, serializeAdminOrderV2Context } from '../../common/utils/order/admin-order-v2.util';
import { ORDER_SHIPPING_ADDRESS_DEBOUNCE_MS } from '../../common/utils/order/order-shipping-service.utils';
import { ADMIN_ORDER_V2_MESSAGE } from '../../common/constant/order/admin-order-v2.constants';
import { parseAdminOrderV2PricingQuote, type AdminOrderV2PricingQuote } from '../../common/utils/order/order-pricing-quote.util';

interface UseAdminOrderV2PricingArgs {
  enabled: boolean;
  context: IAdminOrderV2Context | null;
  paymentMethod: PaymentMethod;
}

interface PricingState {
  signature: string;
  quote: AdminOrderV2PricingQuote | null;
  error: string | null;
  loading: boolean;
}

interface PricingRequestArgs extends UseAdminOrderV2PricingArgs {
  operationId: string | null;
  signature: string;
  setState: Dispatch<SetStateAction<PricingState>>;
}

const requestAdminOrderQuote = async (context: IAdminOrderV2Context, paymentMethod: PaymentMethod, operationId: string): Promise<AdminOrderV2PricingQuote> => {
  const response = await quoteOrderPricingContext({ ...context, paymentMethod, idempotencyKey: operationId });
  const quote = parseAdminOrderV2PricingQuote(response);
  if (!quote) throw new Error(ADMIN_ORDER_V2_MESSAGE.INVALID_QUOTE);
  return quote;
};

function useAdminOrderPricingRequest(args: PricingRequestArgs) {
  const { enabled, context, operationId, paymentMethod, setState, signature } = args;
  const requestIdRef = useRef(0);
  const contextRef = useRef(context);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    const currentContext = contextRef.current;
    if (!enabled || !currentContext || !operationId) return;
    const requestId = ++requestIdRef.current;
    setState({ signature, quote: null, error: null, loading: true });
    const timeoutId = window.setTimeout(() => {
      void requestAdminOrderQuote(currentContext, paymentMethod, operationId)
        .then((quote) => {
          if (requestId === requestIdRef.current) setState({ signature, quote, error: null, loading: false });
        })
        .catch((error: unknown) => {
          if (requestId !== requestIdRef.current) return;
          const message = getAdminOrderApiErrorMessage(error, 'Không thể tính giá và phí vận chuyển. Vui lòng thử lại.');
          setState({ signature, quote: null, error: message, loading: false });
        });
    }, ORDER_SHIPPING_ADDRESS_DEBOUNCE_MS);
    return () => {
      requestIdRef.current += 1;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, operationId, paymentMethod, setState, signature]);
}

export function useAdminOrderV2Pricing({ enabled, context, paymentMethod }: UseAdminOrderV2PricingArgs) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<PricingState>({ signature: '', quote: null, error: null, loading: false });
  const contextKey = useMemo(() => serializeAdminOrderV2Context(context), [context]);
  const signature = useMemo(() => JSON.stringify({ contextKey, paymentMethod, revision }), [contextKey, paymentMethod, revision]);
  const operationId = useMemo(() => (contextKey ? createAdminOrderOperationId() : null), [contextKey, paymentMethod, revision]);

  useAdminOrderPricingRequest({ enabled, context, operationId, paymentMethod, setState, signature });

  const acceptQuote = useCallback(
    (response: unknown): boolean => {
      const quote = parseAdminOrderV2PricingQuote(response);
      if (!quote) return false;
      setState({ signature, quote, error: null, loading: false });
      return true;
    },
    [signature],
  );
  const refreshQuote = useCallback(() => setRevision((current) => current + 1), []);
  const isCurrent = enabled && state.signature === signature;

  return {
    quote: isCurrent ? state.quote : null,
    quoteError: isCurrent ? state.error : null,
    isQuoting: enabled && (!isCurrent || state.loading),
    operationId,
    acceptQuote,
    refreshQuote,
  };
}
