import type { PagePermissionScope } from './page-folder-map';

export type PageButtonPermissionProps = PagePermissionScope & {
  actionCode: string;
  actionLabel: string;
  apiCode?: string | string[];
  unauthorizedMode?: 'hide' | 'disable';
};

export const createPageButtonPermission =
  (scope: PagePermissionScope, defaultUnauthorizedMode: 'hide' | 'disable' = 'hide') =>
  (actionCode: string, actionLabel: string, apiCode?: string | string[]): PageButtonPermissionProps => ({
    ...scope,
    actionCode,
    actionLabel,
    ...(apiCode ? { apiCode } : {}),
    unauthorizedMode: defaultUnauthorizedMode,
  });
