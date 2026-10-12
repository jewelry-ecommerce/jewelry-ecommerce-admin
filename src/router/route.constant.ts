import { DashboardLayout } from "@/layouts/dashboard.layout";
import { lazy } from "react";
const SourceShipping=lazy(()=>import('@/trading-ui/pages/shipping/shipping.page'));
const SourceRefundList=lazy(()=>import('@/trading-ui/pages/refund-proposal/refund-proposal-list/refund-proposal-list.page'));
const SourceRefundDetail=lazy(()=>import('@/trading-ui/pages/refund-proposal/refund-proposal-detail/refund-proposal-detail.page'));
const SourceInvoiceList=lazy(()=>import('@/trading-ui/pages/invoice/invoice-documents-list.page'));
const SourceInvoiceDetail=lazy(()=>import('@/trading-ui/pages/invoice/invoice-document-detail/invoice-document-detail.page'));
const SourceExchange=lazy(()=>import('@/trading-ui/pages/order/returns-exchanges/returns-exchanges-root.page'));
const SourcePROMOTION_UPDATE=lazy(()=>import("@/trading-ui/pages/promotion/promotion-update.page"));
const SourceORDER_CLONE=lazy(()=>import("@/trading-ui/pages/order/create-order/edit/clone-order.page"));
const SourceORDER_EDIT=lazy(()=>import("@/trading-ui/pages/order/create-order/edit/edit-order.page"));
const SourceORDER_CREATE=lazy(()=>import("@/trading-ui/pages/order/create-order/create-order.page"));
const SourcePREORDERCAMPAIGN=lazy(()=>import('@/trading-ui/pages/order/pre-order-campaign/pre-order-campaign-list/pre-order-campaign-list.page'));
const SourcePREORDERCAMPAIGNCREATE=lazy(()=>import('@/trading-ui/pages/order/pre-order-campaign/pre-order-campaign-create/pre-order-campaign-create.page'));
const SourcePREORDERCAMPAIGNDETAIL=lazy(()=>import('@/trading-ui/pages/order/pre-order-campaign/pre-order-campaign-detail/pre-order-campaign-detail.page'));
const SourcePREORDERCAMPAIGNUPDATE=lazy(()=>import('@/trading-ui/pages/order/pre-order-campaign/pre-order-campaign-update/pre-order-campaign-update.page'));
const SourcePREORDERCAMPAIGNSTATISTICS=lazy(()=>import('@/trading-ui/pages/order/pre-order-campaign-statistics/pre-order-campaign-statistics-list/pre-order-campaign-statistics-list.page'));
const SourcePREORDERCAMPAIGNSTATISTICSDETAIL=lazy(()=>import('@/trading-ui/pages/order/pre-order-campaign-statistics/pre-order-campaign-statistics-detail/pre-order-campaign-statistics-detail.page'));
const SourcePREORDERORDER=lazy(()=>import('@/trading-ui/pages/order/pre-order-order/pre-order-order-list/pre-order-order-list.page'));
const SourcePREORDERORDERDETAIL=lazy(()=>import('@/trading-ui/pages/order/pre-order-order/pre-order-order-detail/pre-order-order-detail.page'));
const SourcePREORDERORDERUPDATE=lazy(()=>import('@/trading-ui/pages/order/pre-order-order/pre-order-order-edit/pre-order-order-edit.page'));
const SourcePROMOTIONSANDBOX=lazy(()=>import('@/trading-ui/pages/promotion/promotion-sandbox/promotion-sandbox.page'));
const SourcePROMOTIONDASHBOARD=lazy(()=>import('@/trading-ui/pages/promotion/promotion-dashboard/promotion-dashboard.page'));
const SourceSEARCHPINNEDPRODUCTS=lazy(()=>import('@/trading-ui/pages/content-display/site-layout/search-pinned/search-pinned-products.page'));

