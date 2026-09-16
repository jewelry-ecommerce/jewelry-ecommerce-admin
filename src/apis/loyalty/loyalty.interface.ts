import type { LoyaltyAccount, LoyaltyTransaction, MembershipTier } from "@/apis/customer/customer.interface";

export type LoyaltyAccountRow = {
  customerId: string;
  customerCode: string;
  customerName: string;
  tier: MembershipTier;
  pointBalance: number;
  pointsToNextTier: number;
  nextTier: MembershipTier | null;
  lifetimeSpend: number;
  transactionCount: number;
};

export type LoyaltyAccountListQuery = {
  page?: number;
  take?: number;
  search?: string;
  tier?: MembershipTier;
};

export type MembershipTierRow = {
  tier: MembershipTier;
  label: string;
  /** Lifetime spend required to reach the tier. */
  threshold: number;
  memberCount: number;
  benefits: string[];
};

export type LoyaltyPointAdjustmentPayload = {
  customerId: string;
  /** Signed point delta. Positive credits, negative debits. */
  points: number;
  description: string;
};

export type LoyaltyAdjustmentResult = {
  account: LoyaltyAccount;
  transaction: LoyaltyTransaction;
};

/** Configuration of the storefront AI stylist. Admin-owned, storefront-consumed. */
export type StylistConfig = {
  isEnabled: boolean;
  maxSuggestions: number;
  /** Tone the generated copy should adopt. */
  tone: "CLASSIC" | "MODERN" | "PLAYFUL";
  budgetBands: { label: string; minPrice: number; maxPrice: number }[];
  promptTemplate: string;
  fallbackCollectionSlug: string;
};
