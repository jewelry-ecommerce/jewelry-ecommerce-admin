import type { TenantCode } from '../common/config/tenant.config';
import { getTenantCodes } from '../common/config/tenant.config';
import { ROUTE_PATH } from './route.path';

/** Key khớp map icon trong `dashboard-sidebar.tsx`. */
export type DashboardSidebarIconKey =
  'shopping_cart' | 'inventory' | 'warehouse' | 'storefront' | 'web' | 'receipt' | 'settings' | 'promotion' | 'loyalty' | 'people' | 'account' | 'schedule' | 'support_agent';

export interface DashboardSidebarNavLeaf {
  title: string;
  path: string;
  /** Mã tab phân quyền — đồng bộ với catalog permission. */
  tabCode: string;
  /** Ghi đè menuCode của group — dùng khi gộp nhiều menu IAM trong một mục sidebar. */
  menuCode?: string;
  /** Route con không có mục sidebar riêng nhưng vẫn highlight tab này (vd. trung tâm phân quyền). */
  relatedPaths?: string[];
  /** Ẩn khỏi sidebar UI — vẫn xuất hiện trong catalog phân quyền. */
  hiddenFromNav?: boolean;
}

export type DashboardSidebarNavGroupItem = {
  title: string;
  /** Mã tab cha IAM — đồng bộ catalog permission (vd. `product_category`). */
  tabCode: string;
  children: DashboardSidebarNavLeaf[];
};

/** Mục một cấp (path) hoặc nhóm con (children) — giữ đúng shape UI sidebar. */
export type DashboardSidebarNavItem = { title: string; path: string; tabCode: string; menuCode?: string; relatedPaths?: string[]; hiddenFromNav?: boolean } | DashboardSidebarNavGroupItem;

export interface DashboardSidebarNavGroup {
  title: string;
  icon: DashboardSidebarIconKey;
  /** Mã menu phân quyền — đồng bộ với catalog permission. */
  menuCode: string;
  path?: string;
  items?: DashboardSidebarNavItem[];
}

export type DashboardMenuCatalogItem = {
  menuCode: string;
  name: string;
};

export type DashboardTabCatalogItem = {
  menuCode: string;
  /** Mã tab IAM — 1 cấp `list`, nhiều cấp `product_category.category`. */
  tabCode: string;
  name: string;
  path: string;
};

export type TenantBranchCatalogItem = {
  tenantCode: TenantCode;
  branchCode: string;
  name: string;
};

/**
 * Cấu hình menu dashboard (cùng domain với router, path luôn lấy từ ROUTE_PATH).
 * `menuCode` / `tabCode` dùng chung cho phân quyền FE và catalog IAM.
 */
