import type { ProductAuditLogChange, ProductAuditLogItem, ProductAuditLogListResponse } from '../../../apis/product/product.interface';
import { mapProductAuditActionLabel, mapProductAuditFieldLabel, mapProductAuditValueLabel } from '../../constant/product/product-audit-log-field-label.constant';
import { isAuditMetadataFieldPath } from '../audit-log-display.utils';
import { formatDateTime as formatDateTimeVi } from '../date-format.util';

export type ProductAuditSourceLabel = 'Hệ thống' | 'Thủ công' | 'Webhook';

export type ProductAuditLogViewItem = {
  id: string;
  title: string;
  source: ProductAuditSourceLabel;
  at: string;
  actorLabel: string;
  description?: string;
  changeRows: Array<{ field?: string; oldValue?: string; newValue?: string }>;
};

const SOURCE_LABEL_MAP: Record<string, ProductAuditSourceLabel> = {
  system: 'Hệ thống',
  user: 'Thủ công',
  manual: 'Thủ công',
  cron: 'Hệ thống',
  webhook: 'Webhook',
  internal: 'Hệ thống',
  customer: 'Thủ công',
};

const EMPTY_DISPLAY = 'Không có';

const TIME_FIELDS = new Set(['updatedAt', 'createdAt', 'deletedAt', 'reviewedAt', 'effectiveFrom', 'effectiveTo']);

const MONEY_FIELDS = new Set([
  'compareAtPriceAfterTaxMinor',
  'sellingPriceAfterTaxMinor',
  'costPriceAfterTaxMinor',
  'b2bPriceAfterTax',
  'b2bWholesalePriceAfterTax',
  'packagingIncludedPriceAfterTax',
  'packagingBasePriceAfterTax',
  'includedPriceAfterTax',
  'taxRate',
  'taxRateOverride',
]);

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

const formatProductInfos = (value: unknown): string => {
  const parsed = tryParseJson(value);
  if (!Array.isArray(parsed) || parsed.length === 0) return EMPTY_DISPLAY;
  return parsed
    .map((row) => {
      const info = (row ?? {}) as Record<string, unknown>;
      const title = String(info.title ?? '').trim() || '—';
      const sortOrder = info.sortOrder != null ? ` (#${info.sortOrder})` : '';
      return `${title}${sortOrder}`;
    })
    .join('; ');
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
};

const USER_ID_FIELDS = new Set(['reviewedBy', 'requestedBy', 'submittedBy', 'createdById', 'updatedById']);

const SKU_FIELD_LABELS: Record<string, string> = {
  sellingPriceAfterTaxMinor: 'Giá bán',
  costPriceAfterTaxMinor: 'Giá nhập',
  compareAtPriceAfterTaxMinor: 'Giá gạch',
  b2bWholesalePriceAfterTax: 'Giá sỉ B2B',
  b2bPriceAfterTax: 'Giá sỉ B2B',
  packagingIncludedPriceAfterTax: 'Giá đi kèm',
  packagingBasePriceAfterTax: 'Giá bán lẻ bao bì',
};

const formatSkusSummary = (value: unknown): string => {
  const rows = normalizeSkuRows(value);
  if (rows.length === 0) return EMPTY_DISPLAY;
  return rows
    .map((row) => {
      const code = String(row.skuCode ?? row.id ?? 'SKU');
      const name = String(row.name ?? '').trim();
      const priceParts = Object.entries(SKU_FIELD_LABELS)
        .filter(([key]) => row[key] != null && row[key] !== '')
        .map(([key, label]) => `${label}: ${formatMoney(row[key])}`);
      const head = name ? `${code} — ${name}` : code;
      return priceParts.length > 0 ? `${head} (${priceParts.join(', ')})` : head;
    })
    .join('; ');
};

const normalizeSkuRows = (value: unknown): Record<string, unknown>[] => {
  const parsed = tryParseJson(value);
  if (Array.isArray(parsed)) {
    return parsed.map((row) => (row ?? {}) as Record<string, unknown>);
  }
  const ops = asRecord(parsed);
  const upsert = ops?.upsert;
  if (Array.isArray(upsert)) {
    return upsert.map((row) => (row ?? {}) as Record<string, unknown>);
  }
  return [];
};

const skuRowKey = (row: Record<string, unknown>): string => String(row.uuid ?? row.id ?? row.skuCode ?? '');

