import { axiosRequest } from '../../common/config/axios.config';
import type {
  AdminCreateMemberAddressPayload,
  AdminCreateLoyaltyTierPayload,
  AdminDeleteLoyaltyTierPayload,
  AdminUpdateTenantProfilePayload,
  AdminUpdateMemberAddressPayload,
  // AdminUpdateMemberPhonePayload, // [TẠM COMMENT] logic đổi SĐT loyalty
  AdminUpdateLoyaltyTierPayload,
  ListCustomerActivitiesQuery,
  ListCustomerActivitiesResponse,
  ListLoyaltyCustomersQuery,
  ListLoyaltyCustomersResponse,
  ListLoyaltyTiersResponse,
  ListResourceActivitiesQuery,
  ListResourceActivitiesResponse,
  AdminUpdatePointConfigurationPayload,
  LoyaltyPointConfiguration,
  LoyaltyTier,
  LoyaltyCustomerDetailResponse,
  LoyaltyMemberBenefitsResponse,
  LoyaltyMemberTenantProfileDetail,
  ListMemberHistoryQuery,
  ListMemberPointHistoryQuery,
  ListMemberTierHistoryQuery,
  ListMemberPointHistoryResponse,
  ListMemberTierHistoryResponse,
  LoyaltyMemberPointsTierProgressResponse,
  LoyaltyMemberAddress,
} from './loyalty.interface';

const LOYALTY_ADMIN_PREFIX = 'loyalty/admin';

export const LOYALTY_API_ENDPOINTS = {
  customers: `${LOYALTY_ADMIN_PREFIX}/customers`,
  customerDetail: (customerCode: string) => `${LOYALTY_ADMIN_PREFIX}/customers/${encodeURIComponent(customerCode)}`,
  customerActivities: (customerCode: string) => `${LOYALTY_ADMIN_PREFIX}/customers/${encodeURIComponent(customerCode)}/activities`,
  loyaltyTiers: `${LOYALTY_ADMIN_PREFIX}/loyalty-tiers`,
  loyaltyTier: (tierCode: string) => `${LOYALTY_ADMIN_PREFIX}/loyalty-tiers/${encodeURIComponent(tierCode)}`,
  memberBrandProfile: (memberId: string) => `${LOYALTY_ADMIN_PREFIX}/members/${memberId}/profile`,
  memberPointsTier: (memberId: string) => `${LOYALTY_ADMIN_PREFIX}/members/${memberId}/points-tier-progress`,
  memberBenefits: (memberId: string) => `${LOYALTY_ADMIN_PREFIX}/members/${memberId}/benefits`,
  memberPointsHistory: (memberId: string) => `${LOYALTY_ADMIN_PREFIX}/members/${memberId}/points-history`,
  memberTierHistory: (memberId: string) => `${LOYALTY_ADMIN_PREFIX}/members/${memberId}/tier-history`,
  memberProfile: (memberId: string) => `${LOYALTY_ADMIN_PREFIX}/members/${memberId}/profile`,
  memberStatus: (memberId: string, status: string) => `${LOYALTY_ADMIN_PREFIX}/members/${memberId}/status/${encodeURIComponent(status)}`,
  memberPhone: (memberId: string) => `${LOYALTY_ADMIN_PREFIX}/members/${memberId}/phone`,
  memberAddresses: (memberId: string) => `${LOYALTY_ADMIN_PREFIX}/members/${memberId}/addresses`,
  memberAddress: (memberId: string, addressId: string) => `${LOYALTY_ADMIN_PREFIX}/members/${memberId}/addresses/${addressId}`,
  pointConfig: `${LOYALTY_ADMIN_PREFIX}/point-config`,
  pointConfigActivities: `${LOYALTY_ADMIN_PREFIX}/point-config/activities`,
  loyaltyTierActivities: (tierCode: string) => `${LOYALTY_ADMIN_PREFIX}/loyalty-tiers/${encodeURIComponent(tierCode)}/activities`,
  memberWalletActivities: (memberId: string) => `${LOYALTY_ADMIN_PREFIX}/member-wallets/${memberId}/activities`,
} as const;

