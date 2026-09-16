import { ROUTE_PATH } from "@/router/route.path";

/** Keys map to the icon lookup inside `dashboard-sidebar.component.tsx`. */
export type DashboardSidebarIconKey =
  "dashboard" | "catalog" | "set" | "cms" | "order" | "inventory" | "promotion" | "customer" | "inquiry" | "report" | "setting";

export interface DashboardSidebarNavLeaf {
  title: string;
  path: string;
  tabCode: string;
  menuCode?: string;
  relatedPaths?: string[];
}

export interface DashboardSidebarNavGroup {
  title: string;
  icon: DashboardSidebarIconKey;
  menuCode: string;
  path?: string;
  items?: DashboardSidebarNavLeaf[];
}

/** Navigation is limited to the graduation-project scope. */
export const DASHBOARD_SIDEBAR_NAV: DashboardSidebarNavGroup[] = [
  { title: "Tổng quan", icon: "dashboard", menuCode: "dashboard", path: ROUTE_PATH.DASHBOARD },
  {
    title: "Sản phẩm",
    icon: "catalog",
    menuCode: "product",
    path: ROUTE_PATH.PRODUCT_LIST,
    items: [
      {
        title: "Danh sách sản phẩm",
        path: ROUTE_PATH.PRODUCT_LIST,
        tabCode: "list",
        relatedPaths: [ROUTE_PATH.PRODUCT_CREATE, ROUTE_PATH.PRODUCT_DETAIL, ROUTE_PATH.PRODUCT_EDIT],
      },
      { title: "Danh mục", path: ROUTE_PATH.CATEGORY_LIST, tabCode: "category" },
      { title: "Bộ sưu tập", path: ROUTE_PATH.COLLECTION_LIST, tabCode: "collection" },
      {
        title: "Bộ sản phẩm",
        path: ROUTE_PATH.SET_LIST,
        tabCode: "list",
        menuCode: "set",
        relatedPaths: [ROUTE_PATH.SET_CREATE, ROUTE_PATH.SET_DETAIL],
      },
      { title: "Thuộc tính", path: ROUTE_PATH.ATTRIBUTE_LIST, tabCode: "attribute" },
      { title: "Chất liệu", path: ROUTE_PATH.MATERIAL_LIST, tabCode: "material" },
      { title: "Đá quý", path: ROUTE_PATH.GEMSTONE_LIST, tabCode: "gemstone" },
      { title: "Nhập sản phẩm", path: ROUTE_PATH.PRODUCT_IMPORT, tabCode: "import" },
      { title: "Xuất sản phẩm", path: ROUTE_PATH.PRODUCT_EXPORT, tabCode: "export" },
    ],
  },
  {
    title: "Nội dung & hiển thị",
    icon: "cms",
    menuCode: "cms",
    path: ROUTE_PATH.CMS_PAGE_LIST,
    items: [
      {
        title: "Trang nội dung",
        path: ROUTE_PATH.CMS_PAGE_LIST,
        tabCode: "page",
        relatedPaths: [ROUTE_PATH.CMS_PAGE_CREATE, ROUTE_PATH.CMS_PAGE_DETAIL, ROUTE_PATH.CMS_PAGE_EDIT],
      },
      { title: "Banner", path: ROUTE_PATH.CMS_BANNER_LIST, tabCode: "banner" },
      { title: "Điều hướng", path: ROUTE_PATH.CMS_NAVIGATION, tabCode: "navigation" },
    ],
  },
  {
    title: "Đơn hàng",
    icon: "order",
    menuCode: "order",
    path: ROUTE_PATH.ORDER_LIST,
    items: [{ title: "Danh sách đơn hàng", path: ROUTE_PATH.ORDER_LIST, tabCode: "list", relatedPaths: [ROUTE_PATH.ORDER_DETAIL] }],
  },
  {
    title: "Kho vận",
    icon: "inventory",
    menuCode: "inventory",
    path: ROUTE_PATH.INVENTORY_OVERVIEW,
    items: [
      { title: "Tổng quan kho", path: ROUTE_PATH.INVENTORY_OVERVIEW, tabCode: "overview" },
      { title: "Danh sách kho", path: ROUTE_PATH.INVENTORY_WAREHOUSE_LIST, tabCode: "warehouse" },
      { title: "Tồn kho", path: ROUTE_PATH.INVENTORY_STOCK_LIST, tabCode: "stock" },
    ],
  },
  {
    title: "Khuyến mãi",
    icon: "promotion",
    menuCode: "promotion",
    path: ROUTE_PATH.PROMOTION_LIST,
    items: [
      {
        title: "Chương trình khuyến mãi",
        path: ROUTE_PATH.PROMOTION_LIST,
        tabCode: "promotion",
        relatedPaths: [ROUTE_PATH.PROMOTION_CREATE, ROUTE_PATH.PROMOTION_DETAIL],
      },
      {
        title: "Mã giảm giá",
        path: ROUTE_PATH.VOUCHER_LIST,
        tabCode: "voucher",
        relatedPaths: [ROUTE_PATH.VOUCHER_CREATE, ROUTE_PATH.VOUCHER_DETAIL],
      },
    ],
  },
  {
    title: "Khách hàng",
    icon: "customer",
    menuCode: "customer",
    path: ROUTE_PATH.CUSTOMER_LIST,
    items: [
      { title: "Danh sách khách hàng", path: ROUTE_PATH.CUSTOMER_LIST, tabCode: "list", relatedPaths: [ROUTE_PATH.CUSTOMER_DETAIL] },
      { title: "Hạng thành viên", path: ROUTE_PATH.LOYALTY_TIER_LIST, tabCode: "tier", menuCode: "loyalty" },
    ],
  },
  {
    title: "Báo cáo",
    icon: "report",
    menuCode: "report",
    path: ROUTE_PATH.REPORT_SALES,
    items: [
      { title: "Doanh thu", path: ROUTE_PATH.REPORT_SALES, tabCode: "sales" },
      { title: "Đơn hàng", path: ROUTE_PATH.REPORT_ORDERS, tabCode: "orders" },
      { title: "Sản phẩm", path: ROUTE_PATH.REPORT_PRODUCTS, tabCode: "products" },
    ],
  },
  {
    title: "Quản trị hệ thống",
    icon: "setting",
    menuCode: "setting",
    path: ROUTE_PATH.SETTING_GENERAL,
    items: [
      { title: "Cài đặt chung", path: ROUTE_PATH.SETTING_GENERAL, tabCode: "general" },
      { title: "Thông tin cửa hàng", path: ROUTE_PATH.SETTING_STORE, tabCode: "store" },
      { title: "Thanh toán", path: ROUTE_PATH.SETTING_PAYMENT, tabCode: "payment" },
      { title: "Vận chuyển", path: ROUTE_PATH.SETTING_SHIPPING, tabCode: "shipping" },
    ],
  },
];

export const isNavActive = (pathname: string, path: string): boolean => pathname === path || pathname.startsWith(`${path}/`);

export const collectLeafMatchPaths = (leaf: DashboardSidebarNavLeaf): string[] =>
  [leaf.path, ...(leaf.relatedPaths ?? [])].map((path) => path.replace(/\/:[^/]+/g, ""));

export const resolveLeafMenuCode = (group: DashboardSidebarNavGroup, leaf: DashboardSidebarNavLeaf): string =>
  leaf.menuCode ?? group.menuCode;

export const isGroupActive = (pathname: string, group: DashboardSidebarNavGroup): boolean => {
  const paths = [...(group.path ? [group.path] : []), ...(group.items ?? []).flatMap(collectLeafMatchPaths)];
  return paths.some((path) => isNavActive(pathname, path));
};

export const collectNavLeaves = (): { menuCode: string; tabCode: string; matchPaths: string[] }[] =>
  DASHBOARD_SIDEBAR_NAV.flatMap((group) =>
    (group.items ?? []).map((leaf) => ({
      menuCode: resolveLeafMenuCode(group, leaf),
      tabCode: leaf.tabCode,
      matchPaths: collectLeafMatchPaths(leaf),
    })),
  );
