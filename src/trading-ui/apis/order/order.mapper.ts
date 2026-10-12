import type { ICustomerLookupResult, IOrderCustomerByPhoneItem } from './order.interface';

export function mapOrderCustomerByPhoneItemToLookup(item: IOrderCustomerByPhoneItem, normalizedPhone: string): ICustomerLookupResult {
  const nestedAddress = item.address ?? null;
  const fn = item.firstName?.trim() ?? '';

  return {
    id: item.id,
    firstName: fn || undefined,
    fullName: fn || undefined,
    receiverPhone: item.phone?.trim() || normalizedPhone,
    contactEmail: item.email?.trim() || undefined,
    provinceCode: nestedAddress?.provinceCode ?? undefined,
    provinceName: nestedAddress?.provinceName?.trim() || undefined,
    wardCode: nestedAddress?.wardCode ?? undefined,
    wardName: nestedAddress?.wardName?.trim() || undefined,
    addressLine: nestedAddress?.addressLine?.trim() || undefined,
    tierLabel: 'Khách hàng',
  };
}

/**
 * Mock sync quantity  cho giỏ đơn thủ công.
 * TODO: chuyển sang API thật khi backend mở endpoint patch line.
 */
export const syncManualOrderCartLineQuantity = async (variationId: string, quantity: number): Promise<void> => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('offline');
  }

  void variationId;
  void quantity;

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 280);
  });
};
