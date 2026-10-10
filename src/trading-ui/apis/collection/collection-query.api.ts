import { backendRequest } from '@/apis/backend-request';
import { mapCollection, type WireCollection } from './collection-backend.mapper';
import type { QueryCollectionDto } from './collection.interface';
const COLLECTION_QUERY_POLICY = { firstPage: 1, defaultTake: 20, maximumTake: 100 } as const;
interface CollectionPage {
  list: WireCollection[]; total: number;
  pagination: { page: number; take: number; itemCount: number; pageCount: number; hasNextPage: boolean; hasPreviousPage: boolean };
}
async function collectionPage(query: Partial<QueryCollectionDto>, page: number): Promise<CollectionPage> {
  const take = query.isPagination === false ? COLLECTION_QUERY_POLICY.maximumTake :
    Math.min(Math.max(query.take ?? COLLECTION_QUERY_POLICY.defaultTake, 1), COLLECTION_QUERY_POLICY.maximumTake);
  const params = new URLSearchParams({ page: String(page), take: String(take) });
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.status) params.set('status', query.status);
  return backendRequest<CollectionPage>('admin/catalog/collections?' + params);
}
export async function readCollectionList(query: Partial<QueryCollectionDto>) {
  const page = query.isPagination === false ? COLLECTION_QUERY_POLICY.firstPage : Math.max(query.page ?? 1, 1);
  const result = await collectionPage(query, page);
  if (query.isPagination === false) {
    while (result.pagination.hasNextPage) {
      const next = await collectionPage(query, result.pagination.page + 1);
      result.list.push(...next.list); result.pagination = next.pagination;
    }
  }
  return { ...result, list: result.list.map(mapCollection) };
}
