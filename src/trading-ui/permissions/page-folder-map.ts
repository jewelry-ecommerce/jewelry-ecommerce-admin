export interface PagePermissionScope { menuCode: string; tabCode: string }
export const buildPageKey = (menuCode:string,tabCode:string):string => menuCode+'.'+tabCode;
