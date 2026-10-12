import type { EndpointItemDto } from './permission.interface';

/** BE catalog endpoint dùng `key` hoặc `code` tuỳ phiên bản API. */
export const resolveEndpointCode = (item: Pick<EndpointItemDto, 'key'> & { code?: string }): string => String(item.key ?? item.code ?? '').trim();

export const matchesEndpointCode = (item: Pick<EndpointItemDto, 'key'> & { code?: string }, apiCode: string): boolean => resolveEndpointCode(item) === apiCode.trim();

export const normalizeEndpointMethod = (method: string): string => method.trim().toUpperCase();

export const normalizeEndpointPath = (path: string): string => path.trim().replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();

export const buildEndpointRouteKey = (method: string, path: string): string => {
  const normalizedMethod = normalizeEndpointMethod(method);
  const normalizedPath = normalizeEndpointPath(path);
  if (!normalizedMethod || !normalizedPath) return '';
  return `${normalizedMethod}:${normalizedPath}`;
};

export const matchesEndpointRoute = (item: Pick<EndpointItemDto, 'method' | 'path'>, method: string, path: string): boolean =>
  buildEndpointRouteKey(item.method, item.path) === buildEndpointRouteKey(method, path);

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object';

/** BE trả 409 khi trùng (method, path) — axios reject `response.data`. */
export const isEndpointConflictError = (error: unknown): boolean => {
  if (!isRecord(error)) return false;
  if (error.statusCode === 409) return true;
  if (
    String(error.error ?? '')
      .trim()
      .toLowerCase() === 'conflict'
  )
    return true;
  return String(error.message ?? '')
    .trim()
    .toLowerCase()
    .includes('endpoint already exists');
};

/** Parse `Endpoint already exists: PUT /orders/:id` từ payload lỗi 409. */
export const parseEndpointConflictRoute = (error: unknown): { method: string; path: string } | null => {
  if (!isRecord(error)) return null;
  const message = String(error.message ?? '').trim();
  // Avoid matching "Endpoint code already exists: api_..." (no HTTP method + path).
  if (/endpoint code already exists/i.test(message)) return null;
  const match = message.match(/endpoint already exists:\s*([A-Z]+)\s+(.+)$/i);
  if (!match?.[1] || !match[2]) return null;
  return {
    method: match[1].trim().toUpperCase(),
    path: normalizeEndpointPath(match[2]),
  };
};

/** Parse `Endpoint code already exists: api_warehouse_purchase_order_create` từ payload lỗi 409. */
export const parseEndpointConflictCode = (error: unknown): string | null => {
  if (!isRecord(error)) return null;
  const message = String(error.message ?? '').trim();
  const match = message.match(/endpoint code already exists:\s*([^\s,}]+)/i);
  const code = match?.[1]?.trim();
  return code || null;
};
