import type { ComponentType } from 'react';
import { BarChart01, InfoCircle, MarkerPin01, Package, Send01, Ticket01, Users01 } from '@untitledui/icons';
import {
  AudienceConfigType,
  PromotionCostSource,
  PromotionDraftSchemaType,
  PromotionDraftStatus,
  type PublishedPromotionStatus,
  PromotionSchemaDisplayStatus,
  PromotionSchemaStatus,
  TargetConfigType,
  TargetDiscountStateFilter,
  type PromotionAudienceConfigV1,
  type PromotionDraftSchema,
  type PromotionTargetConfigV1,
} from '../../../apis';

type PromotionSectionIcon = ComponentType<{ size?: number; color?: string }>;

export const PROMOTION_SKU_IMPORT_ROUTING_KEY = 'import.promotion.sku';
export const PROMOTION_CUSTOMER_IMPORT_ROUTING_KEY = 'import.promotion.customer';
export const PROMOTION_PRODUCT_SCOPE_REFERENCE_TYPE = 'PROMOTION_PRODUCT_SCOPE';
export const PROMOTION_CUSTOMER_AUDIENCE_REFERENCE_TYPE = 'PROMOTION_CUSTOMER_AUDIENCE';
export const PROMOTION_CUSTOMER_IMPORT_SAMPLE_URL =
  'https://cdn-media-stg.sevagoretail.jewelry/v1/docs/staging-external-trading/019f5e7e-f895-773e-ad79-5edee7ac92d3/v-809bfa35/Import_Customer_Template.xlsx';

export const PROMOTION_DRAFT_STATUS_MAP: Record<PromotionDraftStatus, { label: string }> = {
  [PromotionDraftStatus.EDITING]: { label: 'Nháp' },
  [PromotionDraftStatus.READY_TO_PUBLISH]: { label: 'Chờ xác nhận' },
  [PromotionDraftStatus.PUBLISHED]: { label: 'Đã xuất bản' },
  [PromotionDraftStatus.DISCARDED]: { label: 'Đã xoá' },
};

export const PROMOTION_PUBLISHED_STATUS_MAP: Record<string, { label: string }> = {
  SCHEDULED: { label: 'Đã lên lịch' },
  ACTIVE: { label: 'Đang chạy' },
  PAUSED: { label: 'Tạm dừng' },
  ENDED: { label: 'Đã kết thúc' },
  ARCHIVED: { label: 'Đã dừng' },
};

export const getPromotionDraftStatusLabel = (status: PromotionDraftStatus): string => PROMOTION_DRAFT_STATUS_MAP[status]?.label ?? status;

export const EDITABLE_PROMOTION_DRAFT_STATUSES: readonly PromotionDraftStatus[] = [PromotionDraftStatus.EDITING, PromotionDraftStatus.READY_TO_PUBLISH] as const;

export const isEditablePromotionDraftStatus = (status: PromotionDraftStatus): boolean => EDITABLE_PROMOTION_DRAFT_STATUSES.includes(status);

export const getPublishedPromotionStatusLabel = (status: string): string => PROMOTION_PUBLISHED_STATUS_MAP[status]?.label ?? status;

/** Bộ lọc trạng thái vòng đời chương trình (gộp nguồn + trạng thái kỹ thuật). */
export type PromotionCampaignLifecycleFilter =
  | ''
  | `DRAFT:${PromotionDraftStatus.EDITING}`
  | `DRAFT:${PromotionDraftStatus.READY_TO_PUBLISH}`
  | `PUBLISHED:${PublishedPromotionStatus.SCHEDULED}`
  | `PUBLISHED:${PublishedPromotionStatus.ACTIVE}`
  | `PUBLISHED:${PublishedPromotionStatus.ENDED}`
  | `PUBLISHED:${PublishedPromotionStatus.ARCHIVED}`;

export const PROMOTION_CAMPAIGN_LIFECYCLE_FILTER_OPTIONS: ReadonlyArray<{
  readonly value: Exclude<PromotionCampaignLifecycleFilter, ''>;
  readonly label: string;
}> = [
  { value: 'DRAFT:EDITING', label: 'Nháp' },
  { value: 'DRAFT:READY_TO_PUBLISH', label: 'Chờ xác nhận' },
  { value: 'PUBLISHED:SCHEDULED', label: 'Đã lên lịch' },
  { value: 'PUBLISHED:ACTIVE', label: 'Đang chạy' },
  { value: 'PUBLISHED:ENDED', label: 'Đã kết thúc' },
  { value: 'PUBLISHED:ARCHIVED', label: 'Đã dừng' },
];

export const parsePromotionCampaignLifecycleFilter = (value: PromotionCampaignLifecycleFilter): { source: 'DRAFT' | 'PUBLISHED'; status: string } | null => {
  if (!value) return null;
  const [source, status] = value.split(':') as ['DRAFT' | 'PUBLISHED', string];
  return { source, status };
};

