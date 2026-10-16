import { backendRequest } from '@/apis/backend-request';
import type { Brand } from '@/trading-ui/apis/brand/brand.entities';
import type { Season } from '@/trading-ui/apis/season/season.entities';
import type { CreateBrandDto, QueryBrandDto, UpdateBrandDto } from '@/trading-ui/apis/brand/brand.interface';
import type { QueryAdminSeasonDto } from '@/trading-ui/apis/season/season.interface';
import { BrandStatus } from '@/trading-ui/apis/brand/brand.enum';
import type { Pagination } from '@/trading-ui/common/constant/api.interface';

type WireBrand = Omit<Brand, 'id' | 'createdAt' | 'updatedAt'> & { id: number; createdAt?: string; updatedAt?: string };
type WireSeason = Omit<Season, 'id' | 'createdAt' | 'updatedAt'> & { id: number; createdAt?: string; updatedAt?: string };
type Page<T> = { list: T[]; total: number; pagination: Pagination };
type ListQuery = { page?: number; take?: number; search?: string; status?: string; isActive?: boolean; isPagination?: boolean };
const BASE = 'admin/catalog/';
function brandView(row: WireBrand): Brand {
  return { ...row, id: String(row.id), status: row.status.toUpperCase() === 'ACTIVE' ? BrandStatus.ACTIVE : BrandStatus.INACTIVE,
    createdAt: new Date(row.createdAt ?? 0), updatedAt: new Date(row.updatedAt ?? 0) };
}
function seasonView(row: WireSeason): Season {
  return { ...row, id: String(row.id), createdAt: new Date(row.createdAt ?? 0), updatedAt: new Date(row.updatedAt ?? 0) };
}
async function list<T>(kind: 'brands' | 'seasons', query: ListQuery): Promise<Page<T>> {
  const params = new URLSearchParams({ page: String(query.page ?? 1), take: String(query.isPagination === false ? 100 : query.take ?? 20) });
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status.toUpperCase());
  if (query.isActive !== undefined) params.set('isActive', String(query.isActive));
  const page = await backendRequest<Page<T>>(BASE + kind + '?' + params);
  while (query.isPagination === false && page.pagination.hasNextPage) {
    params.set('page', String(page.pagination.currentPage + 1));
    const next = await backendRequest<Page<T>>(BASE + kind + '?' + params);
    page.list.push(...next.list); page.pagination = next.pagination;
  }
  return page;
}
export async function javaBrands(query: Partial<QueryBrandDto>) {
  const page = await list<WireBrand>('brands', query); return { ...page, list: page.list.map(brandView) };
}
export async function javaSeasons(query: Partial<QueryAdminSeasonDto>) {
  const page = await list<WireSeason>('seasons', query); return { ...page, list: page.list.map(seasonView) };
}
export async function javaBrand(id: string) { return brandView(await backendRequest<WireBrand>(BASE + 'brands/' + id)); }
export async function javaSaveBrand(body: CreateBrandDto | UpdateBrandDto, id?: string) {
  const { tenantCode: _tenantCode, ...fields } = body;
  const row = await backendRequest<WireBrand>(BASE + 'brands' + (id ? '/' + id : ''), id ? 'PATCH' : 'POST',
    { ...fields, ...(fields.status ? { status: fields.status.toUpperCase() } : {}) });
  return brandView(row);
}
export async function javaDeleteBrand(id: string): Promise<void> { await backendRequest(BASE + 'brands/' + id, 'DELETE'); }
