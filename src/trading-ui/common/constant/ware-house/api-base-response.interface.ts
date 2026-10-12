export const WMS_API_BASE = '/wms-outbound/api/v1/';

export interface BaseResponseWithData<T> {
  data: T;
  succeeded?: boolean;
  message?: string;
  statusCode?: number;
  errors?: unknown;
}

export interface PaginatedResultResponse<T, TMeta = unknown> {
  list: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  message?: string;
  succeeded?: boolean;
  statusCode?: number;
  meta?: TMeta;
}
