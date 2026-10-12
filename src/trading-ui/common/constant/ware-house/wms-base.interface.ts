// ─── Pagination ───────────────────────────────────────────────────────────────

export interface BaseFilterQuery {
  page: number;
  take: number;
  keyword?: string;
  sortBy?: WmsSortField<string>[];
  fromDate?: number;
  toDate?: number;
}

/** Array-based `sortBy` — used by endpoints that accept multiple sort fields. */
export interface WmsSortField<TField extends string = string> {
  field: TField;
  isDescending: boolean;
}

export interface WmsBaseResponse {
  id: string;
  createdBy?: string;
  createdByName?: string;
  createdOn?: number;
  modifiedBy?: string;
  modifiedByName?: string;
  modifiedOn?: number;
  deletedBy?: string;
  deletedOn?: number;
  isDeleted?: boolean;
  concurrencyStamp?: string;
}
