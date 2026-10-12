import type { BaseEntity } from '../../common/constant/api.interface';
import type { PreOrderCampaignStatus, PreOrderProductSourceType } from './pre-order-campaign.enum';

/** SKU thuộc chiến dịch (dữ liệu lõi lưu theo biến thể). */
export interface PreOrderCampaignSku {
  id?: string;
  skuCode: string;
  productVariantId?: string;
  productName?: string;
  variationName?: string;
  image?: string | null;
  badgeProductScopeType?: string;
}

/**
 * Entity chiến dịch đặt trước — dùng chung list/detail và mọi consumer (admin, picker, ...).
 * Field thời gian nhận string ISO từ BE; map sang Date khi cần ở UI.
 */
export interface PreOrderCampaign extends BaseEntity {
  name: string;
  startAt: string;
  endAt: string;
  /**
   * Thời gian mở bán dự kiến (BE: `expectedStockAt`).
   * `expectedAvailableAt` giữ để tương thích payload/form cũ nếu còn.
   */
  expectedStockAt?: string | null;
  expectedAvailableAt?: string | null;
  isActive: boolean;
  status: PreOrderCampaignStatus;
  /** Nhãn trạng thái từ BE (ưu tiên hiển thị nếu có). */
  statusLabel?: string;
  productSourceType: PreOrderProductSourceType;
  productSourceRefs: string[];
  /** Label CMS (badge template) gắn chiến dịch — optional. */
  badgeTemplateId?: string | null;
  maxPurchaseQty?: number;
  paymentTimeoutHours?: number;
  orderCount?: number;
  availableActions?: string[];
  skus?: PreOrderCampaignSku[];
  skuCount?: number;
}

/** Item label từ GET `/order/pre-order/campaigns/badge-templates`. */
export interface PreOrderCampaignBadgeTemplate {
  id: string;
  name: string;
  code?: string;
  displayText?: string | null;
  styleConfig?: {
    textColor?: string;
    backgroundColor?: string;
  } | null;
}
