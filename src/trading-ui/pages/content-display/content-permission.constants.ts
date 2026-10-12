import type { PagePermissionScope } from '../../permissions/page-folder-map';
import { createPageButtonPermission } from '../../permissions/page-button-permission.utils';

/** Tab IAM khớp `dashboard-sidebar.nav.ts` — không dùng `list` chung cho cả menu content. */
export const CONTENT_LABEL_LIST_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'label_list' };
export const CONTENT_LABEL_DISPLAY_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'label_display' };
export const CONTENT_CMS_PAGES_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'cms_pages' };
export const CONTENT_BANNER_SETTINGS_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'banner_settings' };
export const CONTENT_TOP_BANNER_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'top_banner' };
export const CONTENT_LOGO_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'logo' };
export const CONTENT_NAVIGATION_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'navigation' };
export const CONTENT_FOOTER_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'footer' };
export const CONTENT_SEARCH_PINNED_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'search_pinned' };
export const CONTENT_DISCOUNT_LABEL_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'discount_label' };
export const CONTENT_MEDIA_PAGE_SCOPE: PagePermissionScope = { menuCode: 'content', tabCode: 'media' };

/** @deprecated Dùng scope theo tab cụ thể bên trên. */
export const CONTENT_LIST_PAGE_SCOPE: PagePermissionScope = CONTENT_CMS_PAGES_PAGE_SCOPE;

export type ContentButtonPermission = ReturnType<typeof createPageButtonPermission>;

export const contentLabelListButtonPermission = createPageButtonPermission(CONTENT_LABEL_LIST_PAGE_SCOPE);
export const contentLabelDisplayButtonPermission = createPageButtonPermission(CONTENT_LABEL_DISPLAY_PAGE_SCOPE);
export const contentCmsPagesButtonPermission = createPageButtonPermission(CONTENT_CMS_PAGES_PAGE_SCOPE);
export const contentBannerSettingsButtonPermission = createPageButtonPermission(CONTENT_BANNER_SETTINGS_PAGE_SCOPE);
export const contentTopBannerButtonPermission = createPageButtonPermission(CONTENT_TOP_BANNER_PAGE_SCOPE);
export const contentLogoButtonPermission = createPageButtonPermission(CONTENT_LOGO_PAGE_SCOPE);
export const contentNavigationButtonPermission = createPageButtonPermission(CONTENT_NAVIGATION_PAGE_SCOPE);
export const contentFooterButtonPermission = createPageButtonPermission(CONTENT_FOOTER_PAGE_SCOPE);
export const contentSearchPinnedButtonPermission = createPageButtonPermission(CONTENT_SEARCH_PINNED_PAGE_SCOPE);
export const contentDiscountLabelButtonPermission = createPageButtonPermission(CONTENT_DISCOUNT_LABEL_PAGE_SCOPE);
export const contentMediaButtonPermission = createPageButtonPermission(CONTENT_MEDIA_PAGE_SCOPE);

/** @deprecated Dùng helper theo tab: `contentCmsPagesButtonPermission`, `contentLabelListButtonPermission`, ... */
export const contentButtonPermission = contentCmsPagesButtonPermission;
