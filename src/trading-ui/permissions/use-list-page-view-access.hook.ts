
import { usePermissionContext } from '@/permissions/use-permission-context.hook';
export function useListPageViewAccess(scope:{menuCode:string;tabCode:string}, _options:{listApiCode?:string;redirectOnDeny?:boolean}):boolean {
  return usePermissionContext().canAccessMenuTab(scope.menuCode,scope.tabCode);
}
