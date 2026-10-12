import type { PermissionAction, PermissionBrand, PermissionMenu, PermissionTab, RoleSet } from '../../pages/permission/permission.types';
import { normalizePermissionBranchCode } from '../../permissions/permission-branch.utils';
import type { BranchListItemDto, MenuListItemDto, RoleListItemDto, TabActionItemDto, TabListItemDto } from './permission.interface';

const flattenTabDtoList = (items: TabListItemDto[]): TabListItemDto[] => {
  const results: TabListItemDto[] = [];
  for (const item of items) {
    const { children, ...rest } = item;
    results.push(rest);
    if (children?.length) results.push(...flattenTabDtoList(children));
  }
  return results;
};

export const normalizeTabListResponse = (raw: TabListItemDto[]): TabListItemDto[] => flattenTabDtoList(raw);

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object';

const firstMessageFromErrorsField = (errors: unknown): string => {
  if (!errors || typeof errors !== 'object') return '';
  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      const message = String(item ?? '').trim();
      if (message) return message;
    }
  }
  return '';
};

/** Axios interceptor thường reject `response.data` — không phải instance Error. */
export const getPermissionApiErrorMessage = (error: unknown, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.'): string => {
  if (isRecord(error)) {
    const fromErrors = firstMessageFromErrorsField(error.errors ?? error.Errors);
    if (fromErrors) return fromErrors;
    const message = error.message ?? error.Message;
    if (Array.isArray(message)) {
      const lines = message.map((item) => String(item ?? '').trim()).filter(Boolean);
      if (lines.length === 0) return fallback;
      if (lines.length <= 3) return lines.join('\n');
      return `${lines.slice(0, 3).join('\n')}\n(+${lines.length - 3} lỗi khác)`;
    }
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return fallback;
};

/** BE có thể trả HTTP 200 + `{ succeeded: false }`. Giữ nguyên payload (vd. `linkedJobTitles`) khi throw. */
export const assertPermissionApiSuccess = (payload: unknown, fallback = 'Yêu cầu không thành công.'): void => {
  if (!isRecord(payload)) return;
  const succeeded = payload.succeeded ?? payload.Succeeded;
  if (succeeded !== false) return;
  const message = getPermissionApiErrorMessage(payload, fallback);
  throw { ...payload, message };
};

export const unwrapPermissionEntity = <T>(payload: unknown): T => {
  if (!isRecord(payload)) return payload as T;
  const nested = payload.data ?? payload.item ?? payload.result;
  if (nested && typeof nested === 'object') return nested as T;
  return payload as T;
};

/** BE có thể trả mảng trực tiếp hoặc bọc list/data/items. */
export const normalizeListResponse = <T>(raw: unknown): T[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const list = record.list ?? record.data ?? record.items ?? record.branches ?? record.endpoints;
    if (Array.isArray(list)) return list as T[];
  }
  return [];
};

export const mapRoleDto = (dto: RoleListItemDto): RoleSet => {
  const brandCountRaw = dto.branchCount ?? dto.branch_count ?? 0;
  const brandCount = Number.isFinite(Number(brandCountRaw)) ? Number(brandCountRaw) : 0;

  const statusRaw = dto.status;
  const status = statusRaw === 'Inactive' || statusRaw === 'Deleted' ? statusRaw : 'Active';

  const jobTitleRow = dto.jobTitle;
  const jobTitleId = String(dto.jobTitleId ?? jobTitleRow?.id ?? '').trim() || undefined;
  const jobTitle = jobTitleId
    ? {
        id: jobTitleId,
        code: String(jobTitleRow?.code ?? '').trim(),
        name: String(jobTitleRow?.name ?? '').trim(),
      }
    : undefined;
  const departmentRow = dto.department;
  const department = departmentRow?.id
    ? {
        id: String(departmentRow.id).trim(),
        code: String(departmentRow.code ?? '').trim() || undefined,
        name: String(departmentRow.name ?? '').trim() || undefined,
      }
    : undefined;
  const departmentName = String(departmentRow?.name ?? '').trim() || undefined;

  return {
    id: dto.id,
    code: dto.code,
    label: dto.name,
    mode: dto.mode === 'system' ? 'system' : 'custom',
    permissions: [],
    description: String(dto.description ?? '').trim(),
    version: String(dto.version ?? '').trim(),
    brandCount,
    status,
    jobTitleId,
    jobTitle,
    department,
    departmentName,
  };
};

export const mapBrandDto = (dto: BranchListItemDto): PermissionBrand => {
  const tenantCode = String(dto.tenantCode ?? dto.tenantcode ?? dto.tenant_code ?? '').trim();
  const code = normalizePermissionBranchCode({
    code: dto.code,
    tenantCode,
    name: dto.name,
  });

  return {
    id: dto.id,
    code,
    name: dto.name,
    tenantCode: tenantCode || undefined,
    menus: [],
  };
};

export const mapMenuDto = (dto: MenuListItemDto): PermissionMenu => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  tabs: [],
});

export const mapTabDto = (dto: TabListItemDto): PermissionTab => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  sortOrder: dto.sortOrder ?? 0,
  actions: [],
});

export const mapActionDto = (dto: TabActionItemDto): PermissionAction => ({
  id: dto.id,
  code: dto.action,
  name: dto.actionName,
  sensitive: dto.sensitive,
  apiCodes: [],
  displayCode: dto.displayCode,
  granted: dto.granted,
  endpointCount: dto.endpointCount,
});
