// @vitest-environment jsdom
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { OrderReturnReason, OrderReturnType } from '../../../apis/order/order.enum';
import type { IAdminOrderReturnQuoteRequest, IOrderReturnQuoteResponse } from '../../../apis/order/order.interface';
import { useAdminOrderReturnQuote } from './use-admin-order-return-quote.hook';

const mocks = vi.hoisted(() => ({ quote: vi.fn() }));
vi.mock('../../../apis/order/order.api', () => ({ quoteAdminOrderReturn: mocks.quote }));
const request: IAdminOrderReturnQuoteRequest = {
  returnId: '8', orderId: '9', reason: OrderReturnReason.WRONG_ORDER_DELIVERED,
  type: OrderReturnType.REFUND, returnItems: [{ orderItemId: '12', quantity: 1 }], exchangeItems: [],
};
let root: Root;
let container: HTMLDivElement;
const observedQuote = vi.fn<(value: ReturnType<typeof useAdminOrderReturnQuote>) => void>();
function current() {
  const latest = observedQuote.mock.lastCall?.[0];
  if (!latest) throw new Error('Quote hook has not rendered');
  return latest;
}
function Harness({ body }: { body: IAdminOrderReturnQuoteRequest | null }) {
  const state = useAdminOrderReturnQuote(body);
  useEffect(() => { observedQuote(state); }, [state]);
  return null;
}
function quote(fingerprint: string): IOrderReturnQuoteResponse {
  return { success: true, quoteReference: {
    pricingEvaluationId: 'evaluation', fingerprint, exchangeMerchandiseTotalMinor: 0,
    shipping: { declaredValueFeeMinor: 0, shippingFeeMinor: 0, totalFeeMinor: 0, customerPayableShippingMinor: 0 },
  }, product: { returnedMerchandiseSettlementMinor: 100000, exchangeMerchandiseTotalMinor: 0, merchandiseTopUpMinor: 0 },
  shipping: { returnInboundShippingFeeMinor: 0, exchangeOutboundShippingFeeMinor: 0,
    exchangeOutboundTotalFeeMinor: 0, customerPayableShippingMinor: 0 } };
}
beforeEach(() => {
  mocks.quote.mockReset();
  observedQuote.mockClear();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

test('no quote is fetched when the edit form is not ready', async () => {
  await act(async () => root.render(<Harness body={null} />));
  expect(mocks.quote).not.toHaveBeenCalled();
});

test('edit quote includes returnId and drops the previous fingerprint when quantities change', async () => {
  mocks.quote.mockResolvedValueOnce(quote('first'));
  await act(async () => root.render(<Harness body={request} />));
  expect(current().quote?.quoteReference.fingerprint).toBe('first');
  let resolveQuote: (value: IOrderReturnQuoteResponse) => void = () => { throw new Error('Missing pending request'); };
  mocks.quote.mockImplementationOnce(() => new Promise<IOrderReturnQuoteResponse>(resolve => { resolveQuote = resolve; }));
  const changed = { ...request, returnItems: [{ orderItemId: '12', quantity: 2 }] };
  await act(async () => root.render(<Harness body={changed} />));
  expect(current().quote).toBeNull();
  expect(mocks.quote).toHaveBeenLastCalledWith(expect.objectContaining({ returnId: '8', returnItems: changed.returnItems }));
  await act(async () => resolveQuote(quote('changed')));
  expect(current().quote?.quoteReference.fingerprint).toBe('changed');
});

test('manual refresh recovers a failed quote without submitting an update', async () => {
  mocks.quote.mockRejectedValueOnce(new Error('stale')).mockResolvedValueOnce(quote('fresh'));
  await act(async () => root.render(<Harness body={request} />));
  expect(current().hasError).toBe(true);
  await act(async () => current().refresh());
  expect(current().quote?.quoteReference.fingerprint).toBe('fresh');
  expect(current().hasError).toBe(false);
  expect(mocks.quote).toHaveBeenCalledTimes(2);
});
