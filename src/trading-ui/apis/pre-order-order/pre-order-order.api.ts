import { axiosRequest } from '../../common/config';
import { PreOrderOrderStatus } from './pre-order-order.enum';
import type {
  BulkMarkPreOrderAwaitingPaymentDto,
  BulkSendPreOrderZnsDto,
  CancelPreOrderOrderDto,
  PreOrderOrderDetail,
  PreOrderOrderItem,
  PreOrderOrderListItem,
  PreOrderOrderStatusCounts,
  QueryPreOrderOrderDto,
  ResListPreOrderOrder,
  UpdatePreOrderReceiverPhoneDto,
} from './pre-order-order.interface';

const ADMIN_BASE_PATH = 'order/pre-orders/admin';

const STATUS_COUNT_KEYS: Array<'all' | PreOrderOrderStatus> = ['all', ...Object.values(PreOrderOrderStatus)];

const toCountNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const unwrapPayload = (raw: unknown): Record<string, unknown> => {
  if (!raw || typeof raw !== 'object') return {};
  const record = raw as Record<string, unknown>;
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as Record<string, unknown>;
  }
  if (record.result && typeof record.result === 'object' && !Array.isArray(record.result)) {
    return record.result as Record<string, unknown>;
  }
  return record;
};

const readCountByAliases = (record: Record<string, unknown>, ...aliases: string[]): number | undefined => {
  for (const alias of aliases) {
    if (!Object.prototype.hasOwnProperty.call(record, alias)) continue;
    const value = toCountNumber(record[alias]);
    if (value != null) return value;
  }
  return undefined;
};

const normalizeStatusCounts = (raw: unknown, totalFallback?: number): PreOrderOrderStatusCounts | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const record = raw as Record<string, unknown>;
  const counts: PreOrderOrderStatusCounts = {};

  for (const status of Object.values(PreOrderOrderStatus)) {
    // BE có thể trả key theo enum value (`Draft`) hoặc enum name (`DRAFT`).
    const value = readCountByAliases(record, status, status.toUpperCase(), status.toLowerCase());
    counts[status] = value ?? 0;
  }

  const explicitAll = readCountByAliases(record, 'all', 'ALL', 'All');
  const summed = Object.values(PreOrderOrderStatus).reduce((sum, status) => sum + (counts[status] ?? 0), 0);
  counts.all = explicitAll ?? (Number.isFinite(totalFallback) ? Number(totalFallback) : summed);

  return STATUS_COUNT_KEYS.some((key) => counts[key] != null) ? counts : undefined;
};

const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
};

const normalizeItem = (raw: unknown, index: number): PreOrderOrderItem => {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    id: asString(record.id) ?? `item-${index}`,
    productId: asString(record.productId),
    variationId: asString(record.variationId),
    productName: asString(record.productName) ?? asString(record.name) ?? '—',
    variationName: asString(record.variationName),
    skuCode: asString(record.skuCode) ?? asString(record.sku) ?? '',
    image: (asString(record.image) ?? asString(record.thumbnailUrl) ?? null) as string | null,
    quantity: typeof record.quantity === 'number' ? record.quantity : Number(record.quantity) || 0,
    unitPrice: (record.unitPrice as string | number | null | undefined) ?? null,
    salePrice: (record.salePrice as string | number | null | undefined) ?? null,
    lineTotal: (record.lineTotal as string | number | null | undefined) ?? null,
    customerDisplayPrice: record.customerDisplayPrice as PreOrderOrderItem['customerDisplayPrice'],
  };
};