export const LOYALTY_API_KEYS = {
  customerList: (query: ListLoyaltyCustomersQuery) => [LOYALTY_API_ENDPOINTS.customers, query] as const,
  customerDetail: (customerCode: string) => [LOYALTY_API_ENDPOINTS.customerDetail(customerCode)] as const,
  customerActivities: (customerCode: string, query: ListCustomerActivitiesQuery) => [LOYALTY_API_ENDPOINTS.customerActivities(customerCode), query] as const,
  loyaltyTiers: () => [LOYALTY_API_ENDPOINTS.loyaltyTiers, { status: 'ACTIVE' }] as const,
  memberBrandProfile: (memberId: string) => [LOYALTY_API_ENDPOINTS.memberBrandProfile(memberId)] as const,
  memberPointsTier: (memberId: string) => [LOYALTY_API_ENDPOINTS.memberPointsTier(memberId)] as const,
  memberBenefits: (memberId: string) => [LOYALTY_API_ENDPOINTS.memberBenefits(memberId)] as const,
  memberPointsHistory: (memberId: string, query: ListMemberHistoryQuery) => [LOYALTY_API_ENDPOINTS.memberPointsHistory(memberId), query] as const,
  memberTierHistory: (memberId: string, query: ListMemberHistoryQuery) => [LOYALTY_API_ENDPOINTS.memberTierHistory(memberId), query] as const,
  pointConfig: (brandCode: string) => [LOYALTY_API_ENDPOINTS.pointConfig, brandCode] as const,
  pointConfigActivities: (brandCode: string, query: ListResourceActivitiesQuery) => [LOYALTY_API_ENDPOINTS.pointConfigActivities, brandCode, query] as const,
  loyaltyTierActivities: (tierCode: string, query: ListResourceActivitiesQuery) => [LOYALTY_API_ENDPOINTS.loyaltyTierActivities(tierCode), query] as const,
  memberWalletActivities: (memberId: string, query: ListResourceActivitiesQuery) => [LOYALTY_API_ENDPOINTS.memberWalletActivities(memberId), query] as const,
} as const;

export const LOYALTY_POINT_CONFIG_ACTIVITIES_PAGE_SIZE = 10;
export const LOYALTY_TIER_ACTIVITIES_PAGE_SIZE = 10;

export const buildPointConfigActivitiesQuery = (page: number): ListResourceActivitiesQuery => ({
  page,
  take: LOYALTY_POINT_CONFIG_ACTIVITIES_PAGE_SIZE,
  orderBy: 'createdAt',
  orderType: 'DESC',
});

export const buildLoyaltyTierActivitiesQuery = (page: number): ListResourceActivitiesQuery => ({
  page,
  take: LOYALTY_TIER_ACTIVITIES_PAGE_SIZE,
  orderBy: 'createdAt',
  orderType: 'DESC',
});

export const LOYALTY_POINT_CONFIG_ACTIVITIES_QUERY = buildPointConfigActivitiesQuery(1);

export const listLoyaltyCustomers = async (query: ListLoyaltyCustomersQuery): Promise<ListLoyaltyCustomersResponse> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.customers, { params: query })) as ListLoyaltyCustomersResponse;

export const getLoyaltyCustomerDetail = async (customerCode: string): Promise<LoyaltyCustomerDetailResponse> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.customerDetail(customerCode))) as LoyaltyCustomerDetailResponse;

export const getLoyaltyCustomerActivities = async (customerCode: string, query: ListCustomerActivitiesQuery = {}): Promise<ListCustomerActivitiesResponse> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.customerActivities(customerCode), {
    params: query,
  })) as ListCustomerActivitiesResponse;

export const listLoyaltyTiers = async (): Promise<LoyaltyTier[]> => {
  const response = (await axiosRequest.get(LOYALTY_API_ENDPOINTS.loyaltyTiers, { params: { status: 'ACTIVE' } })) as ListLoyaltyTiersResponse;
  return response.list ?? [];
};

export const createLoyaltyTier = async (payload: AdminCreateLoyaltyTierPayload): Promise<LoyaltyTier> => (await axiosRequest.post(LOYALTY_API_ENDPOINTS.loyaltyTiers, payload)) as LoyaltyTier;

export const updateLoyaltyTier = async (tierCode: string, payload: AdminUpdateLoyaltyTierPayload): Promise<LoyaltyTier> =>
  (await axiosRequest.put(LOYALTY_API_ENDPOINTS.loyaltyTier(tierCode), payload)) as LoyaltyTier;

