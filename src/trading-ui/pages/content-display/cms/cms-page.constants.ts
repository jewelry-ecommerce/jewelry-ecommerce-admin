import * as yup from 'yup';
import { MobileOddFullWidthItem, PageDisplayStatus, TargetDevice } from '../../../apis';
import type { CmsPageFormValues } from './cms-page.interface';

export const CMS_PAGE_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const getPageDisplayStatusLabelVi = (status?: PageDisplayStatus): string => {
  switch (status) {
    case PageDisplayStatus.DRAFT:
      return 'Nháp';
    case PageDisplayStatus.SCHEDULED:
      return 'Đã lên lịch';
    case PageDisplayStatus.RUNNING:
      return 'Đang chạy';
    case PageDisplayStatus.PAUSED:
      return 'Tạm dừng';
    case PageDisplayStatus.ENDED:
      return 'Đã kết thúc';
    default:
      return '—';
  }
};

export const CMS_PAGE_DISPLAY_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  ...[PageDisplayStatus.DRAFT, PageDisplayStatus.SCHEDULED, PageDisplayStatus.RUNNING, PageDisplayStatus.ENDED, PageDisplayStatus.PAUSED].map((status) => ({
    value: status,
    label: getPageDisplayStatusLabelVi(status),
  })),
];

export const CMS_PAGE_WIZARD_CONTENT_MAX_WIDTH = 1600;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const cmsPageFormSchema: yup.ObjectSchema<CmsPageFormValues> = yup
  .object({
    name: yup.string().trim().required('Vui lòng nhập tên trang'),
    slug: yup.string().trim().required('Vui lòng nhập đường dẫn trang').matches(SLUG_PATTERN, 'Đường dẫn chỉ dùng chữ thường, số và gạch ngang (ví dụ: san-pham). Không dùng dấu cách hay chữ có dấu.'),
    locale: yup.string().trim().required('Vui lòng chọn ngôn ngữ'),
    isActive: yup.boolean().required(),
    seoTitle: yup.string().trim().required('Vui lòng nhập tiêu đề SEO'),
    seoDescription: yup.string().trim().required('Vui lòng nhập mô tả SEO'),
    seoKeywords: yup.string().trim().required('Vui lòng nhập từ khóa SEO'),
    canonicalUrl: yup.string().trim().optional(),
    seoImageUrl: yup.string().trim().required('Vui lòng chọn ảnh SEO'),
  })
  .required();

export const CMS_PAGE_LOCALE_OPTIONS = [{ value: 'vi-VN', label: 'Tiếng Việt (vi-VN)' }] as const;

export const CMS_PAGE_CREATE_DEFAULT_VALUES: CmsPageFormValues = {
  name: '',
  slug: '',
  locale: 'vi-VN',
  isActive: true,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  canonicalUrl: '',
  seoImageUrl: '',
};

/** Mô tả khối BANNER trong danh mục wizard (thay cho chuỗi kỹ thuật tiếng Anh). */
export const CMS_BANNER_BLOCK_CATALOG_DESCRIPTION = 'Nhập mã vị trí hiển thị để giao diện cửa hàng lấy banner. Các ô nhập và kiểm tra hợp lệ được tạo theo cấu hình loại khối.';

export const CMS_PAGE_TARGET_DEVICE_OPTIONS: { value: TargetDevice; label: string }[] = [
  { value: TargetDevice.ALL, label: 'Tất cả thiết bị' },
  { value: TargetDevice.MOBILE, label: 'Điện thoại' },
  { value: TargetDevice.DESKTOP, label: 'Máy tính' },
];

export const CMS_GRID_MOBILE_ODD_FULL_WIDTH_DEFAULT = MobileOddFullWidthItem.LAST;

export const CMS_GRID_MOBILE_ODD_FULL_WIDTH_OPTIONS: { value: MobileOddFullWidthItem; label: string }[] = [
  { value: MobileOddFullWidthItem.LAST, label: 'Ảnh cuối cùng (mặc định)' },
  { value: MobileOddFullWidthItem.FIRST, label: 'Ảnh đầu tiên' },
];

export const resolveCmsGridMobileOddFullWidthItem = (raw: unknown): MobileOddFullWidthItem =>
  raw === MobileOddFullWidthItem.FIRST ? MobileOddFullWidthItem.FIRST : CMS_GRID_MOBILE_ODD_FULL_WIDTH_DEFAULT;

export const CMS_PAGE_WIZARD_STEPS_CREATE = [
  { id: 'page', title: 'Tạo trang', subtitle: 'Thông tin cơ bản & SEO' },

  { id: 'blocks', title: 'Thêm khối', subtitle: 'Nội dung trang' },
  { id: 'publish', title: 'Xuất bản', subtitle: 'Xem trước & xuất bản' },
] as const;

export const CMS_PAGE_WIZARD_STEPS_EDIT = [
  { id: 'page', title: 'Thông tin trang', subtitle: 'Cơ bản & SEO' },

  { id: 'blocks', title: 'Khối nội dung', subtitle: 'Nội dung trang' },
  { id: 'publish', title: 'Xuất bản', subtitle: 'Xem trước & xuất bản' },
] as const;

export const SCHEDULE_START_REQUIRED_MESSAGE = 'Vui lòng chọn ngày bắt đầu.';
