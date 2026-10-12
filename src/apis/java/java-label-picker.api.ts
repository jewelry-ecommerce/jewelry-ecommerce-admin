import { backendRequest } from "@/apis/backend-request";
import type { JavaPage, JavaProduct } from "./java-catalog.types";
const POLICY = { pageTake: 100, defaultTake: 20 };
export interface WmsSkuSearchListItem { id: string; skuCode: string; name: string; slug?: string; image?: string;
  stock: number; product: { id: string; name: string }; medias?: { url?: string; path?: string }[] }
interface SkuQuery { page?: number; take?: number; search?: string; categoryIds?: string[]; collectionIds?: string[] }
async function skuRows(query: SkuQuery) {
  const products: JavaProduct[] = []; let page = 1;
  while (true) {
    const params = new URLSearchParams({ page: String(page), take: String(POLICY.pageTake) });
    if (query.search) params.set("search", query.search);
    const result = await backendRequest<JavaPage<JavaProduct>>("admin/catalog/products?" + params);
    products.push(...result.list);
    if (!result.pagination.hasNextPage) break;
    page += 1;
  }
  return products.filter(product => (!query.categoryIds?.length || query.categoryIds.includes(String(product.categoryId)))
    && (!query.collectionIds?.length || product.collections.some(collection => query.collectionIds?.includes(String(collection.id)))))
    .flatMap(product => product.skus.map(sku => ({ id: String(sku.id), skuCode: sku.skuCode, name: sku.name,
      image: product.media.find(media => String(media.skuId) === String(sku.id))?.url ?? product.thumbnailUrl,
      slug: product.slug, stock: sku.availableStock, product: { id: String(product.id), name: product.name } })));
}
async function getAdminSkus(query: SkuQuery) {
  const rows = await skuRows(query), take = query.take ?? POLICY.defaultTake, start = ((query.page ?? 1) - 1) * take;
  return { list: rows.slice(start, start + take), total: rows.length };
}
export const productSkuSearchApi = { getAdminSkus, searchAdminSkus: getAdminSkus };
interface JavaPromotion { id: number; name: string; status: string }
export const promotionApi = {
  async getCampaignOverview(query: { includeArchived: boolean; page: number; limit: number }) {
    const rows = await backendRequest<JavaPromotion[]>("admin/promotions");
    const eligible = query.includeArchived ? rows : rows.filter(row => row.status !== "ARCHIVED");
    const start = (query.page - 1) * query.limit;
    return { items: eligible.slice(start, start + query.limit).map(row => ({ id: String(row.id), name: row.name, source: "PUBLISHED" as const, promotionStatus: row.status })) };
  },
};
const STATUS_LABELS: Record<string, string> = { PUBLISHED: "Đã xuất bản", ACTIVE: "Đang chạy", SCHEDULED: "Sắp diễn ra", DRAFT: "Nháp", PAUSED: "Tạm dừng", EXPIRED: "Hết hạn" };
export function getPromotionDraftStatusLabel(status: string): string { return STATUS_LABELS[status] ?? status; }
export function getPublishedPromotionStatusLabel(status: string): string { return STATUS_LABELS[status] ?? status; }
