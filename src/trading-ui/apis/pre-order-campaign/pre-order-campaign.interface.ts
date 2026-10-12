import type { PageOptionsDto, ResList } from '../../common/constant/api.interface';
import type { OrderTimeFilter } from '../order/order.enum';
import type { PreOrderCampaign, PreOrderCampaignBadgeTemplate, PreOrderCampaignSku } from './pre-order-campaign.entities';
import type { PreOrderCampaignStatus, PreOrderProductSourceType } from './pre-order-campaign.enum';

/** Query danh sách — dùng chung list page / selector / picker. */
export interface QueryPreOrderCampaignDto extends PageOptionsDto<PreOrderCampaign> {
  /**
   * Lọc đa trạng thái: Draft, Scheduled, Active, Paused, Ended.
   * Bỏ trống = tất cả. Gửi dạng `Active,Scheduled` hoặc mảng (API layer serialize).
   */
  statuses?: PreOrderCampaignStatus | PreOrderCampaignStatus[] | string;
  /**
   * Alias singular của `statuses` (tương thích FE tab gửi `status=Active`).
   * Ưu tiên dùng `statuses` khi lọc nhiều trạng thái.
   */
  status?: PreOrderCampaignStatus;
  isActive?: boolean;
  /** Lọc theo khoảng thời gian chiến dịch (BE optional — forward-compatible). */
  orderTimeFilter?: OrderTimeFilter;
  startDate?: string;
  endDate?: string;
}

export type PreOrderCampaignStatusCounts = Partial<Record<'all' | PreOrderCampaignStatus, number>>;

/** Shape `summary` từ BE list campaigns (ALL + Draft/Scheduled/Active/Paused/Ended). */
export type PreOrderCampaignListSummary = Partial<Record<'ALL' | PreOrderCampaignStatus, number>>;

export type ResListPreOrderCampaign = ResList<PreOrderCampaign> & {
  /** Tổng theo trạng thái — map từ BE `summary` hoặc field `counts`. */
  counts?: PreOrderCampaignStatusCounts;
  summary?: PreOrderCampaignListSummary;
};

export type ResListPreOrderCampaignBadgeTemplate = ResList<PreOrderCampaignBadgeTemplate>;

/** Body POST `/order/pre-order/campaigns/skus/search` — resolve SKU theo phạm vi Collection/Category (hoặc lọc VARIANT). */
export interface QueryPreOrderCampaignSkuSearchDto extends Partial<Omit<PageOptionsDto<PreOrderCampaignSku>, 'orderBy'>> {
  /** BE sort field — gồm cả timestamp entity, không chỉ key trên `PreOrderCampaignSku`. */
  orderBy?: keyof PreOrderCampaignSku | 'createdAt' | 'updatedAt';
  skuCodes?: string[];
  categoryUuid?: string;
  collectionUuid?: string;
  categoryIds?: string[];
  collectionIds?: string[];
  variationStatus?: string;
  skuKind?: string;
  productKind?: string;
  /** Lọc theo trạng thái SPU — FE gửi PUBLISHED + DISCONTINUED khi chọn SKU campaign. */
  productStatuses?: string[];
  /** Label CMS — BE dùng để lọc SKU đã gắn badge / conflict campaign. */
  badgeTemplateId?: string;
  /** Khoảng hiệu lực chiến dịch (map từ startAt / endAt form). */
  activeFrom?: string;
  activeTo?: string;
}

/** Item trả về từ skus/search — hỗ trợ cả shape campaign SKU và PIM/WMS. */
export interface PreOrderCampaignSkuSearchItem extends PreOrderCampaignSku {
  id?: string;
  name?: string;
  productId?: string;
  medias?: Array<{ url?: string | null; path?: string | null }>;
  product?: { id?: string; name?: string } | null;
  attributes?: Array<{ value?: string | null }>;
  /** `true` = SKU không khả dụng (đã thuộc campaign khác / bị khóa). FE làm mờ + không cho chọn. */
  disabled?: boolean;
  /** Lý do không khả dụng từ BE — hiển thị dưới dòng SKU khi `disabled`. */
  disabledMessage?: string;
}

export type ResListPreOrderCampaignSkuSearch = ResList<PreOrderCampaignSkuSearchItem>;

/** Payload tạo/cập nhật — tái dùng cho create + patch partial. */
export interface PreOrderCampaignUpsertDto {
  name: string;
  startAt: string;
  endAt: string;
  expectedStockAt?: string | null;
  isActive: boolean;
  productSourceType: PreOrderProductSourceType;
  productSourceRefs: string[];
  badgeTemplateId?: string | null;
  maxPurchaseQty?: number;
  paymentTimeoutHours?: number;
  skus: PreOrderCampaignSku[];
}

export type CreatePreOrderCampaignDto = PreOrderCampaignUpsertDto;
export type UpdatePreOrderCampaignDto = Partial<PreOrderCampaignUpsertDto>;

export interface PreOrderCampaignStatisticsListItem {
  id: string;
  name: string;
  status: PreOrderCampaignStatus | string;
  statusLabel: string;
  startAt: string | null;
  endAt: string | null;
  skuCount: number;
  orderCount: number | null;
  orderedQuantity: number | null;
  readyQuantity: number | null;
  progressPercent: number | null;
}

export type ResListPreOrderCampaignStatistics = ResList<PreOrderCampaignStatisticsListItem>;

/** Query danh sách thống kê chiến dịch pre-order. */
export interface QueryPreOrderCampaignStatisticsDto extends PageOptionsDto<PreOrderCampaignStatisticsListItem> {
  /**
   * Đa trạng thái — mặc định FE loại trừ Draft (BR hiển thị).
   * Gửi CSV hoặc mảng (API layer serialize).
   */
  statuses?: PreOrderCampaignStatus | PreOrderCampaignStatus[] | string;
  /** Singular status filter (Active, Scheduled, Ended…). */
  status?: PreOrderCampaignStatus;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PreOrderCampaignStatisticsSkuItem {
  skuCode: string;
  productName: string;
  variationName?: string | null;
  image?: string | null;
  orderCount: number | null;
  orderedQuantity: number | null;
  readyQuantity: number | null;
  progressPercent: number | null;
}

export interface PreOrderCampaignStatisticsDetail {
  id: string;
  name: string;
  status: PreOrderCampaignStatus | string;
  statusLabel: string;
  startAt: string | null;
  endAt: string | null;
  expectedStockAt?: string | null;
  skuCount: number;
  orderCount: number | null;
  orderedQuantity: number | null;
  readyQuantity: number | null;
  progressPercent: number | null;
  skus: PreOrderCampaignStatisticsSkuItem[];
}

export interface QueryPreOrderCampaignStatisticsDetailDto {
  sortOrder?: 'ASC' | 'DESC';
  orderBy?: 'orderCount' | 'orderedQuantity' | 'readyQuantity' | 'progressPercent';
}
