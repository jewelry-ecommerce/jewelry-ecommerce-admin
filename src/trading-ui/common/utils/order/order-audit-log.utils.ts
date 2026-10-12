import type { IOrderAuditLogChange, IOrderAuditLogItem, IOrderAuditLogListResponse } from '../../../apis/order';
import { OrderKind, OrderPurpose, OrderSource, PaymentMethod, PaymentStatus, ShippingMethod } from '../../../apis/order/order.enum';
import { RefundProposalPaymentChannel } from '../../../apis/refund-proposal/refund-proposal.enum';
import { mapOrderAuditActionLabel, mapOrderAuditValueLabel, ORDER_AUDIT_LOG_FIELD_LABELS } from '../../constant/order/order-audit-log-field-label.constant';
import { ORDER_STATUS_LABELS } from '../../constant/order/order.constants';
import { REFUND_PROPOSAL_PAYMENT_LABELS, REFUND_PROPOSAL_REASON_LABELS, REFUND_PROPOSAL_SOURCE_LABELS, REFUND_PROPOSAL_STATUS_LABELS } from '../../constant/refund-proposal/refund-proposal.constants';
import { PRE_ORDER_ORDER_STATUS_LABELS } from '../../../pages/order/pre-order-order/pre-order-order.constants';
import type { PreOrderOrderStatus } from '../../../apis/pre-order-order';
import { isAuditMetadataFieldPath } from '../audit-log-display.utils';
import { formatDateTime as formatDateTimeVi } from '../date-format.util';

export type AuditSourceLabel = 'Hệ thống' | 'Thủ công' | 'Webhook';

export type OrderAuditLogViewItem = {
  id: string;
  title: string;
  source: AuditSourceLabel;
  at: string;
  actorLabel: string;
  description?: string;
  changeRows: Array<{ field?: string; oldValue?: string; newValue?: string }>;
};

const SOURCE_LABEL_MAP: Record<string, AuditSourceLabel> = {
  system: 'Hệ thống',
  cron: 'Hệ thống',
  user: 'Thủ công',
  manual: 'Thủ công',
  webhook: 'Webhook',
};

const MONEY_FIELDS = new Set(['grandTotal', 'subtotal', 'shippingFee', 'discountTotal', 'taxTotal', 'declaredValueFee', 'amountReceived', 'codAmount', 'lineTotal', 'unitPrice', 'salePrice']);
const TIME_FIELDS = new Set([
  'updatedAt',
  'createdAt',
  'confirmedAt',
  'packedAt',
  'shippedAt',
  'deliveredAt',
  'completedAt',
  'cancelledAt',
  'paidAt',
  'paymentFailedAt',
  'orderExpiresAt',
  'estimatedDeliveryAt',
  'invoiceCreatedAt',
]);

const ORDER_STATUS_DISPLAY = ORDER_STATUS_LABELS as Record<string, string>;

