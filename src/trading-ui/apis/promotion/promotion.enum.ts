export enum PromotionDraftStatus {
  EDITING = 'EDITING',
  READY_TO_PUBLISH = 'READY_TO_PUBLISH',
  PUBLISHED = 'PUBLISHED',
  DISCARDED = 'DISCARDED',
}

export enum PromotionSchemaType {
  MARKDOWN = 'MARKDOWN',
  FLAT_PRICE = 'FLAT_PRICE',
  FLASH_SALE = 'FLASH_SALE',
  VOUCHER = 'VOUCHER',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  GIFT_WITH_PURCHASE = 'GIFT_WITH_PURCHASE',
  CASHBACK = 'CASHBACK',
  PAYMENT_DISCOUNT = 'PAYMENT_DISCOUNT',
}

/** Canonical schema type values per promotion-data-model-master. */
export enum PromotionDraftSchemaType {
  MARKDOWN = 'MARKDOWN',
  FLAT_PRICE = 'FLAT_PRICE',
  VOUCHER = 'VOUCHER',
  // FLASH_SALE = 'FLASH_SALE',
  // FREE_SHIPPING = 'FREE_SHIPPING',
  // BUY_X_GET_Y = 'BUY_X_GET_Y',
  // GIFT_WITH_PURCHASE = 'GIFT_WITH_PURCHASE',
  // CASHBACK = 'CASHBACK',
  // PAYMENT_DISCOUNT = 'PAYMENT_DISCOUNT',
}

export enum PromotionScope {
  CART = 'CART',
  SKU_ITEM = 'SKU_ITEM',
  LINE_ITEM = 'LINE_ITEM',
  SHIPPING = 'SHIPPING',
  PAYMENT = 'PAYMENT',
  BUNDLE = 'BUNDLE',
}

export enum PromotionSchemaStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export enum PromotionCostSource {
  RETAIL = 'RETAIL',
  ECOMMERCE = 'ECOMMERCE',
  CRM_CS = 'CRM_CS',
}

export enum PromotionSchemaDisplayStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  RUNNING = 'RUNNING',
  UNPUBLISHED = 'UNPUBLISHED',
  ENDED = 'ENDED',
}

export enum PromotionCampaignTimeFilter {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  CUSTOM = 'CUSTOM',
}

export enum StackingPolicy {
  EXCLUSIVE = 'EXCLUSIVE',
  STACKABLE = 'STACKABLE',
}

export enum PromotionStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DISABLED = 'DISABLED',
}

export enum PublishedPromotionStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum SelectionSourceType {
  ALL = 'ALL',
  CATEGORY = 'CATEGORY',
  COLLECTION = 'COLLECTION',
  UPLOAD = 'UPLOAD',
  MANUAL = 'MANUAL',
}

export enum CustomerAudienceType {
  ALL_CUSTOMERS = 'ALL_CUSTOMERS',
}

export enum ComponentKind {
  TARGET = 'TARGET',
  AUDIENCE = 'AUDIENCE',
  APPLICABILITY = 'APPLICABILITY',
  CONDITION = 'CONDITION',
  BENEFIT = 'BENEFIT',
}

export enum ConditionRuleType {
  TARGET_SUBTOTAL = 'TARGET_SUBTOTAL',
  ALWAYS = 'ALWAYS',
}

export enum BenefitRuleType {
  MARKDOWN = 'MARKDOWN',
  FLAT_PRICE = 'FLAT_PRICE',
  VOUCHER = 'VOUCHER',
}

export enum AmountComparisonOperator {
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
}

