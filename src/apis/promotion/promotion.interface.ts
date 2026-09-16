/** Promotion + voucher contract mirroring `jewelry-commerce-client/src/utils/api/promotion/promotion.interface.ts`. */
export type PromotionStatus = "ACTIVE" | "SCHEDULED" | "PAUSED" | "EXPIRED";
export type DiscountType = "PERCENT" | "FIXED_AMOUNT" | "FREE_SHIPPING";
export type PromotionScope = "ORDER" | "CATEGORY" | "PRODUCT" | "COLLECTION";

export type Promotion = {
  id: string;
  code: string;
  name: string;
  description: string;
  status: PromotionStatus;
  discountType: DiscountType;
  discountValue: number;
  scope: PromotionScope;
  /** Category slugs, product IDs or collection slugs depending on `scope`. */
  eligibleTargets: string[];
  minOrderValue: number;
  maxDiscountAmount: number | null;
  startAt: string;
  endAt: string;
  bannerImage: string | null;
};

export type Voucher = {
  id: string;
  code: string;
  name: string;
  description: string;
  status: PromotionStatus;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  startAt: string;
  endAt: string;
  /** Membership tiers allowed to redeem, empty means everyone. */
  eligibleTiers: string[];
};

/* ------------------------------------------------------------------------------------------------
 * Admin-side contracts
 * ---------------------------------------------------------------------------------------------- */

export type PromotionListQuery = {
  page?: number;
  take?: number;
  search?: string;
  status?: PromotionStatus;
  scope?: PromotionScope;
};

export type VoucherListQuery = {
  page?: number;
  take?: number;
  search?: string;
  status?: PromotionStatus;
  discountType?: DiscountType;
};

export type PromotionPayload = {
  code: string;
  name: string;
  description: string;
  status: PromotionStatus;
  discountType: DiscountType;
  discountValue: number;
  scope: PromotionScope;
  eligibleTargets: string[];
  minOrderValue: number;
  maxDiscountAmount: number | null;
  startAt: string;
  endAt: string;
};

export type VoucherPayload = {
  code: string;
  name: string;
  description: string;
  status: PromotionStatus;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number;
  perCustomerLimit: number;
  startAt: string;
  endAt: string;
  eligibleTiers: string[];
};
