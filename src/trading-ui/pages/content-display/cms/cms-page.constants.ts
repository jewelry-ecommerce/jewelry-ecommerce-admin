import { MobileOddFullWidthItem } from '../../../apis/banner/banner.enum';
export const CMS_GRID_MOBILE_ODD_FULL_WIDTH_DEFAULT = MobileOddFullWidthItem.LAST;

export const CMS_GRID_MOBILE_ODD_FULL_WIDTH_OPTIONS: { value: MobileOddFullWidthItem; label: string }[] = [
  { value: MobileOddFullWidthItem.LAST, label: 'Ảnh cuối cùng (mặc định)' },
  { value: MobileOddFullWidthItem.FIRST, label: 'Ảnh đầu tiên' },
];

export const resolveCmsGridMobileOddFullWidthItem = (raw: unknown): MobileOddFullWidthItem =>
  raw === MobileOddFullWidthItem.FIRST ? MobileOddFullWidthItem.FIRST : CMS_GRID_MOBILE_ODD_FULL_WIDTH_DEFAULT;
