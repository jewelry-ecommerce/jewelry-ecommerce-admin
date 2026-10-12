import type { CmsNavigationBadgeDesignType, CmsNavigationType } from '../../../../apis';
import type { NavigationFormState } from './site-navigation.interface';

export const NAVIGATION_TREE_KEY = 'cms/admin/navigations';
export const NAVIGATION_PUBLISH_STATUS_KEY = 'cms/admin/navigations/publish-status';

export const MENU_IMAGE_ACCEPT = 'image/*';
export const BADGE_IMAGE_ACCEPT = 'image/*';
export const MENU_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const BADGE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const DEFAULT_FORM: NavigationFormState = {
  type: 'NONE',
  label: '',
  targetId: '',
  url: '',
  image: '',
  openInNewTab: false,
  showOnMenuPopup: true,
  showOnPlp: true,
  badgeEnabled: false,
  badgeId: '',
  badgeDesignType: 'TEXT',
  badgeDisplayText: '',
  badgeBackgroundColor: '#E53935',
  badgeTextColor: '#FFFFFF',
  badgeImageUrl: '',
  badgeStartTime: null,
  badgeEndTime: null,
};

export const TARGET_TYPE_OPTIONS: Array<{ value: CmsNavigationType; label: string }> = [
  { value: 'NONE', label: 'Không điều hướng' },
  { value: 'CATEGORY', label: 'Danh mục sản phẩm' },
  { value: 'PAGE', label: 'Trang nội dung' },
  { value: 'LINK', label: 'Đường dẫn thủ công' },
];

export const BADGE_TYPE_OPTIONS: Array<{ value: CmsNavigationBadgeDesignType; label: string }> = [
  { value: 'TEXT', label: 'Nhãn chữ' },
  { value: 'IMAGE', label: 'Hình ảnh' },
];

export const MISSING_PAGE_TARGET_OPTION_LABEL = 'Trang không tồn tại — vui lòng chọn lại';
export const MISSING_CATEGORY_TARGET_OPTION_LABEL = 'Danh mục không tồn tại — vui lòng chọn lại';
