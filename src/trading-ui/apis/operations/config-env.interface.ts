export type ConfigValueType = 'string' | 'number' | 'boolean' | 'json';

export interface ConfigVariable {
  id: string;
  varKey: string;
  valueType: ConfigValueType;
  value: unknown;
  versionStamp: number;
  description: string | null;
  redisKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariableDto {
  varKey: string;
  valueType: ConfigValueType;
  value: unknown;
  description?: string;
}

export interface UpdateVariableDto {
  valueType?: ConfigValueType;
  value?: unknown;
  description?: string;
}

export interface ListVariableQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  varKey?: string;
  valueType?: ConfigValueType;
}

export interface PaginatedConfigResponse<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}

export interface ResyncConfigResult {
  writtenCount: number;
  deletedCount: number;
  elapsedMs: number;
}

export interface ConfigAuditDiffItem {
  field: string;
  before?: unknown;
  after?: unknown;
}

export interface ConfigAuditLog {
  operationId: string;
  action: string;
  actor?: string;
  environment?: string;
  target: string;
  status: string;
  before?: unknown;
  after?: unknown;
  diff?: ConfigAuditDiffItem[];
  traceId?: string;
  createdAt: string;
}

export interface ListConfigAuditQuery {
  page?: number;
  pageSize?: number;
  action?: string;
  varKey?: string;
  from?: string;
  to?: string;
}
