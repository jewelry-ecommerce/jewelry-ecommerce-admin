import type { Customer, LoyaltyAccount, MembershipTier } from "@/apis/customer/customer.interface";

export const MEMBERSHIP_TIER_LABELS: Record<MembershipTier, string> = {
  MEMBER: "Member",
  SILVER: "Silver",
  GOLD: "Gold",
  DIAMOND: "Diamond",
};

export const MEMBERSHIP_TIER_THRESHOLDS: Record<MembershipTier, number> = {
  MEMBER: 0,
  SILVER: 20000000,
  GOLD: 80000000,
  DIAMOND: 200000000,
};

/**
 * Customer fixtures. `cus-demo-linh` is the account the storefront demo signs in as, and the same
 * record appears in the admin CRM module.
 */
export const CUSTOMERS: Customer[] = [];

export const DEMO_CUSTOMER_ID = "cus-demo-linh";

/** Credentials accepted by the mock auth provider. Demo-only, no real secret. */
export const DEMO_CREDENTIALS = { email: "demo@aurelia.test", password: "demo1234" } as const;

const TIER_BENEFITS: Record<MembershipTier, string[]> = {
  MEMBER: ["Earn 1 point per 100,000 spent", "Birthday greeting voucher"],
  SILVER: ["Earn 1.25 points per 100,000 spent", "Free standard shipping", "Priority customer care"],
  GOLD: ["Earn 1.5 points per 100,000 spent", "Free express shipping", "Complimentary annual cleaning", "Early access to new collections"],
  DIAMOND: [
    "Earn 2 points per 100,000 spent",
    "Free express shipping and insured returns",
    "Dedicated styling appointment",
    "Invitation to private collection previews",
  ],
};

const nextTierOf = (tier: MembershipTier): MembershipTier | null => {
  const order: MembershipTier[] = ["MEMBER", "SILVER", "GOLD", "DIAMOND"];
  const index = order.indexOf(tier);
  return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
};

export const LOYALTY_ACCOUNTS: LoyaltyAccount[] = CUSTOMERS.map((customer) => {
  const nextTier = nextTierOf(customer.tier);
  const pointBalance = Math.round(customer.lifetimeValue / 100000);

  return {
    customerId: customer.id,
    tier: customer.tier,
    pointBalance,
    pointsToNextTier: nextTier ? Math.max(0, Math.round((MEMBERSHIP_TIER_THRESHOLDS[nextTier] - customer.lifetimeValue) / 100000)) : 0,
    nextTier,
    lifetimeSpend: customer.lifetimeValue,
    benefits: TIER_BENEFITS[customer.tier],
    transactions: [
      {
        id: `lty-${customer.id}-1`,
        occurredAt: "2026-08-28T10:12:00.000Z",
        type: "EARN",
        points: 486,
        description: "Points earned from order",
        orderCode: "ORD-2026-0841",
      },
      {
        id: `lty-${customer.id}-2`,
        occurredAt: "2026-07-11T14:02:00.000Z",
        type: "REDEEM",
        points: -200,
        description: "Redeemed against order total",
        orderCode: "ORD-2026-0712",
      },
      {
        id: `lty-${customer.id}-3`,
        occurredAt: "2026-06-01T09:00:00.000Z",
        type: "EARN",
        points: 312,
        description: "Points earned from order",
        orderCode: "ORD-2026-0588",
      },
      {
        id: `lty-${customer.id}-4`,
        occurredAt: "2026-01-01T00:00:00.000Z",
        type: "EXPIRE",
        points: -50,
        description: "Points expired after 24 months",
        orderCode: null,
      },
    ],
  };
});

export const findCustomerById = (id: string): Customer | undefined => CUSTOMERS.find((customer) => customer.id === id);

export const findLoyaltyByCustomerId = (customerId: string): LoyaltyAccount | undefined =>
  LOYALTY_ACCOUNTS.find((account) => account.customerId === customerId);
