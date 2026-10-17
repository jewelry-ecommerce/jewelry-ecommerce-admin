import { backendRequest, BackendHttpError, toUiEntityIds } from '@/apis/backend-request';
import type { HeaderAdmin, HeaderUpsertResponse, HeaderScheduleConflictItem, LogoAdmin, FooterSetting } from '@/trading-ui/apis/cms/cms-header-footer.interface';

type LayoutQuery = { page?: number; take?: number; search?: string; status?: string; type?: string; isPagination?: boolean; orderBy?: string; orderType?: string };
type WireHeader = Omit<HeaderAdmin, 'id' | 'tenantCode'> & { id: number };
type WireLogo = Omit<LogoAdmin, 'id' | 'tenantCode'> & { id: number };
type WireFooter = Omit<FooterSetting, 'id' | 'tenantCode'> & { id: number | null };
const PATH = 'admin/cms/';
const headerView = (row: WireHeader): HeaderAdmin => ({ ...row, id: String(row.id) });
const logoView = (row: WireLogo): LogoAdmin => ({ ...row, id: String(row.id) });
const footerView = (row: WireFooter): FooterSetting => ({ ...row, id: row.id == null ? '' : String(row.id) });
function listQuery(query: LayoutQuery): URLSearchParams {
  const params = new URLSearchParams({ page: String(query.page ?? 1), take: String(query.isPagination === false ? 100 : query.take ?? 20) });
  for (const key of ['search', 'status', 'type', 'orderBy', 'orderType'] as const) if (query[key]) params.set(key, query[key]);
  return params;
}
async function readAll<T>(kind: 'headers' | 'logos', query: LayoutQuery): Promise<{ list: T[]; total: number }> {
  const params = listQuery(query);
  const result = await backendRequest<{ list: T[]; total: number; pagination: { currentPage: number; hasNextPage: boolean } }>(PATH + kind + '?' + params);
  while (query.isPagination === false && result.pagination.hasNextPage) {
    params.set('page', String(result.pagination.currentPage + 1));
    const next = await backendRequest<typeof result>(PATH + kind + '?' + params);
    result.list.push(...next.list); result.pagination = next.pagination;
  }
  return result;
}
export async function javaHeaders(query: LayoutQuery = {}) {
  const result = await readAll<WireHeader>('headers', query);
  return { ...result, list: result.list.map(headerView) };
}
export async function javaLogos(query: LayoutQuery = {}) {
  const result = await readAll<WireLogo>('logos', query);
  return { ...result, list: result.list.map(logoView) };
}
export async function javaHeader(id: string) { return headerView(await backendRequest<WireHeader>(PATH + 'headers/' + id)); }
export async function javaLogo(id: string) { return logoView(await backendRequest<WireLogo>(PATH + 'logos/' + id)); }
export async function javaMutateHeader(suffix: string, method: string, body: unknown): Promise<HeaderUpsertResponse> {
  try {
    const data = headerView(await backendRequest<WireHeader>(PATH + 'headers' + suffix, method, body));
    return { success: true, id: data.id, data };
  } catch (error) {
    if (error instanceof BackendHttpError && error.status === 409 && error.code === 'HEADER_SCHEDULE_CONFLICT')
      return { success: false, flow: 'header_schedule_conflict', message: error.message, conflictingHeaders: toUiEntityIds(error.dependencies ?? []) as HeaderScheduleConflictItem[] };
    throw error;
  }
}
export async function javaMutateLogo(suffix: string, method: string, body?: unknown) {
  const data = logoView(await backendRequest<WireLogo>(PATH + 'logos' + suffix, method, body));
  return { success: true, id: data.id, data };
}
export async function javaDeleteHeader(id: string) {
  await backendRequest(PATH + 'headers/' + id, 'DELETE'); return { success: true, id };
}
export async function javaFooter() { return footerView(await backendRequest<WireFooter>(PATH + 'footer')); }
export async function javaSaveFooter(body: unknown) {
  const data = footerView(await backendRequest<WireFooter>(PATH + 'footer', 'PUT', body));
  return { success: true, data: toUiEntityIds(data) as FooterSetting };
}
