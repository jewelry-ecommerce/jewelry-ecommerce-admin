import type { IAdminCreateOrderV2Request, IAdminOrderV2Context } from '../../../apis/order';
import { OrderKind, type OrderSource, type PaymentMethod } from '../../../apis/order/order.enum';
import type { CartLine, CreateOrderFormValues } from '../../../pages/order/create-order/create-order.interface';
import { buildOrderItemsFromCartLines, normalizeVnPhone } from './create-order.utils';
import { ADMIN_ORDER_CONTEXT_VERSION, ADMIN_ORDER_SERVER_ERROR_STATUS, ADMIN_ORDER_TRANSPORT_ERROR_CODES, ADMIN_ORDER_V2_ERROR_CODE } from '../../constant/order/admin-order-v2.constants';
import type { AdminOrderV2PricingQuote } from './order-pricing-quote.util';

export interface AdminOrderV2ContextInput {
  cartLines: CartLine[];
  receiverPhone: string;
  firstName: string;
  provinceCode: number | '';
  provinceName: string;
  wardCode: number | '';
  wardName: string;
  addressLine: string;
  couponCodes: string[];
}

interface AdminOrderV2CreateInput {
  values: CreateOrderFormValues;
  context: IAdminOrderV2Context;
  quote: AdminOrderV2PricingQuote;
  operationId: string;
  paymentMethod: PaymentMethod;
  source: OrderSource;
  returnUrl?: string;
}

const normalizeCouponCodes = (codes: readonly string[]): string[] => Array.from(new Set(codes.map((code) => code.trim()).filter(Boolean)));

export const buildAdminOrderV2Context = (input: AdminOrderV2ContextInput): IAdminOrderV2Context | null => {
  const receiverPhone = normalizeVnPhone(input.receiverPhone);
  const wardCode = Number(input.wardCode);
  const addressLine = input.addressLine.trim();
  const items = buildOrderItemsFromCartLines(input.cartLines);
  if (!receiverPhone || items.length === 0 || wardCode <= 0 || !addressLine) return null;

  const provinceCode = Number(input.provinceCode);
  return {
    contextVersion: ADMIN_ORDER_CONTEXT_VERSION,
    receiverPhone,
    items,
    wardCode,
    addressLine,
    couponCodes: normalizeCouponCodes(input.couponCodes),
    ...(input.firstName.trim() ? { firstName: input.firstName.trim() } : {}),
    ...(provinceCode > 0 ? { provinceCode } : {}),
    ...(input.provinceName.trim() ? { provinceName: input.provinceName.trim() } : {}),
    ...(input.wardName.trim() ? { wardName: input.wardName.trim() } : {}),
  };
};

export const buildAdminOrderV2CreateRequest = (input: AdminOrderV2CreateInput): IAdminCreateOrderV2Request => ({
  ...input.context,
  firstName: input.values.firstName.trim(),
  paymentMethod: input.paymentMethod,
  couponCodes: input.quote.couponCodes,
  pricingEvaluationId: input.quote.pricingEvaluationId,
  expectedGrandTotalMinor: input.quote.expectedGrandTotalMinor,
  idempotencyKey: input.operationId,
  orderKind: OrderKind.NORMAL,
  notePayment: input.values.notePayment.trim() || undefined,
  contactEmail: input.values.contactEmail.trim() || undefined,
  source: input.source,
  purpose: input.values.purpose,
  note: input.values.note.trim() || undefined,
  ...(input.returnUrl ? { returnUrl: input.returnUrl } : {}),
});

export const serializeAdminOrderV2Context = (context: IAdminOrderV2Context | null): string => (context ? JSON.stringify(context) : '');

export const createAdminOrderOperationId = (): string => globalThis.crypto.randomUUID();

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const getAdminOrderApiErrorCode = (error: unknown): string => {
  if (!isRecord(error)) return '';
  const errorCode = error.errorCode ?? error.code;
  return typeof errorCode === 'string' ? errorCode : '';
};

export const isAdminOrderResultUncertain = (error: unknown): boolean => {
  const statusCode = isRecord(error) ? (error.statusCode ?? error.status) : null;
  if (typeof statusCode === 'number') return statusCode >= ADMIN_ORDER_SERVER_ERROR_STATUS;

  const code = getAdminOrderApiErrorCode(error);
  return (
    !code ||
    ADMIN_ORDER_TRANSPORT_ERROR_CODES.some((transportCode) => transportCode === code) ||
    code === ADMIN_ORDER_V2_ERROR_CODE.PERSISTED_RESPONSE_UNAVAILABLE ||
    code === ADMIN_ORDER_V2_ERROR_CODE.FINALIZATION_RETRY_UNAVAILABLE
  );
};

export const getAdminOrderApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!isRecord(error)) return fallback;
  return typeof error.message === 'string' && error.message.trim() ? error.message : fallback;
};

export const getAdminOrderConflictQuote = (error: unknown): unknown | null => {
  if (!isRecord(error) || !isRecord(error.quote)) return null;
  return error.quote;
};