export const DASHBOARD_SIDEBAR_NAV: DashboardSidebarNavGroup[] = [
  {
    title: 'Đơn hàng',
    icon: 'shopping_cart',
    menuCode: 'order',
    path: ROUTE_PATH.ORDER,
    items: [
      { title: 'Danh sách đơn hàng', path: ROUTE_PATH.ORDER, tabCode: 'list' },
      { title: 'Vận chuyển & Giao nhận', path: ROUTE_PATH.SHIPPING, tabCode: 'shipping' },
      { title: 'Quản lý đổi/trả', path: ROUTE_PATH.EXCHANGE, tabCode: 'returns' },
      { title: 'Yêu cầu hoàn tiền', path: ROUTE_PATH.REFUND_PROPOSAL, tabCode: 'refunds' },
      {
        title: 'Đơn đặt trước',
        tabCode: 'pre_order',
        children: [
          {
            title: 'Cấu hình chương trình',
            path: ROUTE_PATH.PRE_ORDER_CAMPAIGN,
            tabCode: 'pre_order_campaign',
            relatedPaths: [ROUTE_PATH.PRE_ORDER_CAMPAIGN_CREATE, ROUTE_PATH.PRE_ORDER_CAMPAIGN_DETAIL, ROUTE_PATH.PRE_ORDER_CAMPAIGN_UPDATE],
          },
          {
            title: 'Thống kê',
            path: ROUTE_PATH.PRE_ORDER_CAMPAIGN_STATISTICS,
            tabCode: 'pre_order_statistics',
            relatedPaths: [ROUTE_PATH.PRE_ORDER_CAMPAIGN_STATISTICS_DETAIL],
          },
          {
            title: 'Đơn hàng đặt trước',
            path: ROUTE_PATH.PRE_ORDER_ORDER,
            tabCode: 'pre_order_orders',
            relatedPaths: [ROUTE_PATH.PRE_ORDER_ORDER_DETAIL, ROUTE_PATH.PRE_ORDER_ORDER_UPDATE],
          },
        ],
      },
      { title: 'Hóa đơn & chứng từ', path: ROUTE_PATH.INVOICE, tabCode: 'invoice' },
    ],
  },
  {
    title: 'Sản phẩm',
    icon: 'inventory',
    menuCode: 'product',
    path: ROUTE_PATH.PRODUCT,
    items: [
      {
        title: 'Danh mục sản phẩm',
        tabCode: 'product_category',
        children: [
          { title: 'Danh mục', path: ROUTE_PATH.PRODUCT_CATEGORY, tabCode: 'category' },
          { title: 'Bộ sưu tập', path: ROUTE_PATH.PRODUCT_COLLECTION_LIST, tabCode: 'collection' },
        ],
      },
      { title: 'Danh sách sản phẩm', path: ROUTE_PATH.PRODUCT_SPU_LIST, tabCode: 'list' },
      { title: 'Bộ sản phẩm', path: ROUTE_PATH.PRODUCT_SET_LIST, tabCode: 'set' },
      { title: 'Thuộc tính & Bộ lọc', path: ROUTE_PATH.PRODUCT_ATTRIBUTE_LIST, tabCode: 'attributes' },
      { title: 'Đánh giá', path: ROUTE_PATH.PRODUCT_REVIEW_LIST, tabCode: 'reviews' },
    ],
  },
  {
    title: 'Khuyến mãi',
    icon: 'promotion',
    menuCode: 'promotion',
    path: ROUTE_PATH.PROMOTION,
    items: [
      { title: 'Chương trình khuyến mãi', path: ROUTE_PATH.PROMOTION, tabCode: 'list' },
      { title: 'Giả lập khuyến mãi', path: ROUTE_PATH.PROMOTION_SANDBOX, tabCode: 'sandbox' },
      { title: 'Tổng quan khuyến mãi', path: ROUTE_PATH.PROMOTION_DASHBOARD, tabCode: 'dashboard' },
    ],
  },
  {
    title: 'Kho vận',
    icon: 'warehouse',
    menuCode: 'warehouse',
    path: ROUTE_PATH.WAREHOUSE,
    items: [
      {
        title: 'Danh sách kho - cửa hàng',
        path: ROUTE_PATH.POS,
        tabCode: 'list',
        menuCode: 'warehouse',
        relatedPaths: [ROUTE_PATH.POS_CREATE, ROUTE_PATH.POS_DETAIL, ROUTE_PATH.POS_UPDATE, ROUTE_PATH.POS_COPY],
      },
      {
        title: 'Nhập kho',
        tabCode: 'inbound',
        children: [
          { title: 'Phiếu nhập', path: ROUTE_PATH.WAREHOUSE_PURCHASE_ORDER, tabCode: 'purchase_order' },
          { title: 'Cất hàng', path: ROUTE_PATH.WAREHOUSE_PUTAWAY, tabCode: 'putaway' },
        ],
      },
      {
        title: 'Xuất kho',
        tabCode: 'outbound',
        children: [
          { title: 'Đơn đặt trước', path: ROUTE_PATH.WAREHOUSE_PRE_ORDER, tabCode: 'pre_order' },
          { title: 'Phiếu xuất', path: ROUTE_PATH.WAREHOUSE_FULFILLMENT_ORDER, tabCode: 'fulfillment' },
          { title: 'Nhặt hàng', path: ROUTE_PATH.WAREHOUSE_WAVE_MANAGEMENT, tabCode: 'wave' },
          { title: 'Trạm đóng gói', path: ROUTE_PATH.WAREHOUSE_PACKING_STATION, tabCode: 'packing' },
          { title: 'Bàn giao ĐVVC', path: ROUTE_PATH.WAREHOUSE_HANDOVER, tabCode: 'handover' },
        ],
      },
      {
        title: 'Nội bộ',
        tabCode: 'internal',
        children: [
          { title: 'Tồn kho', path: ROUTE_PATH.WAREHOUSE_INVENTORY, tabCode: 'inventory' },
          { title: 'Kiểm kê', path: ROUTE_PATH.WAREHOUSE_CYCLE_COUNT, tabCode: 'cycle_count' },
          { title: 'Điều chuyển giữa kho', path: ROUTE_PATH.WAREHOUSE_TRANSFER_REQUEST, tabCode: 'transfer_request' },
          { title: 'Hàng hoàn', path: ROUTE_PATH.WAREHOUSE_RMA, tabCode: 'rma' },
        ],
      },
      { title: 'PDA', path: ROUTE_PATH.WAREHOUSE_PDA_HOME, tabCode: 'pda', hiddenFromNav: true },
      {
        title: 'Cấu hình',
        tabCode: 'config',
        children: [
          { title: 'Cấu hình Layout', path: ROUTE_PATH.WAREHOUSE_LOCATION_AREA, tabCode: 'layout' },
          { title: 'Cấu hình thùng vận chuyển', path: ROUTE_PATH.WAREHOUSE_SHIPPING_PACKAGE_CONFIG, tabCode: 'shipping_package' },
          { title: 'Cấu hình hệ thống', path: ROUTE_PATH.WAREHOUSE_SYSTEM_CONFIG, tabCode: 'system_config' },
        ],
      },
    ],
  },
  {
    title: 'POS - Bán hàng',
    icon: 'storefront',
    menuCode: 'pos',
    path: ROUTE_PATH.POS_SHIFTS,
    items: [{ title: 'Quản lý Ca bán', path: ROUTE_PATH.POS_SHIFTS, tabCode: 'shifts', relatedPaths: [ROUTE_PATH.POS_SHIFT_DETAIL] }],
  },
  {
    title: 'Khách hàng',
    icon: 'people',
    menuCode: 'customer',
    path: ROUTE_PATH.LOYALTY_CUSTOMER,
    items: [{ title: 'Danh sách khách hàng', path: ROUTE_PATH.LOYALTY_CUSTOMER, tabCode: 'list' }],
  },
  {
    title: 'Yêu cầu khách hàng',
    icon: 'support_agent',
    menuCode: 'customer_request',
    path: ROUTE_PATH.CUSTOMER_REQUEST_BACK_IN_STOCK,
    items: [
      { title: 'Liên hệ khi có hàng', path: ROUTE_PATH.CUSTOMER_REQUEST_BACK_IN_STOCK, tabCode: 'back_in_stock' },
      { title: 'Hỗ trợ đơn hàng', path: ROUTE_PATH.CUSTOMER_REQUEST_ORDER_SUPPORT, tabCode: 'order_support' },
      { title: 'Đăng ký nhận tin', path: ROUTE_PATH.CUSTOMER_REQUEST_NEWSLETTER, tabCode: 'newsletter' },
    ],
  },
  {
    title: 'Chương trình thân thiết',
    icon: 'loyalty',
    menuCode: 'loyalty',
    path: ROUTE_PATH.LOYALTY_MEMBERSHIP_TIER,
    items: [
      { title: 'Hạng thành viên', path: ROUTE_PATH.LOYALTY_MEMBERSHIP_TIER, tabCode: 'membership' },
      { title: 'Điểm thưởng', path: ROUTE_PATH.LOYALTY_POINT_MANAGEMENT, tabCode: 'points' },
    ],
  },
  {
    title: 'Nội dung & hiển thị',
    icon: 'web',
    menuCode: 'content',
    path: ROUTE_PATH.CONTENT,
    items: [
      {
        title: 'Quản lý label',
        tabCode: 'label_management',
        children: [
          { title: 'Danh sách Labels', path: ROUTE_PATH.LABEL_CONTENT_LIST, tabCode: 'label_list' },
          { title: 'Quản lý hiển thị Labels', path: ROUTE_PATH.LABEL_DISPLAY_LIST, tabCode: 'label_display' },
        ],
      },
      {
        title: 'Quản lý trang',
        tabCode: 'page_management',
        children: [
          { title: 'Danh sách trang', path: ROUTE_PATH.CMS_PAGE_LIST, tabCode: 'cms_pages' },
          { title: 'Thiết lập banner', path: ROUTE_PATH.PRODUCT_LIST_BANNER_SETTINGS, tabCode: 'banner_settings' },
        ],
      },
      {
        title: 'Cấu hình hiển thị',
        tabCode: 'display_config',
        children: [{ title: 'Nhãn giảm giá', path: ROUTE_PATH.DISCOUNT_LABEL_SETTINGS, tabCode: 'discount_label' }],
      },
      {
        title: 'Quản lý header & footer',
        tabCode: 'header_footer_management',
        children: [
          { title: 'Top banner', path: ROUTE_PATH.SITE_TOP_BANNER, tabCode: 'top_banner' },
          { title: 'Logo', path: ROUTE_PATH.SITE_LOGO, tabCode: 'logo' },
          { title: 'Menu điều hướng', path: ROUTE_PATH.SITE_NAVIGATION, tabCode: 'navigation' },
          { title: 'Footer', path: ROUTE_PATH.SITE_FOOTER, tabCode: 'footer' },
          { title: 'Sản phẩm ô tìm kiếm', path: ROUTE_PATH.SEARCH_PINNED_PRODUCTS, tabCode: 'search_pinned' },
        ],
      },
      // { title: 'Upload media', path: ROUTE_PATH.MEDIA_UPLOAD, tabCode: 'media' },
    ],
  },
  {
    title: 'Báo cáo',
    icon: 'receipt',
    menuCode: 'report',
    path: ROUTE_PATH.REPORT,
    items: [{ title: 'Anh trai say hi', path: ROUTE_PATH.REPORT, tabCode: 'da' }],
  },
  {
    title: 'Phân quyền & tài khoản',
    icon: 'account',
    menuCode: 'permission',
    path: ROUTE_PATH.SETTING_ROLES,
    items: [
      {
        title: 'Danh sách bộ quyền',
        path: ROUTE_PATH.SETTING_ROLES,
        tabCode: 'roles',
        relatedPaths: [ROUTE_PATH.SETTING_PERMISSION, ROUTE_PATH.SETTING_PERMISSION_CREATE_ACTION],
      },
      {
        title: 'Danh sách tài khoản',
        path: ROUTE_PATH.SETTING_USER_ACCESS,
        tabCode: 'user_access',
        relatedPaths: [ROUTE_PATH.ACCOUNT_PROFILE],
      },
      {
        title: 'Quản lý Phòng ban',
        path: ROUTE_PATH.SETTING_DEPARTMENTS,
        tabCode: 'departments',
      },
      {
        title: 'Quản lý Chức danh',
        path: ROUTE_PATH.SETTING_POSITIONS,
        tabCode: 'positions',
      },
      {
        title: 'Hồ sơ cá nhân',
        path: ROUTE_PATH.ACCOUNT_PROFILE,
        tabCode: 'profile',
        hiddenFromNav: true,
      },
    ],
  },
  {
    title: 'Quản trị hệ thống',
    icon: 'schedule',
    menuCode: 'system',
    path: ROUTE_PATH.CRONJOB_SCHEDULER,
    items: [{ title: 'Quản lý tác vụ ngầm', path: ROUTE_PATH.CRONJOB_SCHEDULER, tabCode: 'scheduler' }],
  },
  {
    title: 'Quản lý tiến trình',
    icon: 'settings',
    menuCode: 'import_export',
    path: ROUTE_PATH.IMPORT_EXPORT_WORKER_QUEUE_PROFILES,
    items: [
      {
        title: 'Cấu hình Import Export',
        path: ROUTE_PATH.IMPORT_EXPORT_WORKER_QUEUE_PROFILES,
        tabCode: 'worker_queue_profiles',
        relatedPaths: [ROUTE_PATH.IMPORT_EXPORT_WORKER_QUEUE_PROFILE_DETAIL],
      },
      {
        title: 'Quản lý tiến trình',
        path: ROUTE_PATH.IMPORT_EXPORT,
        tabCode: 'list',
        relatedPaths: [ROUTE_PATH.IMPORT_EXPORT_DETAIL],
      },
    ],
  },
  {
    title: 'Operations',
    icon: 'settings' as const,
    menuCode: 'operations',
    path: ROUTE_PATH.OPERATIONS,
    items: [
      { title: 'PostgreSQL', path: ROUTE_PATH.OPERATIONS_POSTGRESQL, tabCode: 'postgresql', relatedPaths: [ROUTE_PATH.OPERATIONS_POSTGRESQL_UPDATE] },
      { title: 'Redis', path: ROUTE_PATH.OPERATIONS_REDIS, tabCode: 'redis' },
      { title: 'Config Env', path: ROUTE_PATH.OPERATIONS_CONFIG_ENV, tabCode: 'config_env' },
      { title: 'Operation History', path: ROUTE_PATH.OPERATIONS_HISTORY, tabCode: 'history' },
    ],
  },
];

