import { Menu, MenuItem } from '@mui/material';
import { usePermissionContext } from '@/permissions/use-permission-context.hook';
import { ORDER_LIST_PAGE_SCOPE } from '../order-permission.constants';

interface OrderRowActionMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onCloneOrder: () => void;
  onCreateReturnExchange: () => void;
  onAdjustOrder: () => void;
  onCancelOrder: () => void;
  canCreateReturnExchange: boolean;
  canAdjustOrder: boolean;
  canCancelOrder: boolean;
}

const canUseRestrictedMenuAction = (
  canAccessAction: (menuCode: string, tabCode: string, actionCode: string) => boolean,
  hasApiAccess: (apiCode: string | string[]) => boolean,
  actionCode: string,
  apiCode: string,
): boolean => {
  const { menuCode, tabCode } = ORDER_LIST_PAGE_SCOPE;
  return canAccessAction(menuCode, tabCode, actionCode) && hasApiAccess(apiCode);
};

export const OrderRowActionMenu = ({
  anchorEl,
  open,
  onClose,
  onCloneOrder,
  onCreateReturnExchange,
  onAdjustOrder,
  onCancelOrder,
  canCreateReturnExchange,
  canAdjustOrder,
  canCancelOrder,
}: OrderRowActionMenuProps) => {
  const { hasApiAccess, canAccessAction } = usePermissionContext();

  const canCreateReturn = canUseRestrictedMenuAction(canAccessAction, hasApiAccess, 'return_create', 'api_order_return_create');
  const canAdjust = canUseRestrictedMenuAction(canAccessAction, hasApiAccess, 'recall', 'api_order_recall');

  const menuItemSx = { fontSize: '13px', lineHeight: '19.5px', fontWeight: 400 };

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <MenuItem onClick={onCloneOrder} sx={menuItemSx}>
        Sao chép
      </MenuItem>
      {canCreateReturnExchange && canCreateReturn ? (
        <MenuItem onClick={onCreateReturnExchange} sx={menuItemSx}>
          Tạo yêu cầu đổi trả
        </MenuItem>
      ) : null}
      {canAdjustOrder && canAdjust ? (
        <MenuItem onClick={onAdjustOrder} sx={menuItemSx}>
          Điều chỉnh đơn
        </MenuItem>
      ) : null}
      {canCancelOrder ? (
        <MenuItem onClick={onCancelOrder} sx={{ ...menuItemSx, color: '#EF4444' }}>
          Hủy đơn
        </MenuItem>
      ) : null}
    </Menu>
  );
};
