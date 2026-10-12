import { Menu, MenuItem } from '@mui/material';
import type { PagePermissionScope } from '../../../../permissions/page-folder-map';
import { usePermissionContext } from '@/permissions/use-permission-context.hook';
import { ORDER_LIST_PAGE_SCOPE } from '../../order-permission.constants';

export interface OrderDetailMoreMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  /** Không truyền thì ẩn mục lịch sử (vd. chưa có mã đơn để tra audit). */
  onOpenHistory?: () => void;
  showEditOrder?: boolean;
  onEditOrder?: () => void;
  permissionScope?: PagePermissionScope;
  viewHistoryActionCode?: string;
  viewHistoryApiCode?: string;
  editActionCode?: string;
  editApiCode?: string;
}

export function OrderDetailMoreMenu({
  anchorEl,
  open,
  onClose,
  onOpenHistory,
  showEditOrder = false,
  onEditOrder,
  permissionScope = ORDER_LIST_PAGE_SCOPE,
  viewHistoryActionCode = 'view_history',
  viewHistoryApiCode = 'api_oms_get_orders_audit_logs',
  editActionCode = 'edit',
  editApiCode = 'api_order_update',
}: OrderDetailMoreMenuProps) {
  const { canAccessAction, hasApiAccess } = usePermissionContext();
  const canViewHistory = canAccessAction(permissionScope.menuCode, permissionScope.tabCode, viewHistoryActionCode) && hasApiAccess(viewHistoryApiCode);
  const canEditOrder = showEditOrder && Boolean(onEditOrder) && canAccessAction(permissionScope.menuCode, permissionScope.tabCode, editActionCode) && hasApiAccess(editApiCode);

  return (
    <Menu
      id="order-detail-more-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {onOpenHistory && canViewHistory ? (
        <MenuItem
          onClick={() => {
            onClose();
            onOpenHistory();
          }}
        >
          Lịch sử thao tác
        </MenuItem>
      ) : null}
      {canEditOrder ? (
        <MenuItem
          onClick={() => {
            onClose();
            onEditOrder?.();
          }}
        >
          Chỉnh sửa đơn hàng
        </MenuItem>
      ) : null}
    </Menu>
  );
}
