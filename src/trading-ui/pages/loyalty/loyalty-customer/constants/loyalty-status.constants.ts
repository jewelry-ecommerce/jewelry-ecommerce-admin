import { LoyaltyCustomerStatus, LoyaltyMemberStatus } from '../../../../apis/loyalty/loyalty.enum';

export const LOYALTY_CUSTOMER_STATUS_LABELS: Record<LoyaltyCustomerStatus, string> = {
  [LoyaltyCustomerStatus.ACTIVE]: 'Hoạt động',
  [LoyaltyCustomerStatus.INACTIVE]: 'Ngưng hoạt động',
  [LoyaltyCustomerStatus.MERGED]: 'Đã gộp',
};

export const LOYALTY_MEMBER_STATUS_LABELS: Record<LoyaltyMemberStatus, string> = {
  [LoyaltyMemberStatus.NEW]: 'Chờ kích hoạt',
  [LoyaltyMemberStatus.ACTIVE]: 'Hoạt động',
  [LoyaltyMemberStatus.INACTIVE]: 'Ngưng hoạt động',
  [LoyaltyMemberStatus.SUSPENDED]: 'Tạm khóa',
  [LoyaltyMemberStatus.MERGED]: 'Đã gộp',
};

const normalizeStatus = (status: string) => status.trim().toUpperCase();

export const formatLoyaltyCustomerStatusLabel = (status?: string | null) => {
  if (!status?.trim()) return undefined;
  const normalized = normalizeStatus(status) as LoyaltyCustomerStatus;
  return LOYALTY_CUSTOMER_STATUS_LABELS[normalized] ?? status;
};

export const formatLoyaltyMemberStatusLabel = (status?: string | null) => {
  if (!status?.trim()) return undefined;
  const normalized = normalizeStatus(status) as LoyaltyMemberStatus;
  return LOYALTY_MEMBER_STATUS_LABELS[normalized] ?? status;
};

export const formatLoyaltyStatusLabel = (status?: string | null) => formatLoyaltyMemberStatusLabel(status) ?? formatLoyaltyCustomerStatusLabel(status) ?? status?.trim();