export const PROMOTION_DETAIL_SECTIONS = [
  { key: 'general', label: 'Thông tin chung', Icon: InfoCircle },
  { key: 'target', label: 'Sản phẩm áp dụng', Icon: Package },
  { key: 'audience', label: 'Đối tượng khách hàng', Icon: Users01 },
  { key: 'applicability', label: 'Phạm vi áp dụng', Icon: MarkerPin01 },
  { key: 'schemas', label: 'Hình thức khuyến mãi', Icon: Ticket01 },
  { key: 'publish', label: 'Phát hành', Icon: Send01 },
  { key: 'quota', label: 'Thống kê quota', Icon: BarChart01 },
] as const satisfies ReadonlyArray<{ key: string; label: string; Icon: PromotionSectionIcon }>;

export const PROMOTION_DETAIL_SECTION_ICONS: Record<string, PromotionSectionIcon> = {
  general: InfoCircle,
  target: Package,
  audience: Users01,
  applicability: MarkerPin01,
  schemas: Ticket01,
  publish: Send01,
  quota: BarChart01,
};

export const getPromotionDetailSections = (source: 'draft' | 'published') =>
  PROMOTION_DETAIL_SECTIONS.filter((section) => (source === 'published' ? section.key !== 'publish' : section.key !== 'quota'));

export const getPromotionDetailSectionIcon = (sectionKey: string): PromotionSectionIcon => PROMOTION_DETAIL_SECTION_ICONS[sectionKey] ?? InfoCircle;

export const PROMOTION_TARGET_MODE_LABEL: Record<PromotionTargetConfigV1['type'], string> = {
  ALL: 'Toàn bộ sản phẩm',
  CATEGORY: 'Theo danh mục sản phẩm',
  COLLECTION: 'Theo bộ sưu tập',
  UPLOAD_FILE: 'Theo lô tải lên',
  MANUAL: 'Biến thể sản phẩm',
};

export const PROMOTION_AUDIENCE_MODE_LABEL: Record<PromotionAudienceConfigV1['type'], string> = {
  ALL: 'Tất cả khách hàng',
  CUSTOMER_SEGMENT: 'Theo phân khúc khách hàng',
  MANUAL_CUSTOMER: 'Chọn khách hàng thủ công',
  UPLOAD_FILE: 'Tải lên file',
};

export const PROMOTION_SCHEMA_TYPE_LABEL: Record<PromotionDraftSchemaType, string> = {
  [PromotionDraftSchemaType.MARKDOWN]: 'Markdown - Giảm giá trực tiếp',
  [PromotionDraftSchemaType.FLAT_PRICE]: 'Flat price - Đồng giá',
  [PromotionDraftSchemaType.VOUCHER]: 'Voucher/Coupon/Code',
};

export const PROMOTION_SCHEMA_TYPE_SHORT_LABEL: Record<PromotionDraftSchemaType, string> = {
  [PromotionDraftSchemaType.MARKDOWN]: 'Markdown',
  [PromotionDraftSchemaType.FLAT_PRICE]: 'Flat price',
  [PromotionDraftSchemaType.VOUCHER]: 'Voucher',
};

export const PROMOTION_COST_SOURCE_LABEL: Record<PromotionCostSource, string> = {
  [PromotionCostSource.RETAIL]: 'Retail',
  [PromotionCostSource.ECOMMERCE]: 'E-commerce',
  [PromotionCostSource.CRM_CS]: 'CRM/CS',
};

export const formatPromotionCostSources = (costSources?: readonly PromotionCostSource[] | null): string => {
  if (!costSources?.length) return '-';
  return costSources.map((source) => PROMOTION_COST_SOURCE_LABEL[source] ?? source).join(', ');
};

export const PROMOTION_SCHEMA_SCOPE_LABEL: Record<PromotionDraftSchema['scope'], string> = {
  SKU_ITEM: 'Sản phẩm lẻ',
  LINE_ITEM: 'Dòng hàng',
  CART: 'Giỏ hàng',
  SHIPPING: 'Vận chuyển',
  PAYMENT: 'Thanh toán',
  BUNDLE: 'Set sản phẩm',
};

export const PROMOTION_SCHEMA_STATUS_TAG: Record<PromotionSchemaStatus, { bg: string; color: string; text: string }> = {
  [PromotionSchemaStatus.ENABLED]: { bg: '#ECFDF3', color: '#027A48', text: 'Kích hoạt' },
  [PromotionSchemaStatus.DISABLED]: { bg: '#F2F4F7', color: '#344054', text: 'Vô hiệu hóa' },
};

export const PROMOTION_SCHEMA_DISPLAY_STATUS_TAG: Record<PromotionSchemaDisplayStatus, { bg: string; color: string; text: string }> = {
  [PromotionSchemaDisplayStatus.DRAFT]: { bg: '#F2F4F7', color: '#344054', text: 'Nháp' },
  [PromotionSchemaDisplayStatus.SCHEDULED]: { bg: '#EFF4FF', color: '#175CD3', text: 'Đã lên lịch' },
  [PromotionSchemaDisplayStatus.PUBLISHED]: { bg: '#F2F4F7', color: '#344054', text: 'Đã phát hành' },
  [PromotionSchemaDisplayStatus.RUNNING]: { bg: '#ECFDF3', color: '#027A48', text: 'Đang chạy' },
  [PromotionSchemaDisplayStatus.UNPUBLISHED]: { bg: '#FFFAEB', color: '#B54708', text: 'Đã dừng' },
  [PromotionSchemaDisplayStatus.ENDED]: { bg: '#FEF3F2', color: '#B42318', text: 'Đã kết thúc' },
};

