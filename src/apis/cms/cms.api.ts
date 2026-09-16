import type {
  CmsBannerRow,
  CmsBlock,
  CmsBlockPayload,
  CmsPage,
  CmsPageListQuery,
  CmsPagePayload,
  CmsPageRow,
  NavigationItem,
  NavigationPayload,
} from "@/apis/cms/cms.interface";
import type { Paginated } from "@/apis/product/product.interface";
import { apiRequest } from "@/apis/transport";
import { CMS_PAGES, STOREFRONT_GLOBAL_CONFIG } from "@/mocks/data/cms.data";
import { cloneDeep, matchesSearch, MockApiError, normalizeSearch, paginate, withLatency } from "@/mocks/mock-transport";

const BANNER_BLOCK_TYPES: CmsBannerRow["type"][] = ["HERO_BANNER", "PROMO_BANNER", "COLLECTION_BANNER"];

const toCmsPageRow = (page: CmsPage): CmsPageRow => ({
  id: page.id,
  slug: page.slug,
  name: page.name,
  status: page.status,
  blockCount: page.blocks.length,
  visibleBlockCount: page.blocks.filter((block) => block.isVisible).length,
  updatedAt: page.updatedAt,
  publishedAt: page.publishedAt,
});

const requirePage = (pageId: string): CmsPage => {
  const page = CMS_PAGES.find((entry) => entry.id === pageId);
  if (!page) throw new MockApiError("CMS_PAGE_NOT_FOUND", `No CMS page matches the id ${pageId}.`, 404);
  return page;
};

/** Reads the display title of a banner-shaped block without widening its config type. */
const resolveBannerTitle = (block: CmsBlock): string => {
  if (block.type === "HERO_BANNER") return block.config.slides[0]?.title ?? "Hero banner";
  if (block.type === "PROMO_BANNER") return block.config.title;
  if (block.type === "COLLECTION_BANNER") return block.config.title;
  return "";
};

const resolveBannerImage = (block: CmsBlock): string => {
  if (block.type === "HERO_BANNER") return block.config.slides[0]?.image ?? "";
  if (block.type === "PROMO_BANNER") return block.config.image;
  if (block.type === "COLLECTION_BANNER") return block.config.image;
  return "";
};

const resolveBannerCta = (block: CmsBlock): { label: string; href: string } => {
  if (block.type === "HERO_BANNER") return block.config.slides[0]?.cta ?? { label: "", href: "" };
  if (block.type === "PROMO_BANNER") return block.config.cta;
  if (block.type === "COLLECTION_BANNER") return block.config.cta;
  return { label: "", href: "" };
};

const isBannerBlock = (block: CmsBlock): block is Extract<CmsBlock, { type: CmsBannerRow["type"] }> =>
  BANNER_BLOCK_TYPES.includes(block.type as CmsBannerRow["type"]);

/** GET admin/cms/pages */
export const getPageList = (query: CmsPageListQuery = {}): Promise<Paginated<CmsPageRow>> =>
  apiRequest({
    method: "GET",
    path: "admin/cms/pages",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const search = normalizeSearch(query.search);
        const matched = CMS_PAGES.filter((page) => {
          if (query.status && page.status !== query.status) return false;
          return matchesSearch([page.name, page.slug], search);
        });
        const paged = paginate(matched, query.page ?? 1, query.take ?? 20);
        return { ...paged, list: paged.list.map(toCmsPageRow) };
      }),
  });

/** GET admin/cms/pages/{pageId} */
export const getPageDetail = (pageId: string): Promise<CmsPage> =>
  apiRequest({
    method: "GET",
    path: `admin/cms/pages/${encodeURIComponent(pageId)}`,
    mock: () => withLatency(() => cloneDeep(requirePage(pageId))),
  });

/** POST admin/cms/pages */
export const createPage = (payload: CmsPagePayload): Promise<CmsPage> =>
  apiRequest({
    method: "POST",
    path: "admin/cms/pages",
    body: payload,
    mock: () =>
      withLatency(() => {
        if (CMS_PAGES.some((page) => page.slug === payload.slug)) {
          throw new MockApiError("CMS_PAGE_SLUG_TAKEN", `A page already uses the slug ${payload.slug}.`, 409);
        }
        const now = new Date().toISOString();
        const created: CmsPage = {
          id: `cms-${payload.slug}`,
          slug: payload.slug,
          name: payload.name,
          status: payload.status,
          seo: payload.seo,
          blocks: [],
          updatedAt: now,
          publishedAt: payload.status === "PUBLISHED" ? now : null,
        };
        CMS_PAGES.push(created);
        return cloneDeep(created);
      }),
  });