const normalizeListItem = (raw: unknown): PreOrderOrderListItem => {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const shipping = record.shippingAddressSnapshot && typeof record.shippingAddressSnapshot === 'object' ? (record.shippingAddressSnapshot as Record<string, unknown>) : null;
  const rawItems = (record.items ?? record.lineItems ?? record.products) as unknown;
  const items = Array.isArray(rawItems) ? rawItems.map((item, index) => normalizeItem(item, index)) : [];
  const composedName =
    [asString(record.lastName), asString(record.firstName)].filter(Boolean).join(' ').trim() || [asString(shipping?.lastName), asString(shipping?.firstName)].filter(Boolean).join(' ').trim() || null;

  return {
    id: asString(record.id) ?? '',
    createdAt: asString(record.createdAt) ?? '',
    updatedAt: asString(record.updatedAt),
    preOrderCode: asString(record.preOrderCode) ?? asString(record.code) ?? asString(record.orderCode) ?? '—',
    omsOrderCode: asString(record.omsOrderCode) ?? asString(record.linkedOrderCode) ?? asString(record.omsCode) ?? null,
    omsOrderId: asString(record.omsOrderId) ?? asString(record.linkedOrderId) ?? null,
    status: (asString(record.status) ?? PreOrderOrderStatus.PRE_ORDERED) as PreOrderOrderStatus | string,
    source: (asString(record.source) ?? null) as PreOrderOrderListItem['source'],
    customerName: asString(record.customerName) ?? asString(record.receiverName) ?? composedName,
    customerPhone: asString(record.customerPhone) ?? asString(record.receiverPhone) ?? asString(record.phone) ?? asString(shipping?.receiverPhone) ?? null,
    customerEmail:
      asString(record.customerEmail) ??
      asString(record.contactEmail) ??
      asString(record.email) ??
      asString(record.receiverEmail) ??
      asString(shipping?.email) ??
      asString(shipping?.contactEmail) ??
      null,
    totalQuantity: typeof record.totalQuantity === 'number' ? record.totalQuantity : undefined,
    grandTotal: (record.grandTotal as string | number | null | undefined) ?? (record.totalAmount as string | number | null | undefined) ?? null,
    znsRetryCount: (() => {
      const raw = record.znsRetryCount;
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
      if (typeof raw === 'string' && raw.trim() !== '') {
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    })(),
    items,
  };
};

const normalizeOrderListResponse = (raw: unknown): ResListPreOrderOrder => {
  const payload = unwrapPayload(raw);
  const listRaw = (payload.list ?? payload.data ?? payload.items) as unknown;
  const list = Array.isArray(listRaw) ? listRaw.map(normalizeListItem) : Array.isArray(raw) ? (raw as unknown[]).map(normalizeListItem) : [];
  const total = toCountNumber(payload.total) ?? list.length;
  const counts = normalizeStatusCounts(payload.statusCounts ?? payload.summary ?? payload.counts, total);

  return {
    list,
    total,
    page: toCountNumber(payload.page),
    pageSize: toCountNumber(payload.pageSize),
    ...(counts ? { counts } : {}),
    pagination: { total },
  };
};

const normalizeDetail = (raw: unknown): PreOrderOrderDetail => {
  const payload = unwrapPayload(raw);
  const base = normalizeListItem(payload);
  const statusHistoryRaw = payload.statusHistory ?? payload.timeline ?? payload.histories;
  const warehouseFromFlat =
    asString(payload.warehouseId) || asString(payload.warehouseName)
      ? {
          warehouseId: asString(payload.warehouseId) ?? null,
          warehouseName: asString(payload.warehouseName) ?? null,
          addressLine: null,
          phone: null,
          provinceName: null,
          wardName: null,
        }
      : null;

  return {
    ...base,
    paymentMethod: (asString(payload.paymentMethod) ?? null) as PreOrderOrderDetail['paymentMethod'],
    shippingMethod: (asString(payload.shippingMethod) ?? null) as PreOrderOrderDetail['shippingMethod'],
    shippingCarrier: asString(payload.shippingCarrier) ?? null,
    carrierServiceName: asString(payload.carrierServiceName) ?? asString(payload.shippingServiceName) ?? null,
    subtotal: (payload.subtotal as string | number | null | undefined) ?? null,
    discountTotal: (payload.discountTotal as string | number | null | undefined) ?? null,
    discountCode: asString(payload.discountCode) ?? null,
    shippingFee: (payload.shippingFee as string | number | null | undefined) ?? null,
    customerNote: asString(payload.customerNote) ?? null,
    shipperNote: asString(payload.shipperNote) ?? null,
    internalNotes: Array.isArray(payload.internalNotes) ? (payload.internalNotes as PreOrderOrderDetail['internalNotes']) : undefined,
    shippingAddressSnapshot: (payload.shippingAddressSnapshot as PreOrderOrderDetail['shippingAddressSnapshot']) ?? null,
    warehouseSnapshot: (payload.warehouseSnapshot as PreOrderOrderDetail['warehouseSnapshot']) ?? (payload.pickupAddressSnapshot as PreOrderOrderDetail['warehouseSnapshot']) ?? warehouseFromFlat,
    websiteOrderUrl: asString(payload.websiteOrderUrl) ?? asString(payload.detailUrl) ?? asString(payload.websiteUrl) ?? null,
    awaitingPaymentExpiresAt: asString(payload.awaitingPaymentExpiresAt) ?? asString(payload.paymentExpiresAt) ?? null,
    expectedStockAt:
      asString(payload.expectedStockAt) ??
      asString(payload.expectedAvailableAt) ??
      asString(payload.campaign && typeof payload.campaign === 'object' ? (payload.campaign as Record<string, unknown>).expectedStockAt : undefined) ??
      null,
    statusHistory: Array.isArray(statusHistoryRaw)
      ? statusHistoryRaw.map((entry, index) => {
          const row = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};
          const toStatus = asString(row.toStatus) ?? asString(row.status) ?? '';
          const fromStatus = asString(row.fromStatus) ?? null;
          const title = asString(row.title) ?? asString(row.label) ?? (toStatus || null);
          return {
            id: asString(row.id) ?? `history-${index}`,
            status: toStatus,
            fromStatus,
            toStatus: toStatus || null,
            title,
            note: asString(row.note) ?? null,
            changedByName: asString(row.changedByName) ?? asString(row.actorName) ?? null,
            createdAt: asString(row.createdAt) ?? asString(row.changedAt) ?? '',
          };
        })
      : undefined,
  };
};

