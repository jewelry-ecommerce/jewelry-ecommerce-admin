import { DashboardLayout } from "@/layouts/dashboard.layout";
import { lazy } from "react";
const ProductSpuCreatePage = lazy(()=>import("@/trading-ui/pages/product/product-spu/product-spu-create/product-spu-create.page"));
const ProductSpuListPage = lazy(()=>import("@/trading-ui/pages/product/product-spu/product-spu-list/product-spu-list.page"));
const ProductSpuEditPage = lazy(()=>import("@/trading-ui/pages/product/product-spu/product-spu-update/product-spu-update.page"));
const LabelContentListPage=lazy(()=>import('@/trading-ui/pages/content-display/label/label-content/label-content-list/label-content-list.page'));
const LabelContentCreatePage=lazy(()=>import('@/trading-ui/pages/content-display/label/label-content/label-content-create/label-content-create.page'));
const LabelContentDetailPage=lazy(()=>import('@/trading-ui/pages/content-display/label/label-content/label-content-detail/label-content-detail.page'));
const LabelContentUpdatePage=lazy(()=>import('@/trading-ui/pages/content-display/label/label-content/label-content-update/label-content-update.page'));
import { CollectionListPage, CollectionFormPage, CollectionDetailPage, CategoryPage, AttributeListPage, AttributeDetailPage, AttributeEditPage, AttributeCreatePage, CmsDemoPage, CmsBannerPage, DashboardPage, LoginPage, ModuleListPage, NoAccessPage, NotFoundPage } from "@/router/route.lazy-pages";
import { RouteType } from "@/router/route.enum";
import type { AppRoute } from "@/router/route.interface";
import { ROUTE_PATH, type RoutePathKey } from "@/router/route.path";

/** Every dashboard route shares the same shell; only the element differs. */
const dashboardRoute = (path: string, element: AppRoute["element"]): AppRoute => ({
  path,
  type: RouteType.PROTECTED,
  layout: DashboardLayout,
  element,
});

/** Modules whose screens land in a later task. `ModulePlaceholderPage` names itself from the route. */
const placeholderRoute = (path: string): AppRoute => dashboardRoute(path, ModuleListPage);

