export enum ProductApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum ProductApprovalAction {
  CREATE_PRODUCT = 'CREATE_PRODUCT',
  UPDATE_PRODUCT = 'UPDATE_PRODUCT',
}

export enum ProductSpuStatus {
  ALL = 'ALL',
  DRAFT = 'DRAFT',
  UNPUBLISHED = 'UNPUBLISHED',
  PUBLISHED = 'PUBLISHED',
  DISCONTINUED = 'DISCONTINUED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProductSkuStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ProductKind {
  MERCHANDISE = 'MERCHANDISE',
  PACKAGING = 'PACKAGING',
  SHIPPING_PACKAGING = 'SHIPPING_PACKAGING',
}

export enum ProductVariationSkuKind {
  PRODUCT = 'PRODUCT',
  PACKAGING = 'PACKAGING',
}

export enum PackagingType {
  BOX = 'BOX',
  CARTON_BOX = 'CARTON_BOX',
  BAG = 'BAG',
  POUCH = 'POUCH',
  CARD = 'CARD',
  WRAP = 'WRAP',
  TUBE = 'TUBE',
  OTHER = 'OTHER',
}

export enum AdminProductTimeFilter {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  CUSTOM = 'CUSTOM',
}

export enum ProductStockStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum ProductApprovalActionType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum ProductUnitOfMeasure {
  EACH = 'EACH',
  STRAND = 'STRAND',
  PAIR = 'PAIR',
  SET = 'SET',
  BOX = 'BOX',
  BAG = 'BAG',
  SHEET = 'SHEET',
}

/** Single-value unit labels shown in admin Select. */
export const PRODUCT_UNIT_OF_MEASURE_LABELS_VI: Record<ProductUnitOfMeasure, string> = {
  [ProductUnitOfMeasure.EACH]: 'Cái',
  [ProductUnitOfMeasure.STRAND]: 'Sợi',
  [ProductUnitOfMeasure.PAIR]: 'Đôi',
  [ProductUnitOfMeasure.SET]: 'Bộ',
  [ProductUnitOfMeasure.BOX]: 'Hộp',
  [ProductUnitOfMeasure.BAG]: 'Túi',
  [ProductUnitOfMeasure.SHEET]: 'Tấm',
};

export const PRODUCT_UNIT_OF_MEASURE_OPTIONS = Object.values(ProductUnitOfMeasure).map((value) => ({
  value,
  label: PRODUCT_UNIT_OF_MEASURE_LABELS_VI[value],
}));
