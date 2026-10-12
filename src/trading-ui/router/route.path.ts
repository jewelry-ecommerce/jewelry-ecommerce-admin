export const ROUTE_PATH = {
  HOME: '/',
  ORDER: "/orders",
  /** Chi tiết đơn (hồ sơ đơn hàng) */
  ORDER_DETAIL: "/orders/:orderId",
  ORDER_CREATE: '/order/create',
  /** Chỉnh sửa đơn (chỉ khi Pending) */
  ORDER_EDIT: '/order/:orderId/edit',
  /** Sao chép đơn thành đơn mới */
  ORDER_CLONE: '/order/:orderId/clone',
  SHIPPING: "/shipping",
  EXCHANGE: "/exchange",
  /** Danh sách yêu cầu hoàn tiền (US-10). */
  REFUND_PROPOSAL: "/order/refund-proposals",
  /** Chi tiết yêu cầu hoàn tiền (US-11). */
  REFUND_PROPOSAL_DETAIL: '/order/refund-proposals/:refundProposalId',
  /** Danh sách chiến dịch đặt trước. */
  PRE_ORDER_CAMPAIGN: "/order/pre-order-campaigns",
  PRE_ORDER_CAMPAIGN_CREATE: "/order/pre-order-campaigns/create",
  PRE_ORDER_CAMPAIGN_DETAIL: "/order/pre-order-campaigns/:campaignId",
  PRE_ORDER_CAMPAIGN_UPDATE: "/order/pre-order-campaigns/:campaignId/update",
  PRE_ORDER_CAMPAIGN_STATISTICS: "/order/pre-order-campaigns/statistics",
  PRE_ORDER_CAMPAIGN_STATISTICS_DETAIL: "/order/pre-order-campaigns/statistics/:campaignId",
  /** Danh sách đơn hàng đặt trước (OMS). */
  PRE_ORDER_ORDER: "/order/pre-order-orders",
  PRE_ORDER_ORDER_DETAIL: "/order/pre-order-orders/:preOrderId",
  PRE_ORDER_ORDER_UPDATE: "/order/pre-order-orders/:preOrderId/edit",
  INVOICE: "/invoice",
  /** Chi tiết hóa đơn & chứng từ */
  INVOICE_DETAIL: '/invoice/:invoiceId',
  PRODUCT: "/products",
  WAREHOUSE: '/warehouse',
  WAREHOUSE_LOCATION_AREA: '/warehouse/location-area',
  WAREHOUSE_INVENTORY: '/warehouse/inventory',
  WAREHOUSE_PURCHASE_ORDER: '/warehouse/purchase-order',
  WAREHOUSE_PURCHASE_ORDER_CREATE: '/warehouse/purchase-order/create',
  WAREHOUSE_PURCHASE_ORDER_EDIT: '/warehouse/purchase-order/:purchaseOrderId/edit',
  WAREHOUSE_PUTAWAY: '/warehouse/putaway',
  WAREHOUSE_FULFILLMENT_ORDER: '/warehouse/fulfillment-order',
  WAREHOUSE_PRE_ORDER: '/warehouse/pre-order',
  WAREHOUSE_PACKING_STATION: '/warehouse/packing-station',
  WAREHOUSE_PACKING_STATION_CHECK_SLIP: '/warehouse/packing-station/:outboundId',
  WAREHOUSE_HANDOVER: '/warehouse/handover',
  WAREHOUSE_WAVE_MANAGEMENT: '/warehouse/wave-management',
  WAREHOUSE_CYCLE_COUNT: '/warehouse/cycle-count',
  WAREHOUSE_CYCLE_COUNT_CREATE: '/warehouse/cycle-count/create',
  WAREHOUSE_CYCLE_COUNT_DETAIL: '/warehouse/cycle-count/:cycleCountId',
  WAREHOUSE_RMA: '/warehouse/rma',
  WAREHOUSE_RMA_CREATE: '/warehouse/rma/create',
  WAREHOUSE_RMA_EDIT: '/warehouse/rma/:rmaId/edit',
  WAREHOUSE_RMA_DETAIL: '/warehouse/rma/:rmaId',
  WAREHOUSE_SHIPPING_PACKAGE_CONFIG: '/warehouse/shipping-package-config',
  WAREHOUSE_SYSTEM_CONFIG: '/warehouse/system-config',
  WAREHOUSE_TRANSFER_REQUEST: '/warehouse/transfer-request',
  WAREHOUSE_TRANSFER_REQUEST_CREATE: '/warehouse/transfer-request/create',
  WAREHOUSE_TRANSFER_REQUEST_EDIT: '/warehouse/transfer-request/:transferRequestId/edit',
  /** PDA - Wave picking */
  WAREHOUSE_PDA_HOME: '/warehouse/pda',
  WAREHOUSE_PDA_WAVE_PICKING: '/warehouse/pda/wave-picking',
  /** PDA quét khay — waveId trên path (refresh / bookmark ổn định). */
  WAREHOUSE_PDA_WAVE_PICKING_SCAN_TOTE: '/warehouse/pda/wave-picking/:waveId/scan-tote',
  WAREHOUSE_PDA_WAVE_PICKING_ROUTE: '/warehouse/pda/wave-picking/:waveId/route',
  /** PDA - Wave picking theo đơn (by-order) */
  WAREHOUSE_PDA_WAVE_PICKING_BY_ORDER: '/warehouse/pda/wave-picking-by-order',
  WAREHOUSE_PDA_WAVE_PICKING_BY_ORDER_ROUTE: '/warehouse/pda/wave-picking-by-order/:waveId/route',
  /** PDA - Wave tự động (Auto) — không phân biệt pick type */
  WAREHOUSE_PDA_WAVE_PICKING_AUTO: '/warehouse/pda/wave-picking-auto',
  WAREHOUSE_PDA_WAVE_PICKING_AUTO_ROUTE: '/warehouse/pda/wave-picking-auto/:waveId/route',
  /** PDA - Nhận hàng QC (Inbound) */
  WAREHOUSE_PDA_INBOUND_QC: '/warehouse/pda/inbound-qc',
  WAREHOUSE_PDA_INBOUND_QC_DETAIL: '/warehouse/pda/inbound-qc/:poId',
  WAREHOUSE_PDA_INBOUND_QC_SCAN: '/warehouse/pda/inbound-qc/:poId/scan',
  /** PDA - Điều chuyển nội bộ */
  WAREHOUSE_PDA_INTERNAL_TRANSFER: '/warehouse/pda/internal-transfer',
  WAREHOUSE_PDA_QUARANTINE: '/warehouse/pda/quarantine',
  /** PDA - Cất hàng (Putaway) */
  WAREHOUSE_PDA_PUTAWAY: '/warehouse/pda/putaway',
  WAREHOUSE_PDA_PUTAWAY_ROUTE: '/warehouse/pda/putaway/:putawayTaskId/route',
  /** PDA - Kiểm kê (Cycle Count) */
  WAREHOUSE_PDA_CYCLE_COUNT: '/warehouse/pda/cycle-count',
  WAREHOUSE_PDA_CYCLE_COUNT_ROUTE: '/warehouse/pda/cycle-count/:cycleCountId/route',
  /** PDA - Hàng hoàn (RMA) */
  WAREHOUSE_PDA_RMA: '/warehouse/pda/rma',
  WAREHOUSE_PDA_RMA_VALIDATION: '/warehouse/pda/rma/:rmaId/validation',
  CUSTOMER: '/customer',
  LOYALTY_CUSTOMER: '/customer',
  LOYALTY_CUSTOMER_DETAIL: '/customer/:customerId',
  CUSTOMER_REQUEST_BACK_IN_STOCK: "/inquiries",
  CUSTOMER_REQUEST_ORDER_SUPPORT: "/customer-requests/order-support",
  CUSTOMER_REQUEST_NEWSLETTER: "/customer-requests/newsletter",
  LOYALTY_MEMBERSHIP_TIER: '/membership-tier',
  LOYALTY_MEMBERSHIP_TIER_DETAIL: '/membership-tier/:tierCode',
  LOYALTY_POINT_MANAGEMENT: '/point-management',
  CONTENT: "/cms/pages",
  LABEL_CONTENT_LIST: "/cms/labels",
  LABEL_CONTENT_CREATE: "/cms/labels/create",
  LABEL_CONTENT_DETAIL: "/cms/labels/:labelId",
  LABEL_CONTENT_UPDATE: "/cms/labels/:labelId/edit",
  LABEL_DISPLAY_LIST: "/cms/badge-flow",
  LABEL_DISPLAY_CREATE: '/cms/badge-flow/create',
  LABEL_DISPLAY_DETAIL: '/cms/badge-flow/:displayId',
  LABEL_DISPLAY_UPDATE: '/cms/badge-flow/:displayId/edit',
  REPORT: '/report',
  SETTING: '/setting',
  /** Trung tâm phân quyền (cây Branch → Menu → Tab → Action) */
  SETTING_PERMISSION: '/setting',
  SETTING_PERMISSION_CREATE_ACTION: '/setting/actions/create',
  SETTING_ROLES: '/setting/roles',
  SETTING_USER_ACCESS: '/setting/users',
  SETTING_DEPARTMENTS: '/setting/departments',
  SETTING_POSITIONS: '/setting/positions',
  /** Hồ sơ tài khoản đăng nhập — chỉnh sửa qua PATCH /iam/employee/me */
  ACCOUNT_PROFILE: '/account/profile',
  /** Danh sách thông báo của tôi (chuông thông báo) */
  NOTIFICATIONS: '/notifications',
  LOGIN: "/login",
  // FORGOT_PASSWORD: '/forgot-password', — tạm tắt luồng quên mật khẩu
  ACCOUNT_LOCKED: '/account-locked',
  CHANGE_PASSWORD: '/change-password',
  /** Bắt buộc chọn kho làm việc sau đăng nhập khi được phân công nhiều kho. */
  SELECT_WAREHOUSE: '/select-warehouse',
  NO_ACCESS: "/no-access",
  PRODUCT_CATEGORY: "/categories",
  PRODUCT_COLLECTION_LIST: "/collections",
  PRODUCT_COLLECTION_CREATE: "/collections/create",
  PRODUCT_COLLECTION_EDIT: '/product/collection/list/:collectionId/edit',
  PRODUCT_COLLECTION_DETAIL: "/collections/:collectionId",
  PRODUCT_ATTRIBUTE_LIST: "/attributes",
  PRODUCT_ATTRIBUTE_CREATE: "/attributes/create",
  PRODUCT_ATTRIBUTE_DETAIL: "/attributes/:attributeId",
  PRODUCT_ATTRIBUTE_UPDATE: "/attributes/:attributeId/edit",
  PRODUCT_BRAND: '/product/brand',
  PRODUCT_REVIEW_LIST: "/product/review",
  PRODUCT_REVIEW_CREATE: '/product/review/create',
  PRODUCT_SPU_LIST: "/products",
  PRODUCT_SPU_CREATE: "/products/create",
  PRODUCT_SPU_DETAIL: "/products/:spuId",
  PRODUCT_SPU_UPDATE: "/products/:spuId/edit",
  PRODUCT_SET_LIST: "/sets",
  PRODUCT_SET_DETAIL: "/sets/:setId",
  CMS_PAGE_LIST: "/cms/pages",
  CMS_PAGE_CREATE: "/cms/pages/create",
  PRODUCT_LIST_BANNER_SETTINGS: "/cms/banners",
  CMS_PAGE_UPDATE: "/cms/pages/:pageId/edit",
  CMS_PAGE_DETAIL: "/cms/pages/:pageId",
  SITE_LOGO: "/content/site-logo",
  SITE_TOP_BANNER: "/content/site-top-banner",
  SITE_FOOTER: "/content/site-footer",
  SITE_NAVIGATION: "/content/site-navigation",
  SEARCH_PINNED_PRODUCTS: "/content/search-pinned-products",
  DISCOUNT_LABEL_SETTINGS: "/content/discount-label",
  MEDIA_UPLOAD: '/content/media-upload',
  PROMOTION: "/promotions",
  PROMOTION_DASHBOARD: "/promotion/dashboard",
  PROMOTION_CREATE: "/promotions/create",
  PROMOTION_DETAIL: "/promotions/:promotionId",
  PROMOTION_UPDATE: '/promotion/:promotionId/update',
  PROMOTION_SANDBOX: "/promotion/sandbox",
  CRONJOB_SCHEDULER: '/cronjob/scheduler',
  IMPORT_EXPORT_WORKER_QUEUE_PROFILES: '/import-export/worker-queue-profiles',
  IMPORT_EXPORT_WORKER_QUEUE_PROFILE_DETAIL: '/import-export/worker-queue-profiles/:profileId',
  IMPORT_EXPORT: '/import-export',
  IMPORT_EXPORT_DETAIL: '/import-export/:topicConfigId',
  OPERATIONS: '/operations',
  OPERATIONS_PROVIDERS: '/operations/providers',
  OPERATIONS_POSTGRESQL: '/operations/postgresql',
  OPERATIONS_POSTGRESQL_UPDATE: '/operations/postgresql/update',
  OPERATIONS_REDIS: '/operations/redis',
  OPERATIONS_CONFIG_ENV: '/operations/config-env',
  OPERATIONS_HISTORY: '/operations/history',
  /** POS — Quản lý cửa hàng */
  POS: '/pos',
  POS_CREATE: '/pos/create',
  POS_DETAIL: '/pos/:posId',
  POS_UPDATE: '/pos/:posId/update',
  POS_COPY: '/pos/:posId/copy',
  /** POS — Quản lý ca bán (không đặt dưới /pos để tránh trùng POS_DETAIL + highlight "Kho vận") */
  POS_SHIFTS: '/pos-shifts',
  POS_SHIFT_DETAIL: '/pos-shifts/:shiftId',
} as const;