export const ROUTE: Record<RoutePathKey, AppRoute> = {
  LOGIN: { path: ROUTE_PATH.LOGIN, type: RouteType.PUBLIC, element: LoginPage },

  DASHBOARD: dashboardRoute(ROUTE_PATH.DASHBOARD, DashboardPage),

  // Catalog
  PRODUCT_LIST: dashboardRoute(ROUTE_PATH.PRODUCT_LIST,ProductSpuListPage),
  PRODUCT_CREATE: dashboardRoute(ROUTE_PATH.PRODUCT_CREATE,ProductSpuCreatePage),
  PRODUCT_DETAIL: dashboardRoute(ROUTE_PATH.PRODUCT_DETAIL,ProductSpuEditPage),
  PRODUCT_EDIT: dashboardRoute(ROUTE_PATH.PRODUCT_EDIT,ProductSpuEditPage),
  CATEGORY_LIST: dashboardRoute(ROUTE_PATH.CATEGORY_LIST, CategoryPage),
  COLLECTION_LIST: dashboardRoute(ROUTE_PATH.COLLECTION_LIST, CollectionListPage),
  COLLECTION_CREATE: dashboardRoute(ROUTE_PATH.COLLECTION_CREATE, CollectionFormPage),
  COLLECTION_EDIT: dashboardRoute(ROUTE_PATH.COLLECTION_EDIT, CollectionFormPage),
  COLLECTION_DETAIL: dashboardRoute(ROUTE_PATH.COLLECTION_DETAIL, CollectionDetailPage),
  ATTRIBUTE_LIST: dashboardRoute(ROUTE_PATH.ATTRIBUTE_LIST, AttributeListPage),
  ATTRIBUTE_CREATE: dashboardRoute(ROUTE_PATH.ATTRIBUTE_CREATE, AttributeCreatePage),
  ATTRIBUTE_DETAIL: dashboardRoute(ROUTE_PATH.ATTRIBUTE_DETAIL, AttributeDetailPage),
  ATTRIBUTE_EDIT: dashboardRoute(ROUTE_PATH.ATTRIBUTE_EDIT, AttributeEditPage),
  MATERIAL_LIST: placeholderRoute(ROUTE_PATH.MATERIAL_LIST),
  GEMSTONE_LIST: placeholderRoute(ROUTE_PATH.GEMSTONE_LIST),
  PRODUCT_IMPORT: placeholderRoute(ROUTE_PATH.PRODUCT_IMPORT),
  PRODUCT_EXPORT: placeholderRoute(ROUTE_PATH.PRODUCT_EXPORT),

  // Curated sets
  SET_LIST: placeholderRoute(ROUTE_PATH.SET_LIST),
  SET_CREATE: placeholderRoute(ROUTE_PATH.SET_CREATE),
  SET_DETAIL: placeholderRoute(ROUTE_PATH.SET_DETAIL),

  // CMS
  LABEL_CONTENT_LIST: dashboardRoute(ROUTE_PATH.LABEL_CONTENT_LIST,LabelContentListPage),
  LABEL_CONTENT_CREATE: dashboardRoute(ROUTE_PATH.LABEL_CONTENT_CREATE,LabelContentCreatePage),
  LABEL_CONTENT_DETAIL: dashboardRoute(ROUTE_PATH.LABEL_CONTENT_DETAIL,LabelContentDetailPage),
  LABEL_CONTENT_EDIT: dashboardRoute(ROUTE_PATH.LABEL_CONTENT_EDIT,LabelContentUpdatePage),
  CMS_PAGE_LIST: dashboardRoute(ROUTE_PATH.CMS_PAGE_LIST, CmsDemoPage),
  CMS_PAGE_CREATE: dashboardRoute(ROUTE_PATH.CMS_PAGE_CREATE, CmsDemoPage),
  CMS_PAGE_DETAIL: dashboardRoute(ROUTE_PATH.CMS_PAGE_DETAIL, CmsDemoPage),
  CMS_PAGE_EDIT: dashboardRoute(ROUTE_PATH.CMS_PAGE_EDIT, CmsDemoPage),
  CMS_BANNER_LIST: dashboardRoute(ROUTE_PATH.CMS_BANNER_LIST, CmsBannerPage),
  CMS_NAVIGATION: placeholderRoute(ROUTE_PATH.CMS_NAVIGATION),

  // Orders
  ORDER_LIST: placeholderRoute(ROUTE_PATH.ORDER_LIST),
  ORDER_DETAIL: placeholderRoute(ROUTE_PATH.ORDER_DETAIL),

  // Inventory
  INVENTORY_OVERVIEW: placeholderRoute(ROUTE_PATH.INVENTORY_OVERVIEW),
  INVENTORY_WAREHOUSE_LIST: placeholderRoute(ROUTE_PATH.INVENTORY_WAREHOUSE_LIST),
  INVENTORY_STOCK_LIST: placeholderRoute(ROUTE_PATH.INVENTORY_STOCK_LIST),
  INVENTORY_ADJUSTMENT_LIST: placeholderRoute(ROUTE_PATH.INVENTORY_ADJUSTMENT_LIST),
  INVENTORY_RECEIPT_LIST: placeholderRoute(ROUTE_PATH.INVENTORY_RECEIPT_LIST),
  INVENTORY_MOVEMENT_LIST: placeholderRoute(ROUTE_PATH.INVENTORY_MOVEMENT_LIST),

  // Promotions
  PROMOTION_LIST: placeholderRoute(ROUTE_PATH.PROMOTION_LIST),
  PROMOTION_CREATE: placeholderRoute(ROUTE_PATH.PROMOTION_CREATE),
  PROMOTION_DETAIL: placeholderRoute(ROUTE_PATH.PROMOTION_DETAIL),
  VOUCHER_LIST: placeholderRoute(ROUTE_PATH.VOUCHER_LIST),
  VOUCHER_CREATE: placeholderRoute(ROUTE_PATH.VOUCHER_CREATE),
  VOUCHER_DETAIL: placeholderRoute(ROUTE_PATH.VOUCHER_DETAIL),

  // Customers & loyalty
  CUSTOMER_LIST: placeholderRoute(ROUTE_PATH.CUSTOMER_LIST),
  CUSTOMER_DETAIL: placeholderRoute(ROUTE_PATH.CUSTOMER_DETAIL),
  LOYALTY_OVERVIEW: placeholderRoute(ROUTE_PATH.LOYALTY_OVERVIEW),
  LOYALTY_TIER_LIST: placeholderRoute(ROUTE_PATH.LOYALTY_TIER_LIST),
  STYLIST_CONFIG: placeholderRoute(ROUTE_PATH.STYLIST_CONFIG),

  // Customer service
  INQUIRY_LIST: placeholderRoute(ROUTE_PATH.INQUIRY_LIST),
  INQUIRY_DETAIL: placeholderRoute(ROUTE_PATH.INQUIRY_DETAIL),

  // Reports
  REPORT_SALES: placeholderRoute(ROUTE_PATH.REPORT_SALES),
  REPORT_ORDERS: placeholderRoute(ROUTE_PATH.REPORT_ORDERS),
  REPORT_PRODUCTS: placeholderRoute(ROUTE_PATH.REPORT_PRODUCTS),
  REPORT_INVENTORY: placeholderRoute(ROUTE_PATH.REPORT_INVENTORY),
  REPORT_CUSTOMERS: placeholderRoute(ROUTE_PATH.REPORT_CUSTOMERS),

  // Settings
  SETTING_GENERAL: placeholderRoute(ROUTE_PATH.SETTING_GENERAL),
  SETTING_STORE: placeholderRoute(ROUTE_PATH.SETTING_STORE),
  SETTING_PAYMENT: placeholderRoute(ROUTE_PATH.SETTING_PAYMENT),
  SETTING_SHIPPING: placeholderRoute(ROUTE_PATH.SETTING_SHIPPING),
  SETTING_SEO: placeholderRoute(ROUTE_PATH.SETTING_SEO),
  SETTING_ANALYTICS: placeholderRoute(ROUTE_PATH.SETTING_ANALYTICS),
  SETTING_LIVE_CHAT: placeholderRoute(ROUTE_PATH.SETTING_LIVE_CHAT),

  NO_ACCESS: dashboardRoute(ROUTE_PATH.NO_ACCESS, NoAccessPage),
  NOT_FOUND: dashboardRoute(ROUTE_PATH.NOT_FOUND, NotFoundPage),
};

/** Ordered list consumed by `renderRoutes`. The catch-all must stay last. */
export const APP_ROUTES: AppRoute[] = Object.values(ROUTE);
