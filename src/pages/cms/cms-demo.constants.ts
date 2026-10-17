import { CmsDemoBlockType, CmsDemoStatus, type CmsDemoBlock, type CmsDemoPage } from "@/apis/cms-demo/cms-demo.interface";
export const CMS_BLOCK_LABELS: Record<CmsDemoBlockType, string> = {
  BANNER: "Banner",
  PRODUCT_CAROUSEL: "Danh sách sản phẩm dạng carousel",
  PRODUCT_LIST: "Danh sách sản phẩm (lưới + bộ lọc)",
  PRODUCT_CATEGORY_NAV: "Danh mục sản phẩm (thanh trục)",
  PRODUCT_COLLECTION_SHOWCASE: "Bộ sưu tập nổi bật (showcase)",
  INFO_CARDS: "Thẻ thông tin",
  IMAGE_GALLERY: "Thư viện ảnh",
  PRODUCT_EXPANDABLE_DESCRIPTION: "Nội dung mô tả",
};
export const CMS_BANNER_PLACEMENTS: string[] = [];
export const CMS_DEMO_SEED_IMAGE = "";
export const CMS_DEMO_STATUS_LABELS: Record<CmsDemoStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
};
export function newCmsPage(): CmsDemoPage {
  return {
    id: crypto.randomUUID(),
    name: "",
    slug: "",
    status: CmsDemoStatus.DRAFT,
    revision: 0,
    seo: { title: "", description: "" },
    blocks: [],
  };
}
export function newCmsBlock(type: CmsDemoBlockType, position: number): CmsDemoBlock {
  const base = { id: crypto.randomUUID(), blockTypeCode: type, sortOrder: position, isVisible: true };
  if (type === CmsDemoBlockType.BANNER) return { ...base, config: { placementCode: "" } };
  if (type === CmsDemoBlockType.PRODUCT_LIST)
    return { ...base, config: { header: { title: '', subtitle: '' }, productDataSource: { filterType: 'ALL_PRODUCTS', sort: 'newest' } } };
  if (type === CmsDemoBlockType.PRODUCT_CATEGORY_NAV) return { ...base, config: { display: { limit: 0 } } };
  if (type === CmsDemoBlockType.PRODUCT_CAROUSEL)
    return {
      ...base,
      config: {
        header: { title: "", subtitle: "" },
        display: { limit: 6 },
        dataSource: { filterType: "MANUAL_PRODUCTS", productIds: [] },
      },
    };
  if (type === CmsDemoBlockType.PRODUCT_EXPANDABLE_DESCRIPTION) return { ...base, config: { title: "", description: "" } };
  return { ...base, config: { header: { title: "", subtitle: "" }, display: { columns: 3 }, items: [] } };
}
export function moveCmsBlock(blocks: CmsDemoBlock[], index: number, direction: number): CmsDemoBlock[] {
  const target = index + direction;
  if (target < 0 || target >= blocks.length) return blocks;
  const next = [...blocks];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((block, position) => ({ ...block, sortOrder: position + 1 }));
}