export enum MarkdownDiscountKind {
  PERCENT = 'PERCENT',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum VoucherDiscountTarget {
  ORDER_VALUE = 'ORDER_VALUE',
  SHIPPING_FEE = 'SHIPPING_FEE',
}

export enum VoucherDiscountKind {
  PERCENT = 'PERCENT',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum DiscountBase {
  ORIGINAL_PRICE = 'ORIGINAL_PRICE',
  CURRENT_SELLING_PRICE = 'CURRENT_SELLING_PRICE',
  AFTER_SKU_ITEM_PROMOTIONS = 'AFTER_SKU_ITEM_PROMOTIONS',
}

export enum BenefitApplicationScope {
  CART = 'CART',
  SKU_ITEM = 'SKU_ITEM',
  LINE_ITEM = 'LINE_ITEM',
  SHIPPING = 'SHIPPING',
  PAYMENT = 'PAYMENT',
}

export enum DiscountAllocationTarget {
  NONE = 'NONE',
  TARGET_ELIGIBLE_LINES = 'TARGET_ELIGIBLE_LINES',
}

export enum DiscountAllocationMethod {
  NONE = 'NONE',
  PROPORTIONAL_BY_ELIGIBLE_SUBTOTAL = 'PROPORTIONAL_BY_ELIGIBLE_SUBTOTAL',
}

export enum RoundingMode {
  FLOOR = 'FLOOR',
  CEIL = 'CEIL',
  HALF_UP = 'HALF_UP',
}

export enum TargetConfigType {
  ALL = 'ALL',
  CATEGORY = 'CATEGORY',
  COLLECTION = 'COLLECTION',
  UPLOAD_FILE = 'UPLOAD_FILE',
  MANUAL = 'MANUAL',
}

export enum AudienceConfigType {
  ALL = 'ALL',
  CUSTOMER_SEGMENT = 'CUSTOMER_SEGMENT',
  MANUAL_CUSTOMER = 'MANUAL_CUSTOMER',
  UPLOAD_FILE = 'UPLOAD_FILE',
}

/** Sales channel a promotion may be sold through. Mirrors the backend enum. */
export enum PromotionSalesChannel {
  POS = 'POS',
  ONLINE = 'ONLINE',
}

/**
 * Store scope of a POS promotion.
 * GROUP is supported by the backend but not offered in the picker: the store
 * directory (pos-service) has no group concept yet, so there is nothing to pick.
 * Existing GROUP configs must still round-trip through the form.
 */
export enum StoreSelectionMode {
  ALL = 'ALL',
  MANUAL = 'MANUAL',
  GROUP = 'GROUP',
}

export enum TargetDiscountStateFilter {
  ANY = 'ANY',
  WITHOUT_EXISTING_PROMOTION = 'WITHOUT_EXISTING_PROMOTION',
  WITH_EXISTING_PROMOTION = 'WITH_EXISTING_PROMOTION',
}

export enum VoucherCodeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISABLED = 'DISABLED',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
}

export enum PromotionIndexKeyType {
  ALL = 'ALL',
  SKU_ID = 'SKU_ID',
  CATEGORY_ID = 'CATEGORY_ID',
  COLLECTION_ID = 'COLLECTION_ID',
  UPLOAD_BATCH_ID = 'UPLOAD_BATCH_ID',
  CUSTOMER_ID = 'CUSTOMER_ID',
  CUSTOMER_SEGMENT_ID = 'CUSTOMER_SEGMENT_ID',
}

export enum ConditionAuthoringMode {
  IMPLICIT_ALWAYS = 'IMPLICIT_ALWAYS',
  EXPLICIT = 'EXPLICIT',
}

export enum PromotionSimulationSourceType {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

export enum PromotionSimulationConflictOutcome {
  DRAFT_REPLACES_PUBLISHED = 'DRAFT_REPLACES_PUBLISHED',
  PUBLISHED_BLOCKS_DRAFT = 'PUBLISHED_BLOCKS_DRAFT',
  DRAFT_VOUCHER_WINS = 'DRAFT_VOUCHER_WINS',
  PUBLISHED_VOUCHER_WINS = 'PUBLISHED_VOUCHER_WINS',
  DRAFT_STACKS = 'DRAFT_STACKS',
  DRAFT_ADDS_DISCOUNT = 'DRAFT_ADDS_DISCOUNT',
  DRAFT_NO_EFFECT = 'DRAFT_NO_EFFECT',
}
