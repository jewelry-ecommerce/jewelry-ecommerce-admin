import type { IOrderPricingContextQuotePricing, IOrderPricingContextQuoteResponse, IOrderPricingCouponOutcome } from '../../../apis/order/order.interface';
import { parseMoneyAmount } from './create-order.utils';

export type OrderPricingQuoteTotals = {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;
};

export interface AdminOrderV2PricingQuote extends OrderPricingQuoteTotals {
  pricingEvaluationId: string;
  expectedGrandTotalMinor: string;
  couponCodes: string[];
  couponOutcomes: IOrderPricingCouponOutcome[];
  shippingBaseFee: number;
  shippingDiscount: number;
  shippingCustomerFee: number;
}

const readPricingMoneyField = (pricing: IOrderPricingContextQuotePricing, field: keyof OrderPricingQuoteTotals): number => parseMoneyAmount(pricing[field]);

export const parseOrderPricingQuoteResponse = (raw: IOrderPricingContextQuoteResponse): OrderPricingQuoteTotals => {
  const pricing = raw.pricing ?? {};
  const subtotal = readPricingMoneyField(pricing, 'subtotal');
  const discountTotal = readPricingMoneyField(pricing, 'discountTotal');
  const shippingFee = readPricingMoneyField(pricing, 'shippingFee');
  const explicitGrandTotal = readPricingMoneyField(pricing, 'grandTotal');
  const grandTotal =
    pricing.grandTotal !== undefined && pricing.grandTotal !== null && String(pricing.grandTotal).trim() !== '' ? explicitGrandTotal : Math.max(0, subtotal + shippingFee - discountTotal);

  return {
    subtotal,
    discountTotal,
    shippingFee,
    grandTotal,
  };
};

const parseRequiredMoney = (value: unknown): number | null => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const readCouponOutcomes = (value: unknown): IOrderPricingCouponOutcome[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((outcome) => {
    if (!isRecord(outcome)) return [];
    const normalizedCouponCode = typeof outcome.normalizedCouponCode === 'string' ? outcome.normalizedCouponCode : '';
    const status = typeof outcome.status === 'string' ? outcome.status : '';
    if (!normalizedCouponCode || !status) return [];
    const reasonCodes = Array.isArray(outcome.reasonCodes) ? outcome.reasonCodes.filter((reason): reason is string => typeof reason === 'string') : undefined;
    return [{ normalizedCouponCode, status, reasonCodes }];
  });
};

export const parseAdminOrderV2PricingQuote = (raw: unknown): AdminOrderV2PricingQuote | null => {
  if (!isRecord(raw) || !isRecord(raw.pricing) || !isRecord(raw.shipping)) return null;
  const pricingEvaluationId = typeof raw.pricingEvaluationId === 'string' ? raw.pricingEvaluationId.trim() : '';
  const subtotal = parseRequiredMoney(raw.pricing.subtotal);
  const discountTotal = parseRequiredMoney(raw.pricing.discountTotal);
  const shippingFee = parseRequiredMoney(raw.pricing.shippingFee);
  const grandTotal = parseRequiredMoney(raw.pricing.grandTotal);
  const shippingBaseFee = parseRequiredMoney(raw.shipping.baseFeeMinor);
  const shippingDiscount = parseRequiredMoney(raw.shipping.discountMinor);
  const shippingCustomerFee = parseRequiredMoney(raw.shipping.customerFeeMinor);
  if (!pricingEvaluationId || subtotal === null || discountTotal === null || shippingFee === null || grandTotal === null) return null;
  if (shippingBaseFee === null || shippingDiscount === null || shippingCustomerFee === null) return null;

  return {
    pricingEvaluationId,
    expectedGrandTotalMinor: String(raw.pricing.grandTotal),
    couponCodes: Array.isArray(raw.couponCodes) ? raw.couponCodes.filter((code): code is string => typeof code === 'string') : [],
    couponOutcomes: readCouponOutcomes(raw.couponOutcomes),
    subtotal,
    discountTotal,
    shippingFee,
    grandTotal,
    shippingBaseFee,
    shippingDiscount,
    shippingCustomerFee,
  };
};
