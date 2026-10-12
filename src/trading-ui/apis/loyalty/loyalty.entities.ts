import { type LoyaltyCustomerTenantProfile } from './loyalty.interface';
import { type LoyaltyCustomerStatus } from './loyalty.enum';

export interface LoyaltyCustomer {
  loyaltyCustomerId: string;
  customerCode: string;
  phone?: string | null;
  joinedTenants: string[];
  tenantProfiles: LoyaltyCustomerTenantProfile[];
  registrationChannel: string | null;
  registeredAt: string;
  status: LoyaltyCustomerStatus;
}
