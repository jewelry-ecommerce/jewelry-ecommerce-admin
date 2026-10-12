import { PromotionCostSource, PromotionDraftSchemaType, PromotionSchemaStatus, PromotionScope } from '../../../../apis/promotion/promotion.enum';
import type { SchemaHeaderDraft } from './promotion-schema-header-drawer.types';

export const SCHEMA_HEADER_DEFAULT_DRAFT: SchemaHeaderDraft = {
  name: '',
  description: '',
  schemaType: '',
  scope: PromotionScope.SKU_ITEM,
  costSources: [],
  status: PromotionSchemaStatus.ENABLED,
  schemaStartsAt: '',
  schemaEndsAt: '',
};

export const SCHEMA_TYPE_OPTIONS: Array<{
  value: PromotionDraftSchemaType;
  label: string;
  disabled: boolean;
}> = [
  { value: PromotionDraftSchemaType.MARKDOWN, label: 'Markdown - Giảm giá trực tiếp', disabled: false },
  { value: PromotionDraftSchemaType.FLAT_PRICE, label: 'Flat price - Đồng giá', disabled: false },
  // { value: PromotionDraftSchemaType.FLASH_SALE, label: 'Giảm giá sốc - Sắp hỗ trợ', disabled: true },
  { value: PromotionDraftSchemaType.VOUCHER, label: 'Voucher/Coupon/Code', disabled: false },
  // { value: PromotionDraftSchemaType.FREE_SHIPPING, label: 'Miễn phí vận chuyển - Sắp hỗ trợ', disabled: true },
  // { value: PromotionDraftSchemaType.BUY_X_GET_Y, label: 'Mua X tặng Y - Sắp hỗ trợ', disabled: true },
  // { value: PromotionDraftSchemaType.GIFT_WITH_PURCHASE, label: 'Quà tặng kèm - Sắp hỗ trợ', disabled: true },
  // { value: PromotionDraftSchemaType.CASHBACK, label: 'Hoàn tiền - Sắp hỗ trợ', disabled: true },
  // { value: PromotionDraftSchemaType.PAYMENT_DISCOUNT, label: 'Giảm giá thanh toán - Sắp hỗ trợ', disabled: true },
];

export const SCHEMA_COST_SOURCE_OPTIONS: Array<{ value: PromotionCostSource; label: string }> = [
  { value: PromotionCostSource.RETAIL, label: 'Retail' },
  { value: PromotionCostSource.ECOMMERCE, label: 'E-commerce' },
  { value: PromotionCostSource.CRM_CS, label: 'CRM/CS' },
];