export const getImportExportDetailPath = (topicConfigId: string) => `/import-export/${topicConfigId}`;

export const getWorkerQueueProfileDetailPath = (profileId: string) => `/import-export/worker-queue-profiles/${encodeURIComponent(profileId)}`;

export const getOrderDetailPath = (orderId: string) => `/orders/${orderId}`;
export const getOrderEditPath = (orderId: string) => `/order/${orderId}/edit`;
export const getOrderClonePath = (orderId: string) => `/order/${orderId}/clone`;

export const getLabelContentDetailPath = (labelId: string) => `/content/label-list/${labelId}`;
export const getLabelContentUpdatePath = (labelId: string) => `/content/label-list/${labelId}/update`;

export const getLabelDisplayDetailPath = (displayId: string) => `/cms/badge-flow/${displayId}`;
export const getLabelDisplayUpdatePath = (displayId: string) => `/cms/badge-flow/${displayId}/edit`;

export const getProductCollectionDetailPath = (collectionId: string) => `/collections/${collectionId}`;
export const getProductCollectionCreatePath = () => ROUTE_PATH.PRODUCT_COLLECTION_CREATE;
export const getProductCollectionEditPath = (collectionId: string) => `/collections/${collectionId}/edit`;

export const getProductAttributeUpdatePath = (attributeId: string) => `/attributes/${attributeId}/edit`;
export const getProductAttributeDetailPath = (attributeId: string) => `/attributes/${attributeId}`;

