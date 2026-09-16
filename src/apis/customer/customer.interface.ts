/** Customer + loyalty contract mirroring `jewelry-commerce-client/src/utils/api/customer/customer.interface.ts`. */
export type MembershipTier = "MEMBER" | "SILVER" | "GOLD" | "DIAMOND";

export type CustomerAddress = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  label: "HOME" | "OFFICE" | "OTHER";
};

export type LoyaltyTransaction = {
  id: string;
  occurredAt: string;
  type: "EARN" | "REDEEM" | "EXPIRE" | "ADJUST";
  points: number;
  description: string;
  orderCode: string | null;
};

export type LoyaltyAccount = {
  customerId: string;
  tier: MembershipTier;
  pointBalance: number;
  pointsToNextTier: number;
  nextTier: MembershipTier | null;
  lifetimeSpend: number;
  benefits: string[];
  transactions: LoyaltyTransaction[];
};

export type Customer = {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  dateOfBirth: string | null;
  tier: MembershipTier;
  addresses: CustomerAddress[];
  createdAt: string;
  lifetimeValue: number;
  orderCount: number;
  notificationPreferences: {
    orderUpdates: boolean;
    promotions: boolean;
    newArrivals: boolean;
  };
};

/* ------------------------------------------------------------------------------------------------
 * Admin-side contracts
 * ---------------------------------------------------------------------------------------------- */

export type CustomerRow = {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
  tier: MembershipTier;
  pointBalance: number;
  orderCount: number;
  lifetimeValue: number;
  createdAt: string;
};

export type CustomerListQuery = {
  page?: number;
  take?: number;
  search?: string;
  tier?: MembershipTier;
};

export type CustomerDetail = {
  customer: Customer;
  loyalty: LoyaltyAccount | null;
  recentOrderCodes: string[];
};

export type CustomerNotePayload = {
  customerId: string;
  note: string;
};
