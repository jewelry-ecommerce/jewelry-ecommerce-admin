import type { CuratedSet, CuratedSetListQuery, CuratedSetPayload, CuratedSetRow } from "@/apis/set/set.interface";
import type { Paginated } from "@/apis/product/product.interface";
import { apiRequest } from "@/apis/transport";
import { findProductById } from "@/mocks/data/catalog.data";
import { CURATED_SETS, findSetById } from "@/mocks/data/set.data";
import { cloneDeep, matchesSearch, MockApiError, normalizeSearch, paginate, withLatency } from "@/mocks/mock-transport";

const toCuratedSetRow = (set: CuratedSet): CuratedSetRow => ({
  id: set.id,
  code: set.code,
  name: set.name,
  slug: set.slug,
  heroImage: set.heroImage,
  status: set.status,
  itemCount: set.items.length,
  keyPieceCount: set.items.filter((item) => item.isKeyPiece).length,
  bundleDiscountPercent: set.bundleDiscountPercent,
  stockStatus: set.stockStatus,
  createdAt: set.createdAt,
});

const requireSet = (setId: string): CuratedSet => {
  const set = findSetById(setId);
  if (!set) throw new MockApiError("SET_NOT_FOUND", `No curated set matches the id ${setId}.`, 404);
  return set;
};

const assertItemsResolvable = (payload: CuratedSetPayload): void => {
  payload.items.forEach((item) => {
    const product = findProductById(item.productId);
    if (!product)
      throw new MockApiError("SET_ITEM_PRODUCT_NOT_FOUND", `Slot "${item.slotName}" references unknown product ${item.productId}.`, 404);
    if (!item.selectableVariantIds.includes(item.defaultVariantId)) {
      throw new MockApiError("SET_ITEM_DEFAULT_NOT_SELECTABLE", `Slot "${item.slotName}" default SKU is not in its selectable list.`, 422);
    }
  });
};

/** GET admin/catalog/sets */
export const getSetList = (query: CuratedSetListQuery = {}): Promise<Paginated<CuratedSetRow>> =>
  apiRequest({
    method: "GET",
    path: "admin/catalog/sets",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const search = normalizeSearch(query.search);
        const matched = CURATED_SETS.filter((set) => {
          if (query.status && set.status !== query.status) return false;
          return matchesSearch([set.name, set.code, set.slug], search);
        });
        const page = paginate(matched, query.page ?? 1, query.take ?? 20);
        return { ...page, list: page.list.map(toCuratedSetRow) };
      }),
  });

/** GET admin/catalog/sets/{setId} */
export const getSetDetail = (setId: string): Promise<CuratedSet> =>
  apiRequest({
    method: "GET",
    path: `admin/catalog/sets/${encodeURIComponent(setId)}`,
    mock: () => withLatency(() => cloneDeep(requireSet(setId))),
  });

/** POST admin/catalog/sets */
export const createSet = (payload: CuratedSetPayload): Promise<CuratedSet> =>
  apiRequest({
    method: "POST",
    path: "admin/catalog/sets",
    body: payload,
    mock: () =>
      withLatency(() => {
        if (CURATED_SETS.some((set) => set.code === payload.code)) {
          throw new MockApiError("SET_CODE_TAKEN", `Set code ${payload.code} already exists.`, 409);
        }
        assertItemsResolvable(payload);

        const setId = `set-${payload.slug}`;
        const created: CuratedSet = {
          id: setId,
          code: payload.code,
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          status: payload.status,
          heroImage: "",
          media: [],
          items: payload.items.map((item, index) => ({ setItemId: `${setId}-i${index + 1}`, ...item })),
          bundleDiscountPercent: payload.bundleDiscountPercent,
          stockStatus: "IN_STOCK",
          createdAt: new Date().toISOString(),
        };
        CURATED_SETS.push(created);
        return cloneDeep(created);
      }),
  });

/** PUT admin/catalog/sets/{setId} */
export const updateSet = (setId: string, payload: CuratedSetPayload): Promise<CuratedSet> =>
  apiRequest({
    method: "PUT",
    path: `admin/catalog/sets/${encodeURIComponent(setId)}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const set = requireSet(setId);
        assertItemsResolvable(payload);

        set.name = payload.name;
        set.slug = payload.slug;
        set.description = payload.description;
        set.status = payload.status;
        set.bundleDiscountPercent = payload.bundleDiscountPercent;
        // Existing slots keep their `setItemId` so cart / order references stay valid.
        set.items = payload.items.map((item, index) => {
          const existing = set.items.find((current) => current.slotName === item.slotName);
          return { setItemId: existing?.setItemId ?? `${setId}-i${index + 1}`, ...item };
        });
        return cloneDeep(set);
      }),
  });

/** DELETE admin/catalog/sets/{setId} */
export const deleteSet = (setId: string): Promise<{ success: true }> =>
  apiRequest({
    method: "DELETE",
    path: `admin/catalog/sets/${encodeURIComponent(setId)}`,
    mock: () =>
      withLatency(() => {
        const index = CURATED_SETS.findIndex((set) => set.id === setId);
        if (index < 0) throw new MockApiError("SET_NOT_FOUND", `No curated set matches the id ${setId}.`, 404);
        CURATED_SETS.splice(index, 1);
        return { success: true as const };
      }),
  });