export const canUnpublishPromotionSchema = (schema: Pick<PromotionDraftSchema, 'displayStatus' | 'unpublishedAt'>): boolean =>
  schema.unpublishedAt == null && (schema.displayStatus === PromotionSchemaDisplayStatus.RUNNING || schema.displayStatus === PromotionSchemaDisplayStatus.SCHEDULED);

export const PROMOTION_TARGET_DISCOUNT_FILTER_LABEL: Record<TargetDiscountStateFilter, string> = {
  [TargetDiscountStateFilter.ANY]: 'Tất cả',
  [TargetDiscountStateFilter.WITHOUT_EXISTING_PROMOTION]: 'Chỉ hàng nguyên giá',
  [TargetDiscountStateFilter.WITH_EXISTING_PROMOTION]: 'Chỉ hàng giảm giá',
};

export const PROMOTION_TARGET_DISCOUNT_FILTER_OPTIONS = Object.values(TargetDiscountStateFilter).map((value) => ({
  value,
  label: PROMOTION_TARGET_DISCOUNT_FILTER_LABEL[value],
}));

export const formatPromotionTargetSummary = (config: PromotionTargetConfigV1): string => {
  if (config.type === TargetConfigType.CATEGORY) return `${config.categoryIds.length} danh mục`;
  if (config.type === TargetConfigType.COLLECTION) return `${config.collectionIds.length} bộ sưu tập`;
  if (config.type === TargetConfigType.UPLOAD_FILE) return `Lô tải lên: ${config.uploadBatchId}`;
  if (config.type === TargetConfigType.MANUAL) return `${config.skuIds.length} biến thể`;
  return 'Tất cả sản phẩm hợp lệ';
};

export const formatPromotionAudienceSummary = (config: PromotionAudienceConfigV1): string => {
  if (config.type === AudienceConfigType.CUSTOMER_SEGMENT) return `${config.segmentIds.length} phân khúc`;
  if (config.type === AudienceConfigType.MANUAL_CUSTOMER) return `${config.customerIds.length} khách hàng`;
  if (config.type === AudienceConfigType.UPLOAD_FILE) return `Lô tải lên: ${config.uploadBatchId}`;
  return 'Tất cả khách hàng hợp lệ';
};

export const PROMOTION_CREATE_FORM_STORAGE_KEY = 'promotion_draft_header_v1';

export const PROMOTION_VALIDATION_MESSAGES = {
  APPLICABILITY_CHANNEL_REQUIRED: 'Vui lòng chọn ít nhất một kênh bán',
  APPLICABILITY_STORE_REQUIRED: 'Vui lòng chọn ít nhất một cửa hàng',
  APPLICABILITY_STORE_GROUP_REQUIRED: 'Vui lòng chọn ít nhất một nhóm cửa hàng',
  APPLICABILITY_STORE_OVERLAP: 'Cửa hàng loại trừ không được trùng với cửa hàng đã chọn',
  NAME_REQUIRED: 'Tên chương trình khuyến mãi không được để trống',
  START_DATE_REQUIRED: 'Ngày bắt đầu không được để trống',
  END_DATE_REQUIRED: 'Ngày kết thúc không được để trống',
  END_DATE_AFTER_START: 'Thời gian kết thúc phải sau thời gian bắt đầu',
  CATEGORY_REQUIRED: 'Vui lòng chọn danh mục',
  COLLECTION_REQUIRED: 'Vui lòng chọn bộ sưu tập',
  UPLOAD_BATCH_REQUIRED: 'Vui lòng nhập mã lô tải lên',
  MANUAL_SKU_REQUIRED: 'Vui lòng chọn ít nhất một biến thể',
  TARGET_TYPE_REQUIRED: 'Vui lòng chọn phạm vi sản phẩm',
  DISCOUNT_STATE_FILTER_REQUIRED: 'Vui lòng chọn điều kiện giá sản phẩm',
  SEGMENT_IDS_REQUIRED: 'Vui lòng nhập mã phân khúc',
  CUSTOMER_IDS_REQUIRED: 'Vui lòng chọn ít nhất một khách hàng',
  AUDIENCE_UPLOAD_BATCH_REQUIRED: 'Vui lòng tải lên file khách hàng',
  AUDIENCE_TYPE_REQUIRED: 'Vui lòng chọn đối tượng khách hàng',
  SCHEMA_COMPONENT_UNSUPPORTED: 'Loại cấu hình hình thức khuyến mãi này chưa được hỗ trợ.',
  SCHEMA_COMPONENT_SAVE_FAILED: 'Không thể lưu cấu hình hình thức khuyến mãi.',
} as const;
