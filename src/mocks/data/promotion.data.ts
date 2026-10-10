import type { Promotion, Voucher } from "@/apis/promotion/promotion.interface";

/**
 * Promotion and voucher fixtures. The same codes are configurable in the admin application and
 * redeemable in the storefront checkout, so the two sides demo as one system.
 */
export const PROMOTIONS: Promotion[] = [];

export const VOUCHERS: Voucher[] = [];

export const findVoucherByCode = (code: string): Voucher | undefined =>
  VOUCHERS.find((voucher) => voucher.code.toUpperCase() === code.trim().toUpperCase());
