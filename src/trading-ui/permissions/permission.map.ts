import { matchPath } from 'react-router-dom';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';

export type RoutePermission = {
  menu: string;
  tab: string;
  action?: string;
};

type RoutePermissionRule = {
  pattern: string;
  permission: RoutePermission;
  end?: boolean;
};

const RULES: RoutePermissionRule[] = [
  // list & detail and CRUD ORDER
  { pattern: ROUTE_PATH.ORDER, permission: { menu: 'order', tab: 'list', action: 'view' } },
  { pattern: ROUTE_PATH.ORDER_CREATE, permission: { menu: 'order', tab: 'list', action: 'create' } },
  { pattern: ROUTE_PATH.ORDER_EDIT, permission: { menu: 'order', tab: 'list', action: 'edit' } },
  { pattern: ROUTE_PATH.ORDER_CLONE, permission: { menu: 'order', tab: 'list', action: 'create' } },
  { pattern: ROUTE_PATH.SHIPPING, permission: { menu: 'order', tab: 'shipping', action: 'view' } },
  { pattern: ROUTE_PATH.EXCHANGE, permission: { menu: 'order', tab: 'returns', action: 'view' } },
  { pattern: ROUTE_PATH.REFUND_PROPOSAL, permission: { menu: 'order', tab: 'refunds', action: 'view' } },
  { pattern: ROUTE_PATH.REFUND_PROPOSAL_DETAIL, permission: { menu: 'order', tab: 'refunds', action: 'open_detail' } },
  { pattern: ROUTE_PATH.PRE_ORDER_CAMPAIGN, permission: { menu: 'order', tab: 'pre_order_campaign', action: 'view' } },
  { pattern: ROUTE_PATH.PRE_ORDER_CAMPAIGN_CREATE, permission: { menu: 'order', tab: 'pre_order_campaign', action: 'create' } },
  { pattern: ROUTE_PATH.PRE_ORDER_CAMPAIGN_STATISTICS, permission: { menu: 'order', tab: 'pre_order_statistics', action: 'view' } },
  { pattern: ROUTE_PATH.PRE_ORDER_CAMPAIGN_STATISTICS_DETAIL, permission: { menu: 'order', tab: 'pre_order_statistics', action: 'open_detail' } },
  { pattern: ROUTE_PATH.PRE_ORDER_CAMPAIGN_DETAIL, permission: { menu: 'order', tab: 'pre_order_campaign', action: 'open_detail' } },
  { pattern: ROUTE_PATH.PRE_ORDER_CAMPAIGN_UPDATE, permission: { menu: 'order', tab: 'pre_order_campaign', action: 'edit' } },
  { pattern: ROUTE_PATH.PRE_ORDER_ORDER, permission: { menu: 'order', tab: 'pre_order_orders', action: 'view' } },
  { pattern: ROUTE_PATH.PRE_ORDER_ORDER_DETAIL, permission: { menu: 'order', tab: 'pre_order_orders', action: 'open_detail' } },
  { pattern: ROUTE_PATH.PRE_ORDER_ORDER_UPDATE, permission: { menu: 'order', tab: 'pre_order_orders', action: 'edit' } },

  // keep generic order detail after specific /order/* routes
  { pattern: ROUTE_PATH.ORDER_DETAIL, permission: { menu: 'order', tab: 'list', action: 'open_detail' } },

  { pattern: ROUTE_PATH.INVOICE_DETAIL, permission: { menu: 'order', tab: 'invoice', action: 'open_detail' } },
  { pattern: ROUTE_PATH.INVOICE, permission: { menu: 'order', tab: 'invoice', action: 'view' } },
  // ------------------------------------------------------------------------------------------------------------------------------------------------------------
  // Product
  { pattern: ROUTE_PATH.PRODUCT_CATEGORY, permission: { menu: 'product', tab: 'category', action: 'view' } },
  { pattern: ROUTE_PATH.PRODUCT_COLLECTION_LIST, permission: { menu: 'product', tab: 'collection', action: 'view' } },
  { pattern: ROUTE_PATH.PRODUCT_COLLECTION_CREATE, permission: { menu: 'product', tab: 'collection', action: 'create' } },
  { pattern: ROUTE_PATH.PRODUCT_COLLECTION_EDIT, permission: { menu: 'product', tab: 'collection', action: 'edit' } },
  { pattern: ROUTE_PATH.PRODUCT_COLLECTION_DETAIL, permission: { menu: 'product', tab: 'collection', action: 'open_detail' } },
  { pattern: ROUTE_PATH.PRODUCT_ATTRIBUTE_LIST, permission: { menu: 'product', tab: 'attributes', action: 'view' } },
  { pattern: ROUTE_PATH.PRODUCT_ATTRIBUTE_CREATE, permission: { menu: 'product', tab: 'attributes', action: 'create' } },
  { pattern: ROUTE_PATH.PRODUCT_ATTRIBUTE_DETAIL, permission: { menu: 'product', tab: 'attributes', action: 'open_detail' } },
  { pattern: ROUTE_PATH.PRODUCT_ATTRIBUTE_UPDATE, permission: { menu: 'product', tab: 'attributes', action: 'edit' } },
  { pattern: ROUTE_PATH.PRODUCT_BRAND, permission: { menu: 'product', tab: 'list', action: 'view' } },
  { pattern: ROUTE_PATH.PRODUCT_REVIEW_LIST, permission: { menu: 'product', tab: 'reviews', action: 'view' } },
  { pattern: ROUTE_PATH.PRODUCT_SPU_LIST, permission: { menu: 'product', tab: 'list', action: 'view' } },
  { pattern: ROUTE_PATH.PRODUCT_SPU_CREATE, permission: { menu: 'product', tab: 'list', action: 'create' } },
  { pattern: ROUTE_PATH.PRODUCT_SPU_DETAIL, permission: { menu: 'product', tab: 'list', action: 'open_detail' } },
  { pattern: ROUTE_PATH.PRODUCT_SPU_UPDATE, permission: { menu: 'product', tab: 'list', action: 'edit' } },
  { pattern: ROUTE_PATH.PRODUCT_SET_LIST, permission: { menu: 'product', tab: 'set', action: 'view' } },
  { pattern: ROUTE_PATH.PRODUCT, permission: { menu: 'product', tab: 'list', action: 'view' }, end: false },

  // Promotion
  { pattern: ROUTE_PATH.PROMOTION_CREATE, permission: { menu: 'promotion', tab: 'list', action: 'create' } },
  { pattern: ROUTE_PATH.PROMOTION_UPDATE, permission: { menu: 'promotion', tab: 'list', action: 'edit' } },
  { pattern: ROUTE_PATH.PROMOTION_DETAIL, permission: { menu: 'promotion', tab: 'list', action: 'open_detail' } },
  { pattern: ROUTE_PATH.PROMOTION_DASHBOARD, permission: { menu: 'promotion', tab: 'dashboard', action: 'view' } },
  { pattern: ROUTE_PATH.PROMOTION_SANDBOX, permission: { menu: 'promotion', tab: 'sandbox', action: 'view' } },
  { pattern: ROUTE_PATH.PROMOTION, permission: { menu: 'promotion', tab: 'list', action: 'view' }, end: false },

  // Warehouse
  { pattern: ROUTE_PATH.WAREHOUSE_INVENTORY, permission: { menu: 'warehouse', tab: 'inventory', action: 'view' } },
  { pattern: ROUTE_PATH.WAREHOUSE_LOCATION_AREA, permission: { menu: 'warehouse', tab: 'layout', action: 'view' } },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PURCHASE_ORDER_CREATE,
    permission: { menu: 'warehouse', tab: 'purchase_order', action: 'create' },
  },
  { pattern: ROUTE_PATH.WAREHOUSE_PURCHASE_ORDER_EDIT, permission: { menu: 'warehouse', tab: 'purchase_order', action: 'edit' } },
  { pattern: ROUTE_PATH.WAREHOUSE_PURCHASE_ORDER, permission: { menu: 'warehouse', tab: 'purchase_order', action: 'view' } },
  { pattern: ROUTE_PATH.WAREHOUSE_PUTAWAY, permission: { menu: 'warehouse', tab: 'putaway', action: 'view' } },
  { pattern: ROUTE_PATH.WAREHOUSE_FULFILLMENT_ORDER, permission: { menu: 'warehouse', tab: 'fulfillment', action: 'view' } },
  { pattern: ROUTE_PATH.WAREHOUSE_PRE_ORDER, permission: { menu: 'warehouse', tab: 'pre_order', action: 'view' } },
  { pattern: ROUTE_PATH.WAREHOUSE_PACKING_STATION, permission: { menu: 'warehouse', tab: 'packing', action: 'view' } },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PACKING_STATION_CHECK_SLIP,
    permission: { menu: 'warehouse', tab: 'packing', action: 'view' },
  },
  { pattern: ROUTE_PATH.WAREHOUSE_HANDOVER, permission: { menu: 'warehouse', tab: 'handover', action: 'view' } },
  {
    pattern: ROUTE_PATH.WAREHOUSE_CYCLE_COUNT_CREATE,
    permission: { menu: 'warehouse', tab: 'cycle_count', action: 'create' },
  },
  {
    pattern: ROUTE_PATH.WAREHOUSE_CYCLE_COUNT_DETAIL,
    permission: { menu: 'warehouse', tab: 'cycle_count', action: 'open_detail' },
  },
  { pattern: ROUTE_PATH.WAREHOUSE_CYCLE_COUNT, permission: { menu: 'warehouse', tab: 'cycle_count', action: 'view' } },
  {
    pattern: ROUTE_PATH.WAREHOUSE_RMA_CREATE,
    permission: { menu: 'warehouse', tab: 'rma', action: 'create' },
  },
  { pattern: ROUTE_PATH.WAREHOUSE_RMA_EDIT, permission: { menu: 'warehouse', tab: 'rma', action: 'edit' } },
  { pattern: ROUTE_PATH.WAREHOUSE_RMA_DETAIL, permission: { menu: 'warehouse', tab: 'rma', action: 'open_detail' } },
  { pattern: ROUTE_PATH.WAREHOUSE_RMA, permission: { menu: 'warehouse', tab: 'rma', action: 'view' } },
  { pattern: ROUTE_PATH.WAREHOUSE_SHIPPING_PACKAGE_CONFIG, permission: { menu: 'warehouse', tab: 'shipping_package', action: 'view' } },
  { pattern: ROUTE_PATH.WAREHOUSE_SYSTEM_CONFIG, permission: { menu: 'warehouse', tab: 'system_config', action: 'view' } },
  { pattern: ROUTE_PATH.WAREHOUSE_TRANSFER_REQUEST_CREATE, permission: { menu: 'warehouse', tab: 'transfer_request', action: 'create' } },
  { pattern: ROUTE_PATH.WAREHOUSE_TRANSFER_REQUEST_EDIT, permission: { menu: 'warehouse', tab: 'transfer_request', action: 'edit' } },
  { pattern: ROUTE_PATH.WAREHOUSE_TRANSFER_REQUEST, permission: { menu: 'warehouse', tab: 'transfer_request', action: 'view' } },
  { pattern: ROUTE_PATH.WAREHOUSE_WAVE_MANAGEMENT, permission: { menu: 'warehouse', tab: 'wave', action: 'view' } },
  { pattern: ROUTE_PATH.WAREHOUSE_PDA_HOME, permission: { menu: 'warehouse', tab: 'pda', action: 'view' } },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PDA_WAVE_PICKING_SCAN_TOTE,
    permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_wave_pick_sku' },
  },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PDA_WAVE_PICKING_ROUTE,
    permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_wave_pick_sku' },
  },
  { pattern: ROUTE_PATH.WAREHOUSE_PDA_WAVE_PICKING, permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_wave_pick_sku' } },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PDA_WAVE_PICKING_BY_ORDER_ROUTE,
    permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_wave_pick_order' },
  },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PDA_WAVE_PICKING_BY_ORDER,
    permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_wave_pick_order' },
  },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PDA_WAVE_PICKING_AUTO_ROUTE,
    permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_wave_pick_auto' },
  },
  { pattern: ROUTE_PATH.WAREHOUSE_PDA_WAVE_PICKING_AUTO, permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_wave_pick_auto' } },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PDA_RMA_VALIDATION,
    permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_rma' },
  },
  { pattern: ROUTE_PATH.WAREHOUSE_PDA_RMA, permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_rma' } },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PDA_INBOUND_QC_SCAN,
    permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_inbound_qc' },
  },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PDA_INBOUND_QC_DETAIL,
    permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_inbound_qc' },
  },
  { pattern: ROUTE_PATH.WAREHOUSE_PDA_INBOUND_QC, permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_inbound_qc' } },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PDA_PUTAWAY_ROUTE,
    permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_putaway' },
  },
  { pattern: ROUTE_PATH.WAREHOUSE_PDA_PUTAWAY, permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_putaway' } },
  { pattern: ROUTE_PATH.WAREHOUSE_PDA_INTERNAL_TRANSFER, permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_internal_transfer' } },
  { pattern: ROUTE_PATH.WAREHOUSE_PDA_QUARANTINE, permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_quarantine' } },
  {
    pattern: ROUTE_PATH.WAREHOUSE_PDA_CYCLE_COUNT_ROUTE,
    permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_cycle_count' },
  },
  { pattern: ROUTE_PATH.WAREHOUSE_PDA_CYCLE_COUNT, permission: { menu: 'warehouse', tab: 'pda', action: 'navigate_cycle_count' } },
  { pattern: ROUTE_PATH.WAREHOUSE, permission: { menu: 'warehouse', tab: 'list', action: 'view' }, end: false },

  // Content
  { pattern: ROUTE_PATH.LABEL_CONTENT_LIST, permission: { menu: 'content', tab: 'label_list', action: 'view' } },
  { pattern: ROUTE_PATH.LABEL_CONTENT_CREATE, permission: { menu: 'content', tab: 'label_list', action: 'label_content_create' } },
  { pattern: ROUTE_PATH.LABEL_CONTENT_DETAIL, permission: { menu: 'content', tab: 'label_list', action: 'label_content_open_detail' } },
  { pattern: ROUTE_PATH.LABEL_CONTENT_UPDATE, permission: { menu: 'content', tab: 'label_list', action: 'label_content_edit' } },
  { pattern: ROUTE_PATH.LABEL_DISPLAY_LIST, permission: { menu: 'content', tab: 'label_display', action: 'view' } },
  { pattern: ROUTE_PATH.LABEL_DISPLAY_CREATE, permission: { menu: 'content', tab: 'label_display', action: 'label_display_create' } },
  { pattern: ROUTE_PATH.LABEL_DISPLAY_DETAIL, permission: { menu: 'content', tab: 'label_display', action: 'label_display_open_detail' } },
  { pattern: ROUTE_PATH.LABEL_DISPLAY_UPDATE, permission: { menu: 'content', tab: 'label_display', action: 'label_display_edit' } },
  { pattern: ROUTE_PATH.CMS_PAGE_LIST, permission: { menu: 'content', tab: 'cms_pages', action: 'view' } },
  { pattern: ROUTE_PATH.CMS_PAGE_CREATE, permission: { menu: 'content', tab: 'cms_pages', action: 'create' } },
  { pattern: ROUTE_PATH.CMS_PAGE_UPDATE, permission: { menu: 'content', tab: 'cms_pages', action: 'edit' } },
  { pattern: ROUTE_PATH.CMS_PAGE_DETAIL, permission: { menu: 'content', tab: 'cms_pages', action: 'open_detail' } },
  { pattern: ROUTE_PATH.SITE_LOGO, permission: { menu: 'content', tab: 'logo', action: 'view' } },
  { pattern: ROUTE_PATH.SITE_TOP_BANNER, permission: { menu: 'content', tab: 'top_banner', action: 'view' } },
  { pattern: ROUTE_PATH.PRODUCT_LIST_BANNER_SETTINGS, permission: { menu: 'content', tab: 'banner_settings', action: 'view' } },
  { pattern: ROUTE_PATH.DISCOUNT_LABEL_SETTINGS, permission: { menu: 'content', tab: 'discount_label', action: 'view' } },
  { pattern: ROUTE_PATH.SITE_FOOTER, permission: { menu: 'content', tab: 'footer', action: 'view' } },
  { pattern: ROUTE_PATH.SITE_NAVIGATION, permission: { menu: 'content', tab: 'navigation', action: 'view' } },
  { pattern: ROUTE_PATH.SEARCH_PINNED_PRODUCTS, permission: { menu: 'content', tab: 'search_pinned', action: 'view' } },
  { pattern: ROUTE_PATH.MEDIA_UPLOAD, permission: { menu: 'content', tab: 'media', action: 'view' } },
  { pattern: ROUTE_PATH.CONTENT, permission: { menu: 'content', tab: 'label_list', action: 'view' }, end: false },

  { pattern: ROUTE_PATH.CRONJOB_SCHEDULER, permission: { menu: 'system', tab: 'scheduler', action: 'view' } },
  { pattern: ROUTE_PATH.IMPORT_EXPORT, permission: { menu: 'import_export', tab: 'list', action: 'view' } },
  { pattern: ROUTE_PATH.IMPORT_EXPORT_DETAIL, permission: { menu: 'import_export', tab: 'list', action: 'view' } },
  { pattern: ROUTE_PATH.OPERATIONS_PROVIDERS, permission: { menu: 'operations', tab: 'providers', action: 'view' } },
  { pattern: ROUTE_PATH.OPERATIONS_POSTGRESQL_UPDATE, permission: { menu: 'operations', tab: 'postgresql_update', action: 'view' } },
  { pattern: ROUTE_PATH.OPERATIONS_POSTGRESQL, permission: { menu: 'operations', tab: 'postgresql', action: 'view' } },
  { pattern: ROUTE_PATH.OPERATIONS_REDIS, permission: { menu: 'operations', tab: 'redis', action: 'view' } },
  { pattern: ROUTE_PATH.OPERATIONS_CONFIG_ENV, permission: { menu: 'operations', tab: 'config_env', action: 'view' } },
  { pattern: ROUTE_PATH.OPERATIONS_HISTORY, permission: { menu: 'operations', tab: 'history', action: 'view' } },
  { pattern: ROUTE_PATH.OPERATIONS, permission: { menu: 'operations', tab: 'providers', action: 'view' } },

  // Customer & Loyalty
  { pattern: ROUTE_PATH.LOYALTY_CUSTOMER_DETAIL, permission: { menu: 'customer', tab: 'list', action: 'view' } },
  { pattern: ROUTE_PATH.CUSTOMER, permission: { menu: 'customer', tab: 'list', action: 'view' } },
  { pattern: ROUTE_PATH.CUSTOMER_REQUEST_BACK_IN_STOCK, permission: { menu: 'customer_request', tab: 'back_in_stock', action: 'view' } },
  { pattern: ROUTE_PATH.CUSTOMER_REQUEST_ORDER_SUPPORT, permission: { menu: 'customer_request', tab: 'order_support', action: 'view' } },
  { pattern: ROUTE_PATH.CUSTOMER_REQUEST_NEWSLETTER, permission: { menu: 'customer_request', tab: 'newsletter', action: 'view' } },
  { pattern: ROUTE_PATH.LOYALTY_MEMBERSHIP_TIER_DETAIL, permission: { menu: 'loyalty', tab: 'membership', action: 'view' } },
  { pattern: ROUTE_PATH.LOYALTY_MEMBERSHIP_TIER, permission: { menu: 'loyalty', tab: 'membership', action: 'view' } },
  { pattern: ROUTE_PATH.LOYALTY_POINT_MANAGEMENT, permission: { menu: 'loyalty', tab: 'points', action: 'view' } },
  { pattern: ROUTE_PATH.REPORT, permission: { menu: 'report', tab: 'da', action: 'view' } },

  // Phân quyền & Tài khoản
  { pattern: ROUTE_PATH.SETTING_PERMISSION_CREATE_ACTION, permission: { menu: 'permission', tab: 'roles', action: 'create_action' } },
  { pattern: ROUTE_PATH.SETTING_PERMISSION, permission: { menu: 'permission', tab: 'roles', action: 'view' } },
  { pattern: ROUTE_PATH.SETTING_ROLES, permission: { menu: 'permission', tab: 'roles', action: 'view' } },
  { pattern: ROUTE_PATH.SETTING_USER_ACCESS, permission: { menu: 'permission', tab: 'user_access', action: 'view' } },
  { pattern: ROUTE_PATH.SETTING_DEPARTMENTS, permission: { menu: 'permission', tab: 'departments', action: 'view' } },
  { pattern: ROUTE_PATH.SETTING_POSITIONS, permission: { menu: 'permission', tab: 'positions', action: 'view' } },
  { pattern: ROUTE_PATH.ACCOUNT_PROFILE, permission: { menu: 'permission', tab: 'profile', action: 'view' } },
  { pattern: ROUTE_PATH.SETTING, permission: { menu: 'permission', tab: 'roles', action: 'view' }, end: false },
  // POS — Quản lý cửa hàng
  { pattern: ROUTE_PATH.POS, permission: { menu: 'warehouse', tab: 'list', action: 'view' } },
  { pattern: ROUTE_PATH.POS_CREATE, permission: { menu: 'warehouse', tab: 'list', action: 'create' } },
  { pattern: ROUTE_PATH.POS_DETAIL, permission: { menu: 'warehouse', tab: 'list', action: 'open_detail' } },
  { pattern: ROUTE_PATH.POS_UPDATE, permission: { menu: 'warehouse', tab: 'list', action: 'edit' } },
  { pattern: ROUTE_PATH.POS_COPY, permission: { menu: 'warehouse', tab: 'list', action: 'clone' } },
  // POS — Quản lý ca bán
  { pattern: ROUTE_PATH.POS_SHIFTS, permission: { menu: 'pos', tab: 'shifts', action: 'view' } },
  { pattern: ROUTE_PATH.POS_SHIFT_DETAIL, permission: { menu: 'pos', tab: 'shifts', action: 'open_detail' } },
];

export const resolveRoutePermission = (pathname: string): RoutePermission | null => {
  for (const rule of RULES) {
    const matched = matchPath({ path: rule.pattern, end: rule.end ?? true }, pathname);
    if (matched) return rule.permission;
  }
  return null;
};
