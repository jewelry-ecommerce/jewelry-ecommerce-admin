export type LabelDisplayCampaignStatus = 'running' | 'upcoming' | 'paused' | 'ended';

/** Danh mục đã chọn (hiển thị trên form cấu hình). */
export interface LabelDisplaySelectedCategory {
  id: string;
  name: string;
  imageUrl: string;
}

/** Bộ sưu tập đã chọn. */
export interface LabelDisplaySelectedCollection {
  id: string;
  name: string;
  imageUrl: string;
}

/** Sản phẩm đã chọn (giữ đủ field để build payload MANUAL targets). */
export interface LabelDisplaySelectedProduct {
  productVariantId: string;
  productId: string;
  skuCode: string;
  slug?: string;
  name: string;
  imageUrl: string;
}

export type LabelDisplayPromotionSource = 'DRAFT' | 'PUBLISHED';

export interface LabelDisplayPromotionPickItem {
  id: string;
  /** Tên campaign (lưu ruleConfig). */
  name: string;
  /** Label hiển thị picker (name + status). */
  label: string;
  source: LabelDisplayPromotionSource;
  statusLabel?: string;
}

export interface LabelDisplayCategoryTreeNode {
  id: string;
  name: string;
  imageUrl: string;
  children?: LabelDisplayCategoryTreeNode[];
}

/** Lựa chọn phạm vi áp dụng (chỉ 1 active tại 1 thời điểm khi gửi BE). */
export type LabelDisplayScope = 'all' | 'promotion' | 'category' | 'collection' | 'product';
