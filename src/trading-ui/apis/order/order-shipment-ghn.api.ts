import { axiosRequest } from '../../common/configs';
import { WMS_API_BASE } from '../../common/constant/ware-house/api-base-response.interface';
import { PACKING_GHN_WAYBILL_PAGE_SIZE } from '../../pages/warehouse/packing-station/utils/packing-station.constants';
import type { GhnPrintWaybillRequest, GhnPrintWaybillResult } from './order-shipment-ghn.interface';

const GHN_PRINT_PATH = `${WMS_API_BASE}mobile/outbound-packing/print`;
const GHN_SYNC_BY_CLIENT_CODE_PATH = 'order/orders/shipments/ghn/sync-by-client-code';

function unwrapGatewayPayload<T>(response: unknown): T | null {
  if (response == null) return null;
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return ((response as { data?: T }).data ?? null) as T | null;
  }
  return response as T;
}

function readString(r: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (v != null && String(v).trim().length > 0) return String(v).trim();
  }
  return '';
}

function unwrapPayloadRecord(raw: unknown): Record<string, unknown> | null {
  let current: unknown = raw;
  for (let depth = 0; depth < 4; depth += 1) {
    if (current == null || typeof current !== 'object') return null;
    const r = current as Record<string, unknown>;
    const nested = r.data ?? r.Data;
    if (nested != null && typeof nested === 'object' && !Array.isArray(nested)) {
      current = nested;
      continue;
    }
    return r;
  }
  return null;
}

function extractOrderApiFailureMessage(r: Record<string, unknown>): string {
  const errorsRaw = r.errors ?? r.Errors;
  if (errorsRaw && typeof errorsRaw === 'object') {
    for (const v of Object.values(errorsRaw as Record<string, unknown>)) {
      if (!Array.isArray(v)) continue;
      for (const item of v) {
        const s = String(item ?? '').trim();
        if (s) return s;
      }
    }
  }
  const fromMsg = readString(r, 'message', 'Message');
  if (fromMsg) return fromMsg;
  return 'Không lấy được thông tin in vận đơn.';
}

function throwIfOrderApiBusinessFailed(payload: unknown): void {
  if (payload == null || typeof payload !== 'object') return;
  const r = payload as Record<string, unknown>;
  const succeeded = r.succeeded ?? r.Succeeded;
  if (succeeded !== false) return;
  throw new Error(extractOrderApiFailureMessage(r));
}

export function normalizeGhnPrintWaybillResult(raw: unknown): GhnPrintWaybillResult | null {
  throwIfOrderApiBusinessFailed(raw);
  const payload = unwrapGatewayPayload<unknown>(raw) ?? raw;
  const r = unwrapPayloadRecord(payload);
  if (!r) return null;
  const printUrl = readString(r, 'printUrl', 'PrintUrl', 'url', 'Url');
  if (!printUrl) return null;
  const trackingCode = readString(r, 'trackingCode', 'TrackingCode', 'slipCode', 'SlipCode', 'trackingNumber', 'TrackingNumber');
  return {
    token: readString(r, 'token', 'Token'),
    printUrl,
    trackingCode,
  };
}

export async function printGhnWaybill(request: GhnPrintWaybillRequest): Promise<GhnPrintWaybillResult> {
  const orderCode = String(request.orderCode ?? '').trim();
  if (!orderCode) {
    throw new Error('Thiếu mã đơn OMS để in vận đơn.');
  }

  const res = await axiosRequest.post(GHN_PRINT_PATH, {
    orderCode,
    labelSize: request.labelSize ?? PACKING_GHN_WAYBILL_PAGE_SIZE,
  });

  const normalized = normalizeGhnPrintWaybillResult(res);
  if (!normalized) {
    throw new Error('Không lấy được link in vận đơn.');
  }
  return normalized;
}

export async function syncGhnShipmentByClientCode(clientOrderCode: string): Promise<void> {
  const code = String(clientOrderCode ?? '').trim();
  if (!code) {
    throw new Error('Thiếu mã đơn để đồng bộ vận đơn.');
  }

  const res = await axiosRequest.post(GHN_SYNC_BY_CLIENT_CODE_PATH, { clientOrderCode: code });
  throwIfOrderApiBusinessFailed(res);
}