const PAYMENT_STATUS_DISPLAY: Record<string, string> = {
  [PaymentStatus.PAID]: 'Đã thanh toán',
  [PaymentStatus.UNPAID]: 'Chưa thanh toán',
  [PaymentStatus.PARTIAL]: 'Thanh toán một phần',
  [PaymentStatus.PARTIAL_PAID_COD]: 'Thanh toán 1 phần',
  [PaymentStatus.FAILED]: 'Thanh toán thất bại',
  [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',
};

const PAYMENT_METHOD_DISPLAY: Record<string, string> = {
  [PaymentMethod.COD]: 'Thanh toán khi nhận hàng (COD)',
  [PaymentMethod.QR_CODE]: 'QR Code (Ngân hàng / Ví)',
  [PaymentMethod.CREDIT_CARD]: 'Thẻ quốc tế (Visa/Master/JCB)',
  [PaymentMethod.DIGITAL_WALLET]: 'Ví điện tử (Apple Pay / Samsung Pay)',
  [PaymentMethod.MOMO_WALLET]: 'Ví MoMo',
  [PaymentMethod.ZALO_PAY]: 'Ví ZaloPay',
  [PaymentMethod.ZALOPAY]: 'Ví ZaloPay',
  [PaymentMethod.INSTALLMENT]: 'Trả góp',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
  [PaymentMethod.ATM_CARD]: 'Thẻ ATM nội địa',
  [PaymentMethod.VNPAY]: 'Ví VNPAY',
};

const SHIPPING_METHOD_DISPLAY: Record<string, string> = {
  [ShippingMethod.STANDARD]: 'Tiêu chuẩn',
  [ShippingMethod.STORE_PICKUP]: 'Bán tại quầy',
};

const ORDER_PURPOSE_DISPLAY: Record<string, string> = {
  [OrderPurpose.ADDITIONAL]: 'Đặt thêm',
  [OrderPurpose.COMPENSATION]: 'Bù hàng',
  [OrderPurpose.STORE]: 'Cửa hàng',
  [OrderPurpose.RETAIL]: 'Bán lẻ',
  [OrderPurpose.GIFT]: 'Quà tặng',
  [OrderPurpose.RETURN]: 'Đổi trả',
};

const ORDER_KIND_DISPLAY: Record<string, string> = {
  [OrderKind.NORMAL]: 'Đơn thường',
  [OrderKind.RECALL]: 'Thu hồi',
  [OrderKind.RETURN]: 'Trả hàng',
};

/** Nguồn đơn — rút gọn từ enum OrderSource (đủ case audit thường gặp). */
const ORDER_SOURCE_DISPLAY: Partial<Record<OrderSource, string>> = {
  [OrderSource.SHOPEE]: 'Shopee',
  [OrderSource.TIKTOK]: 'TikTok Shop',
  [OrderSource.LAZADA]: 'Lazada',
  [OrderSource.FACEBOOK]: 'Facebook',
  [OrderSource.INSTAGRAM]: 'Instagram',
  [OrderSource.ZALO]: 'Zalo',
  [OrderSource.WEBSITE]: 'Website',
  [OrderSource.APP]: 'Ứng dụng',
  [OrderSource.STORE_POS]: 'POS cửa hàng',
  [OrderSource.STORE_SHIP_FROM_STORE]: 'Cửa hàng — ship từ shop',
  [OrderSource.MANUAL]: 'Thủ công',
  [OrderSource.AFFILIATE]: 'Tiếp thị liên kết',
  [OrderSource.LIVE_STREAM]: 'Livestream',
};

const REFUND_STATUS_DISPLAY: Record<string, string> = REFUND_PROPOSAL_STATUS_LABELS as Record<string, string>;

const REFUND_SOURCE_TYPE_DISPLAY: Record<string, string> = REFUND_PROPOSAL_SOURCE_LABELS as Record<string, string>;

const REFUND_REASON_DISPLAY: Record<string, string> = REFUND_PROPOSAL_REASON_LABELS as Record<string, string>;

const REFUND_PAYMENT_METHOD_DISPLAY: Record<string, string> = {
  ...REFUND_PROPOSAL_PAYMENT_LABELS,
  [RefundProposalPaymentChannel.PAYOO.toLowerCase()]: 'Payoo (Tự động)',
  [RefundProposalPaymentChannel.COD.toLowerCase()]: 'Chuyển khoản (Thủ công)',
};

const mapActorRoleLabel = (role: string): string => {
  const r = role.trim();
  const lower = r.toLowerCase();
  if (lower === 'system') return 'Hệ thống';
  if (lower === 'admin' || lower === 'administrator') return 'Quản trị';
  if (lower === 'webhook') return 'Webhook';
  return r;
};

const mapActorNameLabel = (name: string): string => {
  const n = name.trim();
  if (n.toLowerCase() === 'system') return 'Hệ thống';
  return n;
};

const translateScalarAuditValue = (leafField: string, raw: string): string | undefined => {
  const v = raw.trim();
  if (!v || v === '—') return undefined;

  if (leafField === 'status' || leafField === 'orderStatus' || leafField === 'proposalStatus') {
    return REFUND_STATUS_DISPLAY[v] ?? ORDER_STATUS_DISPLAY[v] ?? PRE_ORDER_ORDER_STATUS_LABELS[v as PreOrderOrderStatus] ?? undefined;
  }
  if (leafField === 'paymentStatus') {
    return PAYMENT_STATUS_DISPLAY[v] ?? undefined;
  }
  if (leafField === 'paymentMethod') {
    return PAYMENT_METHOD_DISPLAY[v] ?? undefined;
  }
  if (leafField === 'originalPaymentMethod' || leafField === 'paymentChannel') {
    return REFUND_PAYMENT_METHOD_DISPLAY[v] ?? undefined;
  }
  if (leafField === 'shippingMethod') {
    return SHIPPING_METHOD_DISPLAY[v] ?? undefined;
  }
  if (leafField === 'purpose') {
    return ORDER_PURPOSE_DISPLAY[v] ?? undefined;
  }
  if (leafField === 'orderKind') {
    return ORDER_KIND_DISPLAY[v] ?? undefined;
  }
  if (leafField === 'source') {
    return ORDER_SOURCE_DISPLAY[v as OrderSource] ?? undefined;
  }
  if (leafField === 'sourceType') {
    return REFUND_SOURCE_TYPE_DISPLAY[v] ?? undefined;
  }
  if (leafField === 'reason') {
    return REFUND_REASON_DISPLAY[v] ?? undefined;
  }
  if (leafField === 'isDataValid') {
    if (v === 'true') return mapOrderAuditValueLabel(true);
    if (v === 'false') return mapOrderAuditValueLabel(false);
  }

  return mapOrderAuditValueLabel(v);
};

const tryParseJson = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const extractLeafField = (field?: string): string => {
  if (!field) return '';
  return field.split('.').pop() ?? field;
};

const formatMoney = (value: unknown): string => {
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(n)) return String(value ?? '—');
  return `${new Intl.NumberFormat('vi-VN').format(n)} đ`;
};

