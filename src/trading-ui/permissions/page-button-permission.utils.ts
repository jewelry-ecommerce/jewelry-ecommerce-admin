export type PageButtonPermissionProps = {
  actionCode?: string;
  actionLabel?: string;
  apiCode?: string | string[];
  menuCode?: string;
  tabCode?: string;
  unauthorizedMode?: 'hide' | 'disable';
};