export const isNavItemWithChildren = (item: DashboardSidebarNavItem): item is DashboardSidebarNavGroupItem => 'children' in item;

/** Menu IAM cũ gộp vào nhóm sidebar tương ứng — chỉ đọc dữ liệu đã seed, không tạo mới. */
const LEGACY_SIDEBAR_GROUP_MENU_CODES: Record<string, string[]> = {
  permission: ['account'],
};

/** Tên IAM cho menu phụ trong nhóm sidebar — không hiển thị riêng trong catalog tạo menu. */
const SECONDARY_MENU_CATALOG_NAMES: Record<string, string> = {};

/** Mọi menuCode IAM thuộc một nhóm sidebar (primary + override trên leaf). */
export const collectSidebarGroupMenuCodes = (group: DashboardSidebarNavGroup): string[] => {
  const codes = new Set<string>([group.menuCode]);
  for (const item of group.items ?? []) {
    if ('path' in item && item.menuCode) codes.add(item.menuCode);
    if ('children' in item) {
      for (const child of item.children) {
        if (child.menuCode) codes.add(child.menuCode);
      }
    }
  }
  return [...codes];
};

export const getSidebarGroupSecondaryMenuCodes = (primaryMenuCode: string): string[] => {
  const group = DASHBOARD_SIDEBAR_NAV.find((entry) => entry.menuCode === primaryMenuCode);
  const fromNav = group ? collectSidebarGroupMenuCodes(group).filter((code) => code !== primaryMenuCode) : [];
  const legacy = LEGACY_SIDEBAR_GROUP_MENU_CODES[primaryMenuCode] ?? [];
  return [...new Set([...fromNav, ...legacy])];
};