export const getProductSpuUpdatePath = (spuId: string) => `/products/${spuId}/edit`;
export const getProductSpuDetailPath = (spuId: string) => `/products/${spuId}`;
export const getProductSetDetailPath = (setId: string) => `/sets/${encodeURIComponent(setId)}`;

export const getPageUpdatePath = (pageId: string) => `/cms/pages/${pageId}/edit`;
export const getPageDetailPath = (pageId: string) => `/cms/pages/${pageId}`;

/** Mở màn chỉnh sửa yêu cầu đổi trả (query `returnId`). */
export const getReturnExchangeEditPath = (orderReturnId: string) => `${ROUTE_PATH.EXCHANGE}?returnId=${encodeURIComponent(orderReturnId)}`;
export const getReturnExchangeDetailPath = (orderReturnId: string) => `${ROUTE_PATH.EXCHANGE}?detailId=${encodeURIComponent(orderReturnId)}`;

export const getRefundProposalDetailPath = (refundProposalId: string) => `${ROUTE_PATH.REFUND_PROPOSAL}/${encodeURIComponent(refundProposalId)}`;
export const getInvoiceDocumentDetailPath = (invoiceId: string) => `${ROUTE_PATH.INVOICE}/${encodeURIComponent(invoiceId)}`;

export const getPreOrderCampaignDetailPath = (campaignId: string) => `${ROUTE_PATH.PRE_ORDER_CAMPAIGN}/${encodeURIComponent(campaignId)}`;
export const getPreOrderCampaignUpdatePath = (campaignId: string) => `${ROUTE_PATH.PRE_ORDER_CAMPAIGN}/${encodeURIComponent(campaignId)}/update`;
export const getPreOrderCampaignStatisticsDetailPath = (campaignId: string) => `${ROUTE_PATH.PRE_ORDER_CAMPAIGN_STATISTICS}/${encodeURIComponent(campaignId)}`;