/** PUT admin/cms/pages/{pageId} */
export const updatePage = (pageId: string, payload: CmsPagePayload): Promise<CmsPage> =>
  apiRequest({
    method: "PUT",
    path: `admin/cms/pages/${encodeURIComponent(pageId)}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const page = requirePage(pageId);
        page.slug = payload.slug;
        page.name = payload.name;
        page.status = payload.status;
        page.seo = payload.seo;
        page.updatedAt = new Date().toISOString();
        if (payload.status === "PUBLISHED" && !page.publishedAt) page.publishedAt = page.updatedAt;
        return cloneDeep(page);
      }),
  });

/** DELETE admin/cms/pages/{pageId} */
export const deletePage = (pageId: string): Promise<{ success: true }> =>
  apiRequest({
    method: "DELETE",
    path: `admin/cms/pages/${encodeURIComponent(pageId)}`,
    mock: () =>
      withLatency(() => {
        const index = CMS_PAGES.findIndex((page) => page.id === pageId);
        if (index < 0) throw new MockApiError("CMS_PAGE_NOT_FOUND", `No CMS page matches the id ${pageId}.`, 404);
        CMS_PAGES.splice(index, 1);
        return { success: true as const };
      }),
  });

/** POST admin/cms/pages/{pageId}/blocks */
export const createBlock = (pageId: string, payload: CmsBlockPayload): Promise<CmsPage> =>
  apiRequest({
    method: "POST",
    path: `admin/cms/pages/${encodeURIComponent(pageId)}/blocks`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const page = requirePage(pageId);
        // The payload union is validated by the editor form; the cast narrows it back to the block
        // variant that matches `payload.type`.
        page.blocks.push({
          id: `${page.id}-b${page.blocks.length + 1}`,
          sortOrder: payload.sortOrder,
          isVisible: payload.isVisible,
          type: payload.type,
          config: payload.config,
        } as CmsBlock);
        page.updatedAt = new Date().toISOString();
        return cloneDeep(page);
      }),
  });

/** PUT admin/cms/pages/{pageId}/blocks/{blockId} */
export const updateBlock = (pageId: string, blockId: string, payload: CmsBlockPayload): Promise<CmsPage> =>
  apiRequest({
    method: "PUT",
    path: `admin/cms/pages/${encodeURIComponent(pageId)}/blocks/${encodeURIComponent(blockId)}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const page = requirePage(pageId);
        const index = page.blocks.findIndex((block) => block.id === blockId);
        if (index < 0) throw new MockApiError("CMS_BLOCK_NOT_FOUND", `Page ${pageId} has no block ${blockId}.`, 404);

        page.blocks[index] = {
          id: blockId,
          sortOrder: payload.sortOrder,
          isVisible: payload.isVisible,
          type: payload.type,
          config: payload.config,
        } as CmsBlock;
        page.updatedAt = new Date().toISOString();
        return cloneDeep(page);
      }),
  });

/** DELETE admin/cms/pages/{pageId}/blocks/{blockId} */
export const deleteBlock = (pageId: string, blockId: string): Promise<CmsPage> =>
  apiRequest({
    method: "DELETE",
    path: `admin/cms/pages/${encodeURIComponent(pageId)}/blocks/${encodeURIComponent(blockId)}`,
    mock: () =>
      withLatency(() => {
        const page = requirePage(pageId);
        const index = page.blocks.findIndex((block) => block.id === blockId);
        if (index < 0) throw new MockApiError("CMS_BLOCK_NOT_FOUND", `Page ${pageId} has no block ${blockId}.`, 404);
        page.blocks.splice(index, 1);
        page.updatedAt = new Date().toISOString();
        return cloneDeep(page);
      }),
  });

/** GET admin/cms/banners */
export const getBannerList = (): Promise<CmsBannerRow[]> =>
  apiRequest({
    method: "GET",
    path: "admin/cms/banners",
    mock: () =>
      withLatency(() =>
        CMS_PAGES.flatMap((page) =>
          page.blocks.filter(isBannerBlock).map((block) => {
            const cta = resolveBannerCta(block);
            return {
              id: block.id,
              pageId: page.id,
              pageName: page.name,
              pageSlug: page.slug,
              type: block.type,
              title: resolveBannerTitle(block),
              image: resolveBannerImage(block),
              ctaLabel: cta.label,
              ctaHref: cta.href,
              isVisible: block.isVisible,
              sortOrder: block.sortOrder,
            };
          }),
        ),
      ),
  });

/** PATCH admin/cms/banners/{blockId}/visibility */
export const setBannerVisibility = (blockId: string, isVisible: boolean): Promise<{ success: true }> =>
  apiRequest({
    method: "PATCH",
    path: `admin/cms/banners/${encodeURIComponent(blockId)}/visibility`,
    body: { isVisible },
    mock: () =>
      withLatency(() => {
        const page = CMS_PAGES.find((entry) => entry.blocks.some((block) => block.id === blockId));
        const block = page?.blocks.find((entry) => entry.id === blockId);
        if (!page || !block) throw new MockApiError("CMS_BLOCK_NOT_FOUND", `No block matches the id ${blockId}.`, 404);
        block.isVisible = isVisible;
        page.updatedAt = new Date().toISOString();
        return { success: true as const };
      }),
  });

/** GET admin/cms/navigation */
export const getNavigation = (): Promise<NavigationItem[]> =>
  apiRequest({
    method: "GET",
    path: "admin/cms/navigation",
    mock: () => withLatency(() => cloneDeep(STOREFRONT_GLOBAL_CONFIG.navigation)),
  });

/** PUT admin/cms/navigation */
export const updateNavigation = (payload: NavigationPayload): Promise<NavigationItem[]> =>
  apiRequest({
    method: "PUT",
    path: "admin/cms/navigation",
    body: payload,
    mock: () =>
      withLatency(() => {
        STOREFRONT_GLOBAL_CONFIG.navigation.splice(0, STOREFRONT_GLOBAL_CONFIG.navigation.length, ...payload.navigation);
        return cloneDeep(STOREFRONT_GLOBAL_CONFIG.navigation);
      }),
  });
