import type { PagePermissionScope } from '../../../permissions/page-folder-map';
import { createPageButtonPermission } from '../../../permissions/page-button-permission.utils';

export const PRE_ORDER_CAMPAIGN_STATISTICS_PAGE_SCOPE: PagePermissionScope = { menuCode: 'order', tabCode: 'pre_order_statistics' };

export const preOrderCampaignStatisticsButtonPermission = createPageButtonPermission(PRE_ORDER_CAMPAIGN_STATISTICS_PAGE_SCOPE);