const formatAuditDateTime = (value: unknown): string => {
  const raw = typeof value === 'string' ? value : String(value ?? '');
  const formatted = formatDateTimeVi(raw.trim() || undefined);
  return formatted === '—' ? raw || '—' : formatted;
};

const formatAddressSnapshot = (value: unknown): string => {
  const v = tryParseJson(value) as Record<string, unknown>;
  if (!v || typeof v !== 'object' || Array.isArray(v)) return String(value ?? '—');
  const fullName = [v.lastName, v.firstName].filter(Boolean).join(' ').trim();
  const address = [v.addressLine, v.wardName, v.provinceName].filter(Boolean).join(', ');
  return [fullName, v.receiverPhone ?? v.phone, address].filter(Boolean).join(' • ') || '—';
};

const formatItems = (value: unknown): string => {
  const parsed = tryParseJson(value);
  if (!Array.isArray(parsed)) return String(value ?? '—');
  if (parsed.length === 0) return '—';
  return parsed
    .map((it) => {
      const row = (it ?? {}) as Record<string, unknown>;
      const name = String(row.productName ?? row.variationName ?? 'Sản phẩm');
      const sku = String(row.skuCode ?? row.sku ?? '—');
      const qty = Number(row.quantity ?? 0);
      return `${name} (${sku}) x${Number.isFinite(qty) ? qty : 0}`;
    })
    .join('; ');
};

const mapAuditFieldLabel = (key: string): string => ORDER_AUDIT_LOG_FIELD_LABELS[key] ?? key;

/** Chuỗi hoá errorLog audit — tránh in JSON thô. */
const formatErrorLogAuditValue = (value: unknown): string => {
  const node = typeof value === 'string' ? tryParseJson(value) : value;
  if (node == null) return '—';
  if (typeof node !== 'object' || Array.isArray(node)) {
    return mapOrderAuditValueLabel(node) ?? (typeof node === 'string' ? node : '—');
  }

  const o = node as Record<string, unknown>;
  const segments: string[] = [];

  const shipment = o.shipment;
  if (shipment != null && String(shipment).trim()) {
    const raw = String(shipment).trim();
    segments.push(`${mapAuditFieldLabel('shipment')}: ${mapOrderAuditValueLabel(raw) ?? raw}`);
  }

  for (const k of Object.keys(o)) {
    if (k === 'shipment') continue;
    const v = o[k];
    const label = mapAuditFieldLabel(k);
    if (v != null && typeof v === 'object') {
      try {
        segments.push(`${label}: ${JSON.stringify(v)}`);
      } catch {
        segments.push(`${label}: (không đọc được)`);
      }
      continue;
    }
    const raw = v == null ? '' : String(v).trim();
    if (!raw) continue;
    segments.push(`${label}: ${mapOrderAuditValueLabel(raw) ?? raw}`);
  }

  return segments.length ? segments.join('; ') : '—';
};

const formatShipmentCreationRetry = (retry: Record<string, unknown>): string => {
  const bits: string[] = [];
  const attempts = retry.attempts;
  if (attempts != null) bits.push(`${mapAuditFieldLabel('attempts')}: ${attempts}`);

  const lastError = retry.lastError != null ? String(retry.lastError).trim() : '';
  if (lastError) {
    bits.push(`${mapAuditFieldLabel('lastError')}: ${mapOrderAuditValueLabel(lastError) ?? lastError}`);
  }

  if (retry.lastAttemptAt != null && String(retry.lastAttemptAt).trim()) {
    bits.push(`${mapAuditFieldLabel('lastAttemptAt')}: ${formatAuditDateTime(retry.lastAttemptAt)}`);
  }

  if (retry.noFurtherRetries != null) {
    const label = mapOrderAuditValueLabel(retry.noFurtherRetries) ?? String(retry.noFurtherRetries);
    bits.push(`${mapAuditFieldLabel('noFurtherRetries')}: ${label}`);
  }
  return bits.length ? bits.join('; ') : '—';
};

