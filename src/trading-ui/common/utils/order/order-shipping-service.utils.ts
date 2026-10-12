import { getOrderShippingServices, type IOrderShippingServiceItem, type IOrderShippingServicesRequest } from '../../../apis/order';

export interface NormalizedOrderShippingServiceOption {
  value: string;
  label: string;
  fee: number;
  /** Hiển thị: từ `from_estimate_date` đến `to_estimate_date`. */
  estimatedDateLabel: string;
  /** Gửi BE khi tạo/cập nhật đơn — `leadtime_order.to_estimate_date`. */
  estimatedDeliveryAt?: string;
  serviceId?: number;
  serviceTypeId?: number;
}

const formatEstimateDateVi = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
};

const formatLeadtimeEstimateLabel = (from?: string, to?: string): string => {
  const fromLabel = from?.trim() ? formatEstimateDateVi(from) : '';
  const toLabel = to?.trim() ? formatEstimateDateVi(to) : '';
  if (fromLabel && toLabel) return fromLabel === toLabel ? fromLabel : `${fromLabel} – ${toLabel}`;
  return fromLabel || toLabel;
};

const readLeadtimeOrder = (service: IOrderShippingServiceItem) => {
  const payload = service.leadtime;
  if (!payload || typeof payload !== 'object') return { from: '', to: '' };
  return {
    from: payload.leadtime_order?.from_estimate_date?.trim() ?? '',
    to: payload.leadtime_order?.to_estimate_date?.trim() ?? '',
  };
};

export const ORDER_SHIPPING_DEFAULT_SHOP_ID = 200011;
export const ORDER_SHIPPING_ADDRESS_DEBOUNCE_MS = 500;

export interface FetchOrderShippingServiceOptionsParams {
  fromWardIdV2: number;
  fromAddressV2: string;
  toWardIdV2: number;
  toAddressV2: string;
  totalWeightGrams?: number;
}

export const mapOrderShippingServiceOption = (service: IOrderShippingServiceItem): NormalizedOrderShippingServiceOption => {
  const serviceId = Number(service.serviceId ?? service.service_id ?? 0);
  const serviceTypeId = Number(service.serviceTypeId ?? service.service_type_id ?? 0);
  const computedFee = Number(service.totalFee ?? service.total_fee ?? service.fee ?? 0);
  const expectedRaw = service.expectedDeliveryTime ?? service.expected_delivery_time ?? '';
  const { from: leadtimeFrom, to: leadtimeTo } = readLeadtimeOrder(service);
  const leadtimePayload = service.leadtime;
  const leadtimeSeconds = typeof leadtimePayload === 'number' ? leadtimePayload : typeof leadtimePayload === 'object' && leadtimePayload !== null ? Number(leadtimePayload.leadtime ?? 0) : 0;
  const expectedTime = expectedRaw ? new Date(expectedRaw) : leadtimeTo ? new Date(leadtimeTo) : leadtimeSeconds > 0 ? new Date(leadtimeSeconds * 1000) : null;
  const expectedLabel =
    leadtimeFrom || leadtimeTo ? formatLeadtimeEstimateLabel(leadtimeFrom, leadtimeTo) : expectedTime && !Number.isNaN(expectedTime.getTime()) ? expectedTime.toLocaleDateString('vi-VN') : '';
  const serviceLabel = service.shortName || service.short_name || service.serviceName || service.service_name || 'Dịch vụ';

  return {
    value: serviceId > 0 ? String(serviceId) : serviceTypeId > 0 ? `type-${serviceTypeId}` : serviceLabel,
    label: serviceLabel,
    fee: Number.isFinite(computedFee) ? computedFee : 0,
    estimatedDateLabel: expectedLabel,
    estimatedDeliveryAt: leadtimeTo || undefined,
    serviceId: serviceId > 0 ? serviceId : undefined,
    serviceTypeId: serviceTypeId > 0 ? serviceTypeId : undefined,
  };
};

export const fetchOrderShippingServiceOptions = async (params: FetchOrderShippingServiceOptionsParams): Promise<NormalizedOrderShippingServiceOption[]> => {
  const request: IOrderShippingServicesRequest = {
    shopId: ORDER_SHIPPING_DEFAULT_SHOP_ID,
    fromWardIdV2: Number(params.fromWardIdV2) || 0,
    fromAddressV2: params.fromAddressV2?.trim() ?? '',
    toWardIdV2: Number(params.toWardIdV2) || 0,
    toAddressV2: params.toAddressV2?.trim() ?? '',
    totalWeightGrams: Math.max(0, Number(params.totalWeightGrams ?? 0)),
  };
  const services = await getOrderShippingServices(request);
  return services.map(mapOrderShippingServiceOption);
};