export const getPrimaryMenuCodeForSidebarMenu = (menuCode: string): string => {
  for (const [primary, legacyCodes] of Object.entries(LEGACY_SIDEBAR_GROUP_MENU_CODES)) {
    if (legacyCodes.includes(menuCode)) return primary;
  }
  for (const group of DASHBOARD_SIDEBAR_NAV) {
    if (collectSidebarGroupMenuCodes(group).includes(menuCode)) {
      return group.menuCode;
    }
  }
  return menuCode;
};

export const isSecondarySidebarMenuCode = (menuCode: string): boolean => getPrimaryMenuCodeForSidebarMenu(menuCode) !== menuCode;

export const getSidebarGroupCatalogMenuCodes = (primaryMenuCode: string): string[] => {
  const group = DASHBOARD_SIDEBAR_NAV.find((entry) => entry.menuCode === primaryMenuCode);
  const base = group ? collectSidebarGroupMenuCodes(group) : [primaryMenuCode];
  const legacy = LEGACY_SIDEBAR_GROUP_MENU_CODES[primaryMenuCode] ?? [];
  return [...new Set([...base, ...legacy])];
};

export const isSidebarGroupFullyProvisioned = (primaryMenuCode: string, existingMenuCodes: Iterable<string>): boolean => {
  const existing = new Set(existingMenuCodes);
  const group = DASHBOARD_SIDEBAR_NAV.find((entry) => entry.menuCode === primaryMenuCode);
  if (!group) return existing.has(primaryMenuCode);
  return collectSidebarGroupMenuCodes(group).every((code) => existing.has(code));
};