/** Chuỗi hoá metadata audit (ví dụ recall) — tránh in JSON thô trên UI. */
const formatMetadataAuditValue = (value: unknown): string => {
  const node = typeof value === 'string' ? tryParseJson(value) : value;
  if (node == null) return '—';
  if (typeof node !== 'object' || Array.isArray(node)) {
    const s = typeof node === 'string' ? node.trim() : '';
    if (!s || s === '{}') return '—';
    return typeof node === 'string' ? node : JSON.stringify(node);
  }

  const o = node as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 0) return '—';

  const segments: string[] = [];

  const recall = o.recall;
  if (recall && typeof recall === 'object' && !Array.isArray(recall)) {
    const r = recall as Record<string, unknown>;
    const bits: string[] = [];
    const fk = String(r.fromKind ?? '').trim();
    if (fk) bits.push(`Loại đơn trước thu hồi: ${ORDER_KIND_DISPLAY[fk] ?? fk}`);
    const fs = String(r.fromStatus ?? '').trim();
    if (fs) bits.push(`Trạng thái trước thu hồi: ${ORDER_STATUS_DISPLAY[fs] ?? fs}`);
    if (r.recalledAt != null && String(r.recalledAt).trim()) {
      bits.push(`Thời điểm thu hồi: ${formatAuditDateTime(r.recalledAt)}`);
    }
    const byId = r.recalledById != null ? String(r.recalledById).trim() : '';
    if (byId) bits.push(`Người thực hiện thu hồi (ID): ${byId}`);
    if (bits.length) segments.push(`Thu hồi đơn — ${bits.join('; ')}`);
  }

  const shipmentRetry = o.shipmentCreationRetry;
  if (shipmentRetry && typeof shipmentRetry === 'object' && !Array.isArray(shipmentRetry)) {
    const formatted = formatShipmentCreationRetry(shipmentRetry as Record<string, unknown>);
    if (formatted !== '—') {
      segments.push(`${mapAuditFieldLabel('shipmentCreationRetry')} — ${formatted}`);
    }
  }

  for (const k of keys) {
    if (k === 'recall' || k === 'shipmentCreationRetry') continue;
    const v = o[k];
    const label = mapAuditFieldLabel(k);
    if (v !== null && typeof v === 'object') {
      try {
        segments.push(`${label}: ${JSON.stringify(v)}`);
      } catch {
        segments.push(`${label}: (không đọc được)`);
      }
      continue;
    }
    const raw = v == null ? '' : String(v).trim();
    if (!raw) continue;
    segments.push(`${label}: ${mapOrderAuditValueLabel(raw) ?? raw}`);
  }

  return segments.length ? segments.join(' | ') : '—';
};

const toDisplayValue = (value: unknown, field?: string): string => {
  if (value == null) return '—';
  const leafField = extractLeafField(field);
  const parsedValue = tryParseJson(value);

  if (leafField === 'metadata') return formatMetadataAuditValue(value);
  if (leafField === 'errorLog') return formatErrorLogAuditValue(value);
  if (leafField === 'isDataValid') {
    return mapOrderAuditValueLabel(parsedValue) ?? String(parsedValue);
  }
  if (leafField === 'items') return formatItems(parsedValue);
  if (leafField === 'pickupAddressSnapshot' || leafField === 'shippingAddressSnapshot') {
    return formatAddressSnapshot(parsedValue);
  }
  if (TIME_FIELDS.has(leafField)) return formatAuditDateTime(parsedValue);
  if (MONEY_FIELDS.has(leafField)) return formatMoney(parsedValue);

  if (typeof parsedValue === 'string') {
    const s = parsedValue.trim() || '—';
    if (s === '—') return '—';
    const translated = translateScalarAuditValue(leafField, s);
    return translated ?? s;
  }
  if (typeof parsedValue === 'boolean') {
    return mapOrderAuditValueLabel(parsedValue) ?? String(parsedValue);
  }
  if (typeof parsedValue === 'number') return String(parsedValue);
  if (parsedValue !== null && typeof parsedValue === 'object' && !Array.isArray(parsedValue)) {
    const obj = parsedValue as Record<string, unknown>;
    if ('shipment' in obj && Object.keys(obj).length <= 3) {
      return formatErrorLogAuditValue(obj);
    }
    if ('shipmentCreationRetry' in obj) {
      return formatMetadataAuditValue(obj);
    }
  }
  try {
    return JSON.stringify(parsedValue);
  } catch {
    return String(parsedValue);
  }
};