const SourceReviewList=lazy(()=>import('@/trading-ui/pages/product/product-review/parts/product-review-list/product-review-list.page').then(module=>({default:module.ProductReviewListPage})));
const SourceProductDetail=lazy(()=>import('@/trading-ui/pages/product/product-spu/product-spu-detail/product-spu-detail.page'));
const SourceOrderList=lazy(()=>import('@/trading-ui/pages/order/order-data.page'));
const SourceOrderDetail=lazy(()=>import('@/trading-ui/pages/order/order-detail/order-detail.page'));
const SourcePromotionList=lazy(()=>import('@/trading-ui/pages/promotion/promotion-list.page'));
const SourcePromotionCreate=lazy(()=>import('@/trading-ui/pages/promotion/promotion-create.page'));
const SourcePromotionDetail=lazy(()=>import('@/trading-ui/pages/promotion/promotion-detail.page'));
const SourceSetList=lazy(()=>import('@/trading-ui/pages/product/product-set/product-set-list.page'));
const SourceSetDetail=lazy(()=>import('@/trading-ui/pages/product/product-set/product-set-detail.page'));
const SourceTopBanner=lazy(()=>import('@/trading-ui/pages/content-display/site-layout/site-top-banner/site-top-banner.page'));
const SourceLogo=lazy(()=>import('@/trading-ui/pages/content-display/site-layout/site-logo/site-logo.page'));
const SourceNavigation=lazy(()=>import('@/trading-ui/pages/content-display/site-layout/site-navigation/site-navigation.page'));
const SourceFooter=lazy(()=>import('@/trading-ui/pages/content-display/site-layout/site-footer/site-footer.page'));

import { isJavaBackend } from "@/common/config/app.config";
const JavaDiscountsPage = lazy(() => import("@/pages/modules/java-discounts.page"));
const CustomerRequestBackInStockPage = lazy(() => import("@/trading-ui/pages/customer-request/customer-request-back-in-stock.page"));
const CustomerRequestOrderSupportPage = lazy(() => import("@/trading-ui/pages/customer-request/customer-request-order-support.page"));
const CustomerRequestNewsletterPage = lazy(() => import("@/trading-ui/pages/customer-request/customer-request-newsletter.page"));
const LabelFlowListPage = lazy(() => import("@/trading-ui/pages/content-display/label/label-display/label-display-list/label-display-list.page"));
const LabelFlowCreatePage = lazy(() => import("@/trading-ui/pages/content-display/label/label-display/label-display-create/label-display-create.page"));
const LabelFlowDetailPage = lazy(() => import("@/trading-ui/pages/content-display/label/label-display/label-display-detail/label-display-detail.page"));
const LabelFlowEditPage = lazy(() => import("@/trading-ui/pages/content-display/label/label-display/label-display-update/label-display-update.page"));

