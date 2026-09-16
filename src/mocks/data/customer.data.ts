import type { Customer, LoyaltyAccount, MembershipTier } from "@/apis/customer/customer.interface";
import { buildThumbImage } from "@/utils/media/placeholder.util";

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
export const CUSTOMERS: Customer[] = [
  {
    id: "cus-demo-linh",
    code: "CUS-000148",
    fullName: "Linh Nguyen",
    email: "demo@aurelia.test",
    phone: "0901234567",
    avatar: buildThumbImage("Linh Nguyen", "blush"),
    gender: "FEMALE",
    dateOfBirth: "1995-04-18",
    tier: "GOLD",
    createdAt: "2025-06-14T08:20:00.000Z",
    lifetimeValue: 96400000,
    orderCount: 7,
    notificationPreferences: { orderUpdates: true, promotions: true, newArrivals: false },
    addresses: [
      {
        id: "adr-linh-home",
        fullName: "Linh Nguyen",
        phone: "0901234567",
        line1: "24 Ly Tu Trong, Apartment 8B",
        ward: "Ben Nghe",
        district: "District 1",
        province: "Ho Chi Minh City",
        isDefault: true,
        label: "HOME",
      },
      {
        id: "adr-linh-office",
        fullName: "Linh Nguyen",
        phone: "0987654321",
        line1: "Bitexco Tower, 15th floor",
        ward: "Ben Nghe",
        district: "District 1",
        province: "Ho Chi Minh City",
        isDefault: false,
        label: "OFFICE",
      },
    ],
  },
  {
    id: "cus-minh-tran",
    code: "CUS-000092",
    fullName: "Minh Tran",
    email: "minh.tran@example.test",
    phone: "0912223344",
    avatar: buildThumbImage("Minh Tran", "charcoal"),
    gender: "MALE",
    dateOfBirth: "1990-11-02",
    tier: "DIAMOND",
    createdAt: "2024-11-02T08:20:00.000Z",
    lifetimeValue: 248900000,
    orderCount: 14,
    notificationPreferences: { orderUpdates: true, promotions: false, newArrivals: true },
    addresses: [
      {
        id: "adr-minh-home",
        fullName: "Minh Tran",
        phone: "0912223344",
        line1: "88 Tran Duy Hung",
        ward: "Trung Hoa",
        district: "Cau Giay",
        province: "Hanoi",
        isDefault: true,
        label: "HOME",
      },
    ],
  },
  {
    id: "cus-hoa-pham",
    code: "CUS-000311",
    fullName: "Hoa Pham",
    email: "hoa.pham@example.test",
    phone: "0933445566",
    avatar: null,
    gender: "FEMALE",
    dateOfBirth: null,
    tier: "SILVER",
    createdAt: "2026-02-19T08:20:00.000Z",
    lifetimeValue: 34200000,
    orderCount: 3,
    notificationPreferences: { orderUpdates: true, promotions: true, newArrivals: true },
    addresses: [
      {
        id: "adr-hoa-home",
        fullName: "Hoa Pham",
        phone: "0933445566",
        line1: "12 Nguyen Van Linh",
        ward: "Nam Duong",
        district: "Hai Chau",
        province: "Da Nang",
        isDefault: true,
        label: "HOME",
      },
    ],
  },
  {
    id: "cus-an-le",
    code: "CUS-000420",
    fullName: "An Le",
    email: "an.le@example.test",
    phone: "0977889900",
    avatar: null,
    gender: "OTHER",
    dateOfBirth: null,
    tier: "MEMBER",
    createdAt: "2026-07-30T08:20:00.000Z",
    lifetimeValue: 6900000,
    orderCount: 1,
    notificationPreferences: { orderUpdates: true, promotions: false, newArrivals: false },
    addresses: [],
  },
];

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