const mapSource = (raw: unknown): AuditSourceLabel => {
  const normalized = typeof raw === 'string' ? raw.toLowerCase() : '';
  return SOURCE_LABEL_MAP[normalized] ?? 'Hệ thống';
};

const mapChanges = (changes: unknown): Array<{ field?: string; oldValue?: string; newValue?: string }> => {
  if (Array.isArray(changes)) {
    const rows = changes.map((change) => {
      const c = (change ?? {}) as IOrderAuditLogChange & {
        key?: unknown;
        path?: unknown;
        fieldName?: unknown;
        old?: unknown;
        new?: unknown;
        from?: unknown;
        to?: unknown;
        before?: unknown;
        after?: unknown;
      };

      const fieldRaw = c.field ?? c.fieldName ?? c.key ?? c.path;
      const oldRaw = c.oldValue ?? c.old ?? c.from ?? c.before;
      const newRaw = c.newValue ?? c.new ?? c.to ?? c.after;

      const field = typeof fieldRaw === 'string' ? fieldRaw : undefined;
      if (isAuditMetadataFieldPath(field)) return null;

      const oldValue = toDisplayValue(oldRaw, field);
      const newValue = toDisplayValue(newRaw, field);

      if (oldValue === newValue) return null;

      return {
        field,
        oldValue,
        newValue,
      };
    });

    return rows.filter((row) => row !== null);
  }

  // Một số API trả `diff` dạng object key-value thay vì array.
  if (changes && typeof changes === 'object') {
    const rows = Object.entries(changes as Record<string, unknown>).map(([field, raw]) => {
      if (isAuditMetadataFieldPath(field)) return null;
      if (!raw || typeof raw !== 'object') return null;
      const candidate = raw as Record<string, unknown>;
      const oldValue = toDisplayValue(candidate.oldValue ?? candidate.old ?? candidate.from ?? candidate.before, field);
      const newValue = toDisplayValue(candidate.newValue ?? candidate.new ?? candidate.to ?? candidate.after, field);
      if (oldValue === newValue) return null;
      return { field, oldValue, newValue };
    });

    return rows.filter((row) => row !== null);
  }

  return [];
};

export const normalizeAuditResponseToList = (response: unknown): IOrderAuditLogItem[] => {
  if (Array.isArray(response)) {
    return response as IOrderAuditLogItem[];
  }
  if (response && typeof response === 'object' && 'list' in response) {
    const typed = response as Partial<IOrderAuditLogListResponse>;
    return Array.isArray(typed.list) ? typed.list : [];
  }
  return [];
};

export const normalizeAuditItem = (item: IOrderAuditLogItem, index: number): OrderAuditLogViewItem => {
  const title = mapOrderAuditActionLabel(typeof item.action === 'string' ? item.action : undefined);
  const actorName = mapActorNameLabel(item.actor?.name?.trim() || 'Hệ thống');
  const actorRole = mapActorRoleLabel(item.actor?.roleName?.trim() || 'System');
  const actorLabel = actorName === actorRole ? actorName : `${actorName} • ${actorRole}`;
  const rawDiff = (item as { diff?: unknown }).diff;
  const changeRows = mapChanges(item.changes ?? rawDiff);

  return {
    id: item.id || `audit-${index}`,
    title,
    source: mapSource(item.source ?? item.actionType ?? (item as { sourceType?: unknown }).sourceType),
    at: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
    actorLabel,
    description: typeof item.message === 'string' ? item.message : typeof item.note === 'string' ? item.note : '',
    changeRows,
  };
};

export const sourceSxByLabel: Record<AuditSourceLabel, { color: string; bg: string; border: string }> = {
  'Hệ thống': { color: '#364153', bg: '#F9FAFB', border: '#E5E7EB' },
  'Thủ công': { color: '#175CD3', bg: '#EFF8FF', border: '#B2DDFF' },
  Webhook: { color: '#027A48', bg: '#ECFDF3', border: '#ABEFC6' },
};
