import { useCallback, useEffect, useMemo, useState } from 'react';
import { quoteAdminOrderReturn } from '../../../apis/order/order.api';
import type { IAdminOrderReturnQuoteRequest, IOrderReturnQuoteResponse } from '../../../apis/order/order.interface';

export function useAdminOrderReturnQuote(request: IAdminOrderReturnQuoteRequest | null) {
  const [revision, setRevision] = useState(0);
  const requestKey = `${JSON.stringify(request)}:${revision}`;
  const [result, setResult] = useState<{ key: string; quote: IOrderReturnQuoteResponse } | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    if (!request) return;
    let cancelled = false;
    setLoadingKey(requestKey);
    setErrorKey(null);
    void quoteAdminOrderReturn(request)
      .then((quote) => {
        if (!cancelled) setResult({ key: requestKey, quote });
      })
      .catch(() => {
        if (!cancelled) setErrorKey(requestKey);
      })
      .finally(() => {
        if (!cancelled) setLoadingKey(null);
      });
    return () => {
      cancelled = true;
    };
  }, [request, requestKey]);

  const refresh = useCallback(() => setRevision((current) => current + 1), []);
  return useMemo(
    () => ({
      quote: result?.key === requestKey ? result.quote : null,
      isLoading: loadingKey === requestKey,
      hasError: errorKey === requestKey,
      refresh,
    }),
    [errorKey, loadingKey, refresh, requestKey, result],
  );
}
