import { buildPageKey } from './page-folder-map';

/** Action content không cần grant IAM — chỉ cần quyền tab cha (vd. `view`). */
const CONTENT_NO_PERMISSION_ACTION_KEYS = new Set<string>([
  // Label display
  'content.label_display.label_display_filter_cancel',
  'content.label_display.label_display_filter_reset',
  'content.label_display.label_display_import_excel',
  'content.label_display.label_display_remove_product',
  'content.label_display.label_display_task_manager',
  'content.label_display.label_display_add_product',
  'content.label_display.label_display_add_product_apply',
  'content.label_display.label_display_add_product_cancel',
  'content.label_display.label_display_apply_category',
  'content.label_display.label_display_filter',
  'content.label_display.label_display_filter_apply',
  // CMS pages
  'content.cms_pages.banner_placement',
  'content.cms_pages.cms_remove_sku',
  'content.cms_pages.add_block',
  'content.cms_pages.continue',
  'content.cms_pages.create_block_type',
  'content.cms_pages.preview',
  'content.cms_pages.preview_block_type',
  'content.cms_pages.publish_back',
  'content.cms_pages.remove_block',
  'content.cms_pages.remove_schema_item',
  'content.cms_pages.save',
  'content.cms_pages.save_draft',
  'content.cms_pages.slug_overwrite',
  'content.cms_pages.slug_restore',
  'content.cms_pages.toggle_block',
  'content.cms_pages.view',
  'content.cms_pages.wizard_back',
  // Banner settings
  'content.banner_settings.add_product_list_banner',
  'content.banner_settings.remove_product_list_banner',
  'content.banner_settings.save_product_list_banner_config',
  // Top banner
  'content.top_banner.top_banner_save',
  // Logo
  'content.logo.logo_save',
  // Navigation
  'content.navigation.navigation_add_child',
  'content.navigation.navigation_add_root',
  'content.navigation.navigation_archive',
  'content.navigation.navigation_save',
  'content.navigation.navigation_select_badge',
  // Footer
  'content.footer.footer_add_link',
  'content.footer.footer_add_social',
  'content.footer.footer_remove_link',
  'content.footer.footer_remove_social',
  'content.footer.footer_save',
  // Search pinned
  'content.search_pinned.search_pinned_add',
  'content.search_pinned.search_pinned_pick_apply',
  'content.search_pinned.search_pinned_pick_cancel',
  'content.search_pinned.search_pinned_pick_product',
  'content.search_pinned.search_pinned_remove',
  'content.search_pinned.search_pinned_save',
  // Media
  'content.media.view',
  'content.media.media_upload',
  'content.media.media_copy_link',
  'content.media.media_open_link',
]);

export const isContentNoPermissionRequiredAction = (menuCode: string, tabCode: string, actionCode: string): boolean => {
  const normalizedAction = actionCode.trim();
  if (!normalizedAction) return false;
  return CONTENT_NO_PERMISSION_ACTION_KEYS.has(`${buildPageKey(menuCode, tabCode)}.${normalizedAction}`);
};