const expandSkuDiffRows = (oldRaw: unknown, newRaw: unknown): Array<{ field?: string; oldValue?: string; newValue?: string }> => {
  const oldRows = normalizeSkuRows(oldRaw);
  const newRows = normalizeSkuRows(newRaw);
  const oldByKey = new Map(oldRows.map((row) => [skuRowKey(row), row]));
  const rows: Array<{ field?: string; oldValue?: string; newValue?: string }> = [];

  for (const newRow of newRows) {
    const key = skuRowKey(newRow);
    const oldRow = oldByKey.get(key) ?? {};
    const code = String(newRow.skuCode ?? oldRow.skuCode ?? key);

    for (const [prop, label] of Object.entries(SKU_FIELD_LABELS)) {
      if (newRow[prop] === undefined && oldRow[prop] === undefined) continue;
      if (String(newRow[prop] ?? '') === String(oldRow[prop] ?? '')) continue;
      rows.push({
        field: `Biến thể ${code} • ${label}`,
        oldValue: oldRow[prop] != null && oldRow[prop] !== '' ? formatMoney(oldRow[prop]) : EMPTY_DISPLAY,
        newValue: newRow[prop] != null && newRow[prop] !== '' ? formatMoney(newRow[prop]) : EMPTY_DISPLAY,
      });
    }
  }

  return rows;
};

const formatUserRef = (value: unknown, usersById?: Record<string, { displayName?: string }>): string => {
  const id = typeof value === 'string' ? value.trim() : '';
  if (!id) return EMPTY_DISPLAY;
  const user = usersById?.[id];
  if (user?.displayName?.trim()) return user.displayName.trim();
  return id;
};

const formatVariantAttributeOrder = (value: unknown): string => {
  const parsed = tryParseJson(value);
  if (!Array.isArray(parsed) || parsed.length === 0) return EMPTY_DISPLAY;
  return `${parsed.length} thuộc tính biến thể`;
};

const formatPackagingItemLabel = (row: Record<string, unknown>): string => {
  const packaging = asRecord(row.packagingVariation);
  const name = String(packaging?.name ?? '').trim();
  const code = String(packaging?.skuCode ?? '').trim();
  if (name && code) return `「${name}」(mã ${code})`;
  if (name) return `「${name}」`;
  if (code) return `mã ${code}`;
  return 'bao bì đi kèm';
};

const formatPackagingScopePhrase = (row: Record<string, unknown>): string => {
  const source = asRecord(row.sourceVariation);
  const sourceCode = String(source?.skuCode ?? '').trim();
  const sourceName = String(source?.name ?? '').trim();
  if (row.productVariationId && sourceCode) {
    return sourceName ? `chỉ áp dụng cho biến thể ${sourceCode} (${sourceName})` : `chỉ áp dụng cho biến thể ${sourceCode}`;
  }
  if (row.productVariationId) return 'chỉ áp dụng cho một biến thể cụ thể';
  return 'áp dụng cho toàn sản phẩm';
};

const formatPackagingBehaviorPhrase = (row: Record<string, unknown>): string[] => {
  const phrases: string[] = [];
  if (row.isRequired === true) phrases.push('khách bắt buộc mua kèm');
  if (row.isRequired === false) phrases.push('khách có thể bỏ qua');
  if (row.isDefault === true) phrases.push('được chọn sẵn mặc định');
  if (row.canCustomerChoose === true) phrases.push('khách được đổi loại bao bì');
  if (row.isVisibleOnProduct === false) phrases.push('không hiển thị trên trang sản phẩm');
  return phrases;
};

const formatPackagingQuantityPhrase = (row: Record<string, unknown>): string => {
  const qty = Number(row.quantity ?? 1);
  if (!Number.isFinite(qty) || qty <= 0) return 'số lượng chưa xác định';
  if (qty === 1) return '1 bộ trên mỗi đơn vị sản phẩm';
  return `${qty} bộ trên mỗi đơn vị sản phẩm`;
};

const formatPackagingRelationRow = (row: Record<string, unknown>): string => {
  const label = formatPackagingItemLabel(row);
  const quantityPhrase = formatPackagingQuantityPhrase(row);
  const scopePhrase = formatPackagingScopePhrase(row);
  const behaviorPhrases = formatPackagingBehaviorPhrase(row);

  let sentence = `Gắn ${label}: ${quantityPhrase}, ${scopePhrase}`;
  if (behaviorPhrases.length > 0) {
    sentence += `, ${behaviorPhrases.join(', ')}`;
  }

  const includedPrice = row.includedPriceAfterTax;
  if (includedPrice != null && includedPrice !== '') {
    sentence += `, giá kèm theo ${formatMoney(includedPrice)}`;
  }

  return sentence;
};

const formatPackagingRelations = (value: unknown): string => {
  const parsed = tryParseJson(value);
  if (!Array.isArray(parsed) || parsed.length === 0) return EMPTY_DISPLAY;
  if (parsed.length === 1) {
    return formatPackagingRelationRow((parsed[0] ?? {}) as Record<string, unknown>);
  }
  return parsed
    .map((row, index) => {
      const line = formatPackagingRelationRow((row ?? {}) as Record<string, unknown>);
      return `${index + 1}) ${line}`;
    })
    .join('\n');
};

