import type { PagePermissionScope } from '../../permissions/page-folder-map';
import { createPageButtonPermission } from '../../permissions/page-button-permission.utils';

export const CUSTOMER_REQUEST_BACK_IN_STOCK_PAGE_SCOPE: PagePermissionScope = {
  menuCode: 'customer_request',
  tabCode: 'back_in_stock',
};

export const CUSTOMER_REQUEST_ORDER_SUPPORT_PAGE_SCOPE: PagePermissionScope = {
  menuCode: 'customer_request',
  tabCode: 'order_support',
};

export const CUSTOMER_REQUEST_NEWSLETTER_PAGE_SCOPE: PagePermissionScope = {
  menuCode: 'customer_request',
  tabCode: 'newsletter',
};

export const customerRequestBackInStockButtonPermission = createPageButtonPermission(CUSTOMER_REQUEST_BACK_IN_STOCK_PAGE_SCOPE);
export const customerRequestOrderSupportButtonPermission = createPageButtonPermission(CUSTOMER_REQUEST_ORDER_SUPPORT_PAGE_SCOPE);
export const customerRequestNewsletterButtonPermission = createPageButtonPermission(CUSTOMER_REQUEST_NEWSLETTER_PAGE_SCOPE);