export const getSecondaryMenuCatalogItems = (primaryMenuCode: string): DashboardMenuCatalogItem[] => {
  const group = DASHBOARD_SIDEBAR_NAV.find((entry) => entry.menuCode === primaryMenuCode);
  if (!group) return [];
  return collectSidebarGroupMenuCodes(group)
    .filter((code) => code !== primaryMenuCode)
    .map((menuCode) => ({
      menuCode,
      name: SECONDARY_MENU_CATALOG_NAMES[menuCode] ?? menuCode,
    }));
};

/** Slug fallback khi nav group chưa khai báo `tabCode`. */
export const toSidebarGroupTabCode = (title: string): string =>
  title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

/** Ưu tiên `tabCode` khai báo trong nav; fallback slug từ title. */
export const resolveSidebarGroupTabCode = (item: { title: string; tabCode?: string }): string => item.tabCode?.trim() || toSidebarGroupTabCode(item.title);

/** Toàn bộ tab từ sidebar — mã chấm phân cấp trong `tabCode`. */
export const getDashboardTabCatalogEntries = (groups: DashboardSidebarNavGroup[] = DASHBOARD_SIDEBAR_NAV): DashboardTabCatalogItem[] => {
  const results: DashboardTabCatalogItem[] = [];

  for (const group of groups) {
    if (!group.items?.length) {
      results.push({
        menuCode: group.menuCode,
        tabCode: 'list',
        name: group.title,
        path: group.path ?? '',
      });
      continue;
    }

    for (const item of group.items) {
      if (isNavItemWithChildren(item)) {
        const groupTabCode = resolveSidebarGroupTabCode(item);
        results.push({
          menuCode: group.menuCode,
          tabCode: groupTabCode,
          name: item.title,
          path: '',
        });
        for (const child of item.children) {
          results.push({
            menuCode: child.menuCode ?? group.menuCode,
            tabCode: `${groupTabCode}.${child.tabCode}`,
            name: child.title,
            path: child.path,
          });
        }
      } else {
        results.push({
          menuCode: item.menuCode ?? group.menuCode,
          tabCode: item.tabCode,
          name: item.title,
          path: item.path,
        });
      }
    }
  }

  return results;
};

