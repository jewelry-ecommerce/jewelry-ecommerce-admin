import { collectionApi } from '../../../../../apis';
import { OrderType } from '../../../../../apis/order';
import type { Collection } from '../../../../../apis/collection/collection.entities';
import type { QueryCollectionDto } from '../../../../../apis/collection/collection.interface';
import type { AnhTraiSayHiCollectionSeed } from './anh-trai-say-hi-collection.seed';
import { normalizeCatalogSlug } from './anh-trai-say-hi-product-resolver.util';

const upsertCollection = (map: Map<string, Collection>, item: Collection): void => {
  const slugKey = normalizeCatalogSlug(item.slug ?? '');
  if (slugKey) map.set(`slug:${slugKey}`, item);

  const nameKey = normalizeCatalogSlug(item.name ?? '');
  if (nameKey) map.set(`name:${nameKey}`, item);

  if (item.id) map.set(`id:${item.id}`, item);
};

const fetchAllCollectionPages = async (params: Partial<QueryCollectionDto>): Promise<Collection[]> => {
  const results: Collection[] = [];
  let page = 1;

  while (page <= 50) {
    const response = await collectionApi.getCollectionList({
      page,
      take: 100,
      isPagination: true,
      orderType: OrderType.ASC,
      orderBy: 'name',
      ...params,
    });

    const list = response.list ?? [];
    results.push(...list);

    const total = response.pagination?.total ?? response.total ?? results.length;
    if (list.length === 0 || results.length >= total) break;
    page += 1;
  }

  return results;
};

/** Gộp collection từ nhiều query — list API có thể lọc theo brand/status khác nhau. */
export const loadExistingCollectionsIndex = async (brandId?: string): Promise<Map<string, Collection>> => {
  const map = new Map<string, Collection>();
  const queryVariants: Partial<QueryCollectionDto>[] = [{ brandId }, { brandId, status: undefined }, {}, { isDeleted: true }];

  const seenIds = new Set<string>();

  for (const params of queryVariants) {
    const list = await fetchAllCollectionPages(params);
    for (const item of list) {
      if (!item.id || seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      upsertCollection(map, item);
    }
  }

  return map;
};

export const findExistingCollection = (seed: AnhTraiSayHiCollectionSeed, index: Map<string, Collection>): Collection | undefined =>
  index.get(`slug:${normalizeCatalogSlug(seed.slug)}`) ?? index.get(`name:${normalizeCatalogSlug(seed.name)}`);

const findInListBySlug = (list: Collection[], slug: string): Collection | undefined => {
  const normalized = normalizeCatalogSlug(slug);
  return list.find((item) => {
    const itemSlug = normalizeCatalogSlug(item.slug ?? '');
    return itemSlug === normalized || itemSlug.includes(normalized) || normalized.includes(itemSlug);
  });
};

const findInListByName = (list: Collection[], name: string): Collection | undefined => {
  const normalized = normalizeCatalogSlug(name);
  return list.find((item) => normalizeCatalogSlug(item.name ?? '') === normalized);
};

export const findExistingCollectionBySlug = async (slug: string, brandId?: string, artistName?: string): Promise<Collection | undefined> => {
  const normalized = normalizeCatalogSlug(slug);
  const searchTerms = [...new Set([slug, normalized, slug.replace(/-/g, ' ')])];

  for (const term of searchTerms) {
    for (const params of [{ brandId, search: term }, { search: term }, { brandId }]) {
      const list = await fetchAllCollectionPages({ ...params, take: 100 });
      const found = findInListBySlug(list, normalized);
      if (found) return found;
    }
  }

  if (artistName) {
    const list = await fetchAllCollectionPages({ brandId });
    const byName = findInListByName(list, artistName);
    if (byName) return byName;
  }

  const globalList = await fetchAllCollectionPages({});
  const fromGlobal = findInListBySlug(globalList, normalized) ?? (artistName ? findInListByName(globalList, artistName) : undefined);
  if (fromGlobal) return fromGlobal;

  const index = await loadExistingCollectionsIndex(brandId);
  return index.get(`slug:${normalized}`) ?? (artistName ? index.get(`name:${normalizeCatalogSlug(artistName)}`) : undefined);
};

export const extractDuplicateSlugFromError = (error: unknown): string | undefined => {
  const message = String((error as { message?: string })?.message ?? error ?? '');
  const bracketMatch = message.match(/Slug\s*\[([^\]]+)\]/i);
  if (bracketMatch?.[1]) return bracketMatch[1].trim();
  return undefined;
};

export const isDuplicateCollectionSlugError = (error: unknown): boolean => {
  const message = String((error as { message?: string })?.message ?? error ?? '').toLowerCase();
  return message.includes('slug') && (message.includes('tồn tại') || message.includes('already exists') || message.includes('exists'));
};

export const countIndexedCollections = (index: Map<string, Collection>): number => new Set([...index.values()].map((item) => item.id)).size;
