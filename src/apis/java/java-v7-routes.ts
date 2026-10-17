interface JavaRoute { source: RegExp; target: string; methods: readonly string[] }
const JAVA_V7_ROUTES: readonly JavaRoute[] = [
  { source: /^cms\/admin\/navigations(?=\/|$)/, target: 'admin/cms/navigations', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
  { source: /^product\/admin\/search-pinned-products(?=\/|$)/, target: 'admin/catalog/search-pinned-products', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
  { source: /^promotion\/promotion-drafts(?=\/|$)/, target: 'admin/promotions/drafts', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
  { source: /^promotion\/promotions(?=\/|$)/, target: 'admin/promotions/published', methods: ['GET', 'POST'] },
  { source: /^promotion\/promotion-campaigns$/, target: 'admin/promotions/campaigns', methods: ['GET'] },
  { source: /^promotion\/internal\/promotion-runtime\/evaluate$/, target: 'admin/promotions/runtime/evaluate', methods: ['POST'] },
  { source: /^promotion\/promotion-vouchers\/(discover|validate-code)$/, target: 'admin/promotions/vouchers/$1', methods: ['POST'] },
  { source: /^promotion\/admin\/customer-audience\/by-phone$/, target: 'admin/promotions/customer-audience/by-phone', methods: ['GET'] },
  { source: /^order\/(?:admin\/promotion-vouchers|orders\/promotion-vouchers)\/(discover|validate-code)$/, target: 'admin/orders/promotion-vouchers/$1', methods: ['POST'] },
  { source: /^order\/(?:admin\/)?order-returns(?=\/|$)/, target: 'admin/order-returns', methods: ['GET', 'POST', 'PUT'] },
  { source: /^order\/orders\/audit-logs$/, target: 'admin/orders/audit-logs', methods: ['GET'] },
  { source: /^order\/orders\/pricing-context\/quote$/, target: 'admin/orders/pricing-context/quote', methods: ['POST'] },
  { source: /^order\/orders\/(\d+|DH[\w-]+)\/notes$/, target: 'admin/orders/$1/notes', methods: ['GET', 'POST'] },
];

export function resolveJavaV7Route(path: string, method: string): string | undefined {
  const [pathname, query] = path.split('?');
  const route = JAVA_V7_ROUTES.find(candidate => candidate.methods.includes(method) && candidate.source.test(pathname));
  if (!route) return undefined;
  return pathname.replace(route.source, route.target) + (query ? '?' + query : '');
}

export function javaV7Response(path: string, method: string, payload: unknown): unknown {
  const isReturn = /^order\/(?:admin\/)?order-returns(?:\/[^/]+(?:\/(approve|reject))?)?$/.test(path);
  if (isReturn && ['POST', 'PUT'].includes(method) && !/\/(quote|commit|list)$/.test(path))
    return { success: true, data: payload };
  return payload;
}

export function toJavaEntityIds(value: unknown, key = ''): unknown {
  if (typeof value === 'string' && (key === 'id' || key.endsWith('Id') || key.endsWith('Ids')) && /^[1-9]\d*$/.test(value)) {
    const numeric = Number(value);
    if (!Number.isSafeInteger(numeric)) throw new Error('ID vượt giới hạn số nguyên an toàn: ' + key);
    return numeric;
  }
  if (Array.isArray(value)) return value.map(entry => toJavaEntityIds(entry, key));
  if (!value || typeof value !== 'object' || value instanceof Date || value instanceof FormData) return value;
  return Object.fromEntries(Object.entries(value).map(([field, entry]) => [field, toJavaEntityIds(entry, field)]));
}

export function javaV7Body(path: string, body: unknown): unknown {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return toJavaEntityIds(body);
  const values: Record<string, unknown> = { ...body };
  if (path.startsWith('product/admin/search-pinned-products/')) {
    if ('endDate' in values && values.endDate === null) values.clearEndDate = true;
    if ('keywordPattern' in values && values.keywordPattern === null) values.clearKeywordPattern = true;
  }
  if (path.startsWith('cms/admin/navigations') && values.type) {
    if (values.type === 'NONE') Object.assign(values, { url: '', targetId: '', queryParams: {} });
    if (values.type === 'LINK') values.targetId = '';
  }
  return toJavaEntityIds(values);
}
