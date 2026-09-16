/** Namespace barrel: `import { productApi } from '@/apis'` then `productApi.getProductList(...)`. */
export * as authApi from "./auth/auth.api";
export * as cmsApi from "./cms/cms.api";
export * as customerApi from "./customer/customer.api";
export * as dashboardApi from "./dashboard/dashboard.api";
export * as inquiryApi from "./inquiry/inquiry.api";
export * as inventoryApi from "./inventory/inventory.api";
export * as loyaltyApi from "./loyalty/loyalty.api";
export * as orderApi from "./order/order.api";
export * as productApi from "./product/product.api";
export * as promotionApi from "./promotion/promotion.api";
export * as reportApi from "./report/report.api";
export * as settingApi from "./setting/setting.api";
export * as setApi from "./set/set.api";

export { ApiError, apiRequest } from "./transport";
export type { ApiDescriptor, ApiErrorPayload, HttpMethod } from "./transport";

export type * from "./auth/auth.interface";
export type * from "./cms/cms.interface";
export type * from "./customer/customer.interface";
export type * from "./dashboard/dashboard.interface";
export type * from "./inquiry/inquiry.interface";
export type * from "./inventory/inventory.interface";
export type * from "./loyalty/loyalty.interface";
export type * from "./order/order.interface";
export type * from "./product/product.interface";
export type * from "./promotion/promotion.interface";
export type * from "./report/report.interface";
export type * from "./set/set.interface";
export type * from "./setting/setting.interface";