export const getPreOrderOrderDetailPath = (preOrderId: string) => `${ROUTE_PATH.PRE_ORDER_ORDER}/${encodeURIComponent(preOrderId)}`;
export const getPreOrderOrderUpdatePath = (preOrderId: string) => `${ROUTE_PATH.PRE_ORDER_ORDER}/${encodeURIComponent(preOrderId)}/edit`;

export const getPurchaseOrderEditPath = (purchaseOrderId: string) => `/warehouse/purchase-order/${purchaseOrderId}/edit`;

export const getTransferRequestEditPath = (transferRequestId: string) => `/warehouse/transfer-request/${encodeURIComponent(transferRequestId)}/edit`;

export const getWarehouseCycleCountDetailPath = (cycleCountId: string) => `/warehouse/cycle-count/${encodeURIComponent(cycleCountId)}`;

export const getPdaInboundQcDetailPath = (poId: string) => `/warehouse/pda/inbound-qc/${encodeURIComponent(poId)}`;

export const getPdaInboundQcScanPath = (poId: string) => `/warehouse/pda/inbound-qc/${encodeURIComponent(poId)}/scan`;

export const getPdaPutawayRoutePath = (putawayTaskId: string) => `/warehouse/pda/putaway/${encodeURIComponent(putawayTaskId)}/route`;

