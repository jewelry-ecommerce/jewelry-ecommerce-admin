export type JsonObject = Record<string, unknown>;

export type OperationStatus = 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN' | string;

export interface ProviderSummary {
  id: string;
  type?: string;
  health?: string | { status?: string; detail?: string; checkedAt?: string };
  description?: string;
  targetCount?: number;
}

export interface ToolSummary {
  id: string;
  toolId?: string;
  name?: string;
  description?: string;
  sideEffect?: 'READ_ONLY' | 'SIDE_EFFECT';
  inputSchema?: JsonObject;
  outputSchema?: JsonObject;
}

export interface OperationRecord {
  id: string;
  status: OperationStatus;
  provider?: string;
  tool?: string;
  target?: string;
  actor?: string;
  environment?: string;
  traceId?: string;
  startedAt?: string;
  completedAt?: string;
  input?: unknown;
  result?: unknown;
  error?: { code?: string; message?: string; stage?: string };
  payload?: {
    input?: JsonObject;
    before?: JsonObject;
    after?: JsonObject;
    diff?: Array<{ field: string; before?: unknown; after?: unknown }>;
    reason?: string;
    result?: JsonObject;
  };
}

export interface ResourceDescription {
  targets?: Array<{ id: string; environment?: string; type?: string }>;
  schemas?: string[];
  tables?: string[];
  columns?: Array<{
    column_name: string;
    data_type?: string;
    is_nullable?: 'YES' | 'NO' | string;
    ordinal_position?: number;
    is_primary_key?: boolean;
    editable?: boolean;
  }>;
  fields?: Array<{ name: string; type?: string; writable?: boolean }>;
  primaryKey?: string | string[];
}

export interface ResourceQueryResult {
  rows: JsonObject[];
  total?: number;
  page?: number;
  pageSize?: number;
  traceId?: string;
  hasMore?: boolean;
}

export interface CacheTarget {
  id: string;
  environment: string;
  database: number;
  type: 'redis';
}

export interface CachePreviewResult {
  target: string;
  mode: 'exact' | 'prefix' | 'all';
  keys: string[];
  missingKeys: string[];
  requestedCount: number;
  affectedCount: number;
  truncated: boolean;
  traceId?: string;
}

export interface UpdatePreviewResult {
  previewToken: string;
  operationId: string;
  before: JsonObject;
  after: JsonObject;
  diff: Array<{ field: string; before?: unknown; after?: unknown }>;
  expiresAt?: string;
  traceId?: string;
}

export type SqlExecutionClassification = 'READ_ONLY' | 'SIDE_EFFECT';

export interface SqlResultSet {
  command: string;
  rowCount: number;
  rows: JsonObject[];
  truncated: boolean;
}

export interface SqlExecutionResult {
  operationId?: string;
  classification: SqlExecutionClassification;
  auditStatus?: 'SUCCEEDED' | 'UNKNOWN';
  auditWarning?: {
    code: string;
    message: string;
  };
  statementCount: number;
  dangerousStatements: string[];
  confirmationRequired: boolean;
  resultSets?: SqlResultSet[];
  rowCount?: number;
  durationMs?: number;
  resultSetsTruncated?: boolean;
  error?: {
    code: string;
    message: string;
    technical?: JsonObject;
  };
}
