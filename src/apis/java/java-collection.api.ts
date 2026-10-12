
import { backendRequest } from '../backend-request';
import type { Collection } from '@/trading-ui/apis/collection/collection.entities';
import type { CreateCollectionDto, UpdateCollectionDto, QueryCollectionDto, UpdateCollectionByProductIdDto } from '@/trading-ui/apis/collection/collection.interface';
import { CollectionStatus, UpdateCollectionAction } from '@/trading-ui/apis/collection/collection.enum';
import { javaProductView } from './java-product.mapper';
import { JAVA_CATALOG_PATH, JAVA_PAGE_POLICY, type JavaCollection, type JavaPage, type JavaProduct } from './java-catalog.types';
const path = JAVA_CATALOG_PATH + '/collections';
export function javaCollectionView(collection: JavaCollection): Collection {
  return { id: String(collection.id), name: collection.name, slug: collection.slug,
    description: collection.description, image: collection.heroImageUrl, status: collection.status === 'PUBLISHED' ? CollectionStatus.ACTIVE : CollectionStatus.INACTIVE,
    createdAt: new Date(collection.createdDate ?? 0), updatedAt: new Date(collection.updatedDate ?? 0) };
}
async function rawCollection(id: string): Promise<JavaCollection> {
  const collections = await backendRequest<JavaCollection[]>(path);
  const selected = collections.find(collection => String(collection.id) === id);
  if (!selected) throw new Error('Không tìm thấy bộ sưu tập.');
  return selected;
}
export async function javaCollectionMembers(collection: JavaCollection): Promise<JavaProduct[]> {
  const list: JavaProduct[] = [];
  for (let page = JAVA_PAGE_POLICY.firstPage; ; page++) {
    const response = await backendRequest<JavaPage<JavaProduct>>(JAVA_CATALOG_PATH + '/products?' +
      new URLSearchParams({ collectionSlug: collection.slug, page: String(page), take: String(JAVA_PAGE_POLICY.take) }));
    list.push(...response.list);
    if (!response.pagination.hasNextPage) break;
  }
  return list;
}
export async function javaCollectionDetail(id: string): Promise<Collection> {
  const collection = await rawCollection(id), members = await javaCollectionMembers(collection);
  return { ...javaCollectionView(collection), productCollections: members.map((product, order) => ({
    id: id + ':' + product.id, collectionId: id, productId: String(product.id), order,
    createdAt: new Date(collection.createdDate ?? 0), updatedAt: new Date(collection.updatedDate ?? 0), product: javaProductView(product) })) };
}
export async function javaCollectionList(query: Partial<QueryCollectionDto> = {}) {
  const collections = await backendRequest<JavaCollection[]>(path), search = query.search?.trim().toLowerCase();
  const filtered = collections.filter(collection => (!query.status || javaCollectionView(collection).status === query.status)
    && (!search || collection.name.toLowerCase().includes(search)));
  const start = ((query.page ?? 1) - 1) * (query.take ?? 20);
  return { total: filtered.length, pagination: {total:filtered.length,page:query.page ?? 1, take:query.take ?? 20, itemCount:filtered.length, pageCount:Math.ceil(filtered.length/(query.take??20)), hasNextPage:(query.page??1)*(query.take??20)<filtered.length, hasPreviousPage:(query.page??1)>1}, list: (query.isPagination === false ? filtered : filtered.slice(start, start + (query.take ?? 20))).map(javaCollectionView) };
}
async function syncMembership(collection: JavaCollection, selected: string[]): Promise<void> {
  const current = await javaCollectionMembers(collection), selectedIds = new Set(selected);
  for (const product of current.filter(product => !selectedIds.has(String(product.id))))
    await backendRequest<void>(path + '/' + collection.id + '/products/' + product.id, 'DELETE');
  const added = selected.filter(id => !current.some(product => String(product.id) === id));
  if (added.length) await backendRequest(path + '/' + collection.id + '/products', 'POST', { productIds: added.map(Number) });
}
export async function javaSaveCollection(input: CreateCollectionDto | UpdateCollectionDto, id?: string): Promise<Collection> {
  const current = id ? await rawCollection(id) : undefined;
  const collection = await backendRequest<JavaCollection>(path + (id ? '/' + id : ''), id ? 'PUT' : 'POST',
    { name: input.name ?? current?.name, slug: input.slug ?? current?.slug, description: input.description ?? current?.description,
      heroImageUrl: input.image ?? current?.heroImageUrl, status: input.status === CollectionStatus.ACTIVE ? 'PUBLISHED'
      : input.status === CollectionStatus.INACTIVE ? 'DRAFT' : current?.status });
  if (input.productIds) await syncMembership(collection, input.productIds);
  return javaCollectionDetail(String(collection.id));
}
export async function javaUpdateMembership(id: string, input: UpdateCollectionByProductIdDto): Promise<Collection> {
  const collection = await rawCollection(id), current = (await javaCollectionMembers(collection)).map(product => String(product.id));
  const selected = input.productIds ?? [];
  const ids = input.action === UpdateCollectionAction.ADD ? [...new Set([...current, ...selected])]
    : input.action === UpdateCollectionAction.REMOVE ? current.filter(id => !selected.includes(id))
    : current.map(id => id === selected[0] ? (selected[1] ?? id) : id);
  await syncMembership(collection, ids);
  return javaCollectionDetail(id);
}
