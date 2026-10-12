import { type AxiosError } from 'axios';
import { axiosRequest } from '../../common/config/axios.config';
import type {
  CachePreviewResult,
  CacheTarget,
  JsonObject,
  OperationRecord,
  ProviderSummary,
  ResourceDescription,
  ResourceQueryResult,
  SqlExecutionResult,
  ToolSummary,
  UpdatePreviewResult,
} from './operations.interface';

export class OperationsApiError extends Error {
  readonly code: string;
  readonly traceId?: string;

  constructor(message: string, code = 'OPS_REQUEST_FAILED', traceId?: string) {
    super(message);
    this.name = 'OperationsApiError';
    this.code = code;
    this.traceId = traceId;
  }
}

const unwrap = <T>(value: unknown): T => {
  if (value && typeof value === 'object' && 'data' in value) return (value as { data: T }).data;
  return value as T;
};

const mapError = (error: unknown): never => {
  const response = (error as AxiosError<{ code?: string; message?: string; traceId?: string }>).response?.data;
  throw new OperationsApiError(response?.message || 'Operations service could not complete the request', response?.code, response?.traceId);
};

const request = async <T>(promise: Promise<unknown>): Promise<T> => {
  try {
    return unwrap<T>(await promise);
  } catch (error) {
    return mapError(error);
  }
};

const collection = <T>(value: unknown, keys: readonly string[] = []): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    for (const key of keys) {
      const candidate = (value as Record<string, unknown>)[key];
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [];
};

const providerSummary = (value: unknown): ProviderSummary | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const item = value as Record<string, unknown>;
  const id = item.id ?? item.providerId ?? item.provider;
  return typeof id === 'string' && id.trim() ? ({ ...item, id } as ProviderSummary) : undefined;
};

const toolSummary = (value: unknown): ToolSummary | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const item = value as Record<string, unknown>;
  const id = item.id ?? item.toolId ?? item.tool;
  return typeof id === 'string' && id.trim() ? ({ ...item, id } as ToolSummary) : undefined;
};

const operationRecord = (value: unknown): OperationRecord => {
  const item = value as Record<string, unknown>;
  const payload = item.payload as Record<string, unknown> | undefined;
  return {
    ...(item as unknown as OperationRecord),
    id: String(item.id ?? item.operationId ?? ''),
    startedAt: typeof item.startedAt === 'string' ? item.startedAt : typeof item.createdAt === 'string' ? item.createdAt : undefined,
    completedAt: typeof item.completedAt === 'string' ? item.completedAt : undefined,
    input: item.input ?? payload?.input,
    result: item.result ?? payload?.result ?? payload?.after,
    error: item.error ?? (item.safeError as OperationRecord['error']),
  };
};

export const operationsApi = {
  getProviders: async () =>
    collection<unknown>(await request<unknown>(axiosRequest.get('operations/admin/providers')), ['providers', 'items'])
      .map(providerSummary)
      .filter((item): item is ProviderSummary => Boolean(item)),
  getTools: async (provider: string) =>
    collection<unknown>(await request<unknown>(axiosRequest.get(`operations/admin/providers/${encodeURIComponent(provider)}/tools`)), ['tools', 'items'])
      .map(toolSummary)
      .filter((item): item is ToolSummary => Boolean(item)),
  executeTool: (provider: string, tool: string, input: JsonObject) =>
    request<unknown>(axiosRequest.post(`operations/admin/providers/${encodeURIComponent(provider)}/tools/${encodeURIComponent(tool)}/execute`, input)),
  describeResource: (input: JsonObject) => request<ResourceDescription>(axiosRequest.post('operations/admin/resources/describe', input)),
  queryResource: async (input: JsonObject) => {
    const result = await request<{ records?: JsonObject[]; rows?: JsonObject[]; page?: number; pageSize?: number; total?: number; hasMore?: boolean }>(
      axiosRequest.post('operations/admin/resources/query', input),
    );
    return { rows: result.rows ?? result.records ?? [], page: result.page, pageSize: result.pageSize, total: result.total, hasMore: result.hasMore } satisfies ResourceQueryResult;
  },
  getResourceDetail: (input: JsonObject) => request<JsonObject>(axiosRequest.post('operations/admin/resources/detail', input)),
  loadRecordForUpdate: (input: JsonObject) => request<{ record: JsonObject; recordHash?: string }>(axiosRequest.post('operations/admin/updates/record', input)),
  previewUpdate: (input: JsonObject) => request<UpdatePreviewResult>(axiosRequest.post('operations/admin/updates/preview', input)),
  confirmUpdate: async (input: JsonObject) => operationRecord(await request<unknown>(axiosRequest.post('operations/admin/updates/confirm', input))),
  clearCache: async (input: JsonObject) => operationRecord(await request<unknown>(axiosRequest.post('operations/admin/cache/clear', input))),
  previewCache: (input: JsonObject) => request<CachePreviewResult>(axiosRequest.post('operations/admin/cache/preview', input)),
  getCacheTargets: async () => {
    const result = await request<unknown>(axiosRequest.get('operations/admin/cache/targets'));
    return collection<CacheTarget>(result, ['targets', 'items']);
  },
  getOperations: async (params?: Record<string, string>) => {
    const result = await request<{ items?: OperationRecord[] } | OperationRecord[]>(axiosRequest.get('operations/admin/operations', { params }));
    return collection<OperationRecord>(result, ['items', 'operations']).map(operationRecord);
  },
  getOperation: async (id: string) => operationRecord(await request<unknown>(axiosRequest.get(`operations/admin/operations/${encodeURIComponent(id)}`))),
  executeSql: (input: { target: string; sql: string; confirmed?: boolean; operationId?: string }, signal?: AbortSignal) =>
    request<SqlExecutionResult>(axiosRequest.post('operations/admin/postgresql/sql/execute', input, { signal })),
  cancelSql: (operationId: string) => request<{ cancelled: boolean }>(axiosRequest.post(`operations/admin/postgresql/sql/operations/${encodeURIComponent(operationId)}/cancel`)),
};
