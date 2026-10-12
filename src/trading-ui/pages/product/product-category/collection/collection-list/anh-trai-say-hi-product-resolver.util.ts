import { productApi } from '../../../../../apis';
import { OrderType } from '../../../../../apis/order';
import type { Product } from '../../../../../apis/product/product.entities';
import { ANH_TRAI_SAY_HI_COLLECTION_SEEDS, type AnhTraiSayHiCollectionSeed } from './anh-trai-say-hi-collection.seed';

/** Số SP mục tiêu / nghệ sĩ khi phân bổ tuần tự (dev). */
export const ANH_TRAI_SAY_HI_PRODUCTS_PER_ARTIST = 3;

export const normalizeCatalogSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const artistNameTokens = (seed: AnhTraiSayHiCollectionSeed): string[] => {
  const fromName = seed.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .split(/[\s.]+/)
    .map((part) => part.replace(/[^a-z0-9]/g, ''))
    .filter((part) => part.length >= 2);

  const fromSlug = seed.slug.split('-').filter((part) => part.length >= 2);
  return [...new Set([...fromName, ...fromSlug])];
};

const slugTokenAppearsIn = (artistSlug: string, haystack: string): boolean => {
  const slug = normalizeCatalogSlug(artistSlug);
  const text = normalizeCatalogSlug(haystack);
  if (!slug || !text) return false;
  if (text === slug || text.includes(slug)) {
    if (slug.length <= 4) {
      return new RegExp(`(^|[-_/])${escapeRegExp(slug)}([-_/]|$)`).test(text);
    }
    return true;
  }

  const compactSlug = slug.replace(/-/g, '');
  const compactText = text.replace(/-/g, '');
  if (compactSlug.length > 4 && compactText.includes(compactSlug)) return true;

  const tokens = slug.split('-').filter((token) => token.length >= 3);
  if (tokens.length === 0) return false;
  return tokens.every((token) => text.includes(token));
};

const matchesArtistNameTokens = (seed: AnhTraiSayHiCollectionSeed, product: Product): boolean => {
  const haystack = normalizeCatalogSlug(`${product.slug ?? ''} ${product.name ?? ''} ${product.spuCode ?? ''}`);
  const tokens = artistNameTokens(seed);
  if (tokens.length === 0) return false;

  const matchedCount = tokens.filter((token) => {
    if (token.length <= 4) {
      return new RegExp(`(^|[-_/])${escapeRegExp(token)}([-_/]|$)`).test(haystack);
    }
    return haystack.includes(token);
  }).length;

  if (tokens.length === 1) return matchedCount === 1;
  return matchedCount >= Math.min(2, tokens.length);
};

export const productMatchesArtistSeed = (product: Product, seed: AnhTraiSayHiCollectionSeed): boolean => {
  const slug = product.slug ?? '';
  const name = product.name ?? '';
  const spuCode = product.spuCode ?? '';

  if (seed.productSlugHints?.some((hint) => slugTokenAppearsIn(hint, slug) || slugTokenAppearsIn(hint, name) || slugTokenAppearsIn(hint, spuCode))) {
    return true;
  }

  if (slugTokenAppearsIn(seed.slug, slug) || slugTokenAppearsIn(seed.slug, name) || slugTokenAppearsIn(seed.slug, spuCode)) {
    return true;
  }

  if (matchesArtistNameTokens(seed, product)) return true;

  const search = (seed.productSearch ?? seed.name).trim();
  if (!search) return false;

  const normalizedSearch = search.toLowerCase();
  if (name.toLowerCase().includes(normalizedSearch)) return true;

  return slugTokenAppearsIn(normalizeCatalogSlug(search), slug);
};

export const loadAllBrandProducts = async (brandId: string): Promise<Product[]> => {
  const all: Product[] = [];
  const take = 100;
  let page = 1;

  while (page <= 100) {
    const response = await productApi.getAdminProductList({
      brandId,
      page,
      take,
      isPagination: true,
      orderType: OrderType.ASC,
      orderBy: 'name',
    });

    const batch = response.list ?? [];
    all.push(...batch);

    const total = response.pagination?.total ?? response.total ?? all.length;
    if (batch.length === 0 || all.length >= total) break;
    page += 1;
  }

  return all;
};

export const resolveArtistProductIds = (seed: AnhTraiSayHiCollectionSeed, catalog: Product[]): string[] => {
  const explicit = [...new Set((seed.productIds ?? []).map((id) => id.trim()).filter(Boolean))];
  if (explicit.length > 0) return explicit;

  const matched = catalog.filter((product) => productMatchesArtistSeed(product, seed));
  return [...new Set(matched.map((product) => product.id).filter(Boolean))];
};

export const buildArtistProductMap = (seeds: AnhTraiSayHiCollectionSeed[], catalog: Product[]): Map<string, string[]> => {
  const map = new Map<string, string[]>();
  for (const seed of seeds) {
    map.set(seed.slug, resolveArtistProductIds(seed, catalog));
  }
  return map;
};

/** Phân bổ tuần tự SP còn lại theo thứ tự nghệ sĩ trong seed (dev). */
export const autoAssignProductsSequential = (
  seeds: AnhTraiSayHiCollectionSeed[],
  catalog: Product[],
  map: Map<string, string[]>,
  productsPerArtist?: number,
): { map: Map<string, string[]>; autoAssigned: Array<{ slug: string; names: string[] }> } => {
  const used = new Set<string>();
  for (const ids of map.values()) ids.forEach((id) => used.add(id));

  const pool = catalog.filter((product) => !used.has(product.id)).sort((a, b) => (a.spuCode ?? a.slug ?? a.name ?? '').localeCompare(b.spuCode ?? b.slug ?? b.name ?? '', 'vi'));

  const seedsNeedingProducts = seeds.filter((seed) => (map.get(seed.slug) ?? []).length === 0);
  const perArtist = productsPerArtist ?? Math.max(1, Math.min(ANH_TRAI_SAY_HI_PRODUCTS_PER_ARTIST, Math.floor(pool.length / Math.max(seedsNeedingProducts.length, 1))));

  const autoAssigned: Array<{ slug: string; names: string[] }> = [];
  let cursor = 0;

  for (const seed of seeds) {
    const current = [...(map.get(seed.slug) ?? [])];
    const need = Math.max(0, perArtist - current.length);
    if (need === 0) {
      map.set(seed.slug, current);
      continue;
    }

    const chunk = pool.slice(cursor, cursor + need);
    cursor += chunk.length;
    if (chunk.length === 0) {
      map.set(seed.slug, current);
      continue;
    }

    const ids = [...current, ...chunk.map((product) => product.id)];
    map.set(seed.slug, ids);
    autoAssigned.push({ slug: seed.slug, names: chunk.map((product) => product.name ?? product.slug ?? product.id) });
  }

  return { map, autoAssigned };
};

export const formatProductCatalogLine = (product: Product): string => `${product.id} | ${product.spuCode ?? '-'} | ${product.slug ?? '-'} | ${product.name ?? '-'}`;

export const ANH_TRAI_SAY_HI_ALL_SEEDS = ANH_TRAI_SAY_HI_COLLECTION_SEEDS;