export const deleteLoyaltyTier = async (tierCode: string, payload: AdminDeleteLoyaltyTierPayload): Promise<LoyaltyTier> =>
  (await axiosRequest.delete(LOYALTY_API_ENDPOINTS.loyaltyTier(tierCode), { data: payload })) as LoyaltyTier;

export const getMemberBrandProfile = async (memberId: string): Promise<LoyaltyMemberTenantProfileDetail> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.memberBrandProfile(memberId))) as LoyaltyMemberTenantProfileDetail;

export const getMemberPointsTierProgress = async (memberId: string): Promise<LoyaltyMemberPointsTierProgressResponse> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.memberPointsTier(memberId))) as LoyaltyMemberPointsTierProgressResponse;

export const getMemberBenefits = async (memberId: string): Promise<LoyaltyMemberBenefitsResponse> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.memberBenefits(memberId))) as LoyaltyMemberBenefitsResponse;

export const getMemberPointsHistory = async (memberId: string, query: ListMemberPointHistoryQuery): Promise<ListMemberPointHistoryResponse> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.memberPointsHistory(memberId), { params: query })) as ListMemberPointHistoryResponse;

export const getMemberTierHistory = async (memberId: string, query: ListMemberTierHistoryQuery): Promise<ListMemberTierHistoryResponse> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.memberTierHistory(memberId), { params: query })) as ListMemberTierHistoryResponse;

export const updateMemberBrandProfile = async (memberId: string, payload: AdminUpdateTenantProfilePayload): Promise<unknown> =>
  await axiosRequest.patch(LOYALTY_API_ENDPOINTS.memberProfile(memberId), payload);

export const updateMemberStatus = async (memberId: string, status: string, reason: string): Promise<unknown> =>
  await axiosRequest.patch(LOYALTY_API_ENDPOINTS.memberStatus(memberId, status), { reason });

// [TẠM COMMENT] Logic đổi số điện thoại loyalty đang tạm ngưng, bao gồm cả API bên dưới.
// export const updateMemberPhone = async (memberId: string, payload: AdminUpdateMemberPhonePayload): Promise<unknown> => await axiosRequest.patch(LOYALTY_API_ENDPOINTS.memberPhone(memberId), payload);

export const createMemberAddress = async (memberId: string, payload: AdminCreateMemberAddressPayload): Promise<LoyaltyMemberAddress> =>
  (await axiosRequest.post(LOYALTY_API_ENDPOINTS.memberAddresses(memberId), payload)) as LoyaltyMemberAddress;

export const updateMemberAddress = async (memberId: string, addressId: string, payload: AdminUpdateMemberAddressPayload): Promise<LoyaltyMemberAddress> =>
  (await axiosRequest.patch(LOYALTY_API_ENDPOINTS.memberAddress(memberId, addressId), payload)) as LoyaltyMemberAddress;

export const deleteMemberAddress = async (memberId: string, addressId: string): Promise<unknown> => await axiosRequest.delete(LOYALTY_API_ENDPOINTS.memberAddress(memberId, addressId));

export const getPointConfiguration = async (): Promise<LoyaltyPointConfiguration> => (await axiosRequest.get(LOYALTY_API_ENDPOINTS.pointConfig)) as LoyaltyPointConfiguration;

export const updatePointConfiguration = async (payload: AdminUpdatePointConfigurationPayload): Promise<LoyaltyPointConfiguration> =>
  (await axiosRequest.put(LOYALTY_API_ENDPOINTS.pointConfig, payload)) as LoyaltyPointConfiguration;

export const getPointConfigActivities = async (query: ListResourceActivitiesQuery = LOYALTY_POINT_CONFIG_ACTIVITIES_QUERY): Promise<ListResourceActivitiesResponse> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.pointConfigActivities, { params: query })) as ListResourceActivitiesResponse;

export const getLoyaltyTierActivities = async (tierCode: string, query: ListResourceActivitiesQuery): Promise<ListResourceActivitiesResponse> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.loyaltyTierActivities(tierCode), { params: query })) as ListResourceActivitiesResponse;

export const getMemberWalletActivities = async (memberId: string, query: ListResourceActivitiesQuery): Promise<ListResourceActivitiesResponse> =>
  (await axiosRequest.get(LOYALTY_API_ENDPOINTS.memberWalletActivities(memberId), { params: query })) as ListResourceActivitiesResponse;
