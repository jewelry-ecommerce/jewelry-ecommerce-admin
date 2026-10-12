import { getRuntimePublicEnv } from './runtime-config';
import { getTenantCodeHeader, getTenantCodes } from './tenant.config';

const parseCommaSeparatedEnvList = (raw: string): string[] =>
  raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const resolvePaymentReturnUrlByTenantIndex = (returnUrls: string[], tenantCode: string): string | undefined => {
  if (returnUrls.length === 0) return undefined;

  const tenantCodes = getTenantCodes();
  const tenantIndex = tenantCodes.indexOf(tenantCode);
  const urlIndex = tenantIndex >= 0 ? tenantIndex : 0;

  return returnUrls[urlIndex] ?? returnUrls[0];
};

/**
 * URL redirect sau thanh toán Payoo — map theo vị trí `VITE_TENANT_CODES` ↔ `VITE_CUSTOMER_PAYMENT_RETURN_URL`.
 * VD: tenant index 0 (B1) → URL index 0.
 */
export const buildCustomerPaymentReturnUrl = (): string => {
  const configuredUrls = parseCommaSeparatedEnvList(getRuntimePublicEnv('VITE_CUSTOMER_PAYMENT_RETURN_URL'));
  const mappedUrl = resolvePaymentReturnUrlByTenantIndex(configuredUrls, getTenantCodeHeader());
  if (mappedUrl) return `${mappedUrl}/don-hang/khach#access=`;

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/don-hang/khach#access=`;
  }

  return '/don-hang/khach#access=';
};