const formatGenericArray = (value: unknown[]): string => {
  if (value.length === 0) return EMPTY_DISPLAY;
  const primitivesOnly = value.every((item) => item == null || ['string', 'number', 'boolean'].includes(typeof item));
  if (primitivesOnly) {
    const labels = value
      .map((item) => {
        if (item == null) return '';
        const raw = String(item).trim();
        return mapProductAuditValueLabel(raw) ?? raw;
      })
      .filter(Boolean);
    return labels.length > 0 ? labels.join(', ') : EMPTY_DISPLAY;
  }
  return `${value.length} mục`;
};

const toDisplayValue = (value: unknown, field?: string, usersById?: Record<string, { displayName?: string }>): string => {
  if (value == null) return EMPTY_DISPLAY;
  const leafField = extractLeafField(field);
  const parsedValue = tryParseJson(value);

  if (USER_ID_FIELDS.has(leafField)) return formatUserRef(parsedValue, usersById);

  if (leafField === 'productInfos') return formatProductInfos(parsedValue);
  if (leafField === 'skus') return formatSkusSummary(parsedValue);
  if (leafField === 'packagingRelations') return formatPackagingRelations(parsedValue);
  if (leafField === 'variantAttributeOrder') return formatVariantAttributeOrder(parsedValue);
  if (TIME_FIELDS.has(leafField)) return formatAuditDateTime(parsedValue);
  if (MONEY_FIELDS.has(leafField)) return formatMoney(parsedValue);

  if (Array.isArray(parsedValue)) {
    return formatGenericArray(parsedValue);
  }

  if (typeof parsedValue === 'string') {
    const s = parsedValue.trim();
    if (!s || s === '[]' || s === '{}') return EMPTY_DISPLAY;
    return mapProductAuditValueLabel(s) ?? s;
  }
  if (typeof parsedValue === 'boolean') {
    return mapProductAuditValueLabel(parsedValue) ?? String(parsedValue);
  }
  if (typeof parsedValue === 'number') return String(parsedValue);
  if (parsedValue !== null && typeof parsedValue === 'object') {
    const keys = Object.keys(parsedValue as object);
    if (keys.length === 0) return EMPTY_DISPLAY;
    try {
      return JSON.stringify(parsedValue);
    } catch {
      return String(parsedValue);
    }
  }
  return String(parsedValue);
};

const mapSource = (raw: unknown): ProductAuditSourceLabel => {
  const normalized = typeof raw === 'string' ? raw.toLowerCase() : '';
  return SOURCE_LABEL_MAP[normalized] ?? 'Hệ thống';
};

const mapActorRoleLabel = (role: string): string => {
  const lower = role.trim().toLowerCase();
  if (lower === 'system') return 'Hệ thống';
  if (lower === 'admin' || lower === 'administrator') return 'Quản trị';
  return role.trim();
};

const mapActorNameLabel = (name: string): string => {
  const n = name.trim();
  return n.toLowerCase() === 'system' ? 'Hệ thống' : n;
};

