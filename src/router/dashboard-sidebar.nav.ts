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


/**
 * Cấu hình menu dashboard (cùng domain với router, path luôn lấy từ ROUTE_PATH).
 * `menuCode` / `tabCode` dùng chung cho phân quyền FE và catalog IAM.
 */
export const DASHBOARD_SIDEBAR_NAV: DashboardSidebarNavGroup[] = [
  {
    "title": "Đơn hàng",
    "icon": "shopping_cart",
    "menuCode": "order",
    "path": ROUTE_PATH.ORDER_LIST,
    "items": [
      {
        "title": "Danh sách đơn hàng",
        "path": ROUTE_PATH.ORDER_LIST,
        "tabCode": "list"
      },
      {
        "title": "Vận chuyển & Giao nhận",
        "path": ROUTE_PATH.SHIPPING,
        "tabCode": "shipping"
      },
      {
        "title": "Quản lý đổi/trả",
        "path": ROUTE_PATH.EXCHANGE,
        "tabCode": "returns"
      },
      {
        "title": "Yêu cầu hoàn tiền",
        "path": ROUTE_PATH.REFUND_PROPOSAL,
        "tabCode": "refunds"
      },
      {
        "title": "Đơn đặt trước",
        "tabCode": "pre_order",
        "children": [
          {
            "title": "Cấu hình chương trình",
            "path": ROUTE_PATH.PRE_ORDER_CAMPAIGN,
            "tabCode": "pre_order_campaign",
            "relatedPaths": [
              ROUTE_PATH.PRE_ORDER_CAMPAIGN_CREATE,
              ROUTE_PATH.PRE_ORDER_CAMPAIGN_DETAIL,
              ROUTE_PATH.PRE_ORDER_CAMPAIGN_UPDATE
            ]
          },
          {
            "title": "Thống kê",
            "path": ROUTE_PATH.PRE_ORDER_CAMPAIGN_STATISTICS,
            "tabCode": "pre_order_statistics",
            "relatedPaths": [
              ROUTE_PATH.PRE_ORDER_CAMPAIGN_STATISTICS_DETAIL
            ]
          },
          {
            "title": "Đơn hàng đặt trước",
            "path": ROUTE_PATH.PRE_ORDER_ORDER,
            "tabCode": "pre_order_orders",
            "relatedPaths": [
              ROUTE_PATH.PRE_ORDER_ORDER_DETAIL,
              ROUTE_PATH.PRE_ORDER_ORDER_UPDATE
            ]
          }
        ]
      },
      {
        "title": "Hóa đơn & chứng từ",
        "path": ROUTE_PATH.INVOICE,
        "tabCode": "invoice"
      }
    ]
  },
  {
    "title": "Sản phẩm",
    "icon": "inventory",
    "menuCode": "product",
    "path": ROUTE_PATH.PRODUCT_LIST,
    "items": [
      {
        "title": "Danh mục sản phẩm",
        "tabCode": "product_category",
        "children": [
          {
            "title": "Danh mục",
            "path": ROUTE_PATH.CATEGORY_LIST,
            "tabCode": "category"
          },
          {
            "title": "Bộ sưu tập",
            "path": ROUTE_PATH.COLLECTION_LIST,
            "tabCode": "collection"
          }
        ]
      },
      {
        "title": "Danh sách sản phẩm",
        "path": ROUTE_PATH.PRODUCT_LIST,
        "tabCode": "list"
      },
      {
        "title": "Bộ sản phẩm",
        "path": ROUTE_PATH.SET_LIST,
        "tabCode": "set"
      },
      {
        "title": "Thuộc tính & Bộ lọc",
        "path": ROUTE_PATH.ATTRIBUTE_LIST,
        "tabCode": "attributes"
      },
      {
        "title": "Đánh giá",
        "path": ROUTE_PATH.PRODUCT_REVIEW_LIST,
        "tabCode": "reviews"
      }
    ]
  },
  {
    "title": "Khuyến mãi",
    "icon": "promotion",
    "menuCode": "promotion",
    "path": ROUTE_PATH.PROMOTION_LIST,
    "items": [
      {
        "title": "Chương trình khuyến mãi",
        "path": ROUTE_PATH.PROMOTION_LIST,
        "tabCode": "list"
      },
      {
        "title": "Giả lập khuyến mãi",
        "path": ROUTE_PATH.PROMOTION_SANDBOX,
        "tabCode": "sandbox"
      },
      {
        "title": "Tổng quan khuyến mãi",
        "path": ROUTE_PATH.PROMOTION_DASHBOARD,
        "tabCode": "dashboard"
      }
    ]
  },
  {
    title: 'Kho vận',
    icon: 'warehouse',
    menuCode: 'inventory',
    path: ROUTE_PATH.INVENTORY_STOCK_LIST,
    items: [
      { title: 'Tồn kho', path: ROUTE_PATH.INVENTORY_STOCK_LIST, tabCode: 'stock',
        relatedPaths: [ROUTE_PATH.INVENTORY_OVERVIEW, ROUTE_PATH.INVENTORY_ADJUSTMENT_LIST] },
      { title: 'Lịch sử điều chỉnh', path: ROUTE_PATH.INVENTORY_MOVEMENT_LIST, tabCode: 'movement' },
    ],
  },
  {
    "title": "Yêu cầu khách hàng",
    "icon": "support_agent",
    "menuCode": "customer_request",
    "path": ROUTE_PATH.INQUIRY_LIST,
    "items": [
      {
        "title": "Liên hệ khi có hàng",
        "path": ROUTE_PATH.INQUIRY_LIST,
        "tabCode": "back_in_stock"
      },
      {
        "title": "Hỗ trợ đơn hàng",
        "path": ROUTE_PATH.CUSTOMER_REQUEST_ORDER_SUPPORT,
        "tabCode": "order_support"
      },
      {
        "title": "Đăng ký nhận tin",
        "path": ROUTE_PATH.CUSTOMER_REQUEST_NEWSLETTER,
        "tabCode": "newsletter"
      }
    ]
  },
  {
    "title": "Nội dung & hiển thị",
    "icon": "web",
    "menuCode": "content",
    "path": ROUTE_PATH.CMS_PAGE_LIST,
    "items": [
      {
        "title": "Quản lý label",
        "tabCode": "label_management",
        "children": [
          {
            "title": "Danh sách Labels",
            "path": ROUTE_PATH.LABEL_CONTENT_LIST,
            "tabCode": "label_list"
          },
          {
            "title": "Quản lý hiển thị Labels",
            "path": ROUTE_PATH.LABEL_FLOW_LIST,
            "tabCode": "label_display"
          }
        ]
      },
      {
        "title": "Quản lý trang",
        "tabCode": "page_management",
        "children": [
          {
            "title": "Danh sách trang",
            "path": ROUTE_PATH.CMS_PAGE_LIST,
            "tabCode": "cms_pages"
          },
          {
            "title": "Thiết lập banner",
            "path": ROUTE_PATH.CMS_BANNER_LIST,
            "tabCode": "banner_settings"
          }
        ]
      },
      {
        "title": "Cấu hình hiển thị",
        "tabCode": "display_config",
        "children": [
          {
            "title": "Nhãn giảm giá",
            "path": ROUTE_PATH.DISCOUNT_LABEL_SETTINGS,
            "tabCode": "discount_label"
          }
        ]
      },
      {
        "title": "Quản lý header & footer",
        "tabCode": "header_footer_management",
        "children": [
          {
            "title": "Top banner",
            "path": ROUTE_PATH.SITE_TOP_BANNER,
            "tabCode": "top_banner"
          },
          {
            "title": "Logo",
            "path": ROUTE_PATH.SITE_LOGO,
            "tabCode": "logo"
          },
          {
            "title": "Menu điều hướng",
            "path": ROUTE_PATH.SITE_NAVIGATION,
            "tabCode": "navigation"
          },
          {
            "title": "Footer",
            "path": ROUTE_PATH.SITE_FOOTER,
            "tabCode": "footer"
          },
          {
            "title": "Sản phẩm ô tìm kiếm",
            "path": ROUTE_PATH.SEARCH_PINNED_PRODUCTS,
            "tabCode": "search_pinned"
          }
        ]
      }
    ]
  }
];

export const isNavActive = (pathname: string, path: string): boolean => pathname === path || pathname.startsWith(path + '/');
export const isNavItemWithChildren = (item: DashboardSidebarNavItem): item is DashboardSidebarNavGroupItem => 'children' in item;
export const resolveLeafMenuCode = (group: DashboardSidebarNavGroup, leaf: DashboardSidebarNavLeaf): string => leaf.menuCode ?? group.menuCode;
export const collectLeafMatchPaths = (leaf: DashboardSidebarNavLeaf): string[] => [leaf.path, ...(leaf.relatedPaths ?? [])].map(path => path.replace(/\/:[^/]+/g, ''));
export const collectNavLeaves = () => DASHBOARD_SIDEBAR_NAV.flatMap(group => (group.items ?? []).flatMap(item => isNavItemWithChildren(item) ? item.children : [item]).map(leaf => ({menuCode:resolveLeafMenuCode(group,leaf),tabCode:leaf.tabCode,matchPaths:collectLeafMatchPaths(leaf)})));