const JavaInventoryPage = lazy(() => import("@/pages/modules/java-inventory.page"));
const SourceCmsListPage=lazy(()=>import("@/trading-ui/pages/content-display/cms/cms-page-list/cms-page-list.page"));
const SourceCmsCreatePage=lazy(()=>import("@/trading-ui/pages/content-display/cms/cms-page-create/cms-page-create.page"));
const SourceCmsDetailPage=lazy(()=>import("@/trading-ui/pages/content-display/cms/cms-page-detail/cms-page-detail.page"));
const SourceCmsEditPage=lazy(()=>import("@/trading-ui/pages/content-display/cms/cms-page-update/cms-page-update.page"));
const ProductSpuCreatePage = lazy(()=>import("@/trading-ui/pages/product/product-spu/product-spu-create/product-spu-create.page"));
const ProductSpuListPage = lazy(()=>import("@/trading-ui/pages/product/product-spu/product-spu-list/product-spu-list.page"));
const ProductSpuEditPage = lazy(()=>import("@/trading-ui/pages/product/product-spu/product-spu-update/product-spu-update.page"));
const LabelContentListPage=lazy(()=>import('@/trading-ui/pages/content-display/label/label-content/label-content-list/label-content-list.page'));
const LabelContentCreatePage=lazy(()=>import('@/trading-ui/pages/content-display/label/label-content/label-content-create/label-content-create.page'));
const LabelContentDetailPage=lazy(()=>import('@/trading-ui/pages/content-display/label/label-content/label-content-detail/label-content-detail.page'));
const LabelContentUpdatePage=lazy(()=>import('@/trading-ui/pages/content-display/label/label-content/label-content-update/label-content-update.page'));
import { CollectionListPage, CollectionFormPage, CollectionDetailPage, CategoryPage, AttributeListPage, AttributeDetailPage, AttributeEditPage, AttributeCreatePage, CmsBannerPage, DashboardPage, LoginPage, ModuleListPage, NoAccessPage, NotFoundPage } from "@/router/route.lazy-pages";
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
  PRODUCT_DETAIL: dashboardRoute(ROUTE_PATH.PRODUCT_DETAIL,SourceProductDetail),
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
  SET_LIST: dashboardRoute(ROUTE_PATH.SET_LIST,SourceSetList),
  SET_CREATE: placeholderRoute(ROUTE_PATH.SET_CREATE),
  SET_DETAIL: dashboardRoute(ROUTE_PATH.SET_DETAIL,SourceSetDetail),

  // CMS
  LABEL_CONTENT_LIST: dashboardRoute(ROUTE_PATH.LABEL_CONTENT_LIST,LabelContentListPage),
  LABEL_CONTENT_CREATE: dashboardRoute(ROUTE_PATH.LABEL_CONTENT_CREATE,LabelContentCreatePage),
  LABEL_CONTENT_DETAIL: dashboardRoute(ROUTE_PATH.LABEL_CONTENT_DETAIL,LabelContentDetailPage),
  LABEL_CONTENT_EDIT: dashboardRoute(ROUTE_PATH.LABEL_CONTENT_EDIT,LabelContentUpdatePage),
  CMS_PAGE_LIST: dashboardRoute(ROUTE_PATH.CMS_PAGE_LIST, SourceCmsListPage),
  CMS_PAGE_CREATE: dashboardRoute(ROUTE_PATH.CMS_PAGE_CREATE, SourceCmsCreatePage),
  CMS_PAGE_DETAIL: dashboardRoute(ROUTE_PATH.CMS_PAGE_DETAIL, SourceCmsDetailPage),
  CMS_PAGE_EDIT: dashboardRoute(ROUTE_PATH.CMS_PAGE_EDIT, SourceCmsEditPage),
  CMS_BANNER_LIST: dashboardRoute(ROUTE_PATH.CMS_BANNER_LIST, CmsBannerPage),
  LABEL_DISPLAY_CREATE: dashboardRoute(ROUTE_PATH.LABEL_DISPLAY_CREATE,LabelFlowCreatePage),
  LABEL_DISPLAY_DETAIL: dashboardRoute(ROUTE_PATH.LABEL_DISPLAY_DETAIL,LabelFlowDetailPage),
  LABEL_DISPLAY_UPDATE: dashboardRoute(ROUTE_PATH.LABEL_DISPLAY_UPDATE,LabelFlowEditPage),
  LABEL_FLOW_LIST: dashboardRoute(ROUTE_PATH.LABEL_FLOW_LIST, LabelFlowListPage),
  CMS_NAVIGATION: placeholderRoute(ROUTE_PATH.CMS_NAVIGATION),

  // Orders
  ORDER_LIST: dashboardRoute(ROUTE_PATH.ORDER_LIST,SourceOrderList),
  ORDER_DETAIL: dashboardRoute(ROUTE_PATH.ORDER_DETAIL,SourceOrderDetail),

  // Inventory
  INVENTORY_OVERVIEW: dashboardRoute(ROUTE_PATH.INVENTORY_OVERVIEW, isJavaBackend() ? JavaInventoryPage : ModuleListPage),
  INVENTORY_WAREHOUSE_LIST: placeholderRoute(ROUTE_PATH.INVENTORY_WAREHOUSE_LIST),
  INVENTORY_STOCK_LIST: dashboardRoute(ROUTE_PATH.INVENTORY_STOCK_LIST, isJavaBackend() ? JavaInventoryPage : ModuleListPage),
  INVENTORY_ADJUSTMENT_LIST: dashboardRoute(ROUTE_PATH.INVENTORY_ADJUSTMENT_LIST, isJavaBackend() ? JavaInventoryPage : ModuleListPage),
  INVENTORY_RECEIPT_LIST: placeholderRoute(ROUTE_PATH.INVENTORY_RECEIPT_LIST),
  INVENTORY_MOVEMENT_LIST: placeholderRoute(ROUTE_PATH.INVENTORY_MOVEMENT_LIST),

  // Promotions
  PROMOTION_LIST: dashboardRoute(ROUTE_PATH.PROMOTION_LIST,SourcePromotionList),
  PROMOTION_CREATE: dashboardRoute(ROUTE_PATH.PROMOTION_CREATE,SourcePromotionCreate),
  PROMOTION_DETAIL: dashboardRoute(ROUTE_PATH.PROMOTION_DETAIL,SourcePromotionDetail),
  VOUCHER_LIST: dashboardRoute(ROUTE_PATH.VOUCHER_LIST, isJavaBackend() ? JavaDiscountsPage : ModuleListPage),
  VOUCHER_CREATE: placeholderRoute(ROUTE_PATH.VOUCHER_CREATE),
  VOUCHER_DETAIL: placeholderRoute(ROUTE_PATH.VOUCHER_DETAIL),

  // Customers & loyalty
  CUSTOMER_LIST: placeholderRoute(ROUTE_PATH.CUSTOMER_LIST),
  CUSTOMER_DETAIL: placeholderRoute(ROUTE_PATH.CUSTOMER_DETAIL),
  LOYALTY_OVERVIEW: placeholderRoute(ROUTE_PATH.LOYALTY_OVERVIEW),
  LOYALTY_TIER_LIST: placeholderRoute(ROUTE_PATH.LOYALTY_TIER_LIST),
  STYLIST_CONFIG: placeholderRoute(ROUTE_PATH.STYLIST_CONFIG),

  // Customer service
  INQUIRY_LIST: dashboardRoute(ROUTE_PATH.INQUIRY_LIST, CustomerRequestBackInStockPage),
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

  SHIPPING: dashboardRoute(ROUTE_PATH.SHIPPING,SourceShipping),
  EXCHANGE: dashboardRoute(ROUTE_PATH.EXCHANGE,SourceExchange),
  REFUND_PROPOSAL: dashboardRoute(ROUTE_PATH.REFUND_PROPOSAL,SourceRefundList),
  PRE_ORDER_CAMPAIGN: dashboardRoute(ROUTE_PATH.PRE_ORDER_CAMPAIGN,SourcePREORDERCAMPAIGN),
  PRE_ORDER_CAMPAIGN_CREATE: dashboardRoute(ROUTE_PATH.PRE_ORDER_CAMPAIGN_CREATE,SourcePREORDERCAMPAIGNCREATE),
  PRE_ORDER_CAMPAIGN_DETAIL: dashboardRoute(ROUTE_PATH.PRE_ORDER_CAMPAIGN_DETAIL,SourcePREORDERCAMPAIGNDETAIL),
  PRE_ORDER_CAMPAIGN_UPDATE: dashboardRoute(ROUTE_PATH.PRE_ORDER_CAMPAIGN_UPDATE,SourcePREORDERCAMPAIGNUPDATE),
  PRE_ORDER_CAMPAIGN_STATISTICS: dashboardRoute(ROUTE_PATH.PRE_ORDER_CAMPAIGN_STATISTICS,SourcePREORDERCAMPAIGNSTATISTICS),
  PRE_ORDER_CAMPAIGN_STATISTICS_DETAIL: dashboardRoute(ROUTE_PATH.PRE_ORDER_CAMPAIGN_STATISTICS_DETAIL,SourcePREORDERCAMPAIGNSTATISTICSDETAIL),
  PRE_ORDER_ORDER: dashboardRoute(ROUTE_PATH.PRE_ORDER_ORDER,SourcePREORDERORDER),
  PRE_ORDER_ORDER_DETAIL: dashboardRoute(ROUTE_PATH.PRE_ORDER_ORDER_DETAIL,SourcePREORDERORDERDETAIL),
  PRE_ORDER_ORDER_UPDATE: dashboardRoute(ROUTE_PATH.PRE_ORDER_ORDER_UPDATE,SourcePREORDERORDERUPDATE),
  INVOICE: dashboardRoute(ROUTE_PATH.INVOICE,SourceInvoiceList),
  PRODUCT_REVIEW_LIST: dashboardRoute(ROUTE_PATH.PRODUCT_REVIEW_LIST,SourceReviewList),
  PROMOTION_SANDBOX: dashboardRoute(ROUTE_PATH.PROMOTION_SANDBOX,SourcePROMOTIONSANDBOX),
  PROMOTION_DASHBOARD: dashboardRoute(ROUTE_PATH.PROMOTION_DASHBOARD,SourcePROMOTIONDASHBOARD),
  CUSTOMER_REQUEST_ORDER_SUPPORT: dashboardRoute(ROUTE_PATH.CUSTOMER_REQUEST_ORDER_SUPPORT,CustomerRequestOrderSupportPage),
  CUSTOMER_REQUEST_NEWSLETTER: dashboardRoute(ROUTE_PATH.CUSTOMER_REQUEST_NEWSLETTER,CustomerRequestNewsletterPage),
  DISCOUNT_LABEL_SETTINGS: placeholderRoute(ROUTE_PATH.DISCOUNT_LABEL_SETTINGS),
  SITE_TOP_BANNER: dashboardRoute(ROUTE_PATH.SITE_TOP_BANNER,SourceTopBanner),
  SITE_LOGO: dashboardRoute(ROUTE_PATH.SITE_LOGO,SourceLogo),
  SITE_NAVIGATION: dashboardRoute(ROUTE_PATH.SITE_NAVIGATION,SourceNavigation),
  SITE_FOOTER: dashboardRoute(ROUTE_PATH.SITE_FOOTER,SourceFooter),
  SEARCH_PINNED_PRODUCTS: dashboardRoute(ROUTE_PATH.SEARCH_PINNED_PRODUCTS,SourceSEARCHPINNEDPRODUCTS),
  NO_ACCESS: dashboardRoute(ROUTE_PATH.NO_ACCESS, NoAccessPage),
  ORDER_CREATE: dashboardRoute(ROUTE_PATH.ORDER_CREATE,SourceORDER_CREATE),
  ORDER_EDIT: dashboardRoute(ROUTE_PATH.ORDER_EDIT,SourceORDER_EDIT),
  ORDER_CLONE: dashboardRoute(ROUTE_PATH.ORDER_CLONE,SourceORDER_CLONE),
  PROMOTION_UPDATE: dashboardRoute(ROUTE_PATH.PROMOTION_UPDATE,SourcePROMOTION_UPDATE),
  INVOICE_DETAIL: dashboardRoute(ROUTE_PATH.INVOICE_DETAIL,SourceInvoiceDetail),
  REFUND_PROPOSAL_DETAIL: dashboardRoute(ROUTE_PATH.REFUND_PROPOSAL_DETAIL,SourceRefundDetail),
  NOT_FOUND: dashboardRoute(ROUTE_PATH.NOT_FOUND, NotFoundPage),
};

/** Ordered list consumed by `renderRoutes`. The catch-all must stay last. */
export const APP_ROUTES: AppRoute[] = Object.values(ROUTE);