const mapChanges = (changes: unknown, usersById?: Record<string, { displayName?: string }>): Array<{ field?: string; oldValue?: string; newValue?: string }> => {
  if (Array.isArray(changes)) {
    const rows = changes.flatMap((change) => {
      const c = (change ?? {}) as ProductAuditLogChange & {
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
      if (isAuditMetadataFieldPath(field)) return [];

      if (field === 'skus' || extractLeafField(field) === 'skus') {
        const expanded = expandSkuDiffRows(oldRaw, newRaw);
        if (expanded.length > 0) return expanded;
      }

      const oldValue = toDisplayValue(oldRaw, field, usersById);
      const newValue = toDisplayValue(newRaw, field, usersById);
      if (oldValue === newValue) return [];

      return [
        {
          field: field ? mapProductAuditFieldLabel(field) : undefined,
          oldValue,
          newValue,
        },
      ];
    });

    return rows;
  }

  if (changes && typeof changes === 'object') {
    const rows = Object.entries(changes as Record<string, unknown>).flatMap(([field, raw]) => {
      if (isAuditMetadataFieldPath(field)) return [];
      if (!raw || typeof raw !== 'object') return [];
      const candidate = raw as Record<string, unknown>;
      const oldRaw = candidate.oldValue ?? candidate.old ?? candidate.from ?? candidate.before;
      const newRaw = candidate.newValue ?? candidate.new ?? candidate.to ?? candidate.after;

      if (field === 'skus') {
        const expanded = expandSkuDiffRows(oldRaw, newRaw);
        if (expanded.length > 0) return expanded;
      }

      const oldValue = toDisplayValue(oldRaw, field, usersById);
      const newValue = toDisplayValue(newRaw, field, usersById);
      if (oldValue === newValue) return [];
      return [
        {
          field: mapProductAuditFieldLabel(field),
          oldValue,
          newValue,
        },
      ];
    });

    return rows;
  }

  return [];
};

export const normalizeProductAuditResponseToList = (response: unknown): ProductAuditLogItem[] => {
  if (Array.isArray(response)) {
    return response as ProductAuditLogItem[];
  }
  if (response && typeof response === 'object' && 'list' in response) {
    const typed = response as Partial<ProductAuditLogListResponse>;
    return Array.isArray(typed.list) ? typed.list : [];
  }
  return [];
};

const seedActorFromAuditItem = (item: ProductAuditLogItem, lookup: Record<string, { displayName?: string }>): void => {
  const topLevelActor = item.actor != null && typeof item.actor === 'object' && !Array.isArray(item.actor) ? (item.actor as { id?: string; name?: string }) : undefined;
  const metadata = item.metadata;
  const metadataActor = metadata?.actor != null && typeof metadata.actor === 'object' && !Array.isArray(metadata.actor) ? (metadata.actor as { id?: string; name?: string }) : undefined;
  const actor = topLevelActor ?? metadataActor;
  const actorId = actor?.id?.trim();
  const actorName = actor?.name?.trim();
  if (!actorId || !actorName || lookup[actorId]?.displayName) return;
  lookup[actorId] = { displayName: actorName };
};

export const buildProductAuditUsersLookup = (items: ProductAuditLogItem[], response: unknown): Record<string, { displayName?: string }> => {
  const lookup: Record<string, { displayName?: string }> = {};
  if (response && typeof response === 'object' && 'usersById' in response) {
    const typed = response as Partial<ProductAuditLogListResponse>;
    if (typed.usersById) {
      for (const [id, user] of Object.entries(typed.usersById)) {
        lookup[id] = { displayName: user.displayName ?? undefined };
      }
    }
  }
  for (const item of items) {
    seedActorFromAuditItem(item, lookup);
  }
  return lookup;
};

export const normalizeProductAuditUsersById = (response: unknown): Record<string, { displayName?: string }> | undefined => {
  const lookup = buildProductAuditUsersLookup([], response);
  return Object.keys(lookup).length > 0 ? lookup : undefined;
};

export const normalizeProductAuditItem = (item: ProductAuditLogItem, index: number, usersById?: Record<string, { displayName?: string }>): ProductAuditLogViewItem => {
  const metadata = item.metadata != null && typeof item.metadata === 'object' && !Array.isArray(item.metadata) ? (item.metadata as Record<string, unknown>) : undefined;
  const topLevelActor = item.actor != null && typeof item.actor === 'object' && !Array.isArray(item.actor) ? (item.actor as { name?: string; roleName?: string; id?: string }) : undefined;
  const metadataActor =
    metadata?.actor != null && typeof metadata.actor === 'object' && !Array.isArray(metadata.actor) ? (metadata.actor as { name?: string; roleName?: string; id?: string }) : undefined;
  const actorId = topLevelActor?.id ?? metadataActor?.id ?? item.createdById ?? undefined;

  const operation = typeof item.operation === 'string' ? item.operation : typeof metadata?.operation === 'string' ? metadata.operation : undefined;
  const actionField = typeof item.action === 'string' ? item.action : undefined;
  const title = mapProductAuditActionLabel(operation ?? actionField);

  const enrichedActorName = topLevelActor?.name ?? metadataActor?.name ?? item.actor?.displayName ?? item.actor?.name;
  const actorName = mapActorNameLabel(enrichedActorName?.trim() || usersById?.[actorId ?? '']?.displayName?.trim() || 'Hệ thống');
  const actorRole = mapActorRoleLabel(topLevelActor?.roleName?.trim() || metadataActor?.roleName?.trim() || item.actor?.roleName?.trim() || 'System');
  const actorLabel = actorName === actorRole ? actorName : `${actorName} • ${actorRole}`;

  const changeRows = mapChanges(item.changes ?? item.diff, usersById);

  return {
    id: item.id || `product-audit-${index}`,
    title,
    source: mapSource(item.source ?? item.sourceType ?? item.actionType),
    at: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
    actorLabel,
    description: typeof item.message === 'string' ? item.message : typeof item.note === 'string' ? item.note : '',
    changeRows,
  };
};

export const productAuditSourceSxByLabel: Record<ProductAuditSourceLabel, { color: string; bg: string; border: string }> = {
  'Hệ thống': { color: '#364153', bg: '#F9FAFB', border: '#E5E7EB' },
  'Thủ công': { color: '#175CD3', bg: '#EFF8FF', border: '#B2DDFF' },
  Webhook: { color: '#027A48', bg: '#ECFDF3', border: '#ABEFC6' },
};