/** POST order/pre-orders/admin/filter */
export const getPreOrderOrderList = async (body: QueryPreOrderOrderDto): Promise<ResListPreOrderOrder> => {
  const raw = await axiosRequest.post(`${ADMIN_BASE_PATH}/filter`, body);
  return normalizeOrderListResponse(raw);
};

/** GET order/pre-orders/admin/:id */
export const getPreOrderOrderDetail = async (id: string): Promise<PreOrderOrderDetail> => {
  const raw = await axiosRequest.get(`${ADMIN_BASE_PATH}/${encodeURIComponent(id)}`);
  return normalizeDetail(raw);
};

/** PUT order/pre-orders/admin/:id/receiver-phone */
export const updatePreOrderOrderReceiverPhone = async (id: string, body: UpdatePreOrderReceiverPhoneDto): Promise<PreOrderOrderDetail> => {
  const raw = await axiosRequest.put(`${ADMIN_BASE_PATH}/${encodeURIComponent(id)}/receiver-phone`, body);
  return normalizeDetail(raw);
};

/** POST order/pre-orders/admin/:id/cancel */
export const cancelPreOrderOrder = async (id: string, body: CancelPreOrderOrderDto): Promise<PreOrderOrderDetail> => {
  const raw = await axiosRequest.post(`${ADMIN_BASE_PATH}/${encodeURIComponent(id)}/cancel`, body);
  return normalizeDetail(raw);
};

/** POST order/pre-orders/admin/:id/send-zns */
export const sendPreOrderOrderZns = async (id: string): Promise<PreOrderOrderDetail> => {
  const raw = await axiosRequest.post(`${ADMIN_BASE_PATH}/${encodeURIComponent(id)}/send-zns`, {});
  return normalizeDetail(raw);
};

/** POST order/pre-orders/admin/bulk-send-zns — BE queue xử lý nền, response success không đồng nghĩa đã gửi xong. */
export const bulkSendPreOrderOrdersZns = async (body: BulkSendPreOrderZnsDto): Promise<void> => {
  await axiosRequest.post(`${ADMIN_BASE_PATH}/bulk-send-zns`, body);
};

/** POST order/pre-orders/admin/:id/resend-zns */
export const resendPreOrderOrderZns = async (id: string): Promise<PreOrderOrderDetail> => {
  const raw = await axiosRequest.post(`${ADMIN_BASE_PATH}/${encodeURIComponent(id)}/resend-zns`, {});
  return normalizeDetail(raw);
};

/** POST order/pre-orders/admin/bulk-mark-awaiting-payment */
export const bulkMarkPreOrderOrdersAwaitingPayment = async (body: BulkMarkPreOrderAwaitingPaymentDto): Promise<void> => {
  await axiosRequest.post(`${ADMIN_BASE_PATH}/bulk-mark-awaiting-payment`, body);
};

/** POST order/pre-orders/admin/bulk-mark-awaiting-payment — không refetch detail (caller tự mutate SWR). */
export const movePreOrderOrderToAwaitingPayment = async (id: string): Promise<void> => {
  await bulkMarkPreOrderOrdersAwaitingPayment({ preOrderIds: [id] });
};
