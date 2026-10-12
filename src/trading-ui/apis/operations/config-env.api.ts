import { type AxiosError } from 'axios';
import { axiosRequest } from '../../common/config/axios.config';
import type {
  ConfigAuditLog,
  ConfigVariable,
  CreateVariableDto,
  ListConfigAuditQuery,
  ListVariableQuery,
  PaginatedConfigResponse,
  ResyncConfigResult,
  UpdateVariableDto,
} from './config-env.interface';

export class ConfigEnvApiError extends Error {
  readonly code: string;
  readonly traceId?: string;

  constructor(message: string, code = 'CONFIG_REQUEST_FAILED', traceId?: string) {
    super(message);
    this.name = 'ConfigEnvApiError';
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
  throw new ConfigEnvApiError(response?.message || 'Không thể hoàn thành yêu cầu cấu hình môi trường', response?.code, response?.traceId);
};

const request = async <T>(promise: Promise<unknown>): Promise<T> => {
  try {
    return unwrap<T>(await promise);
  } catch (error) {
    return mapError(error);
  }
};

export const configEnvApi = {
  listVariables: async (query?: ListVariableQuery): Promise<PaginatedConfigResponse<ConfigVariable>> => {
    const keyword = (query?.keyword ?? query?.varKey)?.trim();
    const params = Object.fromEntries(
      Object.entries({
        page: query?.page,
        pageSize: query?.pageSize,
        keyword: keyword || undefined,
        valueType: query?.valueType,
      }).filter(([, val]) => val !== undefined && val !== ''),
    );
    return request<PaginatedConfigResponse<ConfigVariable>>(axiosRequest.get('operations/admin/config/variables', { params }));
  },

  getVariableById: (variableId: string): Promise<ConfigVariable> => request<ConfigVariable>(axiosRequest.get(`operations/admin/config/variables/${encodeURIComponent(variableId)}`)),

  getVariableByKey: (varKey: string): Promise<ConfigVariable> => request<ConfigVariable>(axiosRequest.get(`operations/admin/config/variables/by-key/${encodeURIComponent(varKey)}`)),

  createVariable: (dto: CreateVariableDto): Promise<ConfigVariable> => request<ConfigVariable>(axiosRequest.post('operations/admin/config/variables', dto)),

  updateVariable: (variableId: string, dto: UpdateVariableDto): Promise<ConfigVariable> =>
    request<ConfigVariable>(axiosRequest.patch(`operations/admin/config/variables/${encodeURIComponent(variableId)}`, dto)),

  deleteVariable: (variableId: string): Promise<ConfigVariable> => request<ConfigVariable>(axiosRequest.delete(`operations/admin/config/variables/${encodeURIComponent(variableId)}`)),

  resyncCache: (): Promise<ResyncConfigResult> => request<ResyncConfigResult>(axiosRequest.post('operations/admin/config/resync')),

  listAuditLogs: async (query?: ListConfigAuditQuery): Promise<PaginatedConfigResponse<ConfigAuditLog>> => {
    const params = Object.fromEntries(Object.entries(query ?? {}).filter(([, val]) => val !== undefined && val !== ''));
    return request<PaginatedConfigResponse<ConfigAuditLog>>(axiosRequest.get('operations/admin/config/audit-logs', { params }));
  },
};
