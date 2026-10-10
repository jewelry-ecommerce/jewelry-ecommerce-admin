/**
 * Every route the console can reach, in one place. Parameterised routes keep their `:param` form
 * here and get a matching builder below, so no screen concatenates a URL by hand.
 */
export const ROUTE_PATH = {
  LOGIN: "/login",
  // The console opens directly on its overview, matching trading-admin.
  DASHBOARD: "/",

  // Catalog
  PRODUCT_LIST: "/products",
  PRODUCT_CREATE: "/products/create",
  PRODUCT_DETAIL: "/products/:id",
  PRODUCT_EDIT: "/products/:id/edit",
  CATEGORY_LIST: "/categories",
  COLLECTION_LIST: "/collections",
  COLLECTION_CREATE: "/collections/create",
  COLLECTION_DETAIL: "/collections/:collectionId",
  COLLECTION_EDIT: "/collections/:collectionId/edit",
  ATTRIBUTE_LIST: "/attributes",
  ATTRIBUTE_CREATE: "/attributes/create",
  ATTRIBUTE_DETAIL: "/attributes/:attributeId",
  ATTRIBUTE_EDIT: "/attributes/:attributeId/edit",
  MATERIAL_LIST: "/materials",
  GEMSTONE_LIST: "/gemstones",
  PRODUCT_IMPORT: "/product-import",
  PRODUCT_EXPORT: "/product-export",

  // Curated sets
  SET_LIST: "/sets",
  SET_CREATE: "/sets/create",
  SET_DETAIL: "/sets/:id",

  // CMS
  LABEL_CONTENT_LIST: "/cms/labels",
  LABEL_CONTENT_CREATE: "/cms/labels/create",
  LABEL_CONTENT_DETAIL: "/cms/labels/:labelId",
  LABEL_CONTENT_EDIT: "/cms/labels/:labelId/edit",
  CMS_PAGE_LIST: "/cms/pages",
  CMS_PAGE_CREATE: "/cms/pages/create",
  CMS_PAGE_DETAIL: "/cms/pages/:id",
  CMS_PAGE_EDIT: "/cms/pages/:id/edit",
  CMS_BANNER_LIST: "/cms/banners",
  CMS_NAVIGATION: "/cms/navigation",

  // Orders
  ORDER_LIST: "/orders",
  ORDER_DETAIL: "/orders/:code",

  // Inventory
  INVENTORY_OVERVIEW: "/inventory",
  INVENTORY_WAREHOUSE_LIST: "/inventory/warehouses",
  INVENTORY_STOCK_LIST: "/inventory/stock",
  INVENTORY_ADJUSTMENT_LIST: "/inventory/adjustments",
  INVENTORY_RECEIPT_LIST: "/inventory/receipts",
  INVENTORY_MOVEMENT_LIST: "/inventory/movements",

  // Promotions
  PROMOTION_LIST: "/promotions",
  PROMOTION_CREATE: "/promotions/create",
  PROMOTION_DETAIL: "/promotions/:id",
  VOUCHER_LIST: "/vouchers",
  VOUCHER_CREATE: "/vouchers/create",
  VOUCHER_DETAIL: "/vouchers/:id",

  // Customers & loyalty
  CUSTOMER_LIST: "/customers",
  CUSTOMER_DETAIL: "/customers/:id",
  LOYALTY_OVERVIEW: "/loyalty",
  LOYALTY_TIER_LIST: "/loyalty/tiers",
  STYLIST_CONFIG: "/stylist-config",

  // Customer service
  INQUIRY_LIST: "/inquiries",
  INQUIRY_DETAIL: "/inquiries/:id",

  // Reports
  REPORT_SALES: "/reports/sales",
  REPORT_ORDERS: "/reports/orders",
  REPORT_PRODUCTS: "/reports/products",
  REPORT_INVENTORY: "/reports/inventory",
  REPORT_CUSTOMERS: "/reports/customers",

  // Settings
  SETTING_GENERAL: "/settings/general",
  SETTING_STORE: "/settings/store",
  SETTING_PAYMENT: "/settings/payment",
  SETTING_SHIPPING: "/settings/shipping",
  SETTING_SEO: "/settings/seo",
  SETTING_ANALYTICS: "/settings/analytics",
  SETTING_LIVE_CHAT: "/settings/live-chat",

  NO_ACCESS: "/no-access",
  NOT_FOUND: "*",
} as const;

export type RoutePathKey = keyof typeof ROUTE_PATH;

/* ------------------------------------------------------------------------------------------------
 * Path builders
 * ---------------------------------------------------------------------------------------------- */

export const getProductDetailPath = (productId: string): string => `/products/${encodeURIComponent(productId)}`;
export const getProductEditPath = (productId: string): string => `/products/${encodeURIComponent(productId)}/edit`;

export const getSetDetailPath = (setId: string): string => `/sets/${encodeURIComponent(setId)}`;

export const getCmsPageDetailPath = (pageId: string): string => `/cms/pages/${encodeURIComponent(pageId)}`;
export const getCmsPageEditPath = (pageId: string): string => `/cms/pages/${encodeURIComponent(pageId)}/edit`;

export const getOrderDetailPath = (orderCode: string): string => `/orders/${encodeURIComponent(orderCode)}`;

export const getPromotionDetailPath = (promotionId: string): string => `/promotions/${encodeURIComponent(promotionId)}`;
export const getVoucherDetailPath = (voucherId: string): string => `/vouchers/${encodeURIComponent(voucherId)}`;

export const getCustomerDetailPath = (customerId: string): string => `/customers/${encodeURIComponent(customerId)}`;

export const getInquiryDetailPath = (inquiryCode: string): string => `/inquiries/${encodeURIComponent(inquiryCode)}`;

/** No-access redirect carrying the reason so the page can explain what was blocked. */
export const getNoAccessPath = (reason: "permission" | "route" = "permission"): string => `${ROUTE_PATH.NO_ACCESS}?reason=${reason}`;
export const getProductAttributeDetailPath = (id: string): string => "/attributes/" + encodeURIComponent(id);
export const getLabelContentDetailPath = (id: string): string => "/cms/labels/" + encodeURIComponent(id);
export const getLabelContentUpdatePath = (id: string): string => getLabelContentDetailPath(id) + "/edit";
export const getProductAttributeUpdatePath = (id: string): string => getProductAttributeDetailPath(id) + "/edit";
export const getProductCollectionCreatePath = (): string => ROUTE_PATH.COLLECTION_CREATE;
export const getProductCollectionDetailPath = (id: string): string => ROUTE_PATH.COLLECTION_LIST + "/" + encodeURIComponent(id);
export const getProductCollectionEditPath = (id: string): string => getProductCollectionDetailPath(id) + "/edit";
