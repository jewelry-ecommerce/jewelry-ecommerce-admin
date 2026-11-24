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
  CTA_BLOCK: "Khối CTA điều hướng",
  TOP_LINE_BANNER: "Thanh top banner chạy chữ",
  NEWSLETTER_SIGNUP: "Form đăng ký nhận tin",
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
  if (type === CmsDemoBlockType.CTA_BLOCK) {
    return {
      ...base,
      config: {
        title: "",
        description: "",
        buttons: [],
        alignment: "CENTER",
        background: { color: "#FFFFFF", borderColor: "transparent", borderRadius: 40 },
      },
    };
  }
  if (type === CmsDemoBlockType.TOP_LINE_BANNER) {
    return {
      ...base,
      config: {
        settings: {
          isClosable: true,
          animationType: "STATIC",
          animationSpeed: 3,
          backgroundColor: "#000000",
          textColor: "#FFFFFF",
        },
        items: [{ text: "", actionType: "NONE" }],
      },
    };
  }
  if (type === CmsDemoBlockType.NEWSLETTER_SIGNUP) {
    return {
      ...base,
      config: {
        heading: "Đăng ký nhận tin",
        consentText: "Bằng cách đăng ký, bạn đồng ý với chính sách bảo mật thông tin.",
      },
    };
  }
  return { ...base, config: { header: { title: "", subtitle: "" }, display: { columns: 3 }, items: [] } };
}
export function moveCmsBlock(blocks: CmsDemoBlock[], index: number, direction: number): CmsDemoBlock[] {
  const target = index + direction;
  if (target < 0 || target >= blocks.length) return blocks;
  const next = [...blocks];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((block, position) => ({ ...block, sortOrder: position + 1 }));
}
