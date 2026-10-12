import type { FieldOption } from './create-order.interface';
import type { WarehouseOption } from './create-order.interface';

export const SHIPPING_CARRIER_OPTIONS: FieldOption[] = [
  // { value: 'viettelpost', label: 'Viettel Post' },
  { value: 'ghn', label: 'Giao Hàng Nhanh' },
  // { value: 'jtexpress', label: 'J&T Express' },
];

export const WAREHOUSE_OPTIONS: WarehouseOption[] = [
  {
    value: '7f9c6f39-1b6d-4d65-9f34-2e5a9d2d8c10',
    label: 'Kho 1',
    addressLine: '200, Nguyen Van Ba, Thu Duc, TP Ho Chi Minh',
    provinceCode: 79,
    provinceName: 'TP Ho Chi Minh',
    wardCode: 1003580,
    wardName: 'Thu Duc',
    phone: '0919822618',
  },
  {
    value: '9ac7f7cc-0d2f-4d74-8d39-9f271f1f7654',
    label: 'Kho 2',
    addressLine: '12 Nguyen Hue, Quan 1, TP Ho Chi Minh',
    provinceCode: 79,
    provinceName: 'TP Ho Chi Minh',
    wardCode: 1003580,
    wardName: 'Thu Duc',
    phone: '0919822618',
  },
  {
    value: '0f3d7f7f-8c2a-4bda-a8cb-63cb7fbc4a1f',
    label: 'Kho 3',
    addressLine: '12 Nguyen Hue, Quan 1, TP Ho Chi Minh',
    provinceCode: 79,
    provinceName: 'TP Ho Chi Minh',
    wardCode: 1003580,
    wardName: 'Thu Duc',
    phone: '0919822618',
  },
];

export const PROVINCE_SHIPPING_FEE_MOCK_BY_CODE: Record<number, number> = {
  79: 30000, // TP. Ho Chi Minh
  1: 300000, // Ha Noi
};

export const DEFAULT_MOCK_SHIPPING_FEE = 20000;

const normalizeProvinceName = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const resolveMockShippingFeeByProvince = (provinceCode?: number, provinceName?: string): number => {
  if (typeof provinceCode === 'number' && PROVINCE_SHIPPING_FEE_MOCK_BY_CODE[provinceCode] != null) {
    return PROVINCE_SHIPPING_FEE_MOCK_BY_CODE[provinceCode];
  }

  const normalized = normalizeProvinceName(provinceName ?? '');
  if (normalized.includes('ho chi minh')) return 30000;
  if (normalized.includes('ha noi')) return 300000;

  return DEFAULT_MOCK_SHIPPING_FEE;
};
