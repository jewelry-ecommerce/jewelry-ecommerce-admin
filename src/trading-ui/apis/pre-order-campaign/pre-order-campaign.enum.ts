/** Trạng thái hiển thị chiến dịch (BR-01) — BE suy luận từ isActive + startAt/endAt. */
export enum PreOrderCampaignStatus {
  DRAFT = 'Draft',
  SCHEDULED = 'Scheduled',
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  ENDED = 'Ended',
}

/** Nguồn sản phẩm áp dụng — lưu SKU phẳng xuống DB. */
export enum PreOrderProductSourceType {
  COLLECTION = 'Collection',
  CATEGORY = 'Category',
  VARIANT = 'Variant',
}