/** @deprecated Dùng getDashboardTabCatalogEntries. */
export const flattenDashboardSidebarTabs = (groups: DashboardSidebarNavGroup[] = DASHBOARD_SIDEBAR_NAV): DashboardTabCatalogItem[] => getDashboardTabCatalogEntries(groups);

/** Brand code = tenant code như khai báo trong VITE_TENANT_CODES. */
export const getBranchCodeFromTenant = (tenantCode: TenantCode | string): string => String(tenantCode).trim().toUpperCase();

export const formatTenantBranchName = (tenantCode: TenantCode): string => tenantCode.replace(/-/g, ' ');

export const getTenantBranchCatalog = (): TenantBranchCatalogItem[] =>
  getTenantCodes().map((tenantCode) => ({
    tenantCode,
    branchCode: getBranchCodeFromTenant(tenantCode),
    name: formatTenantBranchName(tenantCode),
  }));

/** Catalog tạo menu — 1 mục / nhóm sidebar. */
export const getDashboardMenuCatalog = (): DashboardMenuCatalogItem[] =>
  DASHBOARD_SIDEBAR_NAV.map((group) => ({
    menuCode: group.menuCode,
    name: group.title,
  }));

export const findDashboardMenuCatalogItem = (menuCode: string): DashboardMenuCatalogItem | undefined => getDashboardMenuCatalog().find((item) => item.menuCode === menuCode);

export const getDashboardTabsForMenu = (menuCode: string): DashboardTabCatalogItem[] => getDashboardTabCatalogEntries().filter((tab) => tab.menuCode === menuCode);

/** Tab con trực tiếp của `parentTabCode` (vd. `product_category` → `product_category.category`). */
export const isDirectChildTabCode = (parentTabCode: string, tabCode: string): boolean => {
  const parent = parentTabCode.trim();
  if (!parent) return false;
  const prefix = `${parent}.`;
  if (!tabCode.startsWith(prefix)) return false;
  const remainder = tabCode.slice(prefix.length);
  return remainder.length > 0 && !remainder.includes('.');
};

export const getDashboardChildTabsForMenu = (menuCode: string, parentTabCode: string): DashboardTabCatalogItem[] =>
  getDashboardTabCatalogEntries().filter((item) => item.menuCode === menuCode && isDirectChildTabCode(parentTabCode, item.tabCode));

export const getRemainingChildTabsForMenu = (menuCode: string, parentTabCode: string, existingTabCodes: Iterable<string>): DashboardTabCatalogItem[] => {
  const existing = new Set(existingTabCodes);
  return getDashboardChildTabsForMenu(menuCode, parentTabCode).filter((item) => !existing.has(item.tabCode));
};

export const hasRemainingChildTabsInCatalog = (menuCode: string, parentTabCode: string, existingTabCodes: Iterable<string>): boolean =>
  getRemainingChildTabsForMenu(menuCode, parentTabCode, existingTabCodes).length > 0;

export const findDashboardTabCatalogEntry = (menuCode: string, tabCode: string): DashboardTabCatalogItem | undefined => {
  const primaryMenuCode = getPrimaryMenuCodeForSidebarMenu(menuCode);
  const menuCodes = getSidebarGroupCatalogMenuCodes(primaryMenuCode);
  return getDashboardTabCatalogEntries().find((item) => menuCodes.includes(item.menuCode) && item.tabCode === tabCode);
};
