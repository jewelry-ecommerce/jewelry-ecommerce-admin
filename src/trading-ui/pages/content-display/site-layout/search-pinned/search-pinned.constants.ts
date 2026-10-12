export const SEARCH_PINNED_SLOT_COUNT = 4;

export const buildSearchPinnedSwrKey = (tenantCode: string) => ['product/admin/search-pinned-products/landing', tenantCode] as const;
