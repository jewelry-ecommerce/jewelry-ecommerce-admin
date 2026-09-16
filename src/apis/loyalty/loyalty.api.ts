import type { LoyaltyAccount, MembershipTier } from "@/apis/customer/customer.interface";
import type {
  LoyaltyAccountListQuery,
  LoyaltyAccountRow,
  LoyaltyAdjustmentResult,
  LoyaltyPointAdjustmentPayload,
  MembershipTierRow,
  StylistConfig,
} from "@/apis/loyalty/loyalty.interface";
import type { Paginated } from "@/apis/product/product.interface";
import { apiRequest } from "@/apis/transport";
import {
  CUSTOMERS,
  findCustomerById,
  findLoyaltyByCustomerId,
  LOYALTY_ACCOUNTS,
  MEMBERSHIP_TIER_LABELS,
  MEMBERSHIP_TIER_THRESHOLDS,
} from "@/mocks/data/customer.data";
import { cloneDeep, matchesSearch, MockApiError, normalizeSearch, paginate, withLatency } from "@/mocks/mock-transport";

/** Mutable stylist configuration so the settings screen reflects saves within a session. */
const STYLIST_CONFIG: StylistConfig = {
  isEnabled: true,
  maxSuggestions: 6,
  tone: "CLASSIC",
  budgetBands: [
    { label: "Under 10M", minPrice: 0, maxPrice: 10000000 },
    { label: "10M – 30M", minPrice: 10000000, maxPrice: 30000000 },
    { label: "30M – 80M", minPrice: 30000000, maxPrice: 80000000 },
    { label: "Above 80M", minPrice: 80000000, maxPrice: 0 },
  ],
  promptTemplate: "Suggest {count} pieces for a {occasion} within {budget}, favouring {material}.",
  fallbackCollectionSlug: "bridal-heritage",
};

const toLoyaltyRow = (account: LoyaltyAccount): LoyaltyAccountRow => {
  const customer = findCustomerById(account.customerId);
  return {
    customerId: account.customerId,
    customerCode: customer?.code ?? "—",
    customerName: customer?.fullName ?? "—",
    tier: account.tier,
    pointBalance: account.pointBalance,
    pointsToNextTier: account.pointsToNextTier,
    nextTier: account.nextTier,
    lifetimeSpend: account.lifetimeSpend,
    transactionCount: account.transactions.length,
  };
};

/** GET admin/loyalty/accounts */
export const getLoyaltyAccountList = (query: LoyaltyAccountListQuery = {}): Promise<Paginated<LoyaltyAccountRow>> =>
  apiRequest({
    method: "GET",
    path: "admin/loyalty/accounts",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const search = normalizeSearch(query.search);
        const matched = LOYALTY_ACCOUNTS.filter((account) => {
          if (query.tier && account.tier !== query.tier) return false;
          const customer = findCustomerById(account.customerId);
          return matchesSearch([customer?.fullName, customer?.code, customer?.email], search);
        });
        const page = paginate(matched, query.page ?? 1, query.take ?? 20);
        return { ...page, list: page.list.map(toLoyaltyRow) };
      }),
  });

/** GET admin/loyalty/accounts/{customerId} */
export const getLoyaltyAccount = (customerId: string): Promise<LoyaltyAccount> =>
  apiRequest({
    method: "GET",
    path: `admin/loyalty/accounts/${encodeURIComponent(customerId)}`,
    mock: () =>
      withLatency(() => {
        const account = findLoyaltyByCustomerId(customerId);
        if (!account) throw new MockApiError("LOYALTY_ACCOUNT_NOT_FOUND", `No loyalty account matches the customer ${customerId}.`, 404);
        return cloneDeep(account);
      }),
  });

/** POST admin/loyalty/accounts/{customerId}/adjustments */
export const adjustLoyaltyPoints = ({ customerId, points, description }: LoyaltyPointAdjustmentPayload): Promise<LoyaltyAdjustmentResult> =>
  apiRequest({
    method: "POST",
    path: `admin/loyalty/accounts/${encodeURIComponent(customerId)}/adjustments`,
    body: { points, description },
    mock: () =>
      withLatency(() => {
        const account = findLoyaltyByCustomerId(customerId);
        if (!account) throw new MockApiError("LOYALTY_ACCOUNT_NOT_FOUND", `No loyalty account matches the customer ${customerId}.`, 404);
        if (points === 0)
          throw new MockApiError("LOYALTY_ADJUSTMENT_ZERO", "An adjustment must credit or debit a non-zero number of points.", 422);
        if (account.pointBalance + points < 0) {
          throw new MockApiError("LOYALTY_BALANCE_NEGATIVE", `The balance would fall below zero (current ${account.pointBalance}).`, 422);
        }

        account.pointBalance += points;
        const transaction = {
          id: `lty-${customerId}-adj${account.transactions.length + 1}`,
          occurredAt: new Date().toISOString(),
          type: "ADJUST" as const,
          points,
          description,
          orderCode: null,
        };
        account.transactions.unshift(transaction);
        return { account: cloneDeep(account), transaction: cloneDeep(transaction) };
      }),
  });

/** GET admin/loyalty/tiers */
export const getMembershipTierList = (): Promise<MembershipTierRow[]> =>
  apiRequest({
    method: "GET",
    path: "admin/loyalty/tiers",
    mock: () =>
      withLatency(() =>
        (Object.keys(MEMBERSHIP_TIER_LABELS) as MembershipTier[]).map((tier) => ({
          tier,
          label: MEMBERSHIP_TIER_LABELS[tier],
          threshold: MEMBERSHIP_TIER_THRESHOLDS[tier],
          memberCount: CUSTOMERS.filter((customer) => customer.tier === tier).length,
          benefits: LOYALTY_ACCOUNTS.find((account) => account.tier === tier)?.benefits ?? [],
        })),
      ),
  });

/** GET admin/loyalty/stylist-config */
export const getStylistConfig = (): Promise<StylistConfig> =>
  apiRequest({
    method: "GET",
    path: "admin/loyalty/stylist-config",
    mock: () => withLatency(() => cloneDeep(STYLIST_CONFIG)),
  });

/** PUT admin/loyalty/stylist-config */
export const updateStylistConfig = (payload: StylistConfig): Promise<StylistConfig> =>
  apiRequest({
    method: "PUT",
    path: "admin/loyalty/stylist-config",
    body: payload,
    mock: () =>
      withLatency(() => {
        if (payload.maxSuggestions < 1)
          throw new MockApiError("STYLIST_SUGGESTIONS_INVALID", "The stylist must return at least one suggestion.", 422);
        Object.assign(STYLIST_CONFIG, payload);
        return cloneDeep(STYLIST_CONFIG);
      }),
  });
