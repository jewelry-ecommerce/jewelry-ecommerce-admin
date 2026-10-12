import { type BaseEntity, type Pagination, type ResList } from '../../common/constant/api.interface';
import { type LoyaltyCustomer } from './loyalty.entities';
import { type LoyaltyCustomerStatus, type LoyaltyMemberStatus } from './loyalty.enum';

export interface LoyaltyCustomerTenantProfile {
  tenantCode: string;
  memberId: string;
  memberCode?: string | null;
}

export interface LoyaltyMemberAddress extends BaseEntity {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  isDefault: boolean;
  phone?: string;
  receiverPhone?: string;
  addressLine?: string;
  provinceCode?: number;
  provinceName?: string;
  wardCode?: number;
  wardName?: string;
}

export interface LoyaltyMemberGlobalInfo {
  loyaltyCustomerId: string;
  customerCode: string;
  phone: string | null;
  registrationChannel: string | null;
  registeredAt: string;
  joinedTenants: string[];
  status: LoyaltyCustomerStatus;
  mergedIntoLoyaltyCustomerId?: string | null;
}

export type LoyaltyTierStatus = 'ACTIVE' | 'INACTIVE';
export type LoyaltyTierQualificationLogic = 'AND' | 'OR';

export interface LoyaltyTier {
  id: string;
  tenantCode: string;
  tierCode: string;
  tierName: string;
  sortOrder: number;
  minimumSpend: number;
  minimumOrderCount: number;
  qualificationLogic: LoyaltyTierQualificationLogic;
  qualificationPeriodMonths: number | null;
  retentionMinimumSpend: number;
  retentionMinimumOrderCount: number;
  gracePeriodDays: number;
  isInviteOnly: boolean;
  isDefault: boolean;
  description: string | null;
  status: LoyaltyTierStatus;
  multiplier: number;
  memberCount?: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface ListLoyaltyTiersQuery {
  status?: LoyaltyTierStatus;
}

export type ListLoyaltyTiersResponse = ResList<LoyaltyTier>;

export interface AdminCreateLoyaltyTierPayload {
  tierName: string;
  minimumSpend?: number;
  minimumOrderCount?: number;
  qualificationLogic?: LoyaltyTierQualificationLogic;
  qualificationPeriodMonths?: number | null;
  retentionMinimumSpend?: number;
  retentionMinimumOrderCount?: number;
  gracePeriodDays?: number;
  isInviteOnly?: boolean;
  isDefault?: boolean;
  description?: string;
  multiplier?: number;
  status?: LoyaltyTierStatus;
  reason?: string;
}

export interface AdminDeleteLoyaltyTierPayload {
  reason: string;
}

export interface AdminUpdateLoyaltyTierPayload {
  tierName?: string;
  minimumSpend?: number;
  minimumOrderCount?: number;
  qualificationLogic?: LoyaltyTierQualificationLogic;
  qualificationPeriodMonths?: number | null;
  retentionMinimumSpend?: number;
  retentionMinimumOrderCount?: number;
  gracePeriodDays?: number;
  isInviteOnly?: boolean;
  isDefault?: boolean;
  description?: string;
  multiplier?: number;
  status?: LoyaltyTierStatus;
  reason: string;
}

export interface LoyaltyCustomerChangeHistory {
  id?: string;
  action: string;
  actor?: string | null;
  reason?: string | null;
  createdAt?: string;
  date?: string;
  type?: string;
  description?: string;
  payload?: LoyaltyCustomerActivityPayload | null;
}

export interface LoyaltyCustomerActivity extends LoyaltyCustomerChangeHistory {
  memberId: string;
  memberCode?: string | null;
  tenantCode: string;
}

export interface LoyaltyCustomerActivityDiffEntry {
  from?: unknown;
  to?: unknown;
}

export interface LoyaltyCustomerActivityPayload {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  diff?: Record<string, LoyaltyCustomerActivityDiffEntry> | null;
  actor?: string | null;
  reason?: string | null;
  oldPhone?: string;
  newPhone?: string;
  trigger?: string;
  memberId?: string;
  operation?: string;
}

export interface LoyaltyMemberTenantProfileDetail extends LoyaltyCustomerTenantProfile {
  userId: string;
  userType: string;
  phone: string | null;
  email: string | null;
  displayMemberId: string;
  fullName: string | null;
  joinedAt: string;
  status: LoyaltyMemberStatus;
  recordStatus?: string;
  birthday?: string | null;
  gender?: string | null;
  addresses: LoyaltyMemberAddress[];
}

export interface LoyaltyCustomerDetailResponse {
  global: LoyaltyMemberGlobalInfo;
  tenantProfiles: LoyaltyMemberTenantProfileDetail[];
}

export interface ListCustomerActivitiesQuery {
  page?: number;
  take?: number;
  orderBy?: string;
  orderType?: string;
  memberId?: string;
  operation?: string;
}

export interface ListCustomerActivitiesResponse {
  loyaltyCustomerId: string;
  customerCode: string;
  memberIds: string[];
  memberCodes: Array<string | null>;
  list: LoyaltyCustomerActivity[];
  total: number;
  pagination?: Pagination;
}

export interface ListLoyaltyCustomersQuery {
  page: number;
  take: number;
  keyword?: string;
  statuses?: string;
  tenantCodes?: string;
  registrationChannels?: string;
  registeredFrom?: string;
  registeredTo?: string;
}

export type ListLoyaltyCustomersResponse = ResList<LoyaltyCustomer>;

export interface LoyaltyMemberConditionProgress {
  type: string;
  actual: number;
  required: number;
  remaining: number;
  percent: number;
  isCompleted: boolean;
}

export interface LoyaltyMemberTierProgress {
  periodType?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  totalSpend: number;
  totalOrders: number;
  nextTier: string | null;
  nextTierCode?: string | null;
  requiredSpend: number | null;
  remainingSpend: number | null;
  requiredOrderCount: number | null;
  remainingOrderCount: number | null;
  qualificationLogic: LoyaltyTierQualificationLogic | null;
  qualificationPeriodMonths: number | null;
  spendProgress?: LoyaltyMemberConditionProgress | null;
  orderProgress?: LoyaltyMemberConditionProgress | null;
  overallProgressPercent?: number;
  blockingCondition?: string | null;
  isQualifiedForNextTier?: boolean;
  message?: string | null;
}

export interface LoyaltyMemberPointsTierProgressResponse {
  memberId: string;
  memberCode?: string | null;
  currentTier: string;
  currentTierCode?: string | null;
  currentTierExpiresAt?: string | null;
  currentTierQualificationSnapshot?: LoyaltyMemberTierQualificationSnapshot | null;
  points: {
    available: number;
    accumulated: number;
  };
  tierProgress: LoyaltyMemberTierProgress;
  concepts: Array<{
    tenantCode: string;
    tier: string;
    points: number;
    totalSpend: number;
    status?: string;
  }>;
}

export interface ListMemberHistoryQuery {
  page?: number;
  take?: number;
  orderBy?: string;
  orderType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListMemberPointHistoryQuery extends ListMemberHistoryQuery {
  transactionType?: string;
}

export type ListMemberTierHistoryQuery = ListMemberHistoryQuery;

export interface ListMemberPointHistoryResponse {
  memberId: string;
  memberCode?: string | null;
  list: LoyaltyMemberPointTransactionHistory[];
  total: number;
  pagination?: Pagination;
}

export interface LoyaltyMemberTierQualificationStats {
  qualifyingSpend: number;
  qualifyingOrderCount: number;
  periodStart?: string | null;
}

export interface LoyaltyMemberTierQualificationSnapshotTier {
  tierCode: string;
  tierName: string;
  sortOrder: number;
  minimumSpend: number;
  minimumOrderCount: number;
  qualificationLogic?: LoyaltyTierQualificationLogic;
  qualificationPeriodMonths?: number | null;
  multiplier?: number;
}

export interface LoyaltyMemberTierQualificationSnapshot {
  attainedAt: string;
  assignmentType: string;
  tier: LoyaltyMemberTierQualificationSnapshotTier;
  qualificationStats: LoyaltyMemberTierQualificationStats;
  pointConfiguration?: {
    id: string;
    configVersion?: number;
    tierEvaluationPeriod?: string;
    tierDowngradePolicy?: string;
    timezone?: string;
  } | null;
}

/** Mục trong `conceptHistory` khi `type = TIER_CHANGED` (GET /admin/members/{memberId}/tier-history). */
export interface LoyaltyMemberTierHistoryItem {
  type: 'TIER_CHANGED' | 'TIER_ASSIGNED' | string;
  fromTierCode?: string | null;
  fromTierName?: string | null;
  toTierCode?: string | null;
  toTierName?: string | null;
  changedAt: string;
  evaluationPeriod?: string;
  assignmentType?: string | null;
  qualificationSnapshot?: LoyaltyMemberTierQualificationSnapshot;
  tenantCode?: string;
  conceptProfileId?: string;
  status?: string;
  reason?: string | null;
}

export interface ListMemberTierHistoryResponse {
  memberId: string;
  memberCode?: string | null;
  list: LoyaltyMemberTierHistoryItem[];
  total: number;
  pagination?: Pagination;
}

export interface LoyaltyMemberBenefitsResponse {
  memberId: string;
  memberCode?: string | null;
  benefits: Array<{
    id: string;
    benefitCode: string;
    status: string;
    expiresAt?: string | null;
    metadata?: Record<string, unknown> | null;
  }>;
  concepts: Array<{
    tenantCode: string;
    benefits: string[];
    status?: string;
  }>;
}

export interface LoyaltyMemberPointTransactionHistory {
  id: string;
  pointsChanged: number | string;
  direction?: 'DEBIT' | 'CREDIT' | string;
  balanceBefore: number | string;
  balanceAfter: number | string;
  transactionType: string;
  pointEventType?: string;
  componentId?: string | null;
  orderId?: string | null;
  orderCode?: string | null;
  paymentTransactionId?: string | null;
  refundId?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminUpdateTenantProfilePayload {
  fullName?: string;
  email?: string;
  birthday?: string;
  gender?: string | null;
  isSyncAll?: boolean;
  reason: string;
}

export interface AdminUpdateMemberPhonePayload {
  newPhone: string;
  reason: string;
  isSyncAll?: boolean;
}

export interface AdminCreateMemberAddressPayload {
  firstName: string;
  lastName?: string;
  receiverPhone: string;
  receiverEmail?: string;
  addressLine: string;
  wardCode: number;
  wardName: string;
  provinceCode: number;
  provinceName: string;
  isDefault?: boolean;
  note?: string;
}

export type AdminUpdateMemberAddressPayload = Partial<AdminCreateMemberAddressPayload>;

export interface LoyaltyTierPointMultiplierItem {
  tierCode: string;
  tierName: string;
  sortOrder: number;
  minimumSpend: number;
  minimumOrderCount: number;
  multiplier: number;
}

export interface LoyaltyPointConfiguration {
  id: string;
  tenantCode: string;
  isProgramActive: boolean;
  baseConversionAmount: number;
  pointUnit: number;
  isExpiryEnabled: boolean;
  expiryDays: number | null;
  expiryAnchor: string;
  pointConsumptionStrategy: string;
  expiryNotifyBeforeDays: number[];
  isRedemptionEnabled: boolean;
  redemptionPoints: number;
  redemptionValue: number;
  redemptionCurrency: string;
  minimumRedeemPoints: number;
  maximumRedeemPointsPerOrder: number | null;
  redeemStepPoints: number;
  allowedRedemptionChannels: string[];
  isTierQualificationEnabled: boolean;
  tierEvaluationPeriod: string;
  tierDowngradePolicy: string;
  timezone: string;
  configVersion: number;
  tierMultipliers: LoyaltyTierPointMultiplierItem[];
  initialized?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUpdatePointConfigurationPayload {
  isProgramActive?: boolean;
  baseConversionAmount?: number;
  pointUnit?: number;
  isExpiryEnabled?: boolean;
  expiryDays?: number;
  tierMultipliers?: Array<{ tierCode: string; multiplier: number }>;
  reason: string;
}

export interface ListResourceActivitiesQuery {
  page?: number;
  take?: number;
  orderBy?: string;
  orderType?: string;
  operation?: string;
}

export interface ListResourceActivitiesResponse {
  list: Array<Record<string, unknown>>;
  total: number;
  pagination?: Pagination;
}