export const getPdaWavePickingScanTotePath = (waveId: string) => `/warehouse/pda/wave-picking/${encodeURIComponent(waveId)}/scan-tote`;

export const getPdaWavePickingRoutePath = (waveId: string) => `/warehouse/pda/wave-picking/${encodeURIComponent(waveId)}/route`;

export const getPdaWavePickingByOrderRoutePath = (waveId: string) => `/warehouse/pda/wave-picking-by-order/${encodeURIComponent(waveId)}/route`;
export const getPdaWavePickingAutoRoutePath = (waveId: string) => `/warehouse/pda/wave-picking-auto/${encodeURIComponent(waveId)}/route`;

export const getPdaCycleCountRoutePath = (cycleCountId: string) => `/warehouse/pda/cycle-count/${encodeURIComponent(cycleCountId)}/route`;

export const getRmaDetailRoutePath = (rmaId: string) => `/warehouse/rma/${encodeURIComponent(rmaId)}`;
export const getRmaEditRoutePath = (rmaId: string) => `/warehouse/rma/${encodeURIComponent(rmaId)}/edit`;
export const getPdaRmaValidationRoutePath = (rmaId: string) => `/warehouse/pda/rma/${encodeURIComponent(rmaId)}/validation`;

export const getPackingStationCheckSlipPath = (outboundId: string) => `/warehouse/packing-station/${encodeURIComponent(outboundId)}`;

export const getLoyaltyCustomerDetailPath = (customerId: string) => `/customer/${encodeURIComponent(customerId)}`;

export const getPromotionDetailPath = (promotionId: string, source: 'draft' | 'published' = 'draft'): string => {
  const params = new URLSearchParams({ source });
  return `/promotions/${encodeURIComponent(promotionId)}?${params.toString()}`;
};

export const getPromotionUpdatePath = (promotionId: string) => `/promotions/${encodeURIComponent(promotionId)}/edit`;

export const getPromotionSandboxPath = () => ROUTE_PATH.PROMOTION_SANDBOX;

export const getCronjobSchedulerPath = () => ROUTE_PATH.CRONJOB_SCHEDULER;

export const getPosDetailPath = (posId: string) => `${ROUTE_PATH.POS}/${encodeURIComponent(posId)}`;
export const getPosUpdatePath = (posId: string) => `${ROUTE_PATH.POS}/${encodeURIComponent(posId)}/update`;
export const getPosCopyPath = (posId: string) => `${ROUTE_PATH.POS}/${encodeURIComponent(posId)}/copy`;
export const getPosShiftDetailPath = (shiftId: string) => `${ROUTE_PATH.POS_SHIFTS}/${encodeURIComponent(shiftId)}`;
