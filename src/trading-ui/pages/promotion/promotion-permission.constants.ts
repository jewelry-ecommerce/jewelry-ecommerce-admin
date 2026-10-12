import type { PagePermissionScope } from '../../permissions/page-folder-map';
import { createPageButtonPermission } from '../../permissions/page-button-permission.utils';

export const PROMOTION_LIST_PAGE_SCOPE: PagePermissionScope = { menuCode: 'promotion', tabCode: 'list' };

export const PROMOTION_SANDBOX_PAGE_SCOPE: PagePermissionScope = { menuCode: 'promotion', tabCode: 'sandbox' };

export const PROMOTION_DASHBOARD_PAGE_SCOPE: PagePermissionScope = { menuCode: 'promotion', tabCode: 'dashboard' };

export const promotionListButtonPermission = createPageButtonPermission(PROMOTION_LIST_PAGE_SCOPE);

export const promotionSandboxButtonPermission = createPageButtonPermission(PROMOTION_SANDBOX_PAGE_SCOPE);

export const promotionDashboardButtonPermission = createPageButtonPermission(PROMOTION_DASHBOARD_PAGE_SCOPE);

export const promotionEvaluatePermission = (label: string) => promotionListButtonPermission('evaluate', label, 'api_promotion_runtime_evaluate');

export const promotionListRefreshPermission = () => promotionListButtonPermission('refresh', 'Làm mới', 'api_promotion_campaigns_list');

export const promotionSchemaEditPermission = (label: string) => promotionListButtonPermission('edit', label, 'api_promotion_draft_update');
