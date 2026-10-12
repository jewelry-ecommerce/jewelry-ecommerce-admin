import { BrandStatus } from '../../../apis';
import type { ProductBrand, ProductBrandDialogFormValues } from './product-brand.interface';
import * as yup from 'yup';

export const PRODUCT_BRAND_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: BrandStatus.ACTIVE, label: 'Kích hoạt' },
  { value: BrandStatus.INACTIVE, label: 'Vô hiệu hóa' },
] as const;

export type ProductBrandStatusFilter = (typeof PRODUCT_BRAND_STATUS_OPTIONS)[number]['value'];

export const MOCK_PRODUCT_BRANDS: ProductBrand[] = [
  {
    id: 'b4',
    code: 'B4',
    name: 'HEARTLOCK',
    logoUrl: '/images/icon/brand.svg',
    websiteUrl: 'https://dev.trading.sevago.local/',
    status: BrandStatus.ACTIVE,
  },
  {
    id: 'b1',
    code: 'B1',
    name: 'HEARTLOCK',
    logoUrl: '/images/icon/brand.svg',
    websiteUrl: 'https://dev.trading.sevago.local/',
    status: BrandStatus.INACTIVE,
  },
  {
    id: 'b2',
    code: 'B2',
    name: 'HEARTLOCK',
    logoUrl: '/images/icon/brand.svg',
    websiteUrl: 'https://dev.trading.sevago.local/',
    status: BrandStatus.INACTIVE,
  },
  {
    id: 'b3',
    code: 'B3',
    name: 'HEARTLOCK',
    logoUrl: '/images/icon/brand.svg',
    websiteUrl: 'https://dev.trading.sevago.local/',
    status: BrandStatus.INACTIVE,
  },
  {
    id: 'b5',
    code: 'B5',
    name: 'HEARTLOCK',
    logoUrl: '/images/icon/brand.svg',
    websiteUrl: 'https://dev.trading.sevago.local/',
    status: BrandStatus.INACTIVE,
  },
];

const REQUIRED_MESSAGE = 'Trường này không được để trống';
const CODE_LENGTH_MESSAGE = 'Mã thương hiệu phải có đúng 2 ký tự';
export const CODE_FOCUS_HINT = 'Mã thương hiệu phải có đúng 2 ký tự, không bao gồm ký tự đặc biệt và khoảng trắng.';
const URL_INVALID_MESSAGE = 'Định dạng URL không hợp lệ (Vui lòng bao gồm http:// hoặc https://)';

export const brandFormSchema: yup.ObjectSchema<ProductBrandDialogFormValues> = yup
  .object({
    code: yup
      .string()
      .transform((v) => (typeof v === 'string' ? v.trim().toUpperCase() : v))
      .required(REQUIRED_MESSAGE)
      .length(2, CODE_LENGTH_MESSAGE)
      .matches(/^[A-Z0-9]{2}$/, CODE_FOCUS_HINT),
    name: yup.string().trim().required(REQUIRED_MESSAGE).max(255, 'Tên thương hiệu không được quá 255 ký tự'),
    websiteUrl: yup
      .string()
      .transform((v) => (typeof v === 'string' ? v.trim() : v))
      .optional()
      .test('valid-url', URL_INVALID_MESSAGE, (value) => {
        if (!value) return true;
        try {
          const url = new URL(value);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      }),
    description: yup
      .string()
      .transform((v) => (typeof v === 'string' ? v.trim() : v))
      .max(1000, 'Mô tả không được quá 1000 ký tự')
      .optional(),
    logoUrl: yup.string().optional(),
    status: yup.string().oneOf(Object.values(BrandStatus)).required(),
  })
  .required();
