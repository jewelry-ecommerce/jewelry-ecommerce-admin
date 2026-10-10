// ─── Render Type ─────────────────────────────────────
export enum BadgeType {
  TEXT = "TEXT",
  ICON = "ICON",
  IMAGE = "IMAGE",
  MINI_BANNER = "MINI_BANNER",
}

// ─── Visual Shape ────────────────────────────────────
export enum BadgeShape {
  RECTANGLE = "RECTANGLE",
  ROUNDED = "ROUNDED",
  PILL = "PILL",
}

/**
 * Vị trí badge trên ảnh (3×3 bỏ ô giữa) + một vị trí riêng gần giá/title.
 * Giá trị string = tên enum (API / DB).
 */
export enum BadgePosition {
  TOP_LEFT = "TOP_LEFT",
  TOP_CENTER = "TOP_CENTER",
  TOP_RIGHT = "TOP_RIGHT",
  CENTER_LEFT = "CENTER_LEFT",
  CENTER_RIGHT = "CENTER_RIGHT",
  BOTTOM_LEFT = "BOTTOM_LEFT",
  BOTTOM_RIGHT = "BOTTOM_RIGHT",
  BOTTOM_CENTER = "BOTTOM_CENTER",
  PRICE_LINE = "PRICE_LINE",
}

// ─── Lifecycle ───────────────────────────────────────
export enum BadgeStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

// ─── Channel ─────────────────────────────────────────
export enum BadgeChannel {
  ALL = "ALL",
  WEB = "WEB",
  MOBILE_WEB = "MOBILE_WEB",
  APP = "APP",
}

// ─── Campaign Status ──────────────────────────────────
export enum BadgeCampaignStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum BadgeTemplateBadgeType {
  CAMPAIGN = "CAMPAIGN",
  BEST_SELLER = "BEST_SELLER",
  PRICE_DIFF = "PRICE_DIFF",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  NEW_ARRIVAL = "NEW_ARRIVAL",
  LOW_STOCK = "LOW_STOCK",
  PRE_ORDER = "PRE_ORDER",
}
// ─── Rule Type (Targeting) ───────────────────────────
export enum BadgeRuleType {
  MANUAL = "MANUAL",
  ALL = "ALL",
  CATEGORY = "CATEGORY",
  COLLECTION = "COLLECTION",
  PROMOTION = "PROMOTION",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export enum BadgeCampaignDisplayStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  ENDED = "ENDED",
}
