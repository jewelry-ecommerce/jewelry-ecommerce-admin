import type { PreOrderCampaignSku } from '../../../apis';
import type { PreOrderCampaignStatus, PreOrderProductSourceType } from '../../../apis';

/** SKU chọn trên form — map sang PreOrderCampaignSku khi submit. */
export interface PreOrderSelectedSku {
  skuCode: string;
  productName: string;
  variationName?: string;
  imageUrl?: string;
  productVariantId?: string;
  productId?: string;
  /** BE: VARIANT | CATEGORY | COLLECTION */
  badgeProductScopeType?: string;
  /** Từ skus/search — chỉ dùng UI catalog, không gửi lên create/update. */
  disabled?: boolean;
  /** Lý do không khả dụng từ BE — chỉ dùng UI catalog. */
  disabledMessage?: string;
}

export type PreOrderCampaignFormMode = 'create' | 'edit' | 'view';

export interface PreOrderCampaignFormValues {
  name: string;
  startAt: string | null;
  endAt: string | null;
  /** Thời gian mở bán dự kiến (optional). */
  expectedAvailableAt: string | null;
  isActive: boolean;
  productSourceType: PreOrderProductSourceType | '';
  productSourceRefs: string[];
  skus: PreOrderSelectedSku[];
  /** Label CMS gắn chiến dịch (optional). */
  badgeTemplateId: string;
  /** Chỉ dùng hiển thị (create = Draft mặc định). */
  status?: PreOrderCampaignStatus;
}

export interface PreOrderCampaignFormEditableFlags {
  name: boolean;
  startAt: boolean;
  endAt: boolean;
  expectedAvailableAt: boolean;
  productScope: boolean;
  badgeTemplate: boolean;
  isActive: boolean;
  save: boolean;
}

export type PreOrderCampaignSkuPayload = PreOrderCampaignSku;
