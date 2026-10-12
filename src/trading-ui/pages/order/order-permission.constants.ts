import type { PagePermissionScope } from '../../permissions/page-folder-map';
import { createPageButtonPermission } from '../../permissions/page-button-permission.utils';

export const ORDER_LIST_PAGE_SCOPE: PagePermissionScope = { menuCode: 'order', tabCode: 'list' };
export const ORDER_RETURNS_PAGE_SCOPE: PagePermissionScope = { menuCode: 'order', tabCode: 'returns' };
export const ORDER_REFUNDS_PAGE_SCOPE: PagePermissionScope = { menuCode: 'order', tabCode: 'refunds' };
export const ORDER_SHIPPING_PAGE_SCOPE: PagePermissionScope = { menuCode: 'order', tabCode: 'shipping' };
export const ORDER_INVOICE_PAGE_SCOPE: PagePermissionScope = { menuCode: 'order', tabCode: 'invoice' };
export const ORDER_PRE_ORDER_CAMPAIGN_PAGE_SCOPE: PagePermissionScope = { menuCode: 'order', tabCode: 'pre_order_campaign' };

export const orderListButtonPermission = createPageButtonPermission(ORDER_LIST_PAGE_SCOPE);
export const orderReturnsButtonPermission = createPageButtonPermission(ORDER_RETURNS_PAGE_SCOPE);
export const orderRefundsButtonPermission = createPageButtonPermission(ORDER_REFUNDS_PAGE_SCOPE);
export const orderShippingButtonPermission = createPageButtonPermission(ORDER_SHIPPING_PAGE_SCOPE);
export const orderInvoiceButtonPermission = createPageButtonPermission(ORDER_INVOICE_PAGE_SCOPE);
export const orderPreOrderCampaignButtonPermission = createPageButtonPermission(ORDER_PRE_ORDER_CAMPAIGN_PAGE_SCOPE);
